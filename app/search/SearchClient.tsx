'use client'

import { useMemo, useState } from 'react'
import type { ProgramId, ROUTES as ROUTES_CONST, AWARD_CHART as CHART_CONST } from '../../data/awardChart'
import { ROUTES, AWARD_CHART } from '../../data/awardChart'

/** Accept either string or numeric IDs coming from Prisma/serialization */
export type WalletLike = {
  id: string | number
  programId: string
  points: number
}

const ORIGINS: string[] = Array.from(new Set(ROUTES.map(r => r.from)))
const DESTS: string[]   = Array.from(new Set(ROUTES.map(r => r.to)))

function bestOption(wallets: WalletLike[], from: string, to: string) {
  const key = `${from}-${to}` as keyof typeof CHART_CONST
  const chart = AWARD_CHART[key]

  // No chart for that route
  if (!chart) {
    return { program: null as ProgramId | null, cost: null as number | null, canBook: false }
  }

  let best: { program: ProgramId | null; cost: number | null; canBook: boolean } =
    { program: null, cost: null, canBook: false }

  for (const [program, cost] of Object.entries(chart) as [ProgramId, number][]) {
    // If wallet is missing, treat as 0 points
    const points = wallets.find(w => w.programId === program)?.points ?? 0
    const canBook = typeof cost === 'number' && points >= cost

    if (typeof cost === 'number' && (best.cost === null || cost < best.cost)) {
      best = { program, cost, canBook }
    }
  }

  return best
}

export default function SearchClient({ wallets }: { wallets: WalletLike[] }) {
  const [from, setFrom] = useState<string>(ORIGINS[0] ?? '')
  const [to, setTo]     = useState<string>(DESTS[0] ?? '')

  const result = useMemo(() => bestOption(wallets, from, to), [wallets, from, to])

  return (
    <div style={{ maxWidth: 780, margin: '2rem auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Award Finder (mock)</h1>

      <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
        <label>From&nbsp;
          <select value={from} onChange={(e) => setFrom(e.target.value)}>
            {ORIGINS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </label>
        <label>To&nbsp;
          <select value={to} onChange={(e) => setTo(e.target.value)}>
            {DESTS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
      </div>

      {result.cost === null ? (
        <p>No award chart data for <code>{from}</code> → <code>{to}</code>.</p>
      ) : (
        <div>
          <p>
            Cheapest chart price:&nbsp;
            <b>{result.cost.toLocaleString()}</b> via <code>{result.program}</code>.
          </p>
          <p style={{ color: result.canBook ? 'green' : 'crimson' }}>
            {result.canBook ? 'You have enough points to book.' : 'Not enough points in that program.'}
          </p>
        </div>
      )}

      <h3>Your balances</h3>
      <ul>
        {wallets.map(w => (
          <li key={String(w.id)}>
            {w.programId}: {Number(w.points || 0).toLocaleString()} pts
          </li>
        ))}
      </ul>
    </div>
  )
}
