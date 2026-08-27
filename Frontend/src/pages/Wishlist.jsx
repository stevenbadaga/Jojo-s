import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { productsAPI, wishlistAPI } from '../services/api'
import ProductCard from '../components/ProductCard'
import { 
  Heart, 
  ShoppingBag, 
  Sparkles, 
  ArrowRight, 
  Filter,
  SortAsc,
  SortDesc,
  Trash2,
  Share2,
  Grid3x3,
  List
} from 'lucide-react'
import { useToast } from '../contexts/ToastContext'
import { ProductGridSkeleton, LoadingSpinner } from '../components/SkeletonLoader'
import { EmptyWishlist } from '../components/EmptyState'

const Wishlist = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [wishlistIds, setWishlistIds] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('recent') // recent, price-low, price-high, name
  const [viewMode, setViewMode] = useState('grid') // grid, list
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  useEffect(() => {
    loadWishlist()
  }, [isAuthenticated])

  // Listen for wishlist changes from ProductCard
  useEffect(() => {
    const handleWishlistChange = () => {
      loadWishlist()
    }

    // Listen for custom event
    window.addEventListener('wishlist:changed', handleWishlistChange)
    
    // Also listen for storage changes (for guest users)
    const handleStorageChange = (e) => {
      if (e.key === 'kb_wishlist') {
        loadWishlist()
      }
    }
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('wishlist:changed', handleWishlistChange)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [isAuthenticated])

  const loadWishlist = async () => {
    try {
      // Load products
      const productsRes = await productsAPI.getPublicProducts()
      setProducts(productsRes.data)

      // Load wishlist IDs
      if (isAuthenticated) {
        try {
          const wishlistRes = await wishlistAPI.getWishlist()
          setWishlistIds(wishlistRes.data || [])
        } catch (error) {
          console.error('Failed to load wishlist:', error)
          loadLocalWishlist()
        }
      } else {
        loadLocalWishlist()
      }
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadLocalWishlist = () => {
    try {
      const saved = localStorage.getItem('kb_wishlist')
      if (saved) {
        setWishlistIds(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Failed to load local wishlist:', error)
    }
  }

  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id))

  // Sort products
  const sortedProducts = [...wishlistProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'name':
        return a.name.localeCompare(b.name)
      case 'recent':
      default:
        return 0 // Keep original order
    }
  })

  const handleClearWishlist = async () => {
    try {
      if (isAuthenticated) {
        // Remove all items from server wishlist
        for (const productId of wishlistIds) {
          try {
            await wishlistAPI.toggleWishlist(productId, 'remove')
          } catch (error) {
            console.error('Failed to remove item:', error)
          }
        }
      } else {
        localStorage.setItem('kb_wishlist', JSON.stringify([]))
      }
      setWishlistIds([])
      toast.success('Wishlist cleared successfully')
    } catch (error) {
      console.error('Failed to clear wishlist:', error)
      toast.error('Failed to clear wishlist')
    }
  }

  const handleShareWishlist = () => {
    const shareUrl = window.location.href
    const shareText =
      wishlistProducts.length > 0
        ? `Check out my wishlist with ${wishlistProducts.length} item${wishlistProducts.length === 1 ? '' : 's'} at MarketMet!`
        : 'Check out my wishlist at MarketMet!'

    if (navigator.share) {
      navigator
        .share({
          title: 'My Wishlist - MarketMet',
          text: shareText,
          url: shareUrl,
        })
        .catch(() => {
          // User cancelled or share failed silently – no need to show error
        })
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => {
          toast.success('Wishlist link copied to clipboard!')
        })
        .catch(() => {
          toast.error('Failed to copy link. Please try again.')
        })
    } else {
      // Last resort fallback
      toast.error('Sharing is not supported on this device.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 animate-pulse"></div>
          </div>
          <ProductGridSkeleton count={8} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 py-12 sm:py-16 lg:py-20">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl shadow-lg">
                <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-white fill-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2">
                  My Wishlist
                </h1>
                <p className="text-white/90 text-sm sm:text-base">
                  {wishlistProducts.length === 0 
                    ? "Start saving your favorite items"
                    : `${wishlistProducts.length} ${wishlistProducts.length === 1 ? 'item' : 'items'} saved for later`
                  }
                </p>
              </div>
            </div>
            {wishlistProducts.length > 0 && (
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <button
                  onClick={handleShareWishlist}
                  className="px-3 py-2 sm:px-4 sm:py-2 bg-white/20 backdrop-blur-md text-white rounded-lg hover:bg-white/30 transition-all flex items-center gap-2 text-xs sm:text-sm font-medium"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share wishlist</span>
                </button>
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="px-3 py-2 sm:px-4 sm:py-2 bg-white/10 border border-white/30 text-white rounded-lg hover:bg-white/20 transition-all flex items-center gap-2 text-xs sm:text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear all</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {wishlistProducts.length === 0 ? (
          <EmptyWishlist />
        ) : (
          <>
            {/* Toolbar */}
            <div className="mb-6 sm:mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Sparkles className="w-4 h-4 text-orange-500" />
                  <span className="font-medium">{wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'}</span>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full sm:w-auto">
                  {/* View Mode Toggle */}
                  <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded transition-all ${
                        viewMode === 'grid'
                          ? 'bg-white dark:bg-gray-600 text-orange-500 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <Grid3x3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded transition-all ${
                        viewMode === 'list'
                          ? 'bg-white dark:bg-gray-600 text-orange-500 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Sort */}
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="recent">Recently Added</option>
                      <option value="name">Name (A-Z)</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            <div className={
              viewMode === 'grid'
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                : "space-y-4"
            }>
              {sortedProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>

      {/* Clear Wishlist Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-2">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Clear your wishlist?
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This will remove all items from your wishlist. You can add them again later if you change your mind.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setShowClearConfirm(false)
                    await handleClearWishlist()
                  }}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium shadow-md hover:shadow-lg transition-all"
                >
                  Yes, clear wishlist
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Wishlist

