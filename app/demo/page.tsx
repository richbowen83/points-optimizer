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
              borderBottom: '1px solid #eee',
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
                    color: 'crimson',
                    background: 'transparent',
                    border: '1px solid #eee',
                    borderRadius: 8,
                    padding: '6px 10px',
                    cursor: 'pointer',
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
            background: '#fafafa',
            fontWeight: 600,
          }}
        >
          <span>Total</span>
          <span>{total.toLocaleString()} pts</span>
        </div>
      </div>

      <form
        action={addWallet}
        method="post"
        style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 18, alignItems: 'center' }}
      >
        <div style={{ flex: '1 1 380px' }}>
          <label style={{ fontSize: 14, color: '#555' }}>Program ID</label>
          <input
            name="program"
            placeholder="e.g. amex_mr, chase_ur, alaska, delta, southwest"
            required
            pattern="^[a-z_]+$"
            title="Use lowercase letters and underscores (e.g. amex_mr)"
            style={{
              width: '100%',
              marginTop: 6,
              padding: 10,
              border: '1px solid #ddd',
              borderRadius: 8,
            }}
          />
        </div>
        <div style={{ flex: '1 1 220px' }}>
          <label style={{ fontSize: 14, color: '#555' }}>Points</label>
          <input
            name="points"
            placeholder="e.g. 50,000"
            inputMode="numeric"
            pattern="^\\d{1,3}(,\\d{3})*$|^\\d+$"
            title="Enter a positive number"
            required
            style={{
              width: '100%',
              marginTop: 6,
              padding: 10,
              border: '1px solid #ddd',
              borderRadius: 8,
            }}
          />
        </div>
        <div>
          <label style={{ visibility: 'hidden' }}>Add</label>
          <button
            type="submit"
            style={{
              display: 'block',
              marginTop: 6,
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid #222',
              background: '#111',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            Add / Update
          </button>
        </div>
      </form>
    </div>
  )
}
