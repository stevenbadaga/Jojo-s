import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ShoppingBag, Heart, User, Moon, Sun, LogOut, Search, X, Menu, Monitor, Check, Settings } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useTheme } from '../contexts/ThemeContext'
import { useState, useEffect, useRef } from 'react'
import { isBackendConnectionIssue, productsAPI } from '../services/api'
import { getImageUrl } from '../utils/imageUtils'

const Header = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const { getCartCount } = useCart()
  const { isDark, theme, setThemeMode } = useTheme()
  const [showMenu, setShowMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showThemeMenu, setShowThemeMenu] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const themeMenuRef = useRef(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchHistory, setSearchHistory] = useState([])
  const searchRef = useRef(null)
  const profileMenuRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const cartCount = getCartCount()
  const [avatarError, setAvatarError] = useState(false)
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

  // Load search history from localStorage
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

  // Save search to history
  const saveToHistory = (query) => {
    if (!query.trim()) return
    const updatedHistory = [
      query.trim(),
      ...searchHistory.filter(item => item.toLowerCase() !== query.trim().toLowerCase())
    ].slice(0, 5) // Keep only last 5 searches
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
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target)) {
        setShowThemeMenu(false)
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false)
      }
    }

    if (showSearch || showThemeMenu || showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSearch, showThemeMenu, showProfileMenu])

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
    setShowMenu(false)
  }

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto">
        {/* Mobile Header */}
        <div className="lg:hidden">
          {/* Top Row: Menu, Logo, Account, Cart */}
          <div className="bg-white dark:bg-gray-900">
            <div className="flex items-center h-12 px-3">
              <div className="flex items-center flex-1">
                <button
                  onClick={() => {
                    setShowMobileMenu(!showMobileMenu)
                    setShowProfileMenu(false)
                    setShowSearch(false)
                  }}
                  className="p-2 -ml-1 flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="Menu"
                >
                  {showMobileMenu ? (
                    <X className="w-6 h-6 text-gray-900 dark:text-white" />
                  ) : (
                    <Menu className="w-6 h-6 text-gray-900 dark:text-white" />
                  )}
                </button>
              </div>

              <Link to="/" className="flex-shrink-0 mx-2 min-h-[44px] flex items-center justify-center gap-2">
                <div className="relative w-9 h-9 rounded-md flex-shrink-0 shadow-sm bg-gradient-to-br from-accent-500 to-amber-400 ring-1 ring-orange-300/40 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-slate-950" />
                </div>
                <div className="text-sm font-extrabold text-gray-900 dark:text-white tracking-wide">
                  ESOKO
                </div>
              </Link>

              <div className="flex items-center justify-end flex-1 gap-1">
                {!isAuthRoute && (
                  <button
                    onClick={() => window.dispatchEvent(new Event('cart:open'))}
                    className="relative p-2 flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                    aria-label="Cart"
                  >
                    <ShoppingBag className="w-6 h-6 text-gray-900 dark:text-white" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center leading-none">
                        {cartCount > 9 ? '9+' : cartCount}
                      </span>
                    )}
                  </button>
                )}

                <div ref={profileMenuRef} className="relative flex-shrink-0">
                  {!isAuthenticated ? (
                    <Link
                      to="/login"
                      className="p-2 flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      aria-label="Login"
                    >
                      <span className="w-9 h-9 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center overflow-hidden">
                        <User className="w-4 h-4 text-gray-800 dark:text-gray-200" />
                      </span>
                      <span className="sr-only">Login</span>
                    </Link>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setShowProfileMenu(!showProfileMenu)
                          setShowMobileMenu(false)
                          setShowSearch(false)
                        }}
                        className="p-2 flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        aria-label={`Account menu: ${userDisplayName || (isAdmin ? 'Admin' : 'Account')}`}
                        aria-expanded={showProfileMenu}
                      >
                        <span className="w-9 h-9 rounded-full border border-gray-300 dark:border-gray-700 overflow-hidden flex items-center justify-center">
                          {userAvatarUrl && !avatarError ? (
                            <img
                              src={userAvatarUrl}
                              alt="Profile"
                              className="w-full h-full object-cover"
                              onError={() => setAvatarError(true)}
                            />
                          ) : (
                            <span className="w-full h-full bg-gradient-accent text-white flex items-center justify-center font-black text-xs tracking-wide">
                              {userInitials || <User className="w-4 h-4" />}
                            </span>
                          )}
                        </span>
                      </button>

                      {showProfileMenu && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 z-50 overflow-hidden">
                          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {userDisplayName || (isAdmin ? 'Admin' : 'Account')}
                            </p>
                            {user?.email && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                            )}
                          </div>

                          {isAdmin && (
                            <Link
                              to="/admin"
                              onClick={() => setShowProfileMenu(false)}
                              className="block px-4 py-3 min-h-[44px] text-sm font-medium text-gray-900 dark:text-white active:bg-gray-50 dark:active:bg-gray-800 transition-colors touch-manipulation"
                            >
                              Admin Dashboard
                            </Link>
                          )}

                          <Link
                            to="/account"
                            onClick={() => setShowProfileMenu(false)}
                            className="block px-4 py-3 min-h-[44px] text-sm font-medium text-gray-900 dark:text-white active:bg-gray-50 dark:active:bg-gray-800 transition-colors touch-manipulation"
                          >
                            My Account
                          </Link>
                          <Link
                            to="/profile"
                            onClick={() => setShowProfileMenu(false)}
                            className="block px-4 py-3 min-h-[44px] text-sm font-medium text-gray-900 dark:text-white active:bg-gray-50 dark:active:bg-gray-800 transition-colors touch-manipulation flex items-center gap-2"
                          >
                            <Settings className="w-4 h-4" />
                            Profile Settings
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              handleLogout()
                              setShowProfileMenu(false)
                            }}
                            className="w-full text-left px-4 py-3 min-h-[44px] text-sm font-semibold text-red-600 dark:text-red-400 active:bg-gray-50 dark:active:bg-gray-800 transition-colors touch-manipulation flex items-center gap-2"
                          >
                            <LogOut className="w-4 h-4" />
                            Logout
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar - Always Visible, Prominent */}
          {!isAuthRoute && (
            <div className="relative px-3 pb-3 pt-2 bg-gray-50 dark:bg-gray-900" ref={searchRef}>
              <form
                onSubmit={handleSearchSubmit}
                onClick={() => setShowSearch(true)}
                className="flex items-center gap-2 cursor-text"
              >
                <div className="flex-1 flex items-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm min-h-[44px] h-11 px-3 focus-within:border-accent-400 focus-within:ring-2 focus-within:ring-accent/20">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setShowSearch(true)}
                    placeholder="Search Products..."
                    className="flex-1 bg-transparent border-0 outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    style={{ fontSize: '16px' }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSearchQuery('')
                        setSearchResults([])
                      }}
                      className="p-2 flex-shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center"
                      aria-label="Clear search"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="w-11 h-11 rounded-lg bg-gradient-accent text-white flex items-center justify-center shadow-md hover:shadow-lg transition-transform active:scale-95"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
              </form>

              {/* Search Results Dropdown */}
              {showSearch && searchQuery && (
                <div className="absolute left-3 right-3 top-full mt-2 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 z-50 max-h-[60vh] overflow-y-auto">
                  {searchLoading ? (
                    <div className="p-6 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.map((product) => (
                        <Link
                          key={product.id}
                          to={`/products/${product.id}`}
                          onClick={() => {
                            setShowSearch(false)
                            setSearchQuery('')
                          }}
                          className="flex items-center gap-3 p-4 min-h-[64px] active:bg-gray-50 dark:active:bg-gray-800 touch-manipulation"
                        >
                          <img
                            src={product.image || '/placeholder.png'}
                            alt={product.name}
                            className="w-14 h-14 object-cover rounded flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-base text-gray-900 dark:text-white truncate">
                              {product.name}
                            </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {product.price.toLocaleString()} RWF
                          </p>
                        </div>
                      </Link>
                    ))}
                    <div className="border-t border-gray-200 dark:border-gray-800">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          handleSearchSubmit(e)
                        }}
                        className="w-full text-center text-sm text-orange-500 py-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        View all results for "{searchQuery}"
                      </button>
                    </div>
                  </div>
                ) : searchQuery.trim().length >= 2 ? (
                  <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    No products found
                  </div>
                ) : searchHistory.length > 0 ? (
                  <div className="py-2">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-800">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Recent</p>
                      <button
                        onClick={clearSearchHistory}
                        className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        Clear
                      </button>
                    </div>
                    {searchHistory.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearchClick(item)}
                        className="w-full text-left px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
                      >
                        <Search className="w-4 h-4 text-gray-400" />
                        {item}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </div>
          )}
        </div>

        {/* Desktop Header - Keep Original */}
        <div className="hidden lg:flex items-center justify-between h-16 px-4 lg:px-8">
          {/* Brand - Desktop */}
          <Link to="/" className="flex items-center space-x-3 group flex-shrink-0">
            <div className="relative w-12 h-12 rounded-xl flex-shrink-0 shadow-md group-hover:shadow-lg transition-all duration-300 ring-2 ring-transparent group-hover:ring-accent/20 bg-gradient-to-br from-accent-500 to-amber-400 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="text-xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent group-hover:from-accent group-hover:via-accent-600 group-hover:to-accent transition-all duration-300 leading-tight tracking-tight">
                ESOKO
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                Shop fashion, home and more
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link
              to="/"
              className="px-4 py-2 text-sm xl:text-base font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 hover:text-accent hover:bg-gradient-to-r hover:from-accent-50 hover:to-accent-100 dark:hover:from-accent-900/20 dark:hover:to-accent-800/20 rounded-xl transition-all duration-300 relative group"
            >
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-accent to-accent-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              to="/products"
              className="px-4 py-2 text-sm xl:text-base font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 hover:text-accent hover:bg-gradient-to-r hover:from-accent-50 hover:to-accent-100 dark:hover:from-accent-900/20 dark:hover:to-accent-800/20 rounded-xl transition-all duration-300 relative group"
            >
              Products
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-accent to-accent-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              to="/about"
              className="px-4 py-2 text-sm xl:text-base font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 hover:text-accent hover:bg-gradient-to-r hover:from-accent-50 hover:to-accent-100 dark:hover:from-accent-900/20 dark:hover:to-accent-800/20 rounded-xl transition-all duration-300 relative group"
            >
              About
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-accent to-accent-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              to="/contact"
              className="px-4 py-2 text-sm xl:text-base font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 hover:text-accent hover:bg-gradient-to-r hover:from-accent-50 hover:to-accent-100 dark:hover:from-accent-900/20 dark:hover:to-accent-800/20 rounded-xl transition-all duration-300 relative group"
            >
              Contact
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-accent to-accent-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              to="/wishlist"
              className="px-4 py-2 text-sm xl:text-base font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 hover:text-accent hover:bg-gradient-to-r hover:from-accent-50 hover:to-accent-100 dark:hover:from-accent-900/20 dark:hover:to-accent-800/20 rounded-xl transition-all duration-300 flex items-center gap-2 relative group"
            >
              <Heart className="w-4 h-4" />
              Wishlist
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-accent to-accent-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-3 flex-shrink-0">
            {/* Desktop Search */}
            <div className="relative" ref={searchRef}>
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>

              {showSearch && (
                <div className="absolute right-0 top-full mt-2 w-96 max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 z-50">
                  <form onSubmit={handleSearchSubmit} className="p-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products..."
                        className="input-field pl-10 pr-10 w-full text-base py-2.5"
                        autoFocus
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery('')
                            setSearchResults([])
                          }}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </form>

                  {/* Search Results */}
                  <div className="max-h-96 overflow-y-auto">
                    {searchLoading ? (
                      <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="p-2">
                        {searchResults.map((product) => (
                          <Link
                            key={product.id}
                            to={`/products/${product.id}`}
                            onClick={() => {
                              setShowSearch(false)
                              setSearchQuery('')
                            }}
                            className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                          >
                            <img
                              src={product.image || '/placeholder.png'}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-base text-gray-900 dark:text-white truncate">
                                {product.name}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {product.price.toLocaleString()} RWF
                              </p>
                            </div>
                          </Link>
                        ))}
                        <div className="p-2 border-t border-gray-200 dark:border-gray-800">
                          <button
                            onClick={handleSearchSubmit}
                            className="w-full text-center text-sm text-orange-500 hover:underline py-2"
                          >
                            View all results for "{searchQuery}"
                          </button>
                        </div>
                      </div>
                    ) : searchQuery.trim().length >= 2 ? (
                      <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        No products found
                      </div>
                    ) : searchHistory.length > 0 ? (
                      <div className="p-2">
                        <div className="flex items-center justify-between px-2 py-2 border-b border-gray-200 dark:border-gray-800">
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Recent Searches</p>
                          <button
                            onClick={clearSearchHistory}
                            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            Clear
                          </button>
                        </div>
                        {searchHistory.map((item, index) => (
                          <button
                            key={index}
                            onClick={() => handleSearchClick(item)}
                            className="w-full text-left px-4 py-3 min-h-[44px] text-base text-gray-700 dark:text-gray-300 active:bg-gray-50 dark:active:bg-gray-800 rounded-lg transition-colors flex items-center gap-3 touch-manipulation"
                          >
                            <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{item}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        Start typing to search...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* Admin Button - Always visible when admin - Mobile Optimized */}
            {isAdmin && (
              <Link
                to="/admin"
                className="bg-gradient-accent hover:bg-gradient-accent-dark text-white font-black text-[10px] sm:text-xs md:text-sm px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 rounded-full shadow-lg hover:shadow-accent-lg active:scale-95 transition-all duration-300 flex items-center gap-1 sm:gap-1.5 md:gap-2 border-0 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="hidden md:inline relative z-10">Admin</span>
                <span className="md:hidden relative z-10">A</span>
              </Link>
            )}

            {/* Auth Buttons - Mobile Optimized */}
            {!isAuthenticated ? (
              <Link 
                to="/login" 
                className="px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 text-[10px] sm:text-xs md:text-sm font-black text-gray-900 dark:text-white bg-transparent border-2 border-gray-300 dark:border-gray-600 rounded-full hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:border-accent dark:hover:border-accent active:scale-95 transition-all duration-300 whitespace-nowrap shadow-sm hover:shadow-md"
              >
                Login
              </Link>
            ) : (
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 text-[10px] sm:text-xs md:text-sm font-black text-gray-900 dark:text-white bg-transparent border-2 border-gray-300 dark:border-gray-600 rounded-full hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:border-accent dark:hover:border-accent active:scale-95 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden lg:inline truncate max-w-[120px]">{user?.name || user?.email}</span>
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 py-2">
                    {isAdmin ? (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => setShowMenu(false)}
                      >
                        Admin Dashboard
                      </Link>
                    ) : (
                      <Link
                        to="/account"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => setShowMenu(false)}
                      >
                        My Account
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
                      onClick={() => setShowMenu(false)}
                    >
                      <Settings className="w-4 h-4" />
                      Profile Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Theme Toggle with Dropdown - Mobile Optimized */}
            <div className="relative hidden sm:block" ref={themeMenuRef}>
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="p-2.5 sm:p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-all duration-200 touch-target"
                aria-label="Theme options"
              >
                {theme === 'system' ? (
                  <Monitor className="w-5 h-5 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300" />
                ) : isDark ? (
                  <Moon className="w-5 h-5 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Sun className="w-5 h-5 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300" />
                )}
              </button>

              {showThemeMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 py-2 z-50 overflow-hidden">
                  <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-800">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Theme</span>
                  </div>
                  <button
                    onClick={() => {
                      setThemeMode('light')
                      setShowThemeMenu(false)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      theme === 'light'
                        ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    <span className="flex-1 text-left">Light</span>
                    {theme === 'light' && <Check className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => {
                      setThemeMode('dark')
                      setShowThemeMenu(false)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      theme === 'dark'
                        ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    <span className="flex-1 text-left">Dark</span>
                    {theme === 'dark' && <Check className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => {
                      setThemeMode('system')
                      setShowThemeMenu(false)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      theme === 'system'
                        ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Monitor className="w-4 h-4" />
                    <span className="flex-1 text-left">System Default</span>
                    {theme === 'system' && <Check className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>

            {/* Desktop Cart */}
            <button
              onClick={() => window.dispatchEvent(new Event('cart:open'))}
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ShoppingBag className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Shein Style */}
        {showMobileMenu && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 max-h-[70vh] overflow-y-auto rounded-b-2xl shadow-xl">
            <nav className="px-4 py-2 space-y-0.5">
              <Link
                to="/"
                onClick={() => setShowMobileMenu(false)}
                className="block px-4 py-3 min-h-[44px] text-[15px] font-medium text-gray-900 dark:text-white active:bg-gray-50 dark:active:bg-gray-800 transition-colors touch-manipulation flex items-center"
              >
                Home
              </Link>
              <Link
                to="/products"
                onClick={() => setShowMobileMenu(false)}
                className="block px-4 py-3 min-h-[44px] text-[15px] font-medium text-gray-900 dark:text-white active:bg-gray-50 dark:active:bg-gray-800 transition-colors touch-manipulation flex items-center"
              >
                Products
              </Link>
              <Link
                to="/about"
                onClick={() => setShowMobileMenu(false)}
                className="block px-4 py-3 min-h-[44px] text-[15px] font-medium text-gray-900 dark:text-white active:bg-gray-50 dark:active:bg-gray-800 transition-colors touch-manipulation flex items-center"
              >
                About
              </Link>
              <Link
                to="/contact"
                onClick={() => setShowMobileMenu(false)}
                className="block px-4 py-3 min-h-[44px] text-[15px] font-medium text-gray-900 dark:text-white active:bg-gray-50 dark:active:bg-gray-800 transition-colors touch-manipulation flex items-center"
              >
                Contact
              </Link>
              <Link
                to="/wishlist"
                onClick={() => setShowMobileMenu(false)}
                className="block px-4 py-3 min-h-[44px] text-[15px] font-medium text-gray-900 dark:text-white active:bg-gray-50 dark:active:bg-gray-800 transition-colors touch-manipulation flex items-center gap-2"
              >
                <Heart className="w-5 h-5" />
                Wishlist
              </Link>
              {!isAuthenticated && (
                <>
                  <div className="border-t border-gray-200 dark:border-gray-800 my-2"></div>
                <Link
                  to="/login"
                  onClick={() => setShowMobileMenu(false)}
                  className="block px-4 py-3 min-h-[44px] text-[15px] font-semibold text-white bg-gradient-accent active:bg-accent-700 rounded-lg transition-colors text-center touch-manipulation flex items-center justify-center shadow-md"
                >
                  Login
                </Link>
                </>
              )}
              
              {/* Theme Toggle in Mobile Menu */}
              <div className="border-t border-gray-200 dark:border-gray-800 my-2"></div>
              <div className="px-4 py-1.5">
                <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2 tracking-wide">Theme</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setThemeMode('light')
                      setShowMobileMenu(false)
                    }}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      theme === 'light'
                        ? 'bg-gradient-accent text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Sun className="w-4 h-4 mx-auto mb-1" />
                    Light
                  </button>
                  <button
                    onClick={() => {
                      setThemeMode('dark')
                      setShowMobileMenu(false)
                    }}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      theme === 'dark'
                        ? 'bg-gradient-accent text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Moon className="w-4 h-4 mx-auto mb-1" />
                    Dark
                  </button>
                  <button
                    onClick={() => {
                      setThemeMode('system')
                      setShowMobileMenu(false)
                    }}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      theme === 'system'
                        ? 'bg-gradient-accent text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Monitor className="w-4 h-4 mx-auto mb-1" />
                    Auto
                  </button>
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header

