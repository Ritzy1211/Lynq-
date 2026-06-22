/**
 * Re-export the generated Prisma client. Apps depend on `@lynq/db`, not on
 * `@prisma/client` directly, so the generated location is a private detail.
 */
export * from './generated/client';
export { PrismaClient } from './generated/client';
