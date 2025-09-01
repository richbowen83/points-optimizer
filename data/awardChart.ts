// data/awardChart.ts

// Define all programs
export type ProgramId = 'alaska' | 'amex_mr' | 'chase_ur' | 'delta' | 'southwest'

// Define supported routes
export type RouteKey =
  | 'LAX-LHR'
  | 'JFK-NRT'
  | 'SFO-CDG'
  | 'LAX-NRT'
  | 'LAX-CDG'
  | 'JFK-LHR'
  | 'JFK-CDG'
  | 'SFO-LHR'
  | 'SFO-NRT'

// Base (directional) chart
export const AWARD_CHART: Record<RouteKey, Partial<Record<ProgramId, number>>> = {
  'LAX-LHR': { alaska: 70000, amex_mr: 60000, chase_ur: 62500, delta: 95000, southwest: 80000 },
  'JFK-NRT': { alaska: 85000, amex_mr: 90000, chase_ur: 95000, delta: 95000, southwest: 100000 },
  'SFO-CDG': { alaska: 80000, amex_mr: 70000, chase_ur: 75000, delta: 90000, southwest: 85000 },
  'LAX-NRT': { alaska: 75000, amex_mr: 85000, chase_ur: 87500, delta: 95000, southwest: 95000 },
  'LAX-CDG': { alaska: 80000, amex_mr: 70000, chase_ur: 75000, delta: 90000, southwest: 85000 },
  'JFK-LHR': { alaska: 70000, amex_mr: 60000, chase_ur: 62500, delta: 95000, southwest: 80000 },
  'JFK-CDG': { alaska: 80000, amex_mr: 70000, chase_ur: 75000, delta: 90000, southwest: 85000 },
  'SFO-LHR': { alaska: 70000, amex_mr: 60000, chase_ur: 62500, delta: 95000, southwest: 80000 },
  'SFO-NRT': { alaska: 85000, amex_mr: 90000, chase_ur: 95000, delta: 95000, southwest: 100000 },
}

// Cents-per-point valuations (in cents, so 1.5 = 1.5¢)
export const CPP_CENTS: Record<ProgramId, number> = {
  alaska: 1.5,
  amex_mr: 1.8,
  chase_ur: 1.7,
  delta: 1.2,
  southwest: 1.3,
}

// Routes list (flatten keys)
export const ROUTES: { from: string; to: string }[] = Object.keys(AWARD_CHART).map((key) => {
  const [from, to] = key.split('-')
  return { from, to }
})
