'use client'

import { useMemo, useState } from 'react'
import { ROUTES, AWARD_CHART, type ProgramId } from '../../data/awardChart'

type WalletLike = { id: string | number; programId: string; points: number }

const ORIGINS: string[] = Array.from(new Set(ROUTES.map(r => r.from)))
const DESTS: string[]   = Array.from(new Set(ROUTES.map(r => r.to)))

const PRETTY: Record<ProgramId, string> = {
  alaska: 'Alaska',
  amex_mr: 'Amex MR',
  chase_ur: 'Chase UR',
  delta: 'Delta',
  southwest: 'Southwest',
}

type RouteKey = `${typeof ROUTES[number]['from']}-${typeof ROUTES[number]['to']}`

function bestOption(wallets: WalletLike[], from: string, to: string) {
  const key = `${from}-${to}` as RouteKey
  const chart = AWARD_CHART[key]
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

function Pill({ label, color }: { label: string; color: 'blue'|'indigo'|'green'|'red'|'gray' }) {
  const COLORS: Record<typeof color, {bg:string; fg:string; br:string}> = {
    blue:   { bg:'#e6f0ff', fg:'#0b5ad9', br:'#bcd2ff' },
    indigo: { bg:'#ece9ff', fg:'#5b55d6', br:'#d7d2ff' },
    green:  { bg:'#e8f6ee', fg:'#1a7f42', br:'#c7ead6' },
    red:    { bg:'#fdeaea', fg:'#b02a2a', br:'#f8caca' },
    gray:   { bg:'#eee',    fg:'#555',    br:'#ddd'    },
  }
  const c = COLORS[color]
  return (
    <span style={{
      display:'inline-block', padding:'2px 8px', borderRadius:999,
      background:c.bg, color:c.fg, border:`1px solid ${c.br}`, fontSize:12, fontWeight:600
    }}>{label}</span>
  )
}

export default function SearchClient({ wallets }: { wallets: WalletLike[] }) {
  const [from, setFrom] = useState<string>(ORIGINS[0] ?? '')
  const [to, setTo]     = useState<string>(DESTS[0] ?? '')
  const result = useMemo(() => bestOption(wallets ?? [], from, to), [wallets, from, to])

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', fontFamily: 'system-ui, sans-serif' }}>
      <nav style={{display:'flex', gap:16, marginBottom:8}}>
        <a href="/" style={{textDecoration:'none'}}>Home</a>
        <a href="/demo" style={{textDecoration:'none'}}>Demo</a>
        <a href="/search" style={{textDecoration:'none', color:'#5b2dff'}}>Search</a>
      </nav>

      <p style={{color:'#555'}}>Using wallets for <code>demo@points.local</code></p>
      <h1 style={{fontSize:40, margin:'8px 0 12px'}}>Award Finder (mock)</h1>
      <p style={{color:'#555', marginTop:0}}>
        Pick a route and we’ll compare your balances to the cheapest chart price.
      </p>

      <div style={{ display:'flex', gap:10, alignItems:'center', margin:'14px 0 12px' }}>
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
        <button
          type="button"
          aria-label="Swap origin and destination"
          onClick={() => { const f = from; setFrom(to); setTo(f) }}
          style={{ border:'1px solid #ddd', borderRadius:8, padding:'6px 10px', cursor:'pointer' }}
        >
          ⇄
        </button>
      </div>

      {/* Result card */}
      <div style={{
        border:'1px solid #eee', borderRadius:12, padding:'14px 16px', margin:'12px 0',
        background: result.cost === null ? '#fffcef' : '#f7fbff'
      }}>
        {result.cost === null ? (
          <p style={{margin:0, color:'#6b5d00'}}>
            We don’t have chart data for <b>{from} → {to}</b> yet. Try one of:
            {' '}<code>LAX→LHR</code>, <code>JFK→NRT</code>, <code>SFO→CDG</code>.
          </p>
        ) : (
          <>
            <div style={{display:'flex', gap:10, alignItems:'center', marginBottom:6}}>
              <span>Cheapest chart price:</span>
              <b style={{fontSize:18}}>{result.cost.toLocaleString()}</b>
              {result.program && (
                <span>
                  via{' '}
                  <Pill
                    label={PRETTY[result.program]}
                    color={result.program === 'amex_mr' ? 'indigo'
                         : result.program === 'alaska'  ? 'blue'
                         : result.program === 'chase_ur'? 'green'
                         : 'red'}
                  />
                </span>
              )}
            </div>
            <div style={{color: result.canBook ? '#16794f' : '#b02a2a', fontWeight:600}}>
              {result.canBook ? 'You have enough points to book.' : 'Not enough points in that program.'}
            </div>
          </>
        )}
      </div>

      {/* Wallet table */}
      <div style={{border:'1px solid #eee', borderRadius:12, overflow:'hidden', marginTop:18}}>
        <div style={{background:'#fafafa', padding:'10px 14px', fontWeight:700}}>Your balances</div>
        {['alaska','amex_mr','chase_ur','delta','southwest'].map((p) => {
          const w = (wallets ?? []).find(x => x.programId === p)
          const isBest = !!result.program && result.program === p
          const lineColor = p === 'alaska' ? 'blue'
                          : p === 'amex_mr' ? 'indigo'
                          : p === 'chase_ur' ? 'green'
                          : p === 'delta' ? 'red'
                          : 'gray'
          return (
            <div key={p} style={{display:'flex', justifyContent:'space-between', alignItems:'center',
              padding:'12px 16px', borderTop:'1px solid #eee', background: isBest ? '#f1fbf5' : 'white'}}>
              <Pill label={PRETTY[p as ProgramId]} color={lineColor as any} />
              <div style={{fontWeight: isBest ? 800 : 500, color: isBest ? '#157347' : '#111'}}>
                {w ? w.points.toLocaleString() : 0} pts{isBest ? ' • best' : ''}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
