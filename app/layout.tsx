// app/layout.tsx
import type { ReactNode } from 'react';
import Nav from './Nav';

export const metadata = { title: 'Points Optimizer' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0 }}>
        <header style={{ borderBottom: '1px solid #eee', padding: '12px 16px' }}>
          <Nav />
        </header>
        <main style={{ maxWidth: 820, margin: '24px auto', padding: '0 16px' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
