import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { z } from 'zod';
import {
  CreateOrderSchema,
  ORDER_STATUSES,
  UpdateOrderStatusSchema,
  type CreateOrderInput,
  type OrderStatus,
  type TenantClaims,
} from '@lynq/types';
import { CurrentTenant } from '../auth/auth.decorators';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { OrdersService } from './orders.service';

const ListOrdersQuerySchema = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  q: z.string().min(1).max(80).optional(),
  from: z.string().min(1).max(40).optional(),
  to: z.string().min(1).max(40).optional(),
  payment: z.enum(['all', 'paid', 'unpaid']).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
  cursor: z.string().uuid().optional(),
});

@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  create(
    @CurrentTenant() tenant: TenantClaims,
    @Body(new ZodValidationPipe(CreateOrderSchema)) body: CreateOrderInput,
  ) {
    return this.orders.create(tenant.tenantId, tenant.userId, body);
  }

  @Get()
  list(
    @CurrentTenant() tenant: TenantClaims,
    @Query(new ZodValidationPipe(ListOrdersQuerySchema)) query: z.infer<typeof ListOrdersQuerySchema>,
  ) {
    return this.orders.list(tenant.tenantId, query);
  }

  @Get(':id')
  get(@CurrentTenant() tenant: TenantClaims, @Param('id', ParseUUIDPipe) id: string) {
    return this.orders.findById(tenant.tenantId, id);
  }

  @Post(':id/status')
  advanceStatus(
    @CurrentTenant() tenant: TenantClaims,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpdateOrderStatusSchema)) body: { status: OrderStatus; reason?: string },
  ) {
    return this.orders.advanceStatus(tenant.tenantId, id, body.status, tenant.userId, body.reason);
  }
}
