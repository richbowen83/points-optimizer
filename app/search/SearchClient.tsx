'use client'

import { useMemo, useState } from 'react'
import { ROUTES, AWARD_CHART, type ProgramId } from '../../data/awardChart'

type WalletLike = { id: string | number; programId: string; points: number }

// derive dropdown lists
const ORIGINS: string[] = Array.from(new Set(ROUTES.map(r => r.from)))
const DESTS: string[]   = Array.from(new Set(ROUTES.map(r => r.to)))

const PRETTY: Record<ProgramId, string> = {
  alaska: 'Alaska',
  amex_mr: 'Amex MR',
  chase_ur: 'Chase UR',
  delta: 'Delta',
} as const

function prettyProgram(p: ProgramId) {
  return PRETTY[p] ?? p
}

function bestOption(wallets: WalletLike[], from: string, to: string) {
  const key = `${from}-${to}`
  const revKey = `${to}-${from}`

  // try forward, then reverse chart
  const chart = (AWARD_CHART as any)[key] || (AWARD_CHART as any)[revKey] || null
  const reversed = !((AWARD_CHART as any)[key]) && !!((AWARD_CHART as any)[revKey])

  if (!chart) {
    return { program: null as ProgramId | null, cost: null as number | null, canBook: false, reversed: false }
  }

  let best: { program: ProgramId | null; cost: number | null; canBook: boolean } =
    { program: null, cost: null, canBook: false }

  for (const [program, cost] of Object.entries(chart) as [ProgramId, number][]) {
    const w = wallets.find((x) => x.programId === program)
    const canBook = !!w && typeof cost === 'number' && w.points >= cost
    if (typeof cost === 'number' && (best.cost === null || cost < best.cost)) {
      best = { program, cost, canBook }
    }
  }

  return { ...best, reversed }
}

export default function SearchClient({ wallets }: { wallets: WalletLike[] }) {
  const [from, setFrom] = useState<string>(ORIGINS[0] ?? '')
  const [to, setTo]     = useState<string>(DESTS[0] ?? '')

  const result = useMemo(() => bestOption(wallets, from, to), [wallets, from, to])

  // for the balances card
  const bestProg = result.program
  const balanceRows = useMemo(() => {
    return (['alaska','amex_mr','chase_ur','delta'] as ProgramId[]).map((pid) => {
      const w = wallets.find(x => x.programId === pid)
      return {
        pid,
        points: w?.points ?? 0,
        isBest: bestProg === pid,
      }
    })
  }, [wallets, bestProg])

  const handleSwap = () => {
    // safe + simple: swap current state values
    setFrom(to)
    setTo(from)
  }

  return (
    <div style={{ maxWidth: 860, margin: '2rem auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 36, margin: '0 0 8px' }}>Award Finder (mock)</h1>
      <p style={{ marginTop: 0, color: '#666' }}>Pick a route and we’ll compare your balances to the cheapest chart price.</p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '12px 0 16px' }}>
        <label>From&nbsp;
          <select value={from} onChange={(e) => setFrom(e.target.value)}>
            {ORIGINS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </label>

        <button
          aria-label="Swap origin and destination"
          title="Swap origin and destination"
          onClick={handleSwap}
          style={{ padding:'6px 8px', border:'1px solid #ddd', borderRadius:6, background:'#fff', cursor:'pointer' }}
        >
          ⇄
        </button>

        <label>To&nbsp;
          <select value={to} onChange={(e) => setTo(e.target.value)}>
            {DESTS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
      </div>

      {result.cost === null ? (
        <div style={{ background:'#fff8e1', border:'1px solid #ffe08a', padding:12, borderRadius:10 }}>
          We don’t have chart data for {from} → {to} yet. Try one of: LAX→LHR, JFK→NRT, SFO→CDG.
        </div>
      ) : (
        <div style={{ background:'#f6f8ff', border:'1px solid #dfe3ff', padding:12, borderRadius:10 }}>
          <div>
            Cheapest chart price: <b>{result.cost!.toLocaleString()}</b> via{' '}
            <span
              style={{
                display:'inline-block',
                padding:'2px 8px',
                borderRadius:999,
                border:'1px solid #d6d9ff',
                background:'#eef1ff',
                fontSize:12
              }}
            >
              {prettyProgram(result.program!)}
            </span>
            {result.reversed && (
              <span
                style={{
                  display:'inline-block',
                  marginLeft:8,
                  padding:'2px 8px',
                  borderRadius:999,
                  border:'1px solid #ffd699',
                  background:'#fff3d9',
                  fontSize:12
                }}
              >
                reverse chart
              </span>
            )}
          </div>
          <div style={{ color: result.canBook ? 'green' : 'crimson', marginTop:6 }}>
            {result.canBook ? 'You have enough points to book.' : 'Not enough points in that program.'}
          </div>
        </div>
      )}

      <div style={{ marginTop:18, border:'1px solid #eee', borderRadius:12, overflow:'hidden' }}>
        <div style={{ padding:'10px 12px', background:'#fafafa', borderBottom:'1px solid #eee', fontWeight:600 }}>
          Your balances
        </div>
        {balanceRows.map(row => (
          <div key={row.pid} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', borderBottom:'1px solid #eee' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span
                style={{
                  display:'inline-block',
                  padding:'2px 8px',
                  borderRadius:999,
                  border:'1px solid #ddd',
                  background:'#f7f7f7',
                  fontSize:12
                }}
              >
                {prettyProgram(row.pid as ProgramId)}
              </span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ color: row.isBest ? 'green' : '#111', fontWeight: row.isBest ? 700 : 500 }}>
                {row.points.toLocaleString()} pts{row.isBest ? ' • best' : ''}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
