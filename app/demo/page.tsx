import { prisma } from '../../lib/prisma'
import { revalidatePath } from 'next/cache'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getData() {
  const user = await prisma.user.findFirst({ where: { email: 'demo@points.local' } })
  const wallets = user
    ? await prisma.wallet.findMany({
        where: { userId: user.id },
        orderBy: { programId: 'asc' },
      })
    : []
  const total = wallets.reduce((sum, w) => sum + w.points, 0)
  return { user, wallets, total }
}

// Server Action: add or update a wallet row
export async function addWallet(formData: FormData) {
  'use server'
  const program = String(formData.get('program') || '').trim().toLowerCase()
  const points = Number(formData.get('points') || 0)

  if (!program || !Number.isFinite(points)) return

  const user = await prisma.user.findFirst({ where: { email: 'demo@points.local' } })
  if (!user) return

  await prisma.wallet.upsert({
    where: { userId_programId: { userId: user.id, programId: program } },
    update: { points },
    create: { userId: user.id, programId: program, points },
  })

  revalidatePath('/demo')
}

export default async function DemoPage() {
  const { user, wallets, total } = await getData()

  return (
    <div style={{ maxWidth: 780, margin: '2rem auto', fontFamily: 'system-ui, sans-serif' }}>
      <nav style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <a href="/" style={{ textDecoration: 'none', color: 'rebeccapurple' }}>Home</a>
        <a href="/demo" style={{ textDecoration: 'none', color: 'rebeccapurple', fontWeight: 600 }}>Demo</a>
      </nav>

      <h1>Demo Data</h1>
      <p style={{ color: '#555' }}>
        Seeded wallets for <code>{user?.email ?? '—'}</code>
      </p>

      <div style={{ border: '1px solid #eee', borderRadius: 12, overflow: 'hidden', marginTop: 12 }}>
        {wallets.map((w) => (
          <div
            key={w.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderBottom: '1px solid #eee',
            }}
          >
            <span>{w.programId}</span>
            <span>{w.points} pts</span>
          </div>
        ))}
      </div>

      <p style={{ marginTop: 24, fontWeight: 500 }}>Total points: {total}</p>
    </div>
  )
}
