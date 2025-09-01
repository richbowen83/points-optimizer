'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import { ROUTES, AWARD_CHART, type ProgramId } from '../../data/awardChart'

type WalletLike = { id: string | number; programId: ProgramId | string; points: number }

// display names
const PRETTY: Record<ProgramId, string> = {
  alaska: 'Alaska',
  amex_mr: 'Amex MR',
  chase_ur: 'Chase UR',
  delta: 'Delta',
  southwest: 'Southwest',
}

// logo paths (we already created these in /public/logos)
const LOGOS: Record<ProgramId, string> = {
  alaska: '/logos/alaska.svg',
  amex_mr: '/logos/amex_mr.svg',
  chase_ur: '/logos/chase_ur.svg',
  delta: '/logos/delta.svg',
  southwest: '/logos/southwest.svg',
}

// simple list of airport codes from ROUTES
const ORIGINS: string[] = Array.from(new Set(ROUTES.map(r => r.from)))
const DESTS:   string[] = Array.from(new Set(ROUTES.map(r => r.to)))

// cash top-up rate (in cents per point) for the shortfall estimate
const TOP_UP_CENTS_PER_POINT = 1.5

function routeKey(from: string, to: string) {
  return `${from}-${to}` as const
}

function bestOption(wallets: WalletLike[], from: string, to: string) {
  const rk = routeKey(from, to)
  const chart = AWARD_CHART[rk]
  if (!chart) {
    return {
      hasChart: false,
      program: null as ProgramId | null,
      cost: null as number | null,
      canBook: false,
      shortfall: 0,
      topUpUsd: 0,
    }
  }

  // find cheapest chart price across programs for this route
  let winner: { program: ProgramId; cost: number } | null = null
  for (const program of Object.keys(chart) as ProgramId[]) {
    const cost = chart[program]!
    if (typeof cost === 'number') {
      if (!winner || cost < winner.cost) winner = { program, cost }
    }
  }

  if (!winner) {
    return { hasChart: true, program: null, cost: null, canBook: false, shortfall: 0, topUpUsd: 0 }
  }

  // user points in the winning program
  const found = (wallets ?? []).find(w => String(w.programId) === winner!.program)
  const have = found ? Number(found.points) : 0
  const shortfall = Math.max(0, winner.cost - have)
  const canBook = shortfall === 0
  const topUpUsd = shortfall * (TOP_UP_CENTS_PER_POINT / 100)

  return {
    hasChart: true,
    program: winner.program,
    cost: winner.cost,
    canBook,
    shortfall,
    topUpUsd,
  }
}

export default function SearchClient({ wallets }: { wallets: WalletLike[] }) {
  const [from, setFrom] = useState<string>(ORIGINS[0] ?? '')
  const [to, setTo]     = useState<string>(DESTS[0] ?? '')
  const result = useMemo(() => bestOption(wallets ?? [], from, to), [wallets, from, to])

  const swap = () => { setFrom(to); setTo(from) }

  // convenience for rendering the “best” highlight in the balances list
  const bestProgram = result.program

  return (
    <div style={{ maxWidth: 860, margin: '2rem auto', fontFamily: 'system-ui, sans-serif' }}>
      <nav style={{ display: 'flex', gap: 16, color: '#6b46c1' }}>
        <a href="/">Home</a>
        <a href="/demo">Demo</a>
        <a href="/search" style={{ fontWeight: 600 }}>Search</a>
      </nav>

      <h1 style={{ fontSize: 40, marginTop: 12 }}>Search Awards</h1>
      <p style={{ color: '#666' }}>
        Using wallets for <code>demo@points.local</code>
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0' }}>
        <label>From&nbsp;
          <select value={from} onChange={(e) => setFrom(e.target.value)}>
            {ORIGINS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </label>
        <label>To&nbsp;
          <select value={to} onChange={(e) => setTo(e.target.value)}>
            {DESTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>
        <button
          type="button"
          onClick={swap}
          title="Swap"
          style={{
            border: '1px solid #ddd', borderRadius: 8,
            padding: '6px 12px', cursor: 'pointer', background: '#f9fafb'
          }}
        >
          Swap
        </button>
      </div>

      {/* Result panel */}
      {!result.hasChart ? (
        <div style={{
          border: '1px solid #fde68a', background: '#fffbeb', color: '#92400e',
          borderRadius: 12, padding: '16px 18px', margin: '12px 0'
        }}>
          We don’t have chart data for <b>{from}</b> → <b>{to}</b> yet.
          &nbsp;Try one of: <code>LAX→LHR</code>, <code>JFK→NRT</code>, <code>SFO→CDG</code>.
        </div>
      ) : (
        <div style={{
          border: `1px solid ${result.canBook ? '#bbf7d0' : '#fecaca'}`,
          background: result.canBook ? '#ecfdf5' : '#fef2f2',
          color: result.canBook ? '#065f46' : '#991b1b',
          borderRadius: 12, padding: '16px 18px', margin: '12px 0'
        }}>
          <div>
            Cheapest chart price:&nbsp;
            <b>{result.cost!.toLocaleString()}</b>&nbsp;via&nbsp;
            <span style={{
              fontSize: 12, padding: '2px 8px', borderRadius: 999,
              background: '#e0e7ff', color: '#3730a3'
            }}>
              {PRETTY[result.program!]}
            </span>
          </div>

          {result.canBook ? (
            <div style={{ marginTop: 6 }}>You have enough points to book.</div>
          ) : (
            <div style={{ marginTop: 6 }}>
              You’re short by <b>{result.shortfall.toLocaleString()}</b> points in <b>{PRETTY[result.program!]}</b>.<br/>
              Estimated cash top-up at {TOP_UP_CENTS_PER_POINT}¢/pt:&nbsp;
              <b>${result.topUpUsd.toFixed(2)}</b>
            </div>
          )}
        </div>
      )}

      {/* Balances */}
      <section>
        <h3 style={{ margin: '18px 0 10px 0' }}>Your balances</h3>
        <div style={{ border: '1px solid #eee', borderRadius: 12, overflow: 'hidden' }}>
          {(wallets ?? []).map((w) => {
            const id = w.programId as ProgramId
            const isBest = bestProgram === id
            return (
              <div
                key={String(w.id)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: 12, padding: '12px 16px',
                  borderBottom: '1px solid #eee',
                  background: isBest ? '#ecfdf5' : 'transparent',
                  outline: isBest ? '1px solid #bbf7d0' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Image
                    src={LOGOS[id] ?? '/logos/amex_mr.svg'}
                    alt={`${PRETTY[id]} logo`}
                    width={28}
                    height={28}
                  />
                  <span style={{ fontWeight: 600 }}>{PRETTY[id] ?? w.programId}</span>
                  {isBest && (
                    <span style={{
                      fontSize: 12, padding: '2px 8px', borderRadius: 999,
                      background: '#dcfce7', color: '#166534'
                    }}>best</span>
                  )}
                </div>
                <strong>{Number(w.points).toLocaleString()} pts</strong>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
