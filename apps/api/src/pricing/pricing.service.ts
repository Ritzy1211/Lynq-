import { Injectable } from '@nestjs/common';
import type { CreateOrderInput, PriceQuote, PricedLine } from '@lynq/types';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Authoritative pricing engine. The dashboard may compute a preview locally,
 * but the API recomputes the total from current `PriceRule` rows during
 * order creation to prevent client-side tampering.
 *
 * v1 is deliberately simple: no VAT, no promo codes — just sum of line items.
 * Both are easy to add later: VAT goes back into `quote()`, promo lookup goes
 * into a `PromoCodeService`.
 */
@Injectable()
export class PricingService {
  constructor(private readonly prisma: PrismaService) {}

  async quote(tenantId: string, input: CreateOrderInput): Promise<PriceQuote> {
    return this.prisma.withTenant(tenantId, async (tx) => {
      const rules = await tx.priceRule.findMany({
        where: {
          tenantId,
          isActive: true,
          OR: input.items.map((i) => ({
            serviceTypeId: i.serviceTypeId,
            garmentTypeId: i.garmentTypeId,
          })),
        },
      });

      const ruleByKey = new Map<string, number>();
      for (const r of rules) {
        ruleByKey.set(`${r.serviceTypeId}::${r.garmentTypeId}`, r.unitPriceKobo);
      }

      const lines: PricedLine[] = input.items.map((i) => {
        const unit = ruleByKey.get(`${i.serviceTypeId}::${i.garmentTypeId}`);
        if (unit === undefined) {
          throw new Error(
            `No price set for that service + garment combination. Add a price in Settings first.`,
          );
        }
        return {
          serviceTypeId: i.serviceTypeId,
          garmentTypeId: i.garmentTypeId,
          quantity: i.quantity,
          unitPriceKobo: unit,
          subtotalKobo: unit * i.quantity,
        };
      });

      const subtotalKobo = lines.reduce((acc, l) => acc + l.subtotalKobo, 0);

      return {
        lines,
        subtotalKobo,
        discountKobo: 0,
        vatKobo: 0,
        totalKobo: subtotalKobo,
      };
    });
  }
}
