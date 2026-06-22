import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@lynq/db';

/**
 * Wraps PrismaClient with a tenant-scoped helper.
 *
 * `withTenant(tenantId, fn)` opens a transaction, sets the
 * `app.current_tenant` GUC, and runs `fn` with a tx client. All queries inside
 * the callback are subject to the row-level security policies defined in
 * `packages/db/prisma/rls.sql`.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Connected to Postgres');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  async withTenant<T>(tenantId: string, fn: (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>): Promise<T> {
    return this.$transaction(async (tx) => {
      // `set_config(name, value, is_local=true)` scopes the GUC to this tx.
      await tx.$executeRaw`SELECT set_config('app.current_tenant', ${tenantId}, true)`;
      return fn(tx);
    });
  }
}
