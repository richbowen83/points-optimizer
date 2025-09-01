'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import { ROUTES, AWARD_CHART, type ProgramId } from '../../data/awardChart'

type WalletLike = { id: string | number; programId: string; points: number }

const ORIGINS: string[] = Array.from(new Set(ROUTES.map(r => r.from)))
const DESTS: string[]   = Array.from(new Set(ROUTES.map(r => r.to)))

const PRETTY: Record<string, string> = {
  alaska: 'Alaska',
  amex_mr: 'Amex MR',
  chase_ur: 'Chase UR',
  delta: 'Delta',
  southwest: 'Southwest',
}

type Result = { program: ProgramId | null, cost: number | null, canBook: boolean }

function bestOption(wallets: WalletLike[], from: string, to: string): Result {
  const key = `${from}-${to}` as keyof typeof AWARD_CHART
  const chart = AWARD_CHART[key]
  if (!chart) return { program: null, cost: null, canBook: false }

  let best: Result = { program: null, cost: null, canBook: false }
  for (const [program, cost] of Object.entries(chart) as [ProgramId, number][]) {
    const w = wallets.find(x => x.programId === program)
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
  const result = useMemo(() => bestOption(wallets ?? [], from, to), [wallets, from, to])

  const routeKey = `${from}-${to}` as keyof typeof AWARD_CHART
  const hasChart = !!AWARD_CHART[routeKey]

  return (
    <div style={{ maxWidth: 780, margin: '2rem auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Search Awards</h1>

      <div style={{ display: 'flex', gap: 8, margin: '12px 0', alignItems: 'center' }}>
        <label>From:&nbsp;
          <select value={from} onChange={(e) => setFrom(e.target.value)}>
            {ORIGINS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </label>
        <label>To:&nbsp;
          <select value={to} onChange={(e) => setTo(e.target.value)}>
            {DESTS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <button
          type="button"
          onClick={() => { setFrom(to); setTo(from); }}
          style={{ border: '1px solid #ddd', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}
        >
          Swap
        </button>
      </div>

      {!hasChart ? (
        <p>
          We don’t have chart data for <b>{from}</b> → <b>{to}</b> yet. Try one of:&nbsp;
          {ROUTES.map((r, i) => (
            <span key={`${r.from}-${r.to}`}>{i > 0 ? ', ' : ''}{r.from}→{r.to}</span>
          ))}
        </p>
      ) : (
        <div>
          <p>
            Cheapest chart price: <b>{result.cost?.toLocaleString()}</b>
            {result.program ? <> via <code>{PRETTY[result.program] ?? result.program}</code></> : null}.
          </p>
          <p style={{ color: result.canBook ? 'green' : 'crimson' }}>
            {result.canBook ? 'You have enough points to book.' : 'Not enough points in that program.'}
          </p>
        </div>
      )}

      <h3>Your balances</h3>
      <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
        {(wallets ?? []).map(w => (
          <li key={String(w.id)} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Image src={`/logos/${w.programId}.svg`} alt={w.programId} width={24} height={24} />
            <span style={{ fontWeight: 600 }}>{PRETTY[w.programId] ?? w.programId}</span>
            <span style={{ marginLeft: 'auto' }}>{Number(w.points).toLocaleString()} pts</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
