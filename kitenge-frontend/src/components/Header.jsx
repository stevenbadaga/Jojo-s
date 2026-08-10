import { Link, useLocation, useNavigate } from 'react'
import { ShoppingBag, Heart, User, LogOut, Search, X, Menu, Settings, MapPin, Sparkles, ChevronDown } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useState, useEffect, useRef } from 'react'
import { isBackendConnectionIssue, productsAPI } from '../services/api'
import { getImageUrl } from '../utils/imageUtils'

const Header = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const { getCartCount, getCartTotal } = useCart()
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchHistory, setSearchHistory] = useState([])
  const searchRef = useRef(null)
  const profileMenuRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const cartCount = getCartCount()
  const cartTotal = getCartTotal()
  const [avatarError, setAvatarError] = useState(false)

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
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory))
      } catch (e) {
        console.error('Failed to load search history:', e)
      }
    }
  }, [])

  const saveToHistory = (query) => {
    if (!query.trim()) return
    const updatedHistory = [
      query.trim(),
      ...searchHistory.filter(item => item.toLowerCase() !== query.trim().toLowerCase())
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
        const filtered = products
          .filter(
            (product) =>
              product.name?.toLowerCase().includes(query) ||
              product.description?.toLowerCase().includes(query) ||
              product.category?.toLowerCase().includes(query)
          )
          .slice(0, 5)
        setSearchResults(filtered)
      } catch (error) {
        if (!isBackendConnectionIssue(error)) {
          console.error('Search failed:', error)
        }
      } finally {
        setSearchLoading(false)
      }
    }

    const debounceTimer = setTimeout(handleSearch, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false)
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false)
      }
    }

    if (showSearch || showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSearch, showProfileMenu])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      saveToHistory(searchQuery)
      navigate(`/products?q=${encodeURIComponent(searchQuery)}`)
      setShowSearch(false)
      setSearchQuery('')
    }
  }

  const handleSearchClick = (query) => {
    setSearchQuery(query)
    saveToHistory(query)
    navigate(`/products?q=${encodeURIComponent(query)}`)
    setShowSearch(false)
  }

  const clearSearchHistory = () => {
    setSearchHistory([])
    localStorage.removeItem('kb_search_history')
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    setShowProfileMenu(false)
  }

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200/90 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* DESKTOP HEADER NAVBAR */}
        <div className="hidden lg:flex items-center justify-between h-20 gap-6">
          
          {/* LEFT: Instacart Logo & Location Selector */}
          <div className="flex items-center gap-6 flex-shrink-0">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-[#108910] text-white flex items-center justify-center shadow-md group-hover:bg-[#007000] transition-colors">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-gray-900 dark:text-white group-hover:text-[#108910] transition-colors">
                  JOJO GROCERIES
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Instacart Express</span>
              </div>
            </Link>

            {/* Instacart Delivery Location Pill */}
            <div className="hidden xl:flex items-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-3.5 py-1.5 rounded-full text-xs font-bold text-gray-700 dark:text-gray-300 transition-colors cursor-pointer border border-gray-200/60 dark:border-gray-700">
              <MapPin className="w-3.5 h-3.5 text-[#108910]" />
              <span>Kigali, Central</span>
              <span className="text-gray-400">•</span>
              <span className="text-[#108910] font-extrabold">30m Express</span>
            </div>
          </div>

          {/* CENTER: Instacart Prominent Rounded Search Bar */}
          <div className="flex-1 max-w-xl relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <div className="absolute left-4 text-gray-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearch(true)}
                placeholder="Search fresh groceries, organic produce, dairy, bakery..."
                className="w-full pl-11 pr-10 py-2.5 bg-[#F6F7F8] dark:bg-gray-800/80 rounded-full border border-gray-200/90 dark:border-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:bg-white focus:border-[#108910] focus:ring-2 focus:ring-[#108910]/20 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setSearchResults([])
                  }}
                  className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>

            {/* Instant Search Results Dropdown */}
            {showSearch && searchQuery && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 z-50 max-h-96 overflow-y-auto">
                {searchLoading ? (
                  <div className="p-6 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#108910] border-t-transparent mx-auto"></div>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="p-2 space-y-1">
                    {searchResults.map((product) => (
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
                          src={product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                            {product.name}
                          </p>
                          <p className="text-xs font-semibold text-[#108910]">
                            {product.price?.toLocaleString()} RWF
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-sm text-gray-500">
                    No matching grocery products found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: Instacart Nav Links & Green Cart Button */}
          <div className="flex items-center gap-5 flex-shrink-0">
            <nav className="flex items-center gap-4 text-sm font-extrabold text-gray-700 dark:text-gray-200">
              <Link to="/products" className="hover:text-[#108910] transition-colors">
                Aisles
              </Link>
              <Link to="/products?promo=true" className="hover:text-[#FF6B00] transition-colors flex items-center gap-1 text-[#FF6B00]">
                <Sparkles className="w-3.5 h-3.5" />
                Deals
              </Link>
              <Link to="/about" className="hover:text-[#108910] transition-colors">
                About
              </Link>
              <Link to="/contact" className="hover:text-[#108910] transition-colors">
                Contact
              </Link>
              <Link to="/wishlist" className="hover:text-[#108910] transition-colors flex items-center gap-1">
                <Heart className="w-4 h-4 text-red-500" />
                <span>Wishlist</span>
              </Link>
            </nav>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-800"></div>

            {/* Admin Badge if Admin */}
            {isAdmin && (
              <Link
                to="/admin"
                className="bg-emerald-100 dark:bg-emerald-950/60 text-[#108910] dark:text-emerald-400 font-extrabold text-xs px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-200 transition-colors"
              >
                Admin
              </Link>
            )}

            {/* User Profile Pill */}
            {!isAuthenticated ? (
              <Link
                to="/login"
                className="font-extrabold text-sm text-gray-900 dark:text-white hover:text-[#108910] transition-colors px-3 py-2"
              >
                Log In
              </Link>
            ) : (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-1.5 rounded-full transition-colors border border-gray-200/80 dark:border-gray-700"
                >
                  <span className="w-6 h-6 rounded-full bg-[#108910] text-white flex items-center justify-center font-bold text-xs">
                    {userInitials || <User className="w-3.5 h-3.5" />}
                  </span>
                  <span className="text-xs font-extrabold text-gray-900 dark:text-white max-w-[90px] truncate">
                    {userDisplayName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 z-50 overflow-hidden p-2 space-y-1">
                    <Link
                      to="/account"
                      onClick={() => setShowProfileMenu(false)}
                      className="block px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                    >
                      My Orders & Account
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="block px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl flex items-center gap-2"
                    >
                      <Settings className="w-3.5 h-3.5" /> Profile Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* INSTACART ICONIC GREEN CART BUTTON */}
            <button
              onClick={() => window.dispatchEvent(new Event('cart:open'))}
              className="bg-[#108910] hover:bg-[#007000] active:scale-95 text-white font-extrabold px-4 py-2.5 rounded-full flex items-center gap-2.5 shadow-md hover:shadow-lg transition-all text-sm"
              aria-label="Open Instacart Express Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="bg-white text-[#108910] text-xs font-black px-2 py-0.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* MOBILE HEADER NAVBAR */}
        <div className="lg:hidden py-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
              >
                {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#108910] text-white flex items-center justify-center font-bold shadow-sm">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <span className="font-black text-lg text-gray-900 dark:text-white">JOJO GROCERIES</span>
              </Link>
            </div>

            {/* Mobile Cart Green Pill */}
            <button
              onClick={() => window.dispatchEvent(new Event('cart:open'))}
              className="bg-[#108910] text-white font-extrabold px-3 py-2 rounded-full flex items-center gap-1.5 text-xs shadow-md"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="bg-white text-[#108910] text-xs font-black px-1.5 py-0.2 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Full-Width Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search groceries, avocados, milk..."
              className="w-full pl-10 pr-4 py-2 bg-[#F6F7F8] dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white outline-none"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </form>

          {/* Mobile Drawer Menu */}
          {showMobileMenu && (
            <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pt-3 pb-4 space-y-2 font-bold text-sm text-gray-800 dark:text-gray-200">
              <Link to="/" onClick={() => setShowMobileMenu(false)} className="block px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
                🏠 Home
              </Link>
              <Link to="/products" onClick={() => setShowMobileMenu(false)} className="block px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
                🛒 All Aisles & Products
              </Link>
              <Link to="/about" onClick={() => setShowMobileMenu(false)} className="block px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
                📖 About Us
              </Link>
              <Link to="/contact" onClick={() => setShowMobileMenu(false)} className="block px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
                📞 Contact & Delivery
              </Link>
              <Link to="/wishlist" onClick={() => setShowMobileMenu(false)} className="block px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
                ❤️ My Wishlist
              </Link>
              {isAuthenticated ? (
                <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl">
                  🚪 Logout
                </button>
              ) : (
                <Link to="/login" onClick={() => setShowMobileMenu(false)} className="block px-3 py-2 text-[#108910]">
                  🔑 Login / Register
                </Link>
              )}
            </div>
          )}
        </div>

      </div>
    </header>
  )
}

export default Header
