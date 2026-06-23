import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { z } from 'zod';
import type { TenantClaims } from '@lynq/types';
import { CurrentTenant } from '../auth/auth.decorators';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CatalogService } from './catalog.service';

const ListQuerySchema = z.object({
  includeInactive: z.enum(['true', 'false', '1', '0']).optional(),
});

const CreateServiceSchema = z.object({
  name: z.string().min(1).max(60),
  code: z
    .string()
    .min(1)
    .max(40)
    .regex(/^[A-Z0-9_]+$/, 'code must be UPPER_SNAKE_CASE')
    .optional(),
});

const UpdateServiceSchema = z.object({
  name: z.string().min(1).max(60).optional(),
  isActive: z.boolean().optional(),
});

const CreateGarmentSchema = CreateServiceSchema;
const UpdateGarmentSchema = UpdateServiceSchema;

const SetPriceSchema = z.object({
  serviceTypeId: z.string().uuid(),
  garmentTypeId: z.string().uuid(),
  unitPriceKobo: z.number().int().min(0).max(100_000_000).nullable(),
});

/**
 * Catalog read + admin endpoints.
 *
 * `GET /catalog` returns the full catalog for both the order-intake screen and
 * the management UI. The CRUD endpoints below back Settings → Catalog.
 */
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get()
  list(
    @CurrentTenant() tenant: TenantClaims,
    @Query(new ZodValidationPipe(ListQuerySchema)) query: z.infer<typeof ListQuerySchema>,
  ) {
    const includeInactive = query.includeInactive === 'true' || query.includeInactive === '1';
    return this.catalog.list(tenant.tenantId, includeInactive);
  }

  @Post('services')
  createService(
    @CurrentTenant() tenant: TenantClaims,
    @Body(new ZodValidationPipe(CreateServiceSchema)) body: z.infer<typeof CreateServiceSchema>,
  ) {
    return this.catalog.createService(tenant.tenantId, body);
  }

  @Patch('services/:id')
  updateService(
    @CurrentTenant() tenant: TenantClaims,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpdateServiceSchema)) body: z.infer<typeof UpdateServiceSchema>,
  ) {
    return this.catalog.updateService(tenant.tenantId, id, body);
  }

  @Post('garments')
  createGarment(
    @CurrentTenant() tenant: TenantClaims,
    @Body(new ZodValidationPipe(CreateGarmentSchema)) body: z.infer<typeof CreateGarmentSchema>,
  ) {
    return this.catalog.createGarment(tenant.tenantId, body);
  }

  @Patch('garments/:id')
  updateGarment(
    @CurrentTenant() tenant: TenantClaims,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpdateGarmentSchema)) body: z.infer<typeof UpdateGarmentSchema>,
  ) {
    return this.catalog.updateGarment(tenant.tenantId, id, body);
  }

  @Put('prices')
  setPrice(
    @CurrentTenant() tenant: TenantClaims,
    @Body(new ZodValidationPipe(SetPriceSchema)) body: z.infer<typeof SetPriceSchema>,
  ) {
    return this.catalog.setPrice(tenant.tenantId, body);
  }
}
