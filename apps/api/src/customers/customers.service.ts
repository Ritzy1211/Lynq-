import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateCustomerInput {
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
}

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, input: CreateCustomerInput) {
    return this.prisma.withTenant(tenantId, async (tx) => {
      const existing = await tx.customer.findUnique({
        where: { tenantId_phone: { tenantId, phone: input.phone } },
      });
      if (existing) {
        return tx.customer.update({
          where: { id: existing.id },
          data: {
            fullName: input.fullName,
            email: input.email ?? existing.email,
            address: input.address ?? existing.address,
            notes: input.notes ?? existing.notes,
          },
        });
      }
      return tx.customer.create({ data: { tenantId, ...input } });
    });
  }

  async update(tenantId: string, id: string, input: Partial<CreateCustomerInput>) {
    return this.prisma.withTenant(tenantId, async (tx) => {
      const existing = await tx.customer.findFirst({ where: { id, tenantId } });
      if (!existing) throw new NotFoundException(`Customer ${id} not found`);
      return tx.customer.update({ where: { id }, data: input });
    });
  }

  async list(tenantId: string, search?: string, limit = 100) {
    return this.prisma.withTenant(tenantId, async (tx) => {
      const where = {
        tenantId,
        ...(search && {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' as const } },
            { phone: { contains: search } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }),
      };

      const customers = await tx.customer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: Math.min(limit, 500),
      });

      // Attach a quick unpaid-balance and order-count summary for each customer.
      const ids = customers.map((c) => c.id);
      if (ids.length === 0) return [];

      const stats = await tx.order.groupBy({
        by: ['customerId'],
        where: { tenantId, customerId: { in: ids } },
        _count: { _all: true },
        _sum: { totalKobo: true, paidKobo: true },
      });
      const byId = new Map(stats.map((s) => [s.customerId!, s]));

      return customers.map((c) => {
        const s = byId.get(c.id);
        const total = s?._sum.totalKobo ?? 0;
        const paid = s?._sum.paidKobo ?? 0;
        return {
          ...c,
          ordersCount: s?._count._all ?? 0,
          totalSpentKobo: total,
          unpaidBalanceKobo: Math.max(0, total - paid),
        };
      });
    });
  }

  async findById(tenantId: string, id: string) {
    return this.prisma.withTenant(tenantId, async (tx) => {
      const customer = await tx.customer.findFirst({ where: { id, tenantId } });
      if (!customer) throw new NotFoundException(`Customer ${id} not found`);

      const orders = await tx.order.findMany({
        where: { tenantId, customerId: id },
        orderBy: { createdAt: 'desc' },
        include: { items: { select: { id: true, quantity: true } } },
      });

      const totals = orders.reduce(
        (acc, o) => {
          acc.totalKobo += o.totalKobo;
          acc.paidKobo += o.paidKobo;
          return acc;
        },
        { totalKobo: 0, paidKobo: 0 },
      );

      return {
        ...customer,
        orders,
        ordersCount: orders.length,
        totalSpentKobo: totals.totalKobo,
        unpaidBalanceKobo: Math.max(0, totals.totalKobo - totals.paidKobo),
      };
    });
  }

  async unpaidBalances(tenantId: string) {
    return this.prisma.withTenant(tenantId, async (tx) => {
      const stats = await tx.order.groupBy({
        by: ['customerId'],
        where: { tenantId, customerId: { not: null } },
        _sum: { totalKobo: true, paidKobo: true },
      });

      const owing = stats
        .map((s) => ({
          customerId: s.customerId!,
          totalKobo: s._sum.totalKobo ?? 0,
          paidKobo: s._sum.paidKobo ?? 0,
          unpaidBalanceKobo: Math.max(0, (s._sum.totalKobo ?? 0) - (s._sum.paidKobo ?? 0)),
        }))
        .filter((s) => s.unpaidBalanceKobo > 0)
        .sort((a, b) => b.unpaidBalanceKobo - a.unpaidBalanceKobo);

      if (owing.length === 0) return [];

      const customers = await tx.customer.findMany({
        where: { tenantId, id: { in: owing.map((o) => o.customerId) } },
      });
      const byId = new Map(customers.map((c) => [c.id, c]));

      return owing.map((o) => ({
        ...o,
        customer: byId.get(o.customerId) ?? null,
      }));
    });
  }
}
