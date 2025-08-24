// data/awardChart.ts
// Mock award prices (one-way, economy) for a few routes.
// Keys are your internal wallet program ids: alaska | amex_mr | chase_ur | delta
export type ProgramId = 'alaska' | 'amex_mr' | 'chase_ur' | 'delta';

export const ROUTES = [
  { from: 'LAX', to: 'LHR' },
  { from: 'JFK', to: 'NRT' },
  { from: 'SFO', to: 'CDG' },
] as const;

export type RouteKey = `${typeof ROUTES[number]['from']}-${typeof ROUTES[number]['to']}`;

export const AWARD_CHART: Record<RouteKey, Partial<Record<ProgramId, number>>> = {
  'LAX-LHR': { alaska: 70000, amex_mr: 60000, chase_ur: 62500, delta: 95000 },
  'JFK-NRT': { alaska: 85000, amex_mr: 90000, chase_ur: 95000, delta: 95000 },
  'SFO-CDG': { alaska: 80000, amex_mr: 70000, chase_ur: 75000, delta: 90000 },
};
