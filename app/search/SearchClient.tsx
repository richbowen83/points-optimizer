'use client'

import { useMemo, useState } from 'react'
import { ROUTES, AWARD_CHART, ProgramId, getChart } from '../../data/awardChart'

type WalletLike = { id: string | number; programId: string; points: number }

const ORIGINS: string[] = Array.from(new Set(ROUTES.map(r => r.from)))
const DESTS: string[]   = Array.from(new Set(ROUTES.map(r => r.to)))

const niceProgram: Record<string, string> = {
  alaska: 'Alaska',
  amex_mr: 'Amex MR',
  chase_ur: 'Chase UR',
  delta: 'Delta',
  southwest: 'Southwest',
}

const brandPill: Record<string, string> = {
  alaska: '#0a65a1',
  amex_mr: '#3450a1',
  chase_ur: '#186f3d',
  delta: '#b42318',
  southwest: '#5b5b5b',
}

function Pill({ program, children }: { program: string; children: React.ReactNode }) {
  const bg = brandPill[program] ?? '#777'
  return (
    <span
      style={{
        display:'inline-block',
        fontSize:12,
        color:'#fff',
        background:bg,
        padding:'3px 8px',
        borderRadius:999,
      }}
    >
      {children}
    </span>
  )
}

function bestOption(wallets: WalletLike[], from: string, to: string) {
  const chart = getChart(from, to)
  if (!chart) return { program: null as ProgramId | null, cost: null as number | null, canBook: false }

  let best: { program: ProgramId | null; cost: number | null; canBook: boolean } =
    { program: null, cost: null, canBook: false }

  for (const [program, cost] of Object.entries(chart) as [ProgramId, number][]) {
    const w = wallets.find((x) => x.programId === program)
    const canBook = !!w && typeof cost === 'number' && w.points >= cost
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

  const swap = () => { setFrom(to); setTo(from) }

  const chart = getChart(from, to)
  const cheapestLabel = result.program ? (niceProgram[result.program] ?? result.program) : null

  return (
    <div style={{ maxWidth: 820, margin: '2rem auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 36, margin: 0 }}>Award Finder (mock)</h1>
      <p style={{ color:'#666', marginTop: 8 }}>
        Pick a route and we’ll compare your balances to the cheapest chart price.
      </p>

      <div style={{ display:'flex', gap: 8, alignItems:'center', margin: '12px 0 16px' }}>
        <label>From&nbsp;
          <select value={from} onChange={(e) => setFrom(e.target.value)}>
            {ORIGINS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </label>

        <button
          type="button"
          onClick={swap}
          aria-label="Swap"
          title="Swap"
          style={{ padding:'6px 8px', border:'1px solid #ddd', background:'#fff', borderRadius:8, cursor:'pointer' }}
        >
          ⇄
        </button>

        <label>To&nbsp;
          <select value={to} onChange={(e) => setTo(e.target.value)}>
            {DESTS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
      </div>

      {/* Cheapest card */}
      <div style={{ border:'1px solid #eee', borderRadius:12, padding:'14px 16px', marginBottom: 16, background:'#fbfbfb' }}>
        {!chart ? (
          <div style={{ color:'#b42318' }}>No chart data for this route.</div>
        ) : (
          <>
            <div>
              Cheapest chart price:{' '}
              <strong>{result.cost?.toLocaleString() ?? '—'}</strong>{' '}
              {result.program && (
                <span style={{ marginLeft: 8 }}>
                  via <Pill program={result.program}>{cheapestLabel}</Pill>
                </span>
              )}
            </div>
            <div style={{ marginTop:6, color: result.canBook ? '#0d7a33' : '#b42318' }}>
              {result.canBook ? 'You have enough points to book.' : 'Not enough points in that program.'}
            </div>
          </>
        )}
      </div>

      {/* Balances list */}
      <div style={{ border:'1px solid #eee', borderRadius:12, overflow:'hidden' }}>
        <div style={{ padding:'10px 14px', borderBottom:'1px solid #eee', background:'#fafafa', fontWeight:600 }}>
          Your balances
        </div>
        {wallets.map((w) => {
          const isBest = result.program === w.programId
          return (
            <div key={String(w.id)} style={{ display:'flex', justifyContent:'space-between', padding:'12px 16px', borderBottom:'1px solid #eee' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <Pill program={w.programId}>{niceProgram[w.programId] ?? w.programId}</Pill>
              </div>
              <div style={{ fontWeight: isBest ? 700 : 500, color: isBest ? '#0d7a33' : 'inherit' }}>
                {w.points.toLocaleString()} pts {isBest ? '• best' : ''}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
