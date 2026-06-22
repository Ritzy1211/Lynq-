import { Controller, Get } from '@nestjs/common';
import type { TenantClaims } from '@lynq/types';
import { CurrentTenant } from '../auth/auth.decorators';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Reads-only catalog endpoint feeding the order-intake form: the list of
 * services, garment types, and the unit prices for each combination.
 */
@Controller('catalog')
export class CatalogController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async get(@CurrentTenant() tenant: TenantClaims) {
    return this.prisma.withTenant(tenant.tenantId, async (tx) => {
      const [services, garments, priceRules] = await Promise.all([
        tx.serviceType.findMany({
          where: { tenantId: tenant.tenantId, isActive: true },
          orderBy: { name: 'asc' },
        }),
        tx.garmentType.findMany({
          where: { tenantId: tenant.tenantId, isActive: true },
          orderBy: { name: 'asc' },
        }),
        tx.priceRule.findMany({
          where: { tenantId: tenant.tenantId, isActive: true },
        }),
      ]);

      return {
        services: services.map((s) => ({ id: s.id, name: s.name, code: s.code })),
        garments: garments.map((g) => ({ id: g.id, name: g.name, code: g.code })),
        prices: priceRules.map((p) => ({
          serviceTypeId: p.serviceTypeId,
          garmentTypeId: p.garmentTypeId,
          unitPriceKobo: p.unitPriceKobo,
        })),
      };
    });
  }
}
