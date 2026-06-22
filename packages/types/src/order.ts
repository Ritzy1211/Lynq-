/**
 * Order lifecycle — single source of truth for the API, web, and mobile clients.
 *
 * Status transitions are intentionally narrow: only the moves listed in
 * `ORDER_STATUS_TRANSITIONS` are legal. The API enforces this map server-side;
 * the dashboards use it to render only valid action buttons.
 */
import { z } from 'zod';

export const ORDER_STATUSES = [
  'received',
  'washing',
  'ironing',
  'ready',
  'delivered',
  'cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Map of `from -> allowed next statuses`. */
export const ORDER_STATUS_TRANSITIONS: Readonly<Record<OrderStatus, readonly OrderStatus[]>> = {
  received: ['washing', 'cancelled'],
  washing: ['ironing', 'cancelled'],
  ironing: ['ready', 'cancelled'],
  ready: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

export const TERMINAL_ORDER_STATUSES: readonly OrderStatus[] = ['delivered', 'cancelled'];

export const ORDER_STATUS_LABELS: Readonly<Record<OrderStatus, string>> = {
  received: 'Received',
  washing: 'Washing',
  ironing: 'Ironing',
  ready: 'Ready for pickup',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export function canTransitionOrderStatus(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_STATUS_TRANSITIONS[from].includes(to);
}

export const FulfillmentMode = {
  Walkin: 'walkin',
  PickupDelivery: 'pickup_delivery',
} as const;
export type FulfillmentMode = (typeof FulfillmentMode)[keyof typeof FulfillmentMode];

export const PaymentStatus = {
  Pending: 'pending',
  Paid: 'paid',
  Refunded: 'refunded',
  Failed: 'failed',
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const PaymentMethod = {
  Cash: 'cash',
  Card: 'card',
  Transfer: 'transfer',
  PosTerminal: 'pos_terminal',
  MobileMoney: 'mobile_money',
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

// ---- DTOs --------------------------------------------------------------------

export const CreateOrderItemSchema = z.object({
  serviceTypeId: z.string().uuid(),
  garmentTypeId: z.string().uuid(),
  quantity: z.number().int().positive().max(999),
  notes: z.string().max(500).optional(),
});

/**
 * Accepts both full ISO 8601 (`2026-06-23T14:30:00.000Z`) and the value
 * produced by an HTML `<input type="datetime-local">` (`2026-06-23T14:30`).
 * Normalizes to a full ISO string.
 */
const FlexibleDateTime = z
  .string()
  .min(1)
  .refine((v) => !Number.isNaN(new Date(v).getTime()), { message: 'Invalid datetime' })
  .transform((v) => new Date(v).toISOString());

export const CreateOrderSchema = z.object({
  customerId: z.string().uuid().optional(),
  customer: z
    .object({
      fullName: z.string().min(1).max(120),
      phone: z.string().min(7).max(20),
      address: z.string().max(255).optional(),
      email: z.string().email().optional().or(z.literal('').transform(() => undefined)),
    })
    .optional(),
  promisedReadyAt: FlexibleDateTime.optional(),
  notes: z.string().max(1000).optional(),
  items: z.array(CreateOrderItemSchema).min(1).max(100),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type CreateOrderItemInput = z.infer<typeof CreateOrderItemSchema>;

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  reason: z.string().max(500).optional(),
});
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;
