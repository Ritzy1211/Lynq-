/**
 * Minimal seed: creates one demo tenant with an owner, two branches, a small
 * service / garment catalog, price rules, and a few inventory items.
 *
 * Run with: `pnpm --filter @lynq/db seed`
 */
import { PrismaClient } from '../src/generated/client';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      name: 'Demo Laundry',
      slug: 'demo',
    },
  });

  const [mainBranch, ikejaBranch] = await Promise.all([
    prisma.branch.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: 'Lekki HQ' } },
      update: {},
      create: { tenantId: tenant.id, name: 'Lekki HQ', address: '12 Admiralty Way, Lekki' },
    }),
    prisma.branch.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: 'Ikeja' } },
      update: {},
      create: { tenantId: tenant.id, name: 'Ikeja', address: '5 Allen Avenue, Ikeja' },
    }),
  ]);

  await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'owner@demo.lynq' } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'owner@demo.lynq',
      fullName: 'Demo Owner',
      role: 'owner',
      branches: {
        create: [{ branchId: mainBranch.id }, { branchId: ikejaBranch.id }],
      },
    },
  });

  const services = await Promise.all(
    [
      { name: 'Wash & Iron', code: 'WASH_IRON' },
      { name: 'Dry Clean', code: 'DRY_CLEAN' },
      { name: 'Iron Only', code: 'IRON_ONLY' },
    ].map((s) =>
      prisma.serviceType.upsert({
        where: { tenantId_code: { tenantId: tenant.id, code: s.code } },
        update: {},
        create: { tenantId: tenant.id, ...s },
      }),
    ),
  );

  const garments = await Promise.all(
    [
      { name: 'Shirt', code: 'SHIRT' },
      { name: 'Trouser', code: 'TROUSER' },
      { name: 'Suit (2-piece)', code: 'SUIT_2PC' },
      { name: 'Gown', code: 'GOWN' },
    ].map((g) =>
      prisma.garmentType.upsert({
        where: { tenantId_code: { tenantId: tenant.id, code: g.code } },
        update: {},
        create: { tenantId: tenant.id, ...g },
      }),
    ),
  );

  // Simple price grid (kobo) — Wash&Iron / DryClean / IronOnly per garment.
  const priceMatrix: Record<string, Record<string, number>> = {
    WASH_IRON: { SHIRT: 80000, TROUSER: 100000, SUIT_2PC: 250000, GOWN: 200000 },
    DRY_CLEAN: { SHIRT: 150000, TROUSER: 180000, SUIT_2PC: 450000, GOWN: 350000 },
    IRON_ONLY: { SHIRT: 30000, TROUSER: 40000, SUIT_2PC: 100000, GOWN: 80000 },
  };

  for (const svc of services) {
    for (const grm of garments) {
      const price = priceMatrix[svc.code]?.[grm.code];
      if (!price) continue;
      await prisma.priceRule.upsert({
        where: {
          tenantId_serviceTypeId_garmentTypeId: {
            tenantId: tenant.id,
            serviceTypeId: svc.id,
            garmentTypeId: grm.id,
          },
        },
        update: { unitPriceKobo: price },
        create: {
          tenantId: tenant.id,
          serviceTypeId: svc.id,
          garmentTypeId: grm.id,
          unitPriceKobo: price,
        },
      });
    }
  }

  // Inventory seed for the main branch.
  for (const item of [
    { sku: 'DET-001', name: 'Liquid Detergent (5L)', unit: 'litre', currentStock: 40, reorderLevel: 10 },
    { sku: 'BAG-001', name: 'Branded Laundry Bag', unit: 'piece', currentStock: 250, reorderLevel: 50 },
    { sku: 'HNG-001', name: 'Wire Hanger', unit: 'piece', currentStock: 1000, reorderLevel: 200 },
  ]) {
    await prisma.inventoryItem.upsert({
      where: { tenantId_branchId_sku: { tenantId: tenant.id, branchId: mainBranch.id, sku: item.sku } },
      update: {},
      create: { tenantId: tenant.id, branchId: mainBranch.id, ...item },
    });
  }

  console.log(`Seeded tenant "${tenant.name}" (${tenant.slug}).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
