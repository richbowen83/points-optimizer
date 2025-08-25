// data/awardChart.ts
// Small static award chart used by the mock search page.

export const ROUTES = [
  { from: 'LAX', to: 'LHR' },
  { from: 'JFK', to: 'NRT' },
  { from: 'SFO', to: 'CDG' },
] as const

export type RouteKey = `${typeof ROUTES[number]['from']}-${typeof ROUTES[number]['to']}`

// base (directional) chart
const BASE_CHART: Record<
  RouteKey,
  Partial<Record<ProgramId, number>>
> = {
  'LAX-LHR': { alaska: 70000, amex_mr: 60000, chase_ur: 62500, delta: 95000 },
  'JFK-NRT': { alaska: 85000, amex_mr: 90000, chase_ur: 95000, delta: 95000 },
  'SFO-CDG': { alaska: 80000, amex_mr: 70000, chase_ur: 75000, delta: 90000 },
}

// --- generate reverse keys automatically (e.g. LHR-LAX, NRT-JFK, CDG-SFO) ---
type AnyKey = `${string}-${string}`

// The type for all possible reversed keys (helps TS)
type ReverseKey = `${typeof ROUTES[number]['to']}-${typeof ROUTES[number]['from']}`

const REVERSE_CHART = Object.fromEntries(
  Object.entries(BASE_CHART).map(([key, value]) => {
    const [a, b] = key.split('-') as [string, string]
    return [`${b}-${a}`, value]
  })
) as Record<ReverseKey, Partial<Record<ProgramId, number>>>

// Export the full chart with both directions
export const AWARD_CHART = {
  ...BASE_CHART,
  ...REVERSE_CHART,
} as Record<AnyKey, Partial<Record<ProgramId, number>>>
