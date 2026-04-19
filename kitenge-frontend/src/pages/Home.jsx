import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { productsAPI } from '../services/api'
import ProductCard from '../components/ProductCard'
import RecentlyViewed from '../components/RecentlyViewed'
import Newsletter from '../components/Newsletter'
import QuickViewModal from '../components/QuickViewModal'
import { Search, Filter, ChevronLeft, ChevronRight, ArrowRight, Sparkles, ShoppingBag } from 'lucide-react'
import { ProductGridSkeleton, LoadingSpinner } from '../components/SkeletonLoader'
import { EmptyProducts } from '../components/EmptyState'
import { getImageUrl } from '../utils/imageUtils'

const Home = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedView, setSelectedView] = useState('new')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [storyImageError, setStoryImageError] = useState(false)
  const [storyImageLoaded, setStoryImageLoaded] = useState(false)

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const view = params.get('view')
    if (view === 'promo') {
      setSelectedView('promo')
    } else if (view === 'new' || !view) {
      setSelectedView('new')
    }
  }, [location.search])

  useEffect(() => {
    filterProducts()
  }, [products, searchQuery, selectedCategory, selectedView])

  const loadProducts = async () => {
    try {
      console.log('ðŸ”„ Loading products...')
      const response = await productsAPI.getPublicProducts()
      console.log('âœ… Products loaded:', response.data?.length || 0, 'items')
      setProducts(response.data || [])
      setFilteredProducts(response.data || [])
      
      if (!response.data || response.data.length === 0) {
        console.warn('âš ï¸ No products found. Check if:')
        console.warn('   1. Backend is running')
        console.warn('   2. Database has products with active=true')
        console.warn('   3. API endpoint is correct')
      }
    } catch (error) {
      console.error('âŒ Failed to load products:', error)
      console.error('ðŸ’¡ Check browser console Network tab for details')
      setProducts([])
      setFilteredProducts([])
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = [...products]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory)
    }

    // View filter (new, promo, etc.)
    if (selectedView === 'promo') {
      filtered = filtered.filter((p) => p.is_promo)
    }

    setFilteredProducts(filtered)
  }

  const categories = ['all', ...new Set(products.map((p) => p.category).filter(Boolean))]

  // Get featured product images for carousel (products with images)
  const featuredProducts = products
    .filter(p => p.image && p.image.trim() !== '')
    .slice(0, 8) // Use up to 8 products for the carousel

  // Auto-advance carousel
  useEffect(() => {
    if (featuredProducts.length <= 1) return
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredProducts.length)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [featuredProducts.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredProducts.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length)
  }

  const scrollToCollection = () => {
    document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero skeleton */}
        <div className="relative h-[500px] sm:h-[600px] md:h-[700px] bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
        {/* Products skeleton */}
        <div className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 animate-pulse"></div>
            </div>
            <ProductGridSkeleton count={8} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Hero Section with Product Image Carousel - Mobile Optimized */}
      <section className="relative h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] flex items-center justify-center text-white overflow-hidden">
        {/* Background Image Carousel */}
        <div className="absolute inset-0">
          {featuredProducts.length > 0 ? (
            <>
              {featuredProducts.map((product, index) => (
                <div
                  key={product.id}
                  className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                    index === currentSlide ? 'opacity-100 z-0 scale-100' : 'opacity-0 z-0 scale-105'
                  }`}
                >
                  <img
                    src={getImageUrl(product.image)}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    style={{
                      imageRendering: 'crisp-edges',
                      objectFit: 'cover'
                    }}
                    loading="eager"
                    onError={(e) => {
                      e.target.src = '/placeholder.png'
                    }}
                  />
                  {/* Minimal gradient overlay - just for subtle text readability */}
                  <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-black/20 to-black/30 sm:from-black/25 sm:via-black/15 sm:to-black/25"></div>
                </div>
              ))}
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-700"></div>
          )}
        </div>

        {/* Subtle dark overlay for text readability - minimal to preserve image quality */}
        <div className="absolute inset-0 bg-black/15 sm:bg-black/10 z-10"></div>

        {/* Text Content - Mobile and Desktop */}
        <div className="relative z-20 w-full max-w-6xl px-4 sm:px-6 lg:px-8 animate-fade-in-up">
          {/* Mobile hero copy (match desktop wording) */}
          <div className="sm:hidden flex justify-center">
            <div className="relative w-full max-w-sm overflow-hidden rounded-[28px] border border-white/15 bg-black/50 text-center shadow-[0_28px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
              <div className="absolute inset-x-10 top-0 h-24 rounded-full bg-orange-400/20 blur-3xl"></div>
              <div className="absolute -bottom-6 left-0 h-24 w-24 rounded-full bg-amber-300/10 blur-3xl"></div>
              <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-orange-200/80 to-transparent"></div>

              <div className="relative px-5 py-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.26em] text-orange-200 shadow-[0_10px_24px_rgba(0,0,0,0.25)]">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-orange-400/20">
                    <Sparkles className="h-2.5 w-2.5" />
                  </span>
                  Fresh picks across every category
                </div>

                <h1 className="mt-4 text-[30px] font-black leading-[0.96] tracking-[-0.04em] text-white">
                  Shop fashion, home, beauty
                  <span className="mt-1 block text-orange-50/95">and more.</span>
                </h1>

                <p className="mt-4 px-1 text-sm font-medium leading-relaxed text-white/82">
                  Discover everyday essentials, trending finds, and quality products
                  across fashion, home, beauty, accessories, and tech.
                </p>

                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white/80">
                    Everyday essentials
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white/80">
                    Home and lifestyle
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white/80">
                    New arrivals
                  </span>
                </div>

                <div className="mt-6 space-y-3">
                  <button
                    onClick={scrollToCollection}
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300 px-6 py-3.5 text-sm font-black text-slate-950 shadow-[0_18px_40px_rgba(249,115,22,0.4)] transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
                  >
                    Shop now
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>

                  <button
                    onClick={() => navigate('/products')}
                    className="inline-flex w-full items-center justify-center rounded-full border border-white/15 bg-white/10 px-6 py-3 text-sm font-semibold text-white/90 backdrop-blur-sm transition-all duration-300 hover:border-orange-200/40 hover:bg-white/15"
                  >
                    Browse all products
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop hero copy */}
          <div className="hidden sm:block text-center">
            <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[34px] border border-white/15 bg-black/45 shadow-[0_35px_120px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-[#2f1407]/75"></div>
              <div className="absolute -top-16 left-1/2 h-40 w-80 -translate-x-1/2 rounded-full bg-orange-400/20 blur-3xl"></div>
              <div className="absolute -bottom-10 left-10 h-32 w-32 rounded-full bg-amber-300/10 blur-3xl"></div>
              <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-orange-200/80 to-transparent"></div>

              <div className="relative px-8 md:px-12 lg:px-16 py-8 md:py-10 lg:py-12">
                <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs md:text-sm font-bold uppercase tracking-[0.28em] text-orange-200 shadow-[0_12px_32px_rgba(0,0,0,0.18)]">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-400/20">
                    <Sparkles className="h-3.5 w-3.5" />
                  </span>
                  Fresh picks across every category
                </div>

                <h1 className="mx-auto mt-6 max-w-4xl text-4xl md:text-5xl lg:text-[4.1rem] xl:text-[4.55rem] font-black leading-[0.92] tracking-[-0.04em] text-white">
                  Shop fashion, home, beauty
                  <span className="mt-1 block text-orange-50/95">and more.</span>
                </h1>

                <p className="mx-auto mt-5 max-w-3xl text-base font-medium leading-relaxed text-white/82 md:text-lg lg:text-[1.35rem]">
                  Discover everyday essentials, trending finds, and quality products
                  across fashion, home, beauty, accessories, and tech.
                </p>

                <div className="mt-7 flex flex-wrap justify-center gap-3">
                  <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/78">
                    Everyday essentials
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/78">
                    Home and lifestyle
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/78">
                    Fresh seasonal drop
                  </span>
                </div>

                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <button
                    onClick={scrollToCollection}
                    className="group inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300 px-7 py-4 text-base font-black text-slate-950 shadow-[0_18px_40px_rgba(249,115,22,0.42)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(249,115,22,0.55)]"
                  >
                    Shop now
                    <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>

                  <button
                    onClick={() => navigate('/products')}
                    className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-7 py-4 text-base font-semibold text-white/90 backdrop-blur-sm transition-all duration-300 hover:border-orange-200/50 hover:bg-white/15"
                  >
                    Browse all products
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Carousel Navigation - Enhanced styling - Mobile Optimized */}
        {featuredProducts.length > 1 && (
          <>
            {/* Previous Button - Enhanced visibility with better touch targets */}
            <button
              onClick={prevSlide}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-3 sm:p-4 rounded-full bg-white/25 hover:bg-white/35 active:bg-white/50 backdrop-blur-md text-white transition-all touch-manipulation shadow-lg hover:shadow-xl hover:scale-110 border border-white/30 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
            </button>

            {/* Next Button - Enhanced visibility with better touch targets */}
            <button
              onClick={nextSlide}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-3 sm:p-4 rounded-full bg-white/25 hover:bg-white/35 active:bg-white/50 backdrop-blur-md text-white transition-all touch-manipulation shadow-lg hover:shadow-xl hover:scale-110 border border-white/30 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
            </button>

            {/* Dots Indicator - Enhanced with backdrop - Mobile Optimized */}
            <div className="absolute bottom-3 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2 sm:gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full backdrop-blur-md bg-black/30 border border-white/20">
              {featuredProducts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`rounded-full transition-all touch-manipulation min-w-[10px] min-h-[10px] ${
                    index === currentSlide
                      ? 'bg-white h-2.5 sm:h-3 w-6 sm:w-8 shadow-lg'
                      : 'bg-white/70 hover:bg-white/90 h-2.5 sm:h-3 w-2.5 sm:w-3'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Featured Promos Section - Moved before Products for better conversion */}
      {products.filter(p => p.is_promo).length > 0 && (
        <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-900/30 dark:via-orange-900/20 dark:to-yellow-900/20 relative overflow-hidden border-y-4 border-orange-300 dark:border-orange-700">
          {/* Enhanced decorative background elements */}
          <div className="absolute inset-0 opacity-10 dark:opacity-15">
            <div className="absolute top-0 left-0 w-72 h-72 bg-red-500 rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-orange-500 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-400 rounded-full blur-3xl animate-pulse-slow opacity-30" style={{ animationDelay: '2s' }}></div>
          </div>
          
          {/* Animated border gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-200/20 to-transparent animate-shimmer"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="mb-8 sm:mb-10 md:mb-12 text-center">
              <div className="inline-flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 animate-fade-in-up">
                <span className="text-4xl sm:text-5xl md:text-6xl animate-pulse filter drop-shadow-lg">ðŸ”¥</span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white leading-tight bg-gradient-to-r from-red-600 via-orange-600 to-red-600 bg-clip-text text-transparent animate-gradient">
                  Special Promotions
                </h2>
              </div>
              <p className="text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-200 font-bold max-w-2xl mx-auto px-4 mb-4 sm:mb-5">
                Limited time offers - Don't miss out on these amazing deals! âš¡
              </p>
              {/* Enhanced promo count badge */}
              <div className="mt-4 sm:mt-5 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <span className="inline-block px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 text-white text-sm sm:text-base md:text-lg font-black rounded-full shadow-2xl border-2 border-white/50 hover:scale-110 transition-transform duration-300 animate-pulse-slow">
                  ðŸŽ‰ {products.filter(p => p.is_promo).length} Products on Sale ðŸŽ‰
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
              {products
                .filter(p => p.is_promo)
                .slice(0, 4)
                .map((product, index) => {
                  // Calculate discount for this product
                  const getDiscount = () => {
                    if (product.discount && product.discount > 0) return product.discount
                    if (product.original_price && product.price && product.original_price > product.price) {
                      return Math.round(((product.original_price - product.price) / product.original_price) * 100)
                    }
                    return 0
                  }
                  const discount = getDiscount()
                  
                  return (
                    <div 
                      key={product.id} 
                      className="transform hover:scale-105 transition-all duration-500 relative animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {/* Extra prominent discount badge for promos section */}
                      {discount > 0 && (
                        <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 z-20">
                          <div className="bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white text-xs sm:text-sm md:text-base font-black px-3 py-2 sm:px-4 sm:py-2.5 md:px-5 md:py-3 rounded-full shadow-2xl border-2 border-white animate-bounce hover:scale-110 transition-transform duration-300">
                            {discount}% OFF
                          </div>
                        </div>
                      )}
                      <ProductCard
                        product={product}
                        onView={setSelectedProduct}
                      />
                    </div>
                  )
                })}
            </div>
            
            {products.filter(p => p.is_promo).length > 4 && (
              <div className="text-center mt-8 sm:mt-10 md:mt-12 animate-fade-in-up">
                <button
                  onClick={() => {
                    setSelectedView('promo')
                    document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="btn-primary px-8 sm:px-10 md:px-12 py-4 sm:py-4.5 text-base sm:text-lg font-black shadow-2xl hover:shadow-accent-lg hover:scale-110 transition-all duration-300 min-h-[52px] touch-manipulation border-2 border-white/30"
                >
                  View All Promos ({products.filter(p => p.is_promo).length}) â†’
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Collection Section - Main Products */}
      <section id="collection" className="py-8 sm:py-16 md:py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 sm:mb-10 md:mb-12 text-center animate-fade-in-up">
            <div className="inline-block mb-2 sm:mb-4">
              <span className="text-accent font-bold text-xs sm:text-sm uppercase tracking-widest bg-accent/10 px-4 py-2 rounded-full">Products</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-3 sm:mb-5 text-gray-900 dark:text-white leading-tight">
                Shop the catalog
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 font-semibold max-w-2xl mx-auto px-4">
              Browse products across fashion, home, beauty, accessories, and everyday essentials.
            </p>
          </div>

          {/* Filters - Mobile Optimized */}
          <div className="mb-5 sm:mb-8 space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-10 sm:pl-11 text-base sm:text-sm"
                />
              </div>
              {/* Desktop Category Dropdown */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field sm:w-48 hidden sm:block text-sm"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile Category Dropdown */}
            <div className="sm:hidden">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field w-full text-base"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Products' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* View Tabs - Mobile Optimized */}
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => setSelectedView('new')}
                className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-full text-sm sm:text-base font-semibold transition-all min-h-[44px] touch-manipulation ${
                  selectedView === 'new'
                    ? 'bg-accent text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 active:bg-gray-200 dark:active:bg-gray-700'
                }`}
              >
                New in
              </button>
              <button
                onClick={() => setSelectedView('promo')}
                className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-full text-sm sm:text-base font-semibold transition-all relative min-h-[44px] touch-manipulation ${
                  selectedView === 'promo'
                    ? 'bg-accent text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 active:bg-gray-200 dark:active:bg-gray-700'
                }`}
              >
                Promo
                {products.filter(p => p.is_promo).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                    {products.filter(p => p.is_promo).length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Products Grid - Mobile Optimized */}
          {filteredProducts.length === 0 ? (
            <EmptyProducts actionLabel="View All Products" actionLink="/products" />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onView={setSelectedProduct}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trust Badges Section - Professional Features */}
      <section className="py-8 sm:py-12 md:py-16 bg-white dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            <div className="flex flex-col items-center text-center p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">Quality Guaranteed</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Premium materials</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">Fast Delivery</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Quick shipping</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">Secure Payment</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Safe checkout</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">24/7 Support</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Always here</p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section - Moved after Products for better flow */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
            <div className="order-2 md:order-1 animate-fade-in-up">
              <div className="inline-block mb-3 sm:mb-4">
                <span className="text-accent font-bold text-xs sm:text-sm uppercase tracking-widest">About Us</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4 sm:mb-5 md:mb-6 text-gray-900 dark:text-white leading-tight">
                Why shop Esoko
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                Esoko brings together fashion, home, beauty, accessories, and
                everyday essentials in one convenient shopping experience built
                for modern customers across Rwanda.
              </p>
            </div>
            <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl hover:shadow-accent-lg transition-all duration-500 order-1 md:order-2 group bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 min-h-[192px] sm:min-h-[256px] md:min-h-[320px] lg:min-h-[384px] relative">
              {!storyImageError ? (
                <>
                  <img
                    src="/kitenge-fabrics-display.jpeg"
                    alt="Featured products arranged on display shelves"
                    className={`w-full h-full object-cover group-hover:scale-110 transition-all duration-700 ${storyImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    loading="eager"
                    onError={(e) => {
                      console.error('âŒ Image failed to load:', e.target.src)
                      setStoryImageError(true)
                    }}
                    onLoad={(e) => {
                      console.log('âœ… Image loaded successfully:', e.target.src)
                      setStoryImageLoaded(true)
                    }}
                  />
                  {!storyImageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-200 to-orange-300 dark:from-orange-800/50 dark:to-orange-900/50">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600 text-white absolute inset-0">
                  <div className="text-center p-8">
                    <ShoppingBag className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-4" />
                    <div className="text-2xl sm:text-3xl font-black mb-2">Esoko</div>
                    <div className="text-base sm:text-lg font-medium opacity-90">Marketplace and everyday finds</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Recently Viewed Section */}
      <RecentlyViewed />

      {/* Newsletter Section */}
      <Newsletter />

      {/* Quick View Modal */}
      <QuickViewModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  )
}

export default Home

