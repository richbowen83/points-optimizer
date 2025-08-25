cd ~/Downloads/points-optimizer

# Replace the file content
cat > data/awardChart.ts <<'EOF'
// data/awardChart.ts

// Programs we support in the demo
export type ProgramId =
  | 'alaska'
  | 'amex_mr'
  | 'chase_ur'
  | 'delta'
  | 'southwest'

// Demo routes we expose in the UI
export const ROUTES = [
  { from: 'LAX', to: 'LHR' },
  { from: 'JFK', to: 'NRT' },
  { from: 'SFO', to: 'CDG' },
] as const

type From = typeof ROUTES[number]['from'] // 'LAX' | 'JFK' | 'SFO'
type To   = typeof ROUTES[number]['to']   // 'LHR' | 'NRT' | 'CDG'
export type RouteKey = `${From}-${To}`

// Award chart (subset). Using Partial so we don't need all permutations.
export const AWARD_CHART: Partial<
  Record<RouteKey, Partial<Record<ProgramId, number>>>
> = {
  'LAX-LHR': { alaska: 70000, amex_mr: 60000, chase_ur: 62500, delta: 95000 },
  'JFK-NRT': { alaska: 85000, amex_mr: 90000, chase_ur: 95000, delta: 95000 },
  'SFO-CDG': { alaska: 80000, amex_mr: 70000, chase_ur: 75000, delta: 90000 },
}
EOF
