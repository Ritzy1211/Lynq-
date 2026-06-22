import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { z } from 'zod';
import type { TenantClaims } from '@lynq/types';
import { CurrentTenant } from '../auth/auth.decorators';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { PaymentsService } from './payments.service';

const RecordPaymentSchema = z.object({
  amountKobo: z.number().int().positive(),
  method: z.enum(['cash', 'transfer', 'card', 'pos']),
  reference: z.string().max(100).optional(),
});
type RecordPaymentInput = z.infer<typeof RecordPaymentSchema>;

@Controller('orders/:id/payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Get()
  list(@CurrentTenant() tenant: TenantClaims, @Param('id', ParseUUIDPipe) id: string) {
    return this.payments.listForOrder(tenant.tenantId, id);
  }

  @Post()
  record(
    @CurrentTenant() tenant: TenantClaims,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(RecordPaymentSchema)) body: RecordPaymentInput,
  ) {
    return this.payments.record(tenant.tenantId, id, tenant.userId, body);
  }
}
