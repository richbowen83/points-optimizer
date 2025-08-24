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
    <div style={{ maxWidth: 820, margin: '2rem auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 40, margin: '0 0 8px' }}>Demo Data</h1>
      <p style={{ color: '#555', marginTop: 0 }}>
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
                    color: '#b42318',
                    background: '#fff',
                    border: '1px solid #eee',
                    borderRadius: 8,
                    padding: '6px 10px',
                    cursor: 'pointer'
                  }}
                >
                  Remove
                </button>
              </form>
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#fafafa' }}>
          <span style={{ fontWeight: 600 }}>Total</span>
          <strong>{total.toLocaleString()} pts</strong>
        </div>
      </div>

      {/* Add Wallet */}
      <form
        action={addWallet}
        method="post"
        style={{
          marginTop: 20,
          display: 'grid',
          gap: 12,
          gridTemplateColumns: 'minmax(220px, 1fr) minmax(200px, 1fr) auto',
          alignItems: 'center'
        }}
      >
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 13, color: '#555' }}>Program ID</span>
          <input
            name="program"
            placeholder="e.g. amex_mr, chase_ur"
            required
            style={{
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: 8,
              outline: 'none'
            }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 13, color: '#555' }}>Points</span>
          <input
            name="points"
            inputMode="numeric"
            pattern="[0-9, ]*"
            placeholder="e.g. 50,000"
            required
            style={{
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: 8,
              outline: 'none'
            }}
          />
        </label>

        <button
          type="submit"
          style={{
            height: 44,
            padding: '0 16px',
            borderRadius: 8,
            border: '1px solid #111',
            background: '#111',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          Add / Update
        </button>
      </form>
    </div>
  )
}
