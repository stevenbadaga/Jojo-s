import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { productsAPI } from '../services/api'
import ProductCard from '../components/ProductCard'
import RecentlyViewed from '../components/RecentlyViewed'
import Newsletter from '../components/Newsletter'
import QuickViewModal from '../components/QuickViewModal'
import { Search, ArrowRight, ShieldCheck, Zap, Clock, ShoppingBag, Percent, Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react'
import { ProductGridSkeleton } from '../components/SkeletonLoader'
import { EmptyProducts } from '../components/EmptyState'
import { getImageUrl } from '../utils/imageUtils'
import { useToast } from '../contexts/ToastContext'
import { DEFAULT_GROCERY_PRODUCTS } from '../data/groceryData'

const HERO_SHOWCASE_LAYOUTS = [
  {
    kind: 'product',
    productIndex: 0,
    left: '1%',
    top: '4%',
    width: '18%',
    ratioClass: 'aspect-[4/5]',
    className: 'hidden sm:block',
    rotate: '-9deg',
    shiftX: '18px',
    shiftY: '14px',
    delay: '0s',
    duration: '18s',
  },
  {
    kind: 'product',
    productIndex: 1,
    left: '21%',
    top: '10%',
    width: '24%',
    ratioClass: 'aspect-[6/5]',
    className: '',
    rotate: '6deg',
    shiftX: '-16px',
    shiftY: '18px',
    delay: '-2s',
    duration: '22s',
  },
  {
    kind: 'product',
    productIndex: 2,
    left: '47%',
    top: '3%',
    width: '20%',
    ratioClass: 'aspect-[5/4]',
    className: 'hidden md:block',
    rotate: '-5deg',
    shiftX: '18px',
    shiftY: '-14px',
    delay: '-4s',
    duration: '19s',
  },
  {
    kind: 'product',
    productIndex: 3,
    left: '70%',
    top: '8%',
    width: '28%',
    ratioClass: 'aspect-[6/5]',
    className: '',
    rotate: '8deg',
    shiftX: '-14px',
    shiftY: '16px',
    delay: '-6s',
    duration: '21s',
  },
  {
    kind: 'product',
    productIndex: 4,
    left: '4%',
    top: '52%',
    width: '26%',
    ratioClass: 'aspect-[6/5]',
    className: '',
    rotate: '-7deg',
    shiftX: '20px',
    shiftY: '12px',
    delay: '-3s',
    duration: '23s',
  },
  {
    kind: 'product',
    productIndex: 5,
    left: '32%',
    top: '54%',
    width: '22%',
    ratioClass: 'aspect-[5/4]',
    className: 'hidden sm:block',
    rotate: '9deg',
    shiftX: '-18px',
    shiftY: '-14px',
    delay: '-5s',
    duration: '20s',
  },
  {
    kind: 'product',
    productIndex: 6,
    left: '56%',
    top: '50%',
    width: '26%',
    ratioClass: 'aspect-[6/5]',
    className: '',
    rotate: '-6deg',
    shiftX: '16px',
    shiftY: '18px',
    delay: '-1s',
    duration: '24s',
  },
  {
    kind: 'product',
    productIndex: 7,
    left: '84%',
    top: '52%',
    width: '15%',
    ratioClass: 'aspect-[4/5]',
    className: 'hidden lg:block',
    rotate: '12deg',
    shiftX: '-12px',
    shiftY: '-16px',
    delay: '-7s',
    duration: '19s',
  },
]

const CATEGORY_AISLES = [
  { id: 'all', name: 'All Aisles', icon: '🛒' },
  { id: 'Fruits & Vegetables', name: 'Produce', icon: '🥦' },
  { id: 'Dairy & Eggs', name: 'Dairy & Eggs', icon: '🥛' },
  { id: 'Bakery', name: 'Bakery', icon: '🍞' },
  { id: 'Pantry', name: 'Pantry & Oils', icon: '🫒' },
  { id: 'Beverages', name: 'Beverages', icon: '🧃' },
]

const Home = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const response = await productsAPI.getPublicProducts()
      if (response.data && response.data.length > 0) {
        setProducts(response.data)
      } else {
        setProducts(DEFAULT_GROCERY_PRODUCTS)
      }
    } catch (error) {
      console.error('Failed to load products, using high-res grocery fallbacks:', error)
      setProducts(DEFAULT_GROCERY_PRODUCTS)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const promoProducts = products.filter((p) => p.is_promo)
  const produceProducts = products.filter((p) => p.category === 'Fruits & Vegetables' || p.category === 'Produce')
  const dairyProducts = products.filter((p) => p.category === 'Dairy & Eggs')
  const bakeryPantryProducts = products.filter((p) => p.category === 'Bakery' || p.category === 'Pantry')

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter((p) => p.category?.toLowerCase() === activeCategory.toLowerCase())

  return (
    <div className="min-h-screen bg-[#F6F7F8] dark:bg-gray-950">
      {/* Instacart Top Delivery Notification Banner */}
      <div className="bg-[#002524] text-white py-2.5 px-4 text-center text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 border-b border-[#003834]">
        <span className="bg-[#FF6B00] text-white text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Instacart Express</span>
        <span>Free delivery on your first order • Handpicked fresh in 30 mins</span>
      </div>

      {/* Instacart Hero Banner Section with Moving Images directly under navbar */}
      <section className="bg-gradient-to-br from-[#002524] via-[#003834] to-[#004D47] text-white py-12 sm:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Decorative Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#108910]/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#FF6B00]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10 space-y-10">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* Hero Text Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-semibold text-emerald-300">
                <Sparkles className="w-4 h-4 text-[#FF6B00]" />
                <span>JOJO Groceries • Powered by Instacart Design</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-white">
                Fresh groceries delivered in as fast as <span className="text-[#05A42E]">30 minutes</span>
              </h1>

              <p className="text-gray-200 text-sm sm:text-lg max-w-xl">
                Shop farm-fresh organic produce, cold dairy, artisan bakery essentials, and pantry items.
              </p>

              {/* Instacart Prominent Hero Search Bar */}
              <form onSubmit={handleSearchSubmit} className="max-w-2xl">
                <div className="flex items-center bg-white rounded-2xl shadow-2xl p-1.5 border-2 border-white/30 focus-within:border-[#05A42E] transition-all">
                  <div className="pl-3 pr-2 text-gray-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search fresh groceries, avocados, milk, bread..."
                    className="flex-1 bg-transparent border-0 outline-none text-gray-900 placeholder-gray-400 text-sm sm:text-base py-2 px-2"
                  />
                  <button
                    type="submit"
                    className="bg-[#108910] hover:bg-[#007000] text-white px-5 sm:px-7 py-3 rounded-xl font-extrabold text-sm flex items-center gap-2 shadow-md transition-all"
                  >
                    <span>Search</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Instacart Delivery Perks */}
              <div className="pt-2 flex flex-wrap gap-4 text-xs sm:text-sm text-gray-300 font-medium">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#05A42E]" /> 30-min express delivery
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#05A42E]" /> 100% Freshness Guarantee
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-[#FF6B00]" /> In-store low prices
                </span>
              </div>
            </div>

            {/* Right Special Offer Card */}
            <div className="lg:col-span-5 hidden lg:block">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="bg-[#FF6B00] text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                    Today's Express Special
                  </span>
                  <span className="text-xs text-emerald-300 font-bold">Limited Offer</span>
                </div>

                <div className="flex items-center gap-4">
                  <img
                    src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"
                    alt="Fresh organic basket"
                    className="w-24 h-24 object-cover rounded-2xl border-2 border-white/30 shadow-md"
                  />
                  <div>
                    <h4 className="font-extrabold text-white text-lg">Fresh Organic Produce Box</h4>
                    <p className="text-xs text-gray-300">Avocados, Strawberries & Peppers</p>
                    <p className="text-xl font-black text-[#05A42E] mt-1">12,500 RWF <span className="text-xs text-gray-400 line-through">16,000 RWF</span></p>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/products')}
                  className="w-full bg-[#108910] hover:bg-[#007000] text-white py-3 rounded-xl font-extrabold text-sm shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Shop Organic Deals Now</span>
                </button>
              </div>
            </div>
          </div>

          {/* MOVING IMAGES SHOWCASE directly under the navbar/hero text */}
          <div className="pt-4">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#05A42E] animate-ping"></div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">Live Fresh Showcase</span>
              </div>
              <span className="text-xs text-gray-300 font-medium">Interactive grocery cards • Tap to inspect</span>
            </div>

            {/* Floating Moving Images Canvas */}
            <div className="relative h-64 sm:h-72 md:h-80 w-full overflow-hidden rounded-3xl bg-black/20 backdrop-blur-md border border-white/15 p-2 shadow-2xl">
              {HERO_SHOWCASE_LAYOUTS.map((layout, idx) => {
                const item = products[layout.productIndex] || DEFAULT_GROCERY_PRODUCTS[idx % DEFAULT_GROCERY_PRODUCTS.length]
                if (!item) return null

                return (
                  <div
                    key={idx}
                    className={`absolute transition-all duration-700 hover:z-30 hover:scale-110 cursor-pointer ${layout.className}`}
                    style={{
                      left: layout.left,
                      top: layout.top,
                      width: layout.width,
                      animation: `heroFloat ${layout.duration} ease-in-out infinite alternate`,
                      animationDelay: layout.delay,
                      transform: `rotate(${layout.rotate})`,
                    }}
                    onClick={() => setQuickViewProduct(item)}
                  >
                    <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border-2 border-white/40 shadow-2xl p-2 transition-all duration-300">
                      <div className={`relative ${layout.ratioClass} overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800`}>
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'
                          }}
                        />
                        {item.is_promo && (
                          <span className="absolute top-1 left-1 bg-[#FF6B00] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-md">
                            Deal
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 px-1 flex items-center justify-between">
                        <p className="text-[11px] font-extrabold text-gray-900 dark:text-white truncate max-w-[80%]">
                          {item.name}
                        </p>
                        <p className="text-[10px] font-black text-[#108910]">
                          {item.price?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Instacart Category Aisles Navigation Bar */}
      <section className="sticky top-16 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
          {CATEGORY_AISLES.map((aisle) => (
            <button
              key={aisle.id}
              onClick={() => setActiveCategory(aisle.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 ${
                activeCategory === aisle.id
                  ? 'bg-[#108910] text-white shadow-md scale-105'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <span className="text-base">{aisle.icon}</span>
              <span>{aisle.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Loading State */}
        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : (
          <>
            {/* Instacart Row 1: Hot Deals & Promos */}
            {promoProducts.length > 0 && activeCategory === 'all' && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#FF6B00]/10 flex items-center justify-center text-[#FF6B00]">
                      <Percent className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                        Hot Instacart Deals
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-500">Up to 30% off daily fresh essentials</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/products')}
                    className="text-xs sm:text-sm font-bold text-[#108910] hover:underline flex items-center gap-1"
                  >
                    <span>View all</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                  {promoProducts.slice(0, 5).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onView={setQuickViewProduct}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Instacart Row 2: Farm Fresh Produce */}
            {produceProducts.length > 0 && (activeCategory === 'all' || activeCategory === 'Fruits & Vegetables') && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🥦</span>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                        Farm Fresh Produce
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-500">Handpicked organic fruits and vegetables</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/products?category=Produce')}
                    className="text-xs sm:text-sm font-bold text-[#108910] hover:underline flex items-center gap-1"
                  >
                    <span>See aisle</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                  {produceProducts.slice(0, 5).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onView={setQuickViewProduct}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Instacart Row 3: Dairy, Milk & Cold Drinks */}
            {dairyProducts.length > 0 && (activeCategory === 'all' || activeCategory === 'Dairy & Eggs') && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🥛</span>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                        Dairy, Eggs & Juices
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-500">Cold fresh milk, eggs, cheeses and juices</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/products?category=Dairy')}
                    className="text-xs sm:text-sm font-bold text-[#108910] hover:underline flex items-center gap-1"
                  >
                    <span>See aisle</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                  {dairyProducts.slice(0, 5).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onView={setQuickViewProduct}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Instacart Row 4: Bakery & Pantry */}
            {bakeryPantryProducts.length > 0 && (activeCategory === 'all' || activeCategory === 'Bakery' || activeCategory === 'Pantry') && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🍞</span>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                        Fresh Bakery & Pantry
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-500">Artisan bread, olive oil, and baking essentials</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/products')}
                    className="text-xs sm:text-sm font-bold text-[#108910] hover:underline flex items-center gap-1"
                  >
                    <span>See aisle</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                  {bakeryPantryProducts.slice(0, 5).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onView={setQuickViewProduct}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* All Filtered Products Grid */}
            {activeCategory !== 'all' && (
              <section className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                  {activeCategory} Products
                </h2>
                {filteredProducts.length === 0 ? (
                  <EmptyProducts />
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onView={setQuickViewProduct}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        )}

        {/* Cinematic Video Showcase Banner Section */}
        <section className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-emerald-900/30 group">
          <div className="relative h-80 sm:h-96 w-full overflow-hidden bg-black">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
              poster="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80"
            >
              <source
                src="https://assets.mixkit.co/videos/preview/mixkit-fresh-vegetables-and-fruits-in-a-market-42939-large.mp4"
                type="video/mp4"
              />
            </video>

            {/* Gradient Overlay for Cinematic Contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#002524] via-[#002524]/60 to-transparent flex flex-col justify-end p-6 sm:p-12 text-white">
              <div className="max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 bg-[#108910] text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-lg">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Cinematic Market Experience</span>
                </div>

                <h3 className="text-2xl sm:text-4xl font-black leading-tight tracking-tight">
                  Handpicked daily from local organic harvests
                </h3>

                <p className="text-gray-200 text-xs sm:text-base font-medium">
                  Watch our local Kigali shoppers select peak-ripeness organic produce, cold dairy, and fresh artisan breads for your 30-minute delivery.
                </p>

                <div className="pt-2 flex items-center gap-4">
                  <button
                    onClick={() => navigate('/products')}
                    className="bg-[#108910] hover:bg-[#007000] active:scale-95 text-white font-black px-6 py-3 rounded-full text-xs sm:text-sm shadow-xl transition-all flex items-center gap-2"
                  >
                    <span>Shop Fresh Harvest</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Instacart How It Works Banner */}
        <section className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-10 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-2">
              Grocery delivery & pickup made simple
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              Get your favorite groceries delivered from JOJO Groceries in 3 simple steps
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 text-center">
            <div className="p-4 rounded-2xl bg-[#F6F7F8] dark:bg-gray-800/50 space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#108910] text-white font-black text-lg flex items-center justify-center mx-auto shadow-md">
                1
              </div>
              <h4 className="font-extrabold text-gray-900 dark:text-white text-base">Choose your items</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">Select fresh produce, dairy, and household essentials.</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F6F7F8] dark:bg-gray-800/50 space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#108910] text-white font-black text-lg flex items-center justify-center mx-auto shadow-md">
                2
              </div>
              <h4 className="font-extrabold text-gray-900 dark:text-white text-base">Handpicked with care</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">Our personal shoppers pick the freshest items for you.</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F6F7F8] dark:bg-gray-800/50 space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#FF6B00] text-white font-black text-lg flex items-center justify-center mx-auto shadow-md">
                3
              </div>
              <h4 className="font-extrabold text-gray-900 dark:text-white text-base">Delivered in 30 mins</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">Enjoy fast door-to-door delivery right to your home.</p>
            </div>
          </div>
        </section>

        {/* Recently Viewed & Newsletter */}
        <RecentlyViewed onView={setQuickViewProduct} />
        <Newsletter />
      </main>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  )
}

export default Home
