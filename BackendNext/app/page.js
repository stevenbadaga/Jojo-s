export default function Home() {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 32 }}>
      <div style={{ width: '100%', maxWidth: 720, border: '1px solid #1f1f1f', borderRadius: 24, padding: 32, background: '#0a0a0a' }}>
        <div style={{ color: '#39d353', fontWeight: 800, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase' }}>MarketMet</div>
        <h1 style={{ marginBottom: 8 }}>API backend is online</h1>
        <p style={{ color: '#a3a3a3', lineHeight: 1.6 }}>
          This Next.js service replaces the legacy Spring Boot API for Vercel hosting. Use <code>/api/health</code> to verify service health.
        </p>
      </div>
    </main>
  )
}
