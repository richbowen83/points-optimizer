// app/demo/page.tsx
import { prisma } from '../../lib/prisma'
import { addWallet, deleteWallet } from './actions'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

type WalletRow = { id: number; programId: string; points: number }

const LOGO_BY_PROGRAM: Record<string, string> = {
  alaska: 'alaska',
  amex_mr: 'amex',
  chase_ur: 'chase',
  delta: 'delta',
  southwest: 'southwest',
}
const PRETTY: Record<string, string> = {
  alaska: 'Alaska',
  amex_mr: 'Amex MR',
  chase_ur: 'Chase UR',
  delta: 'Delta',
  southwest: 'Southwest',
}

async function getData() {
  const user = await prisma.user.findFirst({ where: { email: 'demo@points.local' } })
  const wallets: WalletRow[] = user
    ? await prisma.wallet.findMany({
        where: { userId: user.id },
        orderBy: { programId: 'asc' },
        select: { id: true, programId: true, points: true },
      })
    : []
  const total = wallets.reduce((sum, w) => sum + Number(w.points || 0), 0)
  return { user, wallets, total }
}

export default async function DemoPage() {
  const { user, wallets, total } = await getData()

  return (
    <div style={{ maxWidth: 920, margin: '2rem auto', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, sans-serif' }}>
      <h1 style={{ fontSize: 40, lineHeight: 1.1, marginBottom: 4 }}>Demo Data</h1>
      <p style={{ color: '#555', marginTop: 0 }}>
        Seeded wallets for <code>{user?.email ?? '—'}</code>
      </p>

      {/* Wallet list */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', marginTop: 16 }}>
        {wallets.map((w) => {
          const logoKey = LOGO_BY_PROGRAM[w.programId] ?? w.programId
          const pretty = PRETTY[w.programId] ?? w.programId
          return (
            <div
              key={w.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto',
                alignItems: 'center',
                gap: 12,
                padding: '14px 16px',
                borderBottom: '1px solid #eee'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <img
                  src={`/logos/${logoKey}.svg`}
                  alt={pretty}
                  width={28}
                  height={28}
                  style={{ borderRadius: 6, boxShadow: '0 0 0 1px rgba(0,0,0,0.06)' }}
                />
                <span style={{ fontSize: 16, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {pretty}
                </span>
              </div>

              <div style={{ fontWeight: 700 }}>
                {Number(w.points).toLocaleString()} pts
              </div>

              <form action={deleteWallet} method="post">
                <input type="hidden" name="program" value={w.programId} />
                <button
                  type="submit"
                  style={{
                    color: '#b91c1c',
                    background: 'transparent',
                    border: '1px solid #f1f1f1',
                    borderRadius: 8,
                    padding: '6px 10px',
                    cursor: 'pointer'
                  }}
                >
                  Remove
                </button>
              </form>
            </div>
          )
        })}

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', background: '#fafafa' }}>
          <span style={{ fontWeight: 600 }}>Total</span>
          <strong>{total.toLocaleString()} pts</strong>
        </div>
      </div>

      {/* Add / Update wallet */}
      <form
        action={addWallet}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr auto',
          gap: 12,
          marginTop: 16
        }}
      >
        <input
          name="program"
          placeholder="program id (e.g. amex_mr)"
          autoCapitalize="off"
          spellCheck={false}
          style={{
            padding: '10px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: 10,
            fontSize: 14
          }}
        />
        <input
          name="points"
          placeholder="points (e.g. 50000)"
          inputMode="numeric"
          style={{
            padding: '10px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: 10,
            fontSize: 14
          }}
        />
        <button
          type="submit"
          style={{
            background: 'black',
            color: 'white',
            border: '1px solid #111',
            borderRadius: 10,
            padding: '10px 14px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Add / Update Wallet
        </button>
      </form>
    </div>
  )
}
