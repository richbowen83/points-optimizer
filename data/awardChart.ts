// data/awardChart.ts
// Mock award prices (one-way, economy) for a few routes.

export type ProgramId = 'alaska' | 'amex_mr' | 'chase_ur' | 'delta' | 'southwest'

// Supported routes for the demo
export const ROUTES = [
  { from: 'LAX', to: 'LHR' },
  { from: 'JFK', to: 'NRT' },
  { from: 'SFO', to: 'CDG' },
] as const

// Keep the route key union **only** to those three routes so TS doesn't require all 9 combos
export type RouteKey = 'LAX-LHR' | 'JFK-NRT' | 'SFO-CDG'

// Award prices per program (partial: not every program needs a price on every route)
export const AWARD_CHART: Record<RouteKey, Partial<Record<ProgramId, number>>> = {
  'LAX-LHR': { alaska: 70000, amex_mr: 60000, chase_ur: 62500, delta: 95000, southwest: 0 },
  'JFK-NRT': { alaska: 85000, amex_mr: 90000, chase_ur: 95000, delta: 95000, southwest: 0 },
  'SFO-CDG': { alaska: 80000, amex_mr: 70000, chase_ur: 75000, delta: 90000, southwest: 0 },
}
