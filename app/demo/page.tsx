// app/demo/page.tsx
import { prisma } from '../../lib/prisma'
import { revalidatePath } from 'next/cache'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getData() {
  const user = await prisma.user.findFirst({ where: { email: 'demo@points.local' } })
  const wallets = user
    ? await prisma.wallet.findMany({ where: { userId: user.id }, orderBy: { programId: 'asc' } })
    : []
  const total = wallets.reduce((sum, w) => sum + w.points, 0)
  return { user, wallets, total }
}

// Server Action: add or update a wallet
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
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <a href="/" style={{ textDecoration: 'none', color: 'rebeccapurple' }}>Home</a>
        <a href="/demo" style={{ textDecoration: 'none', color: 'rebeccapurple', fontWeight: 600 }}>Demo</a>
      </div>

      <h1>Demo Data</h1>
      <p style={{ color: '#555' }}>
        Seeded wallets for <code>{user?.email}</code>
      </p>

      <div>
        {wallets.map(w => (
          <div
            key={w.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderBottom: '1px solid #eee',
              borderRadius: 8,
              overflow: 'hidden',
              marginBottom: 12,
              border: '1px solid #eee',
            }}
          >
            <strong>{w.programId.toUpperCase()}</strong>
            <span>{w.points.toLocaleString()} pts</span>
          </div>
        ))}
      </div>

      <div style={{ padding: '12px 16px', background: '#fafafa', borderRadius: 8, marginTop: 8, marginBottom: 24 }}>
        <strong>Total:</strong> {total.toLocaleString()} pts
      </div>

      <h2>Add a Wallet (demo)</h2>
      <form action={addWallet} style={{ display: 'grid', gap: 12, maxWidth: 520 }}>
        <label>
          Program ID (e.g. <code>amex_mr</code>, <code>chase_ur</code>, <code>alaska</code>)
          <input
            name="program"
            placeholder="amex_mr"
            style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }}
          />
        </label>

        <label>
          Points
          <input
            name="points"
            placeholder="5000"
            inputMode="numeric"
            style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }}
          />
        </label>

        <button
          type="submit"
          style={{ padding: '12px 14px', borderRadius: 8, background: '#111', color: 'white', border: 0 }}
        >
          Add / Update Wallet
        </button>
      </form>
    </div>
  )
}
