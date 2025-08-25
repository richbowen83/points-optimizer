// app/demo/page.tsx
import { addWallet, deleteWallet } from './actions'
import { prisma } from '../../lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

// pretty labels + logo paths + color accents
const PRETTY: Record<string, string> = {
  alaska: 'Alaska',
  amex_mr: 'Amex MR',
  chase_ur: 'Chase UR',
  delta: 'Delta',
  southwest: 'Southwest',
}
const LOGO: Record<string, string> = {
  alaska: '/logos/alaska.svg',
  amex_mr: '/logos/amex.svg',
  chase_ur: '/logos/chase.svg',
  delta: '/logos/delta.svg',
  southwest: '/logos/southwest.svg',
}
const COLOR: Record<string, string> = {
  alaska: '#006097',
  amex_mr: '#016FD0',
  chase_ur: '#0A2239',
  delta: '#C8102E',
  southwest: '#304CB2',
}

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
      <h1 style={{ marginBottom: 8 }}>Demo Data</h1>
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
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img
                src={LOGO[w.programId] ?? '/logos/amex.svg'}
                alt=""
                width={22}
                height={22}
                style={{ display: 'block', opacity: 0.9 }}
              />
              <span style={{ textTransform: 'none' }}>
                {PRETTY[w.programId] ?? w.programId}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <strong style={{ color: COLOR[w.programId] ?? '#111', fontWeight: 700 }}>
                {w.points.toLocaleString()} pts
              </strong>
              <form action={deleteWallet} method="post">
                <input type="hidden" name="program" value={w.programId} />
                <button
                  type="submit"
                  style={{
                    color: 'crimson',
                    background: 'transparent',
                    border: '1px solid #eee',
                    borderRadius: 6,
                    padding: '4px 8px',
                    cursor: 'pointer',
                  }}
                >
                  Remove
                </button>
              </form>
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#fafafa' }}>
          <span>Total</span>
          <strong>{total.toLocaleString()} pts</strong>
        </div>
      </div>

      <form action={addWallet} style={{ marginTop: 24, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input
          name="program"
          placeholder="program id (e.g. amex_mr)"
          style={{ flex: '1 1 220px', padding: 8, border: '1px solid #ddd', borderRadius: 6 }}
          required
        />
        <input
          name="points"
          type="number"
          min={0}
          step={1}
          placeholder="points (e.g. 50000)"
          style={{ width: 180, padding: 8, border: '1px solid #ddd', borderRadius: 6 }}
          required
        />
        <button
          type="submit"
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid #ddd',
            background: '#111',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          Add / Update Wallet
        </button>
      </form>
    </div>
  )
}
