import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { OrderStatus } from '@lynq/types';
import { ORDER_STATUS_LABELS } from '@lynq/types';
import { PrismaService } from '../prisma/prisma.service';
import { CHANNEL_REGISTRY, ChannelName, ChannelRegistry } from './providers/channel-registry';

const NOTIFIABLE_STATUSES: ReadonlySet<OrderStatus> = new Set([
  'washing',
  'ironing',
  'ready',
  'delivered',
  'cancelled',
]);

export interface ListNotificationsFilters {
  status?: 'queued' | 'sent' | 'failed';
  channel?: string;
  orderId?: string;
  search?: string; // matches recipient or order number
  limit?: number;
  cursor?: string;
}

/**
 * Persists, dispatches and tracks outbound customer notifications across
 * one or more channels.
 *
 * Per status change, the service walks `NOTIFICATIONS_CHANNELS` (e.g.
 * `whatsapp,sms`) in order, queues a `NotificationLog` row, attempts the
 * send, and stops at the first success. Every attempt — including
 * fall-backs — is stored so staff can audit what reached the customer.
 *
 * A failed send NEVER throws to the caller — the order status transition
 * that triggered it must succeed regardless of provider health.
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CHANNEL_REGISTRY)
    private readonly registry: ChannelRegistry,
    @Inject('NOTIFICATION_CHANNELS')
    private readonly channels: ChannelName[],
  ) {}

  /** Triggered by the orders service after an advance. Best-effort. */
  async notifyStatusChange(tenantId: string, orderId: string, status: OrderStatus) {
    if (!NOTIFIABLE_STATUSES.has(status)) return null;

    const ctx = await this.prisma.withTenant(tenantId, async (tx) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, tenantId },
        include: { customer: true },
      });
      if (!order || !order.customer) return null;
      return {
        orderId: order.id,
        recipient: order.customer.phone,
        message: renderMessage(order.number, order.customer.fullName, status),
      };
    });
    if (!ctx) return null;

    const attempts: Array<Awaited<ReturnType<typeof this.dispatchToChannel>>> = [];
    for (const channel of this.channels) {
      const provider = this.registry.get(channel);
      if (!provider) {
        this.logger.warn(`No provider registered for channel ${channel}`);
        continue;
      }
      const queued = await this.queue(tenantId, {
        orderId: ctx.orderId,
        channel,
        template: `order_${status}`,
        recipient: ctx.recipient,
        message: ctx.message,
        status,
      });
      const result = await this.dispatchToChannel(tenantId, queued.id);
      attempts.push(result);
      if (result.status === 'sent') break;
    }

    return attempts;
  }

  /** Dispatches an already-queued notification through its row's channel. */
  async dispatch(tenantId: string, notificationId: string) {
    return this.dispatchToChannel(tenantId, notificationId);
  }

  /** Retry endpoint helper — only re-dispatches if currently failed/queued. */
  async retry(tenantId: string, notificationId: string) {
    const row = await this.prisma.withTenant(tenantId, (tx) =>
      tx.notificationLog.findFirst({ where: { id: notificationId, tenantId } }),
    );
    if (!row) throw new NotFoundException(`Notification ${notificationId} not found`);
    if (row.status === 'sent') return row;
    return this.dispatchToChannel(tenantId, notificationId);
  }

  listForOrder(tenantId: string, orderId: string) {
    return this.prisma.withTenant(tenantId, (tx) =>
      tx.notificationLog.findMany({
        where: { tenantId, orderId },
        orderBy: { createdAt: 'desc' },
      }),
    );
  }

  async list(tenantId: string, filters: ListNotificationsFilters) {
    const limit = Math.min(Math.max(filters.limit ?? 50, 1), 200);
    return this.prisma.withTenant(tenantId, async (tx) => {
      const rows = await tx.notificationLog.findMany({
        where: {
          tenantId,
          ...(filters.status ? { status: filters.status } : {}),
          ...(filters.channel ? { channel: filters.channel } : {}),
          ...(filters.orderId ? { orderId: filters.orderId } : {}),
          ...(filters.search
            ? {
                OR: [
                  { recipient: { contains: filters.search, mode: 'insensitive' } },
                  { order: { number: { contains: filters.search, mode: 'insensitive' } } },
                ],
              }
            : {}),
        },
        include: { order: { select: { id: true, number: true, status: true } } },
        orderBy: { createdAt: 'desc' },
        take: limit + 1,
        ...(filters.cursor ? { cursor: { id: filters.cursor }, skip: 1 } : {}),
      });
      const hasMore = rows.length > limit;
      const items = hasMore ? rows.slice(0, limit) : rows;
      return {
        items,
        nextCursor: hasMore ? items[items.length - 1]?.id ?? null : null,
      };
    });
  }

  // ----- internals ---------------------------------------------------------

  private queue(
    tenantId: string,
    input: {
      orderId: string;
      channel: string;
      template: string;
      recipient: string;
      message: string;
      status: OrderStatus;
    },
  ) {
    return this.prisma.withTenant(tenantId, (tx) =>
      tx.notificationLog.create({
        data: {
          tenantId,
          orderId: input.orderId,
          channel: input.channel,
          template: input.template,
          recipient: input.recipient,
          status: 'queued',
          payload: { message: input.message, status: input.status },
        },
      }),
    );
  }

  private async dispatchToChannel(tenantId: string, notificationId: string) {
    const row = await this.prisma.withTenant(tenantId, (tx) =>
      tx.notificationLog.findFirst({ where: { id: notificationId, tenantId } }),
    );
    if (!row) throw new NotFoundException(`Notification ${notificationId} not found`);

    const provider = this.registry.get(row.channel as ChannelName);
    if (!provider) {
      return this.prisma.withTenant(tenantId, (tx) =>
        tx.notificationLog.update({
          where: { id: row.id },
          data: {
            status: 'failed',
            error: `No provider for channel ${row.channel}`,
          },
        }),
      );
    }

    const payload = (row.payload ?? {}) as { message?: string };
    const message = payload.message ?? '';

    const result = await provider.send({
      recipient: row.recipient,
      message,
      template: row.template,
    });

    const updated = await this.prisma.withTenant(tenantId, (tx) =>
      tx.notificationLog.update({
        where: { id: row.id },
        data: {
          status: result.ok ? 'sent' : 'failed',
          channel: result.channel,
          providerRef: result.providerRef ?? null,
          error: result.ok ? null : result.error ?? 'Unknown error',
          sentAt: result.ok ? new Date() : row.sentAt,
        },
      }),
    );

    if (!result.ok) {
      this.logger.warn(
        `Notification ${row.id} (${row.channel}) failed: ${result.error}`,
      );
    }
    return updated;
  }
}

function renderMessage(orderNumber: string, name: string, status: OrderStatus): string {
  const firstName = name.split(' ')[0] || name;
  const label = ORDER_STATUS_LABELS[status] ?? status;
  switch (status) {
    case 'washing':
      return `Hi ${firstName}, your order ${orderNumber} is now being washed. We'll keep you posted.`;
    case 'ironing':
      return `Hi ${firstName}, your order ${orderNumber} is being ironed and packed.`;
    case 'ready':
      return `Hi ${firstName}, your order ${orderNumber} is ready for pickup. See you soon!`;
    case 'delivered':
      return `Hi ${firstName}, your order ${orderNumber} has been delivered. Thank you for choosing us!`;
    case 'cancelled':
      return `Hi ${firstName}, your order ${orderNumber} has been cancelled. Please contact us if this is unexpected.`;
    default:
      return `Order ${orderNumber} update: ${label}.`;
  }
}
