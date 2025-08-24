'use client'

import { useMemo, useState } from 'react'
import { ROUTES, AWARD_CHART } from '../../data/awardChart'

type Wallet = { id: string; programId: string; points: number }

// Simple demo transfer map (1:1). Real life is richer; this keeps the demo sane.
const TRANSFER_PARTNERS: Record<string, string[]> = {
  amex_mr: ['delta'],
  chase_ur: [], // add partners later if you want
}

export default function SearchClient({ wallets }: { wallets: Wallet[] }) {
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')

  const [topUpProgram, setTopUpProgram] = useState<string>('')
  const [topUpAmount, setTopUpAmount] = useState<number>(0)

  const knownRoutes = ROUTES.map(r => `${r.from}→${r.to}`).join(', ')

  const routeKey = useMemo(() => {
    const o = origin.trim().toUpperCase()
    const d = destination.trim().toUpperCase()
    return o && d ? (`${o}-${d}` as keyof typeof AWARD_CHART) : null
  }, [origin, destination])

  const results = routeKey ? AWARD_CHART[routeKey] : null

  // Current balances per programId
  const balanceByProgram = useMemo(() => {
    const map: Record<string, number> = {}
    for (const w of wallets) map[w.programId] = (map[w.programId] ?? 0) + w.points
    return map
  }, [wallets])

  // Helper: compute how much transferable currency could top up a target airline program
  function transferableInto(targetProgram: string): { total: number; breakdown: Record<string, number> } {
    const breakdown: Record<string, number> = {}
    let total = 0
    for (const [src, partners] of Object.entries(TRANSFER_PARTNERS)) {
      if (partners.includes(targetProgram)) {
        const amt = balanceByProgram[src] ?? 0
        if (amt > 0) {
          breakdown[src] = amt
          total += amt
        }
      }
    }
    return { total, breakdown }
  }

  // Build rows for the table
  const rows = useMemo(() => {
    if (!results) return []
    return Object.entries(results).map(([programId, requiredMiles]) => {
      const required = requiredMiles ?? NaN
      const haveDirect = balanceByProgram[programId] ?? 0

      // direct check
      const directEnough = Number.isFinite(required) && haveDirect >= required

      // transfer assist (only if not already enough)
      let transferPossible = false
      let transferShortBy = NaN
      let transferBreakdown: Record<string, number> = {}
      if (!directEnough && Number.isFinite(required)) {
        const { total: transferable, breakdown } = transferableInto(programId)
        transferBreakdown = breakdown
        transferPossible = haveDirect + transferable >= required
        transferShortBy = Math.max(0, required - (haveDirect + transferable))
      }

      return {
        programId,
        required,
        haveDirect,
        directEnough,
        transferPossible,
        transferShortBy,
        transferBreakdown,
      }
    })
  }, [results, balanceByProgram])

  // Cheapest overall requirement
  const cheapest = useMemo(() => {
    const numeric = rows.filter(r => Number.isFinite(r.required))
    if (!numeric.length) return null
    return numeric.reduce((a, b) => (a.required < b.required ? a : b))
  }, [rows])

  // Best you can book right now (direct OR via transfer)
  const bestNow = useMemo(() => {
    const ok = rows.filter(r => r.directEnough || r.transferPossible)
    if (!ok.length) return null
    return ok.reduce((a, b) => (a.required < b.required ? a : b))
  }, [rows])

  // Top-up simulator
  const rowsWithTopUp = useMemo(() => {
    if (!rows.length || !topUpProgram || !Number.isFinite(topUpAmount) || topUpAmount <= 0) return rows
    return rows.map(r => {
      if (r.programId !== topUpProgram) return r
      const haveWithTopUp = r.haveDirect + topUpAmount
      const directEnough = haveWithTopUp >= r.required
      // Transfer re-check given top-up (if still needed)
      let transferPossible = r.transferPossible
      let transferShortBy = r.transferShortBy
      if (!directEnough) {
        const { total: transferable } = transferableInto(r.programId)
        transferPossible = haveWithTopUp + transferable >= r.required
        transferShortBy = Math.max(0, r.required - (haveWithTopUp + transferable))
      } else {
        transferPossible = true
        transferShortBy = 0
      }
      return {
        ...r,
        haveDirect: haveWithTopUp,
        directEnough,
        transferPossible,
        transferShortBy,
      }
    })
  }, [rows, topUpProgram, topUpAmount, balanceByProgram])

  const cheapestTopUp = useMemo(() => {
    const numeric = rowsWithTopUp.filter(r => Number.isFinite(r.required))
    if (!numeric.length) return null
    return numeric.reduce((a, b) => (a.required < b.required ? a : b))
  }, [rowsWithTopUp])

  const bestNowTopUp = useMemo(() => {
    const ok = rowsWithTopUp.filter(r => r.directEnough || r.transferPossible)
    if (!ok.length) return null
    return ok.reduce((a, b) => (a.required < b.required ? a : b))
  }, [rowsWithTopUp])

  return (
    <div>
      {/* Inputs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, margin: '16px 0 24px' }}>
        <input
          placeholder="Origin (e.g. LAX)"
          value={origin}
          onChange={e => setOrigin(e.target.value.toUpperCase())}
          style={{ padding: 10, border: '1px solid #ddd', borderRadius: 8 }}
        />
        <input
          placeholder="Destination (e.g. LHR)"
          value={destination}
          onChange={e => setDestination(e.target.value.toUpperCase())}
          style={{ padding: 10, border: '1px solid #ddd', borderRadius: 8 }}
        />
        <button
          onClick={() => {
            const examples = ['LAX-LHR', 'JFK-NRT', 'SFO-CDG']
            const [o, d] = examples[Math.floor(Math.random() * examples.length)].split('-')
            setOrigin(o); setDestination(d)
          }}
          style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', background: '#fafafa' }}
        >
          Try Example
        </button>
      </div>

      {!results && (
        <p style={{ color: '#666', marginBottom: 16 }}>
          Enter a known route (e.g. <code>{knownRoutes}</code>).
        </p>
      )}

      {/* Top-up simulator */}
      {!!results && (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', margin: '12px 0 20px' }}>
          <label>Top-up simulator:</label>
          <select
            value={topUpProgram}
            onChange={e => setTopUpProgram(e.target.value)}
            style={{ padding: 8, border: '1px solid #ddd', borderRadius: 8 }}
          >
            <option value="">— Choose program —</option>
            {Object.keys(results).map(pid => (
              <option key={pid} value={pid}>{pid}</option>
            ))}
          </select>
          <input
            type="number"
            min={0}
            step={1000}
            placeholder="Add points"
            value={topUpAmount || ''}
            onChange={e => setTopUpAmount(Number(e.target.value || 0))}
            style={{ width: 140, padding: 8, border: '1px solid #ddd', borderRadius: 8 }}
          />
        </div>
      )}

      {/* Table */}
      {!!rowsWithTopUp.length && (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
            <thead>
              <tr>
                <th style={th}>Program</th>
                <th style={th}>Required</th>
                <th style={th}>Direct balance</th>
                <th style={th}>Status</th>
                <th style={th}>Transfer assist</th>
              </tr>
            </thead>
            <tbody>
              {rowsWithTopUp.map(r => (
                <tr key={r.programId}>
                  <td style={td}><code>{r.programId}</code></td>
                  <td style={td}>{Number.isFinite(r.required) ? r.required.toLocaleString() : 'N/A'}</td>
                  <td style={td}>{r.haveDirect.toLocaleString()}</td>
                  <td style={td}>
                    {Number.isFinite(r.required)
                      ? (r.directEnough
                          ? <span style={{ color: 'green' }}>✅ Bookable (direct)</span>
                          : r.transferPossible
                            ? <span style={{ color: '#0a0' }}>✅ Bookable (via transfer)</span>
                            : <span style={{ color: '#b00' }}>❌ Short by {r.transferShortBy.toLocaleString()}</span>)
                      : '—'}
                  </td>
                  <td style={td}>
                    {r.transferBreakdown && Object.keys(r.transferBreakdown).length > 0 ? (
                      <span>
                        from{' '}
                        {Object.entries(r.transferBreakdown).map(([src, amt], i, arr) => (
                          <span key={src}>
                            <code>{src}</code> ({amt.toLocaleString()})
                            {i < arr.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </span>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: 16, lineHeight: 1.6 }}>
            {cheapest && (
              <div>
                <strong>Cheapest overall:</strong>{' '}
                <code>{cheapest.programId}</code> at {cheapest.required.toLocaleString()} miles.
              </div>
            )}
            {bestNow ? (
              <div>
                <strong>Best you can book now:</strong>{' '}
                <code>{bestNow.programId}</code> at {bestNow.required.toLocaleString()} miles. 🎉
              </div>
            ) : (
              <div>
                <strong>Heads up:</strong> You can’t fully book with your current balances (even after transfer assist).
              </div>
            )}

            {/* With top-up applied */}
            {topUpProgram && topUpAmount > 0 && (
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed #ddd' }}>
                <em>With a top-up of {topUpAmount.toLocaleString()} to <code>{topUpProgram}</code>:</em>
                {bestNowTopUp ? (
                  <div>
                    <strong>Best now:</strong>{' '}
                    <code>{bestNowTopUp.programId}</code> at {bestNowTopUp.required.toLocaleString()} miles. ✅
                  </div>
                ) : (
                  <div>Still not bookable; increase the top-up or try another route.</div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

const th: React.CSSProperties = { textAlign: 'left', borderBottom: '1px solid #eee', padding: '8px 6px' }
const td: React.CSSProperties = { borderBottom: '1px solid #f3f3f3', padding: '8px 6px' }
