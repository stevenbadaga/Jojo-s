import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import CartDrawer from './CartDrawer'
import BackToTop from './BackToTop'
import ErrorBoundary from './ErrorBoundary'
import MobileBottomNav from './MobileBottomNav'
import BackendStatusBanner from './BackendStatusBanner'

const Layout = () => {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')
  const authRoutes = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/resend-verification',
  ]
  const isAuthRoute = authRoutes.some(
    (route) => location.pathname === route || location.pathname.startsWith(`${route}/`)
  )
  const showStoreChrome = !isAdminRoute

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col">
      {showStoreChrome && (
        <ErrorBoundary>
          <Header />
        </ErrorBoundary>
      )}
      <ErrorBoundary>
        <BackendStatusBanner />
      </ErrorBoundary>
      <main className={`flex-grow ${showStoreChrome && !isAuthRoute ? 'pb-24 lg:pb-0' : ''}`}>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      {showStoreChrome && (
        <>
          <ErrorBoundary>
            <Footer />
          </ErrorBoundary>
          <ErrorBoundary>
            <CartDrawer />
          </ErrorBoundary>
          <ErrorBoundary>
            <MobileBottomNav />
          </ErrorBoundary>
          <BackToTop />
        </>
      )}
    </div>
  )
}

export default Layout

