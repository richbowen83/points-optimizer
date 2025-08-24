import { prisma } from '../../lib/prisma'
import SearchClient from './SearchClient'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function SearchPage() {
  const user = await prisma.user.findFirst({ where: { email: 'demo@points.local' } })
  const wallets = user
    ? await prisma.wallet.findMany({
        where: { userId: user.id },
        select: { id: true, programId: true, points: true }, // id is a string in Prisma
        orderBy: { programId: 'asc' },
      })
    : []

  return (
    <div style={{ maxWidth: 780, margin: '2rem auto', fontFamily: 'system-ui, sans-serif' }}>
      <nav style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <a href="/" style={{ textDecoration: 'none', color: 'rebeccapurple' }}>Home</a>
        <a href="/demo" style={{ textDecoration: 'none', color: 'rebeccapurple' }}>Demo</a>
        <a href="/search" style={{ textDecoration: 'none', color: 'rebeccapurple', fontWeight: 600 }}>Search</a>
      </nav>

      <p>Using wallets for <code>{user?.email ?? '—'}</code></p>
      <SearchClient wallets={wallets} />
    </div>
  )
}
