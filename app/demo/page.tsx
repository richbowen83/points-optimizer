// app/demo/page.tsx
import { addWallet, deleteWallet } from './actions'
import { prisma } from '../../lib/prisma'

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
          <div
            key={w.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderBottom: '1px solid #eee'
            }}
          >
            <span style={{ textTransform: 'none' }}>{w.programId}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <strong>{w.points.toLocaleString()} pts</strong>
              <form action={deleteWallet} method="post">
                <input type="hidden" name="program" value={w.programId} />
                <button
                  type="submit"
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    background: '#fff',
                    color: '#b00020',
                    border: '1px solid #ffd6de'
                  }}
                >
                  Remove
                </button>
              </form>
            </div>
          </div>
        ))}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '12px 16px',
            background: '#fafafa'
          }}
        >
          <span>Total</span>
          <strong>{total.toLocaleString()} pts</strong>
        </div>
      </div>

      {/* Add Wallet form */}
      <form
        action={addWallet}
        style={{
          marginTop: 24,
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap'
        }}
      >
        <input
          name="program"
          placeholder="program id (e.g. amex_mr)"
          style={{
            flex: '1 1 220px',
            padding: 8,
            border: '1px solid #ddd',
            borderRadius: 8
          }}
        />
        <input
          name="points"
          placeholder="points (e.g. 50000)"
          type="number"
          style={{
            flex: '1 1 160px',
            padding: 8,
            border: '1px solid #ddd',
            borderRadius: 8
          }}
        />
        <button
          type="submit"
          style={{
            padding: '8px 16px',
            background: 'black',
            color: 'white',
            border: '1px solid black',
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Save
        </button>
      </form>
    </div>
  )
}
