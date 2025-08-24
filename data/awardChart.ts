// Mock award prices (one-way, economy) for a few routes.
// Keys are your internal wallet program ids: alaska | amex_mr | chase_ur | delta | southwest
export type ProgramId = 'alaska' | 'amex_mr' | 'chase_ur' | 'delta' | 'southwest';

export const ROUTES = [
  { from: 'LAX', to: 'LHR' },
  { from: 'JFK', to: 'NRT' },
  { from: 'SFO', to: 'CDG' },
] as const;

export type RouteKey = `${typeof ROUTES[number]['from']}-${typeof ROUTES[number]['to']}`;

// base (directional) chart
export const AWARD_CHART: Record<string, Partial<Record<ProgramId, number>>> = {
  'LAX-LHR': { alaska: 70000, amex_mr: 60000, chase_ur: 62500, delta: 95000 },
  'JFK-NRT': { alaska: 85000, amex_mr: 90000, chase_ur: 95000, delta: 95000 },
  'SFO-CDG': { alaska: 80000, amex_mr: 70000, chase_ur: 75000, delta: 90000 },
};

// Helper: get chart for (from,to) OR (to,from) so routes are bidirectional in the UI.
export function getChart(from: string, to: string) {
  const fwd = `${from}-${to}` as RouteKey;
  const rev = `${to}-${from}` as RouteKey;
  return (AWARD_CHART as any)[fwd] ?? (AWARD_CHART as any)[rev] ?? null;
}
