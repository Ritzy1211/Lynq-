/**
 * Pricing primitives shared between the API (authoritative) and dashboards
 * (preview during order intake).
 *
 * All monetary values are stored as integer **kobo** (NGN minor units) to
 * avoid floating-point rounding issues in pricing math.
 */
import { z } from 'zod';

export const KOBO_PER_NAIRA = 100;

export function nairaToKobo(naira: number): number {
  return Math.round(naira * KOBO_PER_NAIRA);
}

export function koboToNaira(kobo: number): number {
  return kobo / KOBO_PER_NAIRA;
}

export function formatNgn(kobo: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
  }).format(koboToNaira(kobo));
}

export const PriceRuleSchema = z.object({
  serviceTypeId: z.string().uuid(),
  garmentTypeId: z.string().uuid(),
  unitPriceKobo: z.number().int().nonnegative(),
});
export type PriceRule = z.infer<typeof PriceRuleSchema>;

export interface PricedLine {
  serviceTypeId: string;
  garmentTypeId: string;
  quantity: number;
  unitPriceKobo: number;
  subtotalKobo: number;
}

export interface PriceQuote {
  lines: PricedLine[];
  subtotalKobo: number;
  discountKobo: number;
  vatKobo: number;
  totalKobo: number;
  appliedPromoCode?: string;
}
