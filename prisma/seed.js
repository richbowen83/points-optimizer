// prisma/seed.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const DEMO_EMAIL = 'demo@points.local';

// canonical demo balances — edit as you like
const WALLET_SEED = [
  { programId: 'alaska',   points: 45000 },
  { programId: 'amex_mr',  points: 120000 },
  { programId: 'chase_ur', points: 30000 },
  { programId: 'delta',    points: 25000 },
];

async function main() {
  // 1) ensure the demo user exists (idempotent)
  const user = await prisma.user.upsert({
    where:  { email: DEMO_EMAIL },
    update: {},
    create: { email: DEMO_EMAIL, name: 'Demo User' },
  });

  // 2) reset that user’s wallets to the canonical seed
  //    (this keeps the seed idempotent and removes prior duplicates)
  await prisma.wallet.deleteMany({ where: { userId: user.id } });

  await prisma.wallet.createMany({
    data: WALLET_SEED.map(w => ({ ...w, userId: user.id })),
    // if you keep deleteMany above, skipDuplicates is irrelevant but harmless
    skipDuplicates: true,
  });

  console.log(`✅ Seeded ${WALLET_SEED.length} wallets for ${user.email}`);
}

main()
  .catch(err => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
