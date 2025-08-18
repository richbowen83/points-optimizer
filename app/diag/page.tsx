// app/diag/page.tsx
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export default function Diag() {
  const url = process.env.DATABASE_URL || ''
  return (
    <pre style={{padding:20,fontFamily:'system-ui'}}>
      {JSON.stringify({
        hasDatabaseUrl: Boolean(url),
        startsWithPostgresql: url.startsWith('postgresql://') || url.startsWith('postgres://'),
        length: url.length,
        previewSample: url ? url.slice(0, 32) + '…' : ''
      }, null, 2)}
    </pre>
  )
}
