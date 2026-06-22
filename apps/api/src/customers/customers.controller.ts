import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { z } from 'zod';
import type { TenantClaims } from '@lynq/types';
import { CurrentTenant } from '../auth/auth.decorators';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CustomersService } from './customers.service';

const CreateCustomerSchema = z.object({
  fullName: z.string().min(1).max(120),
  phone: z.string().min(7).max(20),
  email: z.string().email().optional().or(z.literal('').transform(() => undefined)),
  address: z.string().max(255).optional(),
  notes: z.string().max(1000).optional(),
});
type CreateCustomerInput = z.infer<typeof CreateCustomerSchema>;

const UpdateCustomerSchema = CreateCustomerSchema.partial();
type UpdateCustomerInput = z.infer<typeof UpdateCustomerSchema>;

@Controller('customers')
export class CustomersController {
  constructor(private readonly customers: CustomersService) {}

  @Get()
  list(@CurrentTenant() tenant: TenantClaims, @Query('search') search?: string) {
    return this.customers.list(tenant.tenantId, search);
  }

  @Get('balances/unpaid')
  unpaid(@CurrentTenant() tenant: TenantClaims) {
    return this.customers.unpaidBalances(tenant.tenantId);
  }

  @Get(':id')
  get(@CurrentTenant() tenant: TenantClaims, @Param('id', ParseUUIDPipe) id: string) {
    return this.customers.findById(tenant.tenantId, id);
  }

  @Post()
  create(
    @CurrentTenant() tenant: TenantClaims,
    @Body(new ZodValidationPipe(CreateCustomerSchema)) body: CreateCustomerInput,
  ) {
    return this.customers.create(tenant.tenantId, body);
  }

  @Patch(':id')
  update(
    @CurrentTenant() tenant: TenantClaims,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpdateCustomerSchema)) body: UpdateCustomerInput,
  ) {
    return this.customers.update(tenant.tenantId, id, body);
  }
}
