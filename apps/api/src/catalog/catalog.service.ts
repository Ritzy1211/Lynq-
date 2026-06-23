import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface UpsertServiceInput {
  name: string;
  code?: string;
}

export interface UpsertGarmentInput {
  name: string;
  code?: string;
}

export interface SetPriceInput {
  serviceTypeId: string;
  garmentTypeId: string;
  unitPriceKobo: number | null; // null removes the price (sets isActive=false)
}

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, includeInactive = false) {
    return this.prisma.withTenant(tenantId, async (tx) => {
      const activeFilter = includeInactive ? {} : { isActive: true };
      const [services, garments, priceRules] = await Promise.all([
        tx.serviceType.findMany({
          where: { tenantId, ...activeFilter },
          orderBy: { name: 'asc' },
        }),
        tx.garmentType.findMany({
          where: { tenantId, ...activeFilter },
          orderBy: { name: 'asc' },
        }),
        tx.priceRule.findMany({
          where: { tenantId, isActive: true },
        }),
      ]);
      return {
        services: services.map((s) => ({
          id: s.id,
          name: s.name,
          code: s.code,
          isActive: s.isActive,
        })),
        garments: garments.map((g) => ({
          id: g.id,
          name: g.name,
          code: g.code,
          isActive: g.isActive,
        })),
        prices: priceRules.map((p) => ({
          serviceTypeId: p.serviceTypeId,
          garmentTypeId: p.garmentTypeId,
          unitPriceKobo: p.unitPriceKobo,
        })),
      };
    });
  }

  async createService(tenantId: string, input: UpsertServiceInput) {
    const code = (input.code ?? slugifyCode(input.name)).slice(0, 40);
    if (!code) throw new BadRequestException('Service code could not be derived from the name.');
    return this.prisma.withTenant(tenantId, async (tx) => {
      const existing = await tx.serviceType.findUnique({
        where: { tenantId_code: { tenantId, code } },
      });
      if (existing) {
        throw new BadRequestException(`A service with code "${code}" already exists.`);
      }
      return tx.serviceType.create({
        data: { tenantId, name: input.name.trim(), code },
      });
    });
  }

  async updateService(
    tenantId: string,
    id: string,
    input: { name?: string; isActive?: boolean },
  ) {
    return this.prisma.withTenant(tenantId, async (tx) => {
      const existing = await tx.serviceType.findFirst({ where: { id, tenantId } });
      if (!existing) throw new NotFoundException(`Service ${id} not found`);
      return tx.serviceType.update({
        where: { id },
        data: {
          ...(input.name !== undefined ? { name: input.name.trim() } : {}),
          ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        },
      });
    });
  }

  async createGarment(tenantId: string, input: UpsertGarmentInput) {
    const code = (input.code ?? slugifyCode(input.name)).slice(0, 40);
    if (!code) throw new BadRequestException('Garment code could not be derived from the name.');
    return this.prisma.withTenant(tenantId, async (tx) => {
      const existing = await tx.garmentType.findUnique({
        where: { tenantId_code: { tenantId, code } },
      });
      if (existing) {
        throw new BadRequestException(`A garment with code "${code}" already exists.`);
      }
      return tx.garmentType.create({
        data: { tenantId, name: input.name.trim(), code },
      });
    });
  }

  async updateGarment(
    tenantId: string,
    id: string,
    input: { name?: string; isActive?: boolean },
  ) {
    return this.prisma.withTenant(tenantId, async (tx) => {
      const existing = await tx.garmentType.findFirst({ where: { id, tenantId } });
      if (!existing) throw new NotFoundException(`Garment ${id} not found`);
      return tx.garmentType.update({
        where: { id },
        data: {
          ...(input.name !== undefined ? { name: input.name.trim() } : {}),
          ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        },
      });
    });
  }

  /**
   * Idempotent set of a single price cell. Pass `unitPriceKobo: null` to remove
   * the price (we soft-delete by setting `isActive=false` so historical orders
   * keep their FK).
   */
  async setPrice(tenantId: string, input: SetPriceInput) {
    return this.prisma.withTenant(tenantId, async (tx) => {
      const [service, garment] = await Promise.all([
        tx.serviceType.findFirst({ where: { id: input.serviceTypeId, tenantId } }),
        tx.garmentType.findFirst({ where: { id: input.garmentTypeId, tenantId } }),
      ]);
      if (!service) throw new NotFoundException(`Service ${input.serviceTypeId} not found`);
      if (!garment) throw new NotFoundException(`Garment ${input.garmentTypeId} not found`);

      if (input.unitPriceKobo === null) {
        // Soft-delete: deactivate the rule if it exists.
        const existing = await tx.priceRule.findUnique({
          where: {
            tenantId_serviceTypeId_garmentTypeId: {
              tenantId,
              serviceTypeId: input.serviceTypeId,
              garmentTypeId: input.garmentTypeId,
            },
          },
        });
        if (!existing) return null;
        return tx.priceRule.update({
          where: { id: existing.id },
          data: { isActive: false },
        });
      }

      if (input.unitPriceKobo < 0 || !Number.isFinite(input.unitPriceKobo)) {
        throw new BadRequestException('Unit price must be a non-negative integer (in kobo).');
      }

      return tx.priceRule.upsert({
        where: {
          tenantId_serviceTypeId_garmentTypeId: {
            tenantId,
            serviceTypeId: input.serviceTypeId,
            garmentTypeId: input.garmentTypeId,
          },
        },
        update: { unitPriceKobo: input.unitPriceKobo, isActive: true },
        create: {
          tenantId,
          serviceTypeId: input.serviceTypeId,
          garmentTypeId: input.garmentTypeId,
          unitPriceKobo: input.unitPriceKobo,
        },
      });
    });
  }
}

/**
 * Turn a free-text name into a stable upper-snake-case code.
 *  "Pillow case" -> "PILLOW_CASE"
 *  "Suit (2-piece)" -> "SUIT_2_PIECE"
 */
function slugifyCode(name: string): string {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}
