import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface RecordPaymentInput {
  amountKobo: number;
  method: 'cash' | 'transfer' | 'card' | 'pos';
  reference?: string;
}

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async record(tenantId: string, orderId: string, actorUserId: string, input: RecordPaymentInput) {
    if (input.amountKobo <= 0) {
      throw new BadRequestException('Payment amount must be positive.');
    }

    return this.prisma.withTenant(tenantId, async (tx) => {
      const order = await tx.order.findFirst({ where: { id: orderId, tenantId } });
      if (!order) throw new NotFoundException(`Order ${orderId} not found`);

      const newPaid = order.paidKobo + input.amountKobo;
      const overpaid = newPaid > order.totalKobo;
      if (overpaid) {
        throw new BadRequestException(
          `Payment exceeds outstanding balance. Outstanding: ${order.totalKobo - order.paidKobo} kobo.`,
        );
      }

      const paymentStatus = newPaid >= order.totalKobo ? 'paid' : 'partial';

      const [payment] = await Promise.all([
        tx.payment.create({
          data: {
            tenantId,
            orderId,
            amountKobo: input.amountKobo,
            provider: input.method === 'cash' ? 'cash' : input.method === 'pos' ? 'pos_terminal' : 'manual',
            method: input.method,
            status: 'paid',
            providerRef: input.reference,
            paidAt: new Date(),
          },
        }),
        tx.order.update({
          where: { id: orderId },
          data: { paidKobo: newPaid, paymentStatus },
        }),
      ]);

      return payment;
    });
  }

  async listForOrder(tenantId: string, orderId: string) {
    return this.prisma.withTenant(tenantId, async (tx) =>
      tx.payment.findMany({
        where: { tenantId, orderId },
        orderBy: { createdAt: 'desc' },
      }),
    );
  }
}
