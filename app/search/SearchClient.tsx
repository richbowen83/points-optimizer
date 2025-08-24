'use client'

import { useMemo, useState } from 'react'
import { ROUTES, getChart, ProgramId } from '../../data/awardChart'

type WalletLike = { id: string | number; programId: string; points: number }

const ORIGINS: string[] = Array.from(new Set(ROUTES.map(r => r.from)))
const DESTS: string[]   = Array.from(new Set(ROUTES.map(r => r.to)))

function bestOption(wallets: WalletLike[], from: string, to: string) {
  const chart = getChart(from, to)
  if (!chart) return { program: null as ProgramId | null, cost: null as number | null, canBook: false }

  let best: { program: ProgramId | null; cost: number | null; canBook: boolean } =
    { program: null, cost: null, canBook: false }

  for (const [program, cost] of Object.entries(chart) as [ProgramId, number][]) {
    if (typeof cost !== 'number') continue
    const w = wallets.find((x) => x.programId === program)
    const canBook = !!w && w.points >= cost
    if (best.cost === null || cost < best.cost) {
      best = { program, cost, canBook }
    }
  }
  return best
}

export default function SearchClient({ wallets }: { wallets: WalletLike[] }) {
  const [from, setFrom] = useState<string>(ORIGINS[0] ?? '')
  const [to, setTo]     = useState<string>(DESTS[0] ?? '')
  const result = useMemo(() => bestOption(wallets, from, to), [wallets, from, to])

  function swap() {
    setFrom(to)
    setTo(from)
  }

  return (
    <div style={{ maxWidth: 820, margin: '2rem auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Award Finder (mock)</h1>
      <p style={{ color:'#666' }}>Pick a route and we’ll compare your balances to the cheapest chart price.</p>

      <div style={{ display:'flex', alignItems:'center', gap:8, margin:'12px 0' }}>
        <label>From:&nbsp;
          <select value={from} onChange={(e) => setFrom(e.target.value)}>
            {Array.from(new Set([...ORIGINS, ...DESTS])).map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </label>
        <button type="button" onClick={swap} aria-label="swap" style={{ padding:'6px 10px' }}>⇄</button>
        <label>To:&nbsp;
          <select value={to} onChange={(e) => setTo(e.target.value)}>
            {Array.from(new Set([...DESTS, ...ORIGINS])).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
      </div>

      {result.cost === null ? (
        <div style={{ padding:'12px 14px', border:'1px solid #eee', borderRadius:8, background:'#fffbe6', color:'#8a6d3b' }}>
          No chart data for this route yet. Try another pair (e.g., LAX↔LHR, JFK↔NRT, SFO↔CDG).
        </div>
      ) : (
        <div style={{ padding:'12px 14px', border:'1px solid #eee', borderRadius:8 }}>
          <div>Cheapest chart price: <b>{result.cost.toLocaleString()}</b> via <span style={{padding:'2px 8px', borderRadius:12, background:'#eef', border:'1px solid #dde'}}>{result.program}</span>.</div>
          <div style={{ marginTop:6, color: result.canBook ? 'green' : 'crimson' }}>
            {result.canBook ? 'You have enough points to book.' : 'Not enough points in that program.'}
          </div>
        </div>
      )}

      <h3 style={{ marginTop:24 }}>Your balances</h3>
      <ul>
        {wallets.map(w => (
          <li key={String(w.id)}>{w.programId}: {w.points.toLocaleString()} pts</li>
        ))}
      </ul>
    </div>
  )
}
