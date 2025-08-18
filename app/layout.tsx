// app/layout.tsx
export const metadata = { title: 'Points Optimizer' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{fontFamily:'system-ui, sans-serif', margin:0}}>
        <header style={{borderBottom:'1px solid #eee', padding:'12px 16px'}}>
          <nav style={{display:'flex', gap:12}}>
            <a href="/" style={{textDecoration:'none'}}>Home</a>
            <a href="/demo" style={{textDecoration:'none'}}>Demo</a>
          </nav>
        </header>
        <main style={{maxWidth: 820, margin: '24px auto', padding: '0 16px'}}>
          {children}
        </main>
      </body>
    </html>
  )
}
