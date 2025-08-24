// app/search/SearchClient.tsx
'use client'

import { useMemo, useState } from 'react'
import { ROUTES, AWARD_CHART, type ProgramId, type RouteKey } from '../../data/awardChart'

type WalletLike = { id: string | number; programId: string; points: number }

const ORIGINS: string[] = Array.from(new Set(ROUTES.map(r => r.from)))
const DESTS: string[]   = Array.from(new Set(ROUTES.map(r => r.to)))

function bestOption(wallets: WalletLike[], from: string, to: string) {
  const key = `${from}-${to}` as RouteKey
  const chart = AWARD_CHART[key]
  if (!chart) return { program: null as ProgramId | null, cost: null as number | null, canBook: false }

  let bestProgram: ProgramId | null = null
  let bestCost: number | null = null

  for (const [program, cost] of Object.entries(chart) as [ProgramId, number][]) {
    if (typeof cost !== 'number') continue
    if (bestCost === null || cost < bestCost) {
      bestCost = cost
      bestProgram = program
    }
  }

  const canBook =
    bestProgram != null &&
    bestCost != null &&
    !!wallets.find(w => w.programId === bestProgram && w.points >= bestCost)

  return { program: bestProgram, cost: bestCost, canBook }
}

export default function SearchClient({ wallets }: { wallets: WalletLike[] }) {
  const [from, setFrom] = useState<string>(ORIGINS[0] ?? '')
  const [to, setTo]     = useState<string>(DESTS[0] ?? '')
  const result = useMemo(() => bestOption(wallets, from, to), [wallets, from, to])

  const card: React.CSSProperties = { border: '1px solid #eee', borderRadius: 12, padding: 16, background: '#fff' }

  return (
    <div style={{ maxWidth: 820, margin: '24px auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginBottom: 8 }}>Award Finder (mock)</h1>
      <p style={{ color: '#666', marginTop: 0 }}>Pick a route and we’ll compare your balances to the cheapest chart price.</p>

      <div style={{ display: 'flex', gap: 12, margin: '16px 0' }}>
        <label>From&nbsp;
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            style={{ padding: '8px 10px', border: '1px solid #ddd', borderRadius: 8 }}
          >
            {ORIGINS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </label>
        <label>To&nbsp;
          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
            style={{ padding: '8px 10px', border: '1px solid #ddd', borderRadius: 8 }}
          >
            {DESTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>
      </div>

      <div style={{ ...card, marginBottom: 16 }}>
        {result.cost === null ? (
          <p style={{ margin: 0 }}>No chart data for this route.</p>
        ) : (
          <>
            <div style={{ fontSize: 16 }}>
              Cheapest chart price:&nbsp;
              <b>{result.cost.toLocaleString()}</b>&nbsp;
              <span>via <code>{result.program}</code></span>
            </div>
            <div
              style={{
                marginTop: 8,
                color: result.canBook ? '#0a7' : '#b00020',
                fontWeight: 600,
              }}
            >
              {result.canBook ? 'You have enough points to book.' : 'Not enough points in that program.'}
            </div>
          </>
        )}
      </div>

      <div style={card}>
        <h3 style={{ marginTop: 0 }}>Your balances</h3>
        <ul style={{ margin: '8px 0 0 0', paddingLeft: 18 }}>
          {wallets.map(w => (
            <li key={String(w.id)} style={{ margin: '6px 0' }}>
              <code style={{ textTransform: 'none' }}>{w.programId}</code>: {w.points.toLocaleString()} pts
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
