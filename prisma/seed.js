import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'demo@points.local' },
    update: {},
    create: { email: 'demo@points.local', name: 'Demo User' }
  })

  const wallets = [
    { programId: 'amex_mr', points: 120000 },
    { programId: 'chase_ur', points: 30000 },
    { programId: 'alaska', points: 45000 },
  ]

  for (const w of wallets) {
    await prisma.wallet.create({ data: { userId: user.id, ...w } })
  }

  await prisma.event.create({ data: { userId: user.id, type: 'seed_complete', meta: JSON.stringify({ note: "Demo data loaded" }) } })

  console.log('Seeded demo user:', user.email)
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
