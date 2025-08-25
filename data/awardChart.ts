// data/awardChart.ts
export type ProgramId = 'alaska' | 'amex_mr' | 'chase_ur' | 'delta' | 'southwest'

export const ROUTES = [
  { from: 'LAX', to: 'LHR' },
  { from: 'JFK', to: 'NRT' },
  { from: 'SFO', to: 'CDG' },
] as const

type RouteKey =
  | 'LAX-LHR'
  | 'JFK-NRT'
  | 'SFO-CDG'

/**
 * Award charts per route (mock).
 * NOTE: Southwest is intentionally not priced here (no partner chart).
 */
export const AWARD_CHART: Record<RouteKey, Partial<Record<ProgramId, number>>> = {
  'LAX-LHR': { alaska: 70000, amex_mr: 60000, chase_ur: 62500, delta: 95000 },
  'JFK-NRT': { alaska: 85000, amex_mr: 90000, chase_ur: 95000, delta: 95000 },
  'SFO-CDG': { alaska: 80000, amex_mr: 70000, chase_ur: 75000, delta: 90000 },
}
