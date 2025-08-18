export const dynamic = "force-dynamic"

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function DemoPage() {
  const user = await prisma.user.findFirst({ where: { email: 'demo@points.local' } })
  const wallets = user ? await prisma.wallet.findMany({ where: { userId: user.id } }) : []
  return (
    <div style={{maxWidth:'600px',margin:'2rem auto',fontFamily:'sans-serif'}}>
      <h1>Demo Data</h1>
      <p>Seeded wallets for <code>demo@points.local</code></p>
      <ul>
        {wallets.map(w => (
          <li key={w.id}>{w.programId}: {w.points} pts</li>
        ))}
      </ul>
    </div>
  )
}
