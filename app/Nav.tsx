// app/Nav.tsx
export default function Nav() {
  return (
    <nav style={{ display: 'flex', gap: 12 }}>
      <a href="/" style={{ textDecoration: 'none' }}>Home</a>
      <a href="/demo" style={{ textDecoration: 'none' }}>Demo</a>
      <a href="/search" style={{ textDecoration: 'none' }}>Search</a>
    </nav>
  );
}
