import { BadRequestException, Injectable } from '@nestjs/common';
import { ORDER_STATUSES, type OrderStatus } from '@lynq/types';
import { PrismaService } from '../prisma/prisma.service';

/**
 * End-of-day reporting.
 *
 * All windows are computed in the server's local timezone (single-shop
 * assumption). For multi-region tenants we'd take a `?tz=` param and pass it
 * to `parseDayWindow`.
 */
@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async endOfDay(tenantId: string, date: string) {
    const { start, end, isoDate } = parseDayWindow(date);

    return this.prisma.withTenant(tenantId, async (tx) => {
      // 1. Orders created within the window.
      const created = await tx.order.findMany({
        where: { tenantId, createdAt: { gte: start, lte: end } },
        select: {
          id: true,
          number: true,
          status: true,
          totalKobo: true,
          paidKobo: true,
          paymentStatus: true,
          createdAt: true,
          customer: { select: { id: true, fullName: true, phone: true } },
        },
        orderBy: { createdAt: 'asc' },
      });

      const ordersByStatus = Object.fromEntries(ORDER_STATUSES.map((s) => [s, 0])) as Record<
        OrderStatus,
        number
      >;
      let createdValueKobo = 0;
      let createdPaidKobo = 0;
      const unpaid: typeof created = [];
      for (const o of created) {
        ordersByStatus[o.status as OrderStatus]++;
        createdValueKobo += o.totalKobo;
        createdPaidKobo += o.paidKobo;
        if (o.paymentStatus !== 'paid') unpaid.push(o);
      }

      // 2. Orders that *transitioned* to delivered within the window (regardless
      //    of when they were originally created). This is the "completed today"
      //    figure shopkeepers care about.
      const completedEvents = await tx.orderStatusEvent.findMany({
        where: { tenantId, toStatus: 'delivered', createdAt: { gte: start, lte: end } },
        select: {
          createdAt: true,
          order: {
            select: {
              id: true,
              number: true,
              totalKobo: true,
              customer: { select: { fullName: true } },
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      });
      const completed = completedEvents.map((e) => ({
        id: e.order.id,
        number: e.order.number,
        customerName: e.order.customer?.fullName ?? null,
        totalKobo: e.order.totalKobo,
        completedAt: e.createdAt.toISOString(),
      }));

      // 3. Payments collected within the window. We use `paidAt` so a backdated
      //    cash payment lands on the right day's report.
      const payments = await tx.payment.findMany({
        where: {
          tenantId,
          status: 'paid',
          paidAt: { gte: start, lte: end },
        },
        select: {
          id: true,
          amountKobo: true,
          method: true,
          provider: true,
          paidAt: true,
          order: { select: { id: true, number: true } },
        },
        orderBy: { paidAt: 'asc' },
      });

      const paymentMethods: Record<string, { count: number; amountKobo: number }> = {};
      let collectedKobo = 0;
      for (const p of payments) {
        collectedKobo += p.amountKobo;
        const key = p.method || 'unknown';
        if (!paymentMethods[key]) paymentMethods[key] = { count: 0, amountKobo: 0 };
        paymentMethods[key].count++;
        paymentMethods[key].amountKobo += p.amountKobo;
      }

      // 4. Notifications sent within the window (success only).
      const notificationsSent = await tx.notificationLog.count({
        where: { tenantId, status: 'sent', sentAt: { gte: start, lte: end } },
      });
      const notificationsFailed = await tx.notificationLog.count({
        where: { tenantId, status: 'failed', createdAt: { gte: start, lte: end } },
      });

      return {
        date: isoDate,
        windowStart: start.toISOString(),
        windowEnd: end.toISOString(),
        orders: {
          created: created.length,
          createdValueKobo,
          createdPaidKobo,
          createdOutstandingKobo: createdValueKobo - createdPaidKobo,
          byStatus: ordersByStatus,
          unpaid: unpaid.map((o) => ({
            id: o.id,
            number: o.number,
            customerName: o.customer?.fullName ?? null,
            customerPhone: o.customer?.phone ?? null,
            totalKobo: o.totalKobo,
            paidKobo: o.paidKobo,
            outstandingKobo: o.totalKobo - o.paidKobo,
          })),
        },
        completed: {
          count: completed.length,
          totalValueKobo: completed.reduce((s, c) => s + c.totalKobo, 0),
          orders: completed,
        },
        revenue: {
          collectedKobo,
          paymentCount: payments.length,
          byMethod: paymentMethods,
        },
        notifications: {
          sent: notificationsSent,
          failed: notificationsFailed,
        },
      };
    });
  }
}

/**
 * Accepts `YYYY-MM-DD` and returns inclusive local-day bounds.
 * If the input is undefined the caller should pass today's date.
 */
function parseDayWindow(input: string): { start: Date; end: Date; isoDate: string } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input);
  if (!match) {
    throw new BadRequestException(`Invalid date "${input}", expected YYYY-MM-DD.`);
  }
  const [, y, m, d] = match;
  const year = Number(y);
  const month = Number(m);
  const day = Number(d);
  const start = new Date(year, month - 1, day, 0, 0, 0, 0);
  // Reject calendar rollovers like 2025-13-40 silently becoming Feb 2026.
  if (
    start.getFullYear() !== year ||
    start.getMonth() !== month - 1 ||
    start.getDate() !== day
  ) {
    throw new BadRequestException(`Invalid date "${input}".`);
  }
  const end = new Date(year, month - 1, day, 23, 59, 59, 999);
  return { start, end, isoDate: input };
}
