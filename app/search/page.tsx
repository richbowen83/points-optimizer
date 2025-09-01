cat > ~/Downloads/points-optimizer-nextjs/app/search/page.tsx <<'EOF'
// app/search/page.tsx (server component)
import Link from 'next/link'
import SearchClient from './SearchClient'
import { prisma } from '../../lib/prisma'
import { ROUTES } from '../../data/awardChart'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const ORIGINS = Array.from(new Set(ROUTES.map(r => r.from)))
const DESTS   = Array.from(new Set(ROUTES.map(r => r.to)))

async function getWallets() {
  const user = await prisma.user.findFirst({ where: { email: 'demo@points.local' } })
  if (!user) return []
  const wallets = await prisma.wallet.findMany({
    where: { userId: user.id },
    orderBy: { programId: 'asc' },
  })
  return wallets.map(w => ({ id: w.id, programId: w.programId, points: Number(w.points) }))
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: { from?: string; to?: string }
}) {
  const wallets = await getWallets()

  const initialFrom = (searchParams?.from && ORIGINS.includes(searchParams.from))
    ? searchParams.from
    : ORIGINS[0]

  const initialTo = (searchParams?.to && DESTS.includes(searchParams.to))
    ? searchParams.to
    : DESTS[0]

  return (
    <main style={{ maxWidth: 920, margin: '2rem auto', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif' }}>
      {/* crumb nav */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
        <Link href="/">Home</Link>
        <Link href="/demo">Demo</Link>
        <Link href="/search">Search</Link>
      </div>

      <p style={{ color: '#555', marginTop: 4 }}>
        Using wallets for <code>demo@points.local</code>
      </p>

      <h1 style={{ fontSize: 40, lineHeight: 1.2, margin: '12px 0 18px' }}>
        Search Awards
      </h1>

      <SearchClient wallets={wallets} initialFrom={initialFrom} initialTo={initialTo} />
    </main>
  )
}
EOF
