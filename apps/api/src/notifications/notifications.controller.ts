import { Controller, Get, NotFoundException, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { z } from 'zod';
import type { OrderStatus, TenantClaims } from '@lynq/types';
import { CurrentTenant } from '../auth/auth.decorators';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { ZodValidationPipe } from '../common/zod-validation.pipe';

const ListQuerySchema = z.object({
  status: z.enum(['queued', 'sent', 'failed']).optional(),
  channel: z.string().min(1).max(40).optional(),
  orderId: z.string().uuid().optional(),
  search: z.string().min(1).max(80).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
  cursor: z.string().uuid().optional(),
});

@Controller()
export class NotificationsController {
  constructor(
    private readonly notifications: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  // Tenant-wide feed for the staff inbox.
  @Get('notifications')
  list(
    @CurrentTenant() tenant: TenantClaims,
    @Query(new ZodValidationPipe(ListQuerySchema)) query: z.infer<typeof ListQuerySchema>,
  ) {
    return this.notifications.list(tenant.tenantId, query);
  }

  @Post('notifications/:id/retry')
  retry(@CurrentTenant() tenant: TenantClaims, @Param('id', ParseUUIDPipe) id: string) {
    return this.notifications.retry(tenant.tenantId, id);
  }

  // Per-order helpers (kept for the order detail page).
  @Get('orders/:id/notifications')
  listForOrder(@CurrentTenant() tenant: TenantClaims, @Param('id', ParseUUIDPipe) id: string) {
    return this.notifications.listForOrder(tenant.tenantId, id);
  }

  @Post('orders/:id/notifications')
  async notifyCurrentStatus(
    @CurrentTenant() tenant: TenantClaims,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const order = await this.prisma.withTenant(tenant.tenantId, (tx) =>
      tx.order.findFirst({ where: { id, tenantId: tenant.tenantId } }),
    );
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return this.notifications.notifyStatusChange(tenant.tenantId, id, order.status as OrderStatus);
  }
}
