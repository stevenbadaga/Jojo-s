import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Building2,
  Headphones,
  Heart,
  Home,
  Lightbulb,
  LogOut,
  MapPin,
  Menu,
  Search,
  Settings,
  ShoppingBag,
  Tag,
  User,
  X,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useEffect, useRef, useState } from 'react'
import { isBackendConnectionIssue, productsAPI } from '../services/api'
import { getImageUrl } from '../utils/imageUtils'
import NotificationCenter from './NotificationCenter'
import PaymentConfirmationModal from './PaymentConfirmationModal'

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home, exact: true },
  { to: '/products', label: 'Shop', icon: ShoppingBag },
  { to: '/products?promo=true', label: 'Offers', icon: Tag, accent: true },
  { to: '/insights', label: 'Insights', icon: Lightbulb },
  { to: '/about', label: 'Company', icon: Building2 },
  { to: '/contact', label: 'Support', icon: Headphones },
]

const Header = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const { getCartCount, getCartTotal } = useCart()
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchHistory, setSearchHistory] = useState([])
  const [avatarError, setAvatarError] = useState(false)
  const searchRef = useRef(null)
  const profileMenuRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const cartCount = getCartCount()
  const cartTotal = getCartTotal()

  const userDisplayName = user?.name || user?.email?.split('@')?.[0] || ''
  const userInitials = userDisplayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
  const userAvatarUrl = user?.profileImageUrl ? getImageUrl(user.profileImageUrl) : ''

  useEffect(() => {
    setAvatarError(false)
  }, [userAvatarUrl])

  useEffect(() => {
    const savedHistory = localStorage.getItem('kb_search_history')
    if (!savedHistory) return
    try {
      setSearchHistory(JSON.parse(savedHistory))
    } catch (error) {
      console.error('Failed to load search history:', error)
    }
  }, [])

  const saveToHistory = (query) => {
    if (!query.trim()) return
    const updatedHistory = [
      query.trim(),
      ...searchHistory.filter((item) => item.toLowerCase() !== query.trim().toLowerCase()),
    ].slice(0, 5)
    setSearchHistory(updatedHistory)
    localStorage.setItem('kb_search_history', JSON.stringify(updatedHistory))
  }

  useEffect(() => {
    const handleSearch = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([])
        return
      }

      setSearchLoading(true)
      try {
        const response = await productsAPI.getPublicProducts()
        const products = response.data || []
        const query = searchQuery.toLowerCase()
        setSearchResults(
          products
            .filter(
              (product) =>
                product.name?.toLowerCase().includes(query) ||
                product.description?.toLowerCase().includes(query) ||
                product.category?.toLowerCase().includes(query)
            )
            .slice(0, 5)
        )
      } catch (error) {
        if (!isBackendConnectionIssue(error)) console.error('Search failed:', error)
      } finally {
        setSearchLoading(false)
      }
    }

    const debounceTimer = setTimeout(handleSearch, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) setShowSearch(false)
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false)
      }
    }

    if (showSearch || showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSearch, showProfileMenu])

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    if (!searchQuery.trim()) return
    saveToHistory(searchQuery)
    navigate(`/products?q=${encodeURIComponent(searchQuery)}`)
    setShowSearch(false)
    setSearchQuery('')
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    setShowProfileMenu(false)
  }

  const isNavActive = (item) => {
    if (item.exact) return location.pathname === '/'
    if (item.to.startsWith('/products?')) {
      return location.pathname === '/products' && location.search.includes('promo')
    }
    if (item.to === '/products') {
      return location.pathname.startsWith('/products') && !location.search.includes('promo')
    }
    return location.pathname.startsWith(item.to)
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-7 2xl:px-10">
        <div className="hidden lg:flex items-center h-20 gap-5 xl:gap-6">
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-[#108910] text-white flex items-center justify-center shadow-md group-hover:bg-[#007000] transition-colors">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-gray-900 dark:text-white group-hover:text-[#108910] transition-colors leading-none mb-1">
                  MarketMet
                </span>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest leading-none">
                  Fresh Groceries to Your Door.
                </span>
              </div>
            </Link>

            <div className="hidden 2xl:flex items-center gap-2 bg-[#F6F7F8] dark:bg-gray-800 px-3 py-1.5 rounded-full text-xs font-bold text-gray-700 dark:text-gray-300 border border-gray-200/80 dark:border-gray-700">
              <MapPin className="w-3.5 h-3.5 text-[#108910]" />
              <span>Kigali, Central</span>
              <span className="text-gray-300">•</span>
              <span className="text-[#108910]">30m Delivery</span>
            </div>
          </div>

          <div className="flex-1 min-w-[170px] max-w-sm xl:max-w-md relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search className="w-4 h-4 text-gray-400 absolute left-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onFocus={() => setShowSearch(true)}
                placeholder="Search groceries..."
                className="w-full pl-11 pr-10 py-2.5 bg-[#F6F7F8] dark:bg-gray-800 rounded-full border border-gray-200/90 dark:border-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:bg-white dark:focus:bg-gray-900 focus:border-[#108910] focus:ring-2 focus:ring-[#108910]/20 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setSearchResults([])
                  }}
                  className="absolute right-3.5 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>

            {showSearch && searchQuery && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 z-50 max-h-96 overflow-y-auto p-2 space-y-1">
                {searchLoading ? (
                  <div className="p-6 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#108910] border-t-transparent mx-auto" />
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((product) => (
                    <Link
                      key={product.id}
                      to={`/products/${product.id}`}
                      onClick={() => {
                        setShowSearch(false)
                        setSearchQuery('')
                      }}
                      className="flex items-center gap-3 p-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                    >
                      <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{product.name}</p>
                        <p className="text-xs font-semibold text-[#108910]">{product.price?.toLocaleString()} RWF</p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-6 text-center text-sm text-gray-500">No matching products found</div>
                )}
              </div>
            )}
          </div>

          <nav className="flex items-center gap-0.5 xl:gap-1 flex-shrink-0 font-bold text-xs xl:text-sm">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const active = isNavActive(item)
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`px-2.5 xl:px-3 py-2 rounded-full transition-all inline-flex items-center gap-1.5 whitespace-nowrap ${
                    active
                      ? 'bg-[#108910] text-white shadow-sm'
                      : item.accent
                        ? 'text-[#FF6B00] hover:bg-[#FF6B00]/10'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {(item.label === 'Offers' || item.label === 'Insights') && <Icon className="w-3.5 h-3.5" />}
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            <Link
              to="/wishlist"
              className={`w-9 h-9 rounded-full grid place-items-center transition-all ${
                location.pathname.startsWith('/wishlist')
                  ? 'bg-red-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-500'
              }`}
              aria-label="Saved items"
              title="Saved items"
            >
              <Heart className="w-4 h-4" />
            </Link>

            <NotificationCenter onOpenPaymentModal={() => setShowPaymentModal(true)} />

            {isAdmin && (
              <Link
                to="/admin"
                className="bg-emerald-100 dark:bg-emerald-950/60 text-[#108910] dark:text-emerald-400 font-extrabold text-xs px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-200 transition-colors"
              >
                Admin
              </Link>
            )}

            {!isAuthenticated ? (
              <Link
                to="/login"
                className="font-extrabold text-xs xl:text-sm text-gray-900 dark:text-white hover:text-[#108910] transition-colors px-2 py-2 whitespace-nowrap"
              >
                Sign in
              </Link>
            ) : (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="w-10 h-10 rounded-full grid place-items-center border border-gray-200 dark:border-gray-700 bg-[#F6F7F8] dark:bg-gray-800 hover:ring-2 hover:ring-[#108910]/30 transition-all overflow-hidden"
                  aria-label="Open profile menu"
                  title={userDisplayName || 'Profile'}
                >
                  {userAvatarUrl && !avatarError ? (
                    <img
                      src={userAvatarUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <span className="w-8 h-8 rounded-full bg-[#108910] text-white flex items-center justify-center font-bold text-xs">
                      {userInitials || <User className="w-4 h-4" />}
                    </span>
                  )}
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 z-50 overflow-hidden p-2 space-y-1">
                    <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 mb-1">
                      <p className="text-xs font-black text-gray-900 dark:text-white truncate">{userDisplayName || 'MarketMet account'}</p>
                      <p className="text-[11px] text-gray-500 truncate">{user?.email || ''}</p>
                    </div>
                    <Link
                      to="/account"
                      onClick={() => setShowProfileMenu(false)}
                      className="block px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                    >
                      Orders & Account
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl flex items-center gap-2"
                    >
                      <Settings className="w-3.5 h-3.5" /> Profile Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => window.dispatchEvent(new Event('cart:open'))}
              className="bg-[#108910] hover:bg-[#007000] active:scale-95 text-white font-extrabold px-3.5 py-2 rounded-full flex items-center gap-2 shadow-sm hover:shadow-md transition-all text-xs xl:text-sm whitespace-nowrap"
              aria-label="Open MarketMet cart"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden xl:inline">Cart</span>
              {cartCount > 0 && (
                <span className="bg-white text-[#108910] text-xs font-black min-w-5 h-5 px-1.5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="lg:hidden py-3 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                aria-label="Toggle navigation"
              >
                {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <Link to="/" className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#108910] text-white flex items-center justify-center shadow-sm flex-shrink-0">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-black text-lg text-gray-900 dark:text-white leading-none">MarketMet</span>
                  <span className="text-[9px] font-semibold text-emerald-700 dark:text-emerald-400 leading-tight truncate">Fresh Groceries to Your Door.</span>
                </div>
              </Link>
            </div>

            <button
              onClick={() => window.dispatchEvent(new Event('cart:open'))}
              className="bg-[#108910] text-white font-extrabold px-3 py-2 rounded-full flex items-center gap-1.5 text-xs shadow-md flex-shrink-0"
              aria-label="Open MarketMet cart"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="bg-white text-[#108910] text-xs font-black min-w-5 h-5 px-1 rounded-full flex items-center justify-center">{cartCount}</span>
              )}
            </button>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search groceries..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#F6F7F8] dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white outline-none"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </form>

          {showMobileMenu && (
            <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pt-3 pb-4 space-y-1 font-bold text-sm text-gray-800 dark:text-gray-200">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                )
              })}
              <Link
                to="/wishlist"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
              >
                <Heart className="w-4 h-4 text-red-500" /> Saved Items
              </Link>
              {isAuthenticated ? (
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl">
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              ) : (
                <Link to="/login" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-3 py-2.5 text-[#108910]">
                  <User className="w-4 h-4" /> Sign in / Register
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      <PaymentConfirmationModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        orderData={{ total: cartTotal }}
      />
    </header>
  )
}

export default Header
