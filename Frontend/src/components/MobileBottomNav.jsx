import { Link, useLocation } from 'react-router-dom'
import { Home, ShoppingBag, Flame, ShoppingCart, Mail } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const MobileBottomNav = () => {
  const location = useLocation()
  const [hidden, setHidden] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      const down = currentY > lastScrollY.current + 8
      const up = currentY < lastScrollY.current - 8

      if (down && currentY > 80) {
        setHidden(true)
      } else if (up) {
        setHidden(false)
      }

      if (currentY < 40) {
        setHidden(false)
      }

      lastScrollY.current = currentY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleCartOpen = () => setCartOpen(true)
    const handleCartClose = () => setCartOpen(false)

    window.addEventListener('cart:open', handleCartOpen)
    window.addEventListener('cart:close', handleCartClose)
    return () => {
      window.removeEventListener('cart:open', handleCartOpen)
      window.removeEventListener('cart:close', handleCartClose)
    }
  }, [])

  const searchParams = new URLSearchParams(location.search)
  const isPromo = location.pathname === '/' && searchParams.get('view') === 'promo'
  const isHome = location.pathname === '/' && !isPromo
  const isProducts = location.pathname.startsWith('/products')
  const isContact = location.pathname === '/contact'
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

  const itemClasses = (active) =>
    `flex flex-col items-center gap-1 py-2 ${
      active ? 'text-accent-700 dark:text-accent-300' : 'text-gray-500 dark:text-gray-400'
    }`

  const iconWrapClasses = (active) =>
    `w-11 h-11 rounded-full flex items-center justify-center transition-all ${
      active
        ? 'bg-gradient-accent text-white shadow-accent'
        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
    }`

  if (cartOpen || isAuthRoute) return null

  return (
    <div
      className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${
        hidden ? 'translate-y-full' : 'translate-y-0'
      }`}
    >
      <div className="mx-auto max-w-md px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="bg-white/95 dark:bg-gray-900/95 border border-gray-200 dark:border-gray-800 shadow-2xl rounded-t-2xl backdrop-blur">
          <nav className="grid grid-cols-5">
            <Link to="/" className={itemClasses(isHome)}>
              <span className={iconWrapClasses(isHome)}>
                <Home className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-semibold">Home</span>
            </Link>
            <Link to="/products" className={itemClasses(isProducts)}>
              <span className={iconWrapClasses(isProducts)}>
                <ShoppingBag className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-semibold">Shop</span>
            </Link>
            <Link to="/?view=promo" className={itemClasses(isPromo)}>
              <span className={iconWrapClasses(isPromo)}>
                <Flame className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-semibold">Hot Sale</span>
            </Link>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event('cart:open'))}
              className={itemClasses(false)}
              aria-label="Checkout"
            >
              <span className={iconWrapClasses(false)}>
                <ShoppingCart className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-semibold">Checkout</span>
            </button>
            <Link to="/contact" className={itemClasses(isContact)}>
              <span className={iconWrapClasses(isContact)}>
                <Mail className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-semibold">Contact</span>
            </Link>
          </nav>
        </div>
      </div>
    </div>
  )
}

export default MobileBottomNav
