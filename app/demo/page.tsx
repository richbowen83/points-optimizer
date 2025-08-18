// app/demo/page.tsx
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0)

export default async function DemoPage() {
  if (process.env.DEMO_ENABLED !== 'true') {
    return (
      <div>
        <h1>Demo Disabled</h1>
        <p>Set <code>DEMO_ENABLED=true</code> in your environment to view this page.</p>
      </div>
    )
  }

  const user = await prisma.user.findFirst({ where: { email: 'demo@points.local' } })
  const wallets = user
    ? await prisma.wallet.findMany({ where: { userId: user.id }, orderBy: { programId: 'asc' } })
    : []
  const total = sum(wallets.map(w => Number(w.points || 0)))

  return (
    <div>
      <h1>Demo Data</h1>
      <p>Seeded wallets for <code>demo@points.local</code></p>

      <div style={{display:'grid', gap:8, marginTop:12}}>
        {wallets.map(w => (
          <div key={w.id} style={{display:'flex', justifyContent:'space-between', padding:'10px 12px', border:'1px solid #eee', borderRadius:8}}>
            <span style={{textTransform:'uppercase'}}>{w.programId}</span>
            <strong>{w.points.toLocaleString()} pts</strong>
          </div>
        ))}
      </div>

      <div style={{marginTop:16, padding:'12px', background:'#fafafa', border:'1px solid #eee', borderRadius:8}}>
        <strong>Total:</strong> {total.toLocaleString()} pts
      </div>

      <h2 style={{marginTop:24}}>Add a Wallet (demo)</h2>
      <form method="post" action="/api/wallets" style={{display:'grid', gap:8, maxWidth:440}}>
        <label>
          Program ID (e.g. <code>amex_mr</code>, <code>chase_ur</code>)<br/>
          <input name="programId" required style={{width:'100%', padding:8, border:'1px solid #ddd', borderRadius:6}} />
        </label>
        <label>
          Points<br/>
          <input name="points" type="number" min="0" step="1" required style={{width:'100%', padding:8, border:'1px solid #ddd', borderRadius:6}} />
        </label>
        <button type="submit" style={{padding:'10px 12px', border:'1px solid #333', borderRadius:8, background:'#111', color:'#fff', cursor:'pointer'}}>Add Wallet</button>
      </form>
    </div>
  )
}
