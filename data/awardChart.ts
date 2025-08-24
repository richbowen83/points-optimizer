// data/awardChart.ts
export type ProgramId = 'alaska' | 'amex_mr' | 'chase_ur' | 'delta' | 'southwest';

export const ROUTES = [
  { from: 'LAX', to: 'LHR' },
  { from: 'JFK', to: 'NRT' },
  { from: 'SFO', to: 'CDG' },
] as const;

// Relaxed types so prod build doesn’t require every cartesian pair
export type RouteKey = string;

// base chart; add more keys as you expand
export const AWARD_CHART: Record<string, Partial<Record<ProgramId, number>>> = {
  'LAX-LHR': { alaska: 70000, amex_mr: 60000, chase_ur: 62500, delta: 95000 },
  'JFK-NRT': { alaska: 85000, amex_mr: 90000, chase_ur: 95000, delta: 95000 },
  'SFO-CDG': { alaska: 80000, amex_mr: 70000, chase_ur: 75000, delta: 90000 },
};

// small helper to read directional key
export function getChart(from: string, to: string) {
  return AWARD_CHART[`${from}-${to}`]
}
