// app/demo/page.tsx
import { prisma } from '../../lib/prisma'
import { addWallet } from './actions'

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

export default async function DemoPage() {
  const { user, wallets, total } = await getData()

  return (
    <div style={{ maxWidth: 780, margin: '2rem auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Demo Data</h1>
      <p style={{ color: '#555' }}>
        Seeded wallets for <code>{user?.email ?? '—'}</code>
      </p>

      <div style={{ border: '1px solid #eee', borderRadius: 12, overflow: 'hidden', marginTop: 12 }}>
        {wallets.map((w) => (
          <div key={w.id} style={{ display:'flex', justifyContent:'space-between', padding:'12px 16px', borderBottom:'1px solid #eee' }}>
            <span>{w.programId}</span>
            <strong>{w.points.toLocaleString()} pts</strong>
          </div>
        ))}
        <div style={{ display:'flex', justifyContent:'space-between', padding:'12px 16px', background:'#fafafa' }}>
          <span>Total</span>
          <strong>{total.toLocaleString()} pts</strong>
        </div>
      </div>

      <form action={addWallet} style={{ marginTop: 24, display:'flex', gap: 8 }}>
        <input name="program" placeholder="program id e.g. amex_mr" />
        <input name="points" placeholder="points e.g. 50000" />
        <button type="submit">Save</button>
      </form>
    </div>
  )
}
