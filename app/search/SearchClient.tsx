'use client'

import { useMemo, useState } from 'react'
import { ROUTES, AWARD_CHART, type ProgramId, type RouteKey } from '../../data/awardChart'

/** Wallet type accepted by this client component */
export type WalletLike = { id: string | number; programId: string; points: number }

/** Distinct origin/dest lists from the chart */
const ORIGINS: string[] = Array.from(new Set(ROUTES.map(r => r.from)))
const DESTS: string[]   = Array.from(new Set(ROUTES.map(r => r.to)))

/** Compute best chart option for a route and current wallets */
function bestOption(wallets: WalletLike[], from: string, to: string) {
  const key = `${from}-${to}` as RouteKey
  const chart = AWARD_CHART[key]
  if (!chart) return { program: null as ProgramId | null, cost: null as number | null, canBook: false }

  let best: { program: ProgramId | null; cost: number | null; canBook: boolean } =
    { program: null, cost: null, canBook: false }

  // Find minimum chart price; mark canBook if user has enough points in that program
  for (const [program, cost] of Object.entries(chart) as [ProgramId, number][]) {
    const w = wallets.find((x) => x.programId === program)
    const canBook = !!w && typeof cost === 'number' && w.points >= cost
    if (typeof cost === 'number' && (best.cost === null || cost < best.cost)) {
      best = { program, cost, canBook }
    }
  }
  return best
}

/** Small, clean “logo” badges for programs (no external assets needed) */
function ProgramBadge({ id }: { id: ProgramId }) {
  const labelMap: Record<ProgramId, string> = {
    alaska: 'Alaska',
    amex_mr: 'Amex MR',
    chase_ur: 'Chase UR',
    delta: 'Delta',
  }
  const bg: Record<ProgramId, string> = {
    alaska: '#0b4a6f',
    amex_mr: '#0d3b66',
    chase_ur: '#0d5e3c',
    delta: '#b8172b',
  }
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        color: 'white',
        background: bg[id] ?? '#444',
        lineHeight: 1.6,
      }}
    >
      {labelMap[id] ?? id}
    </span>
  )
}

export default function SearchClient({ wallets }: { wallets: WalletLike[] }) {
  const [from, setFrom] = useState<string>(ORIGINS[0] ?? '')
  const [to, setTo]     = useState<string>(DESTS[0] ?? '')

  const result = useMemo(() => bestOption(wallets, from, to), [wallets, from, to])
  const swap = () => { setFrom(to); setTo(from) }

  const haveChart = result.cost !== null && result.program !== null

  return (
    <div style={{ maxWidth: 820, margin: '2rem auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 36, marginBottom: 6 }}>Award Finder (mock)</h1>
      <p style={{ color: '#666', marginTop: 0 }}>
        Pick a route and we’ll compare your balances to the cheapest chart price.
      </p>

      {/* Route controls */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', margin: '12px 0 20px' }}>
        <label>
          From&nbsp;
          <select value={from} onChange={(e) => setFrom(e.target.value)}>
            {ORIGINS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </label>

        {/* Swap button */}
        <button
          type="button"
          onClick={swap}
          aria-label="Swap origin and destination"
          title="Swap"
          style={{
            border: '1px solid #ddd',
            background: '#fff',
            borderRadius: 8,
            padding: '6px 10px',
            cursor: 'pointer'
          }}
        >
          ⇄
        </button>

        <label>
          To&nbsp;
          <select value={to} onChange={(e) => setTo(e.target.value)}>
            {DESTS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Cheapest option card */}
      <div
        style={{
          border: '1px solid #eee',
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          background: '#fafafa'
        }}
      >
        {haveChart ? (
          <>
            <div style={{ fontSize: 16 }}>
              Cheapest chart price:{' '}
              <b>{result.cost!.toLocaleString()}</b>{' '}
              <span>via&nbsp;</span>
              <ProgramBadge id={result.program!} />
            </div>
            <div
              style={{
                marginTop: 8,
                color: result.canBook ? '#0a7a37' : '#b10c2b',
                fontWeight: 600
              }}
            >
              {result.canBook
                ? 'You have enough points to book.'
                : 'Not enough points in that program.'}
            </div>
          </>
        ) : (
          <div>No chart data for this route.</div>
        )}
      </div>

      {/* Wallets list */}
      <div style={{ border: '1px solid #eee', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', fontWeight: 700, background: '#fcfcfc' }}>
          Your balances
        </div>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {wallets.map((w) => {
            const isBest = haveChart && w.programId === result.program
            return (
              <li
                key={String(w.id)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderTop: '1px solid #eee',
                  background: isBest ? 'rgba(10,122,55,0.06)' : 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {/* safe cast here because ProgramBadge only styles known ids; unknowns will render plain text */}
                  <ProgramBadge id={(w.programId as ProgramId)} />
                </div>
                <div style={{ fontWeight: isBest ? 800 : 600, color: isBest ? '#0a7a37' : '#111' }}>
                  {w.points.toLocaleString()} pts{isBest ? ' • best' : ''}
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
