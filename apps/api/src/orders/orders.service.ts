import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  ORDER_STATUS_TRANSITIONS,
  canTransitionOrderStatus,
  type CreateOrderInput,
  type OrderStatus,
} from '@lynq/types';
import { PrismaService } from '../prisma/prisma.service';
import { PricingService } from '../pricing/pricing.service';
import { NotificationsService } from '../notifications/notifications.service';

/** Statuses that should trigger an outbound notification to the customer. */
const NOTIFY_STATUSES: ReadonlySet<OrderStatus> = new Set(['washing', 'ironing', 'ready', 'delivered', 'cancelled']);

export interface ListOrdersFilters {
  status?: OrderStatus;
  q?: string;
  from?: string; // ISO datetime, ISO date, or YYYY-MM-DD
  to?: string;
  payment?: 'all' | 'paid' | 'unpaid';
  limit?: number;
  cursor?: string; // order id for keyset pagination
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricing: PricingService,
    private readonly notifications: NotificationsService,
  ) {}

  async create(tenantId: string, actorUserId: string, input: CreateOrderInput) {
    const quote = await this.pricing.quote(tenantId, input);

    return this.prisma.withTenant(tenantId, async (tx) => {
      // Single-shop simplification: always attach to the tenant's first branch.
      const branch = await tx.branch.findFirst({
        where: { tenantId, isActive: true },
        orderBy: { createdAt: 'asc' },
      });
      if (!branch) {
        throw new BadRequestException(
          'No active branch found. Run `pnpm --filter @lynq/db seed` to set up your shop.',
        );
      }

      // Resolve customer: existing by id, existing by phone, or create from inline payload.
      let customerId = input.customerId;
      if (!customerId && input.customer) {
        const existing = await tx.customer.findUnique({
          where: { tenantId_phone: { tenantId, phone: input.customer.phone } },
        });
        if (existing) {
          customerId = existing.id;
          await tx.customer.update({
            where: { id: existing.id },
            data: {
              fullName: input.customer.fullName,
              address: input.customer.address ?? existing.address,
              email: input.customer.email ?? existing.email,
            },
          });
        } else {
          const created = await tx.customer.create({
            data: {
              tenantId,
              fullName: input.customer.fullName,
              phone: input.customer.phone,
              address: input.customer.address,
              email: input.customer.email,
            },
          });
          customerId = created.id;
        }
      }
      if (!customerId) {
        throw new BadRequestException('A customer is required to create an order.');
      }

      const number = await nextOrderNumber(tx, tenantId);

      const order = await tx.order.create({
        data: {
          tenantId,
          branchId: branch.id,
          customerId,
          number,
          status: 'received',
          fulfillmentMode: 'walkin',
          subtotalKobo: quote.subtotalKobo,
          discountKobo: 0,
          vatKobo: 0,
          totalKobo: quote.totalKobo,
          promisedReadyAt: input.promisedReadyAt ? new Date(input.promisedReadyAt) : null,
          notes: input.notes,
          createdByUserId: actorUserId,
          items: {
            create: quote.lines.map((line, idx) => ({
              tenantId,
              serviceTypeId: line.serviceTypeId,
              garmentTypeId: line.garmentTypeId,
              quantity: line.quantity,
              unitPriceKobo: line.unitPriceKobo,
              subtotalKobo: line.subtotalKobo,
              garmentTag: `${number}-${(idx + 1).toString().padStart(2, '0')}`,
              notes: input.items[idx]?.notes,
              photoKeys: [],
            })),
          },
          statusEvents: {
            create: {
              tenantId,
              fromStatus: null,
              toStatus: 'received',
              actorUserId,
            },
          },
        },
        include: {
          items: { include: { serviceType: true, garmentType: true } },
          customer: true,
        },
      });

      return order;
    });
  }

  async findById(tenantId: string, id: string) {
    return this.prisma.withTenant(tenantId, async (tx) => {
      const order = await tx.order.findFirst({
        where: { id, tenantId },
        include: {
          items: { include: { serviceType: true, garmentType: true } },
          statusEvents: { orderBy: { createdAt: 'asc' } },
          payments: { orderBy: { createdAt: 'desc' } },
          customer: true,
        },
      });
      if (!order) throw new NotFoundException(`Order ${id} not found`);
      return order;
    });
  }

  async list(tenantId: string, filters: ListOrdersFilters) {
    const limit = Math.min(Math.max(filters.limit ?? 50, 1), 200);
    const fromDate = filters.from ? parseFlexibleDate(filters.from, 'start') : null;
    const toDate = filters.to ? parseFlexibleDate(filters.to, 'end') : null;

    const createdAt =
      fromDate || toDate
        ? {
            ...(fromDate ? { gte: fromDate } : {}),
            ...(toDate ? { lte: toDate } : {}),
          }
        : undefined;

    const paymentFilter =
      filters.payment === 'paid'
        ? { paymentStatus: 'paid' }
        : filters.payment === 'unpaid'
          ? { paymentStatus: { in: ['pending', 'partial'] } }
          : {};

    const q = filters.q?.trim();
    const search = q
      ? {
          OR: [
            { number: { contains: q, mode: 'insensitive' as const } },
            { customer: { is: { fullName: { contains: q, mode: 'insensitive' as const } } } },
            { customer: { is: { phone: { contains: q } } } },
          ],
        }
      : {};

    return this.prisma.withTenant(tenantId, async (tx) => {
      const rows = await tx.order.findMany({
        where: {
          tenantId,
          ...(filters.status ? { status: filters.status } : {}),
          ...(createdAt ? { createdAt } : {}),
          ...paymentFilter,
          ...search,
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: limit + 1,
        ...(filters.cursor ? { cursor: { id: filters.cursor }, skip: 1 } : {}),
        include: {
          customer: { select: { id: true, fullName: true, phone: true } },
          items: { select: { id: true, quantity: true } },
        },
      });
      const hasMore = rows.length > limit;
      const items = hasMore ? rows.slice(0, limit) : rows;
      return {
        items,
        nextCursor: hasMore ? items[items.length - 1]?.id ?? null : null,
      };
    });
  }

  async advanceStatus(
    tenantId: string,
    orderId: string,
    to: OrderStatus,
    actorUserId: string,
    reason?: string,
  ) {
    return this.prisma.withTenant(tenantId, async (tx) => {
      const order = await tx.order.findFirst({ where: { id: orderId, tenantId } });
      if (!order) throw new NotFoundException(`Order ${orderId} not found`);

      const from = order.status as OrderStatus;
      if (!canTransitionOrderStatus(from, to)) {
        const allowed = ORDER_STATUS_TRANSITIONS[from].join(', ') || '(none — terminal state)';
        throw new BadRequestException(`Illegal transition ${from} -> ${to}. Allowed: ${allowed}`);
      }

      const completedAt = to === 'delivered' ? new Date() : order.completedAt;

      const [updated] = await Promise.all([
        tx.order.update({
          where: { id: orderId },
          data: { status: to, completedAt },
        }),
        tx.orderStatusEvent.create({
          data: { tenantId, orderId, fromStatus: from, toStatus: to, actorUserId, reason },
        }),
      ]);
      return updated;
    }).then(async (updated) => {
      // Fire-and-record notification outside the transaction so a notification
      // failure never rolls back the status change. The notifier swallows its
      // own errors and logs them in NotificationLog.
      if (NOTIFY_STATUSES.has(to)) {
        await this.notifications.notifyStatusChange(tenantId, orderId, to).catch(() => undefined);
      }
      return updated;
    });
  }
}

async function nextOrderNumber(
  tx: { order: { count: (args: { where: { tenantId: string } }) => Promise<number> } },
  tenantId: string,
): Promise<string> {
  const count = await tx.order.count({ where: { tenantId } });
  const seq = (count + 1).toString().padStart(4, '0');
  return `LYNQ-${seq}`;
}

/**
 * Accepts:
 *   - YYYY-MM-DD (treated as UTC midnight; `end` returns 23:59:59.999 UTC)
 *   - Full ISO datetime (returned as-is)
 *
 * Returns `null` for unparseable input so the caller can ignore it.
 */
function parseFlexibleDate(input: string, edge: 'start' | 'end'): Date | null {
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const time = edge === 'end' ? 'T23:59:59.999Z' : 'T00:00:00.000Z';
    const d = new Date(input + time);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? null : d;
}
