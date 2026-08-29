export const metadata = {
  title: 'MarketMet API',
  description: 'MarketMet Vercel backend',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'Arial, sans-serif', background: '#050505', color: '#ffffff' }}>
        {children}
      </body>
    </html>
  )
}
