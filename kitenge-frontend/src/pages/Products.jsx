import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { isBackendConnectionIssue, productsAPI } from '../services/api'
import ProductCard from '../components/ProductCard'
import QuickViewModal from '../components/QuickViewModal'
import Breadcrumbs from '../components/Breadcrumbs'
import { Search, Filter, Grid, List, X, SlidersHorizontal, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'
import { ProductGridSkeleton, LoadingSpinner } from '../components/SkeletonLoader'
import { EmptyProducts, EmptySearch } from '../components/EmptyState'
import useBackendStatus from '../hooks/useBackendStatus'
import { DEFAULT_GROCERY_PRODUCTS } from '../data/groceryData'

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all')
  const [priceRange, setPriceRange] = useState([0, 1000000])
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState('grid')
  const [showPromoOnly, setShowPromoOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [productsPerPage] = useState(12)
  const toast = useToast()
  const { state: backendState } = useBackendStatus()

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    filterAndSortProducts()
    setCurrentPage(1) // Reset to first page when filters change
  }, [products, searchQuery, selectedCategory, priceRange, sortBy, showPromoOnly])

  const loadProducts = async () => {
    try {
      const response = await productsAPI.getPublicProducts()
      if (response.data && response.data.length > 0) {
        setProducts(response.data)
        setFilteredProducts(response.data)
      } else {
        setProducts(DEFAULT_GROCERY_PRODUCTS)
        setFilteredProducts(DEFAULT_GROCERY_PRODUCTS)
      }
    } catch (error) {
      setProducts(DEFAULT_GROCERY_PRODUCTS)
      setFilteredProducts(DEFAULT_GROCERY_PRODUCTS)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortProducts = () => {
    let filtered = [...products]

    // Promo filter
    if (showPromoOnly) {
      filtered = filtered.filter((product) => product.is_promo)
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (product) =>
          product.name?.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query) ||
          product.category?.toLowerCase().includes(query)
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((product) => product.category === selectedCategory)
    }

    // Price range filter
    filtered = filtered.filter(
      (product) => product.price >= priceRange[0] && product.price <= priceRange[1]
    )

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price
      if (sortBy === 'price-high') return b.price - a.price
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      return new Date(b.created_at || 0) - new Date(a.created_at || 0) // newest
    })

    setFilteredProducts(filtered)
  }

  const categories = ['all', ...new Set(products.map((p) => p.category).filter(Boolean))]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 animate-pulse"></div>
          </div>
          <ProductGridSkeleton count={8} />
        </div>
      </div>
    )
  }

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || priceRange[0] > 0 || priceRange[1] < 1000000 || showPromoOnly

  const clearAllFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setPriceRange([0, 1000000])
    setShowPromoOnly(false)
    setSortBy('newest')
  }

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct)
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-5 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs />
        
        {/* Header Section */}
        <div className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-2">
            All Products
          </h1>
          <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-400 leading-snug">
            Explore products across fashion, home, beauty, accessories, and everyday essentials
          </p>
        </div>

        {products.length === 0 && backendState !== 'ready' && (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100 sm:px-5">
            <p className="font-semibold">The backend is still starting.</p>
            <p className="mt-1 opacity-90">
              Product requests are being retried automatically. This page will fill in once the API is reachable.
            </p>
          </div>
        )}

        {/* Main Search and Quick Filters Bar */}
        <div className="card p-3 sm:p-5 mb-4 sm:mb-6">
          <div className="flex flex-col lg:flex-row gap-2 sm:gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products by name, category, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10 pr-10 w-full h-11 sm:h-12 text-base"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-400 active:text-gray-600 dark:active:text-gray-300 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap sm:flex-nowrap gap-2 flex-shrink-0">
              {/* Promos Button */}
              <button
                onClick={() => setShowPromoOnly(!showPromoOnly)}
                className={`px-4 py-2.5 sm:px-6 sm:py-3 rounded-full text-sm font-semibold transition-all flex items-center gap-2 min-h-[44px] ${
                  showPromoOnly
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/30'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
              >
                <Sparkles className={`w-4 h-4 ${showPromoOnly ? 'animate-pulse' : ''}`} />
                Promos
                {products.filter(p => p.is_promo).length > 0 && (
                  <span className={`w-6 h-6 rounded-full text-xs font-bold inline-flex items-center justify-center ${
                    showPromoOnly 
                      ? 'bg-white/30 text-white' 
                      : 'bg-accent/20 text-accent'
                  }`}>
                    {products.filter(p => p.is_promo).length}
                  </span>
                )}
              </button>

              {/* View Mode Toggle */}
              <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-full border border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded-full transition-all min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation ${
                    viewMode === 'grid'
                      ? 'bg-accent text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 active:text-gray-900 dark:active:text-gray-200'
                  }`}
                  aria-label="Grid view"
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 rounded-full transition-all min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation ${
                    viewMode === 'list'
                      ? 'bg-accent text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 active:text-gray-900 dark:active:text-gray-200'
                  }`}
                  aria-label="List view"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`lg:hidden px-4 py-2.5 sm:px-6 sm:py-3 rounded-full border flex items-center gap-2 touch-manipulation min-h-[44px] transition-all ${
                  showFilters
                    ? 'bg-gradient-accent text-white border-transparent shadow-accent'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 active:bg-gray-200 dark:active:bg-gray-700 border-gray-200 dark:border-gray-700'
                }`}
                aria-label="Toggle filters"
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span className="hidden sm:inline text-base">Filters</span>
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Active filters:</span>
              {searchQuery && (
                <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium flex items-center gap-2">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center active:text-accent-darker touch-manipulation" aria-label="Clear search">
                    <X className="w-4 h-4" />
                  </button>
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium flex items-center gap-2">
                  Category: {selectedCategory}
                  <button onClick={() => setSelectedCategory('all')} className="p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center active:text-blue-900 dark:active:text-blue-100 touch-manipulation" aria-label="Clear category">
                    <X className="w-4 h-4" />
                  </button>
                </span>
              )}
              {(priceRange[0] > 0 || priceRange[1] < 1000000) && (
                <span className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium flex items-center gap-2">
                  Price: {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()} RWF
                  <button onClick={() => setPriceRange([0, 1000000])} className="p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center active:text-green-900 dark:active:text-green-100 touch-manipulation" aria-label="Clear price filter">
                    <X className="w-4 h-4" />
                  </button>
                </span>
              )}
              {showPromoOnly && (
                <span className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm font-medium flex items-center gap-2">
                  Promos Only
                  <button onClick={() => setShowPromoOnly(false)} className="p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center active:text-red-900 dark:active:text-red-100 touch-manipulation" aria-label="Clear promo filter">
                    <X className="w-4 h-4" />
                  </button>
                </span>
              )}
              <button
                onClick={clearAllFilters}
                className="ml-auto px-4 py-2 min-h-[40px] text-sm text-gray-600 dark:text-gray-400 active:text-accent font-medium flex items-center gap-2 touch-manipulation"
                aria-label="Clear all filters"
              >
                <X className="w-4 h-4" />
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Mobile Filter Overlay */}
        {showFilters && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setShowFilters(false)}
            style={{
              paddingTop: 'env(safe-area-inset-top)',
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
          />
        )}

        {/* Filters Panel - Desktop Always Visible, Mobile Slide-in Drawer */}
        <div className={`
          ${showFilters ? 'fixed' : 'hidden'} lg:block
          top-0 right-0 h-full w-full max-w-sm
          lg:relative lg:max-w-none lg:h-auto lg:w-auto
          bg-white dark:bg-gray-900 z-50 lg:z-auto
          shadow-2xl lg:shadow-none
          overflow-y-auto
          card p-4 sm:p-6 mb-6
          transform transition-transform duration-300 ease-in-out
          ${showFilters ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}
        style={{
          paddingTop: showFilters ? 'max(1rem, env(safe-area-inset-top))' : undefined,
          paddingBottom: showFilters ? 'max(1rem, env(safe-area-inset-bottom))' : undefined,
        }}
        >
          <div className="flex items-center justify-between mb-4 sticky top-0 bg-white dark:bg-gray-900 pb-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Filter className="w-5 h-5 text-accent" />
              Filters
            </h3>
            <button
              onClick={() => setShowFilters(false)}
              className="lg:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 touch-target"
              aria-label="Close filters"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field w-full text-base"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field w-full"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price Range (RWF)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange[0] || ''}
                  onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                  className="input-field flex-1"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange[1] === 1000000 ? '' : priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 1000000])}
                  className="input-field flex-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Count and Info */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredProducts.length}</span> of{' '}
              <span className="font-semibold text-gray-900 dark:text-white">{products.length}</span> products
            </p>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-accent hover:text-accent-darker font-medium flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Reset filters
            </button>
          )}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          hasActiveFilters ? (
            <EmptySearch 
              searchQuery={searchQuery || 'your filters'} 
              onClear={clearAllFilters}
            />
          ) : (
            <EmptyProducts />
          )
        ) : (
          <>
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'
                  : 'space-y-4'
              }
            >
              {currentProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onView={setSelectedProduct}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {indexOfFirstProduct + 1} to {Math.min(indexOfLastProduct, filteredProducts.length)} of {filteredProducts.length} products
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        // Show first page, last page, current page, and pages around current
                        return (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        )
                      })
                      .map((page, index, array) => {
                        // Add ellipsis if there's a gap
                        const showEllipsisBefore = index > 0 && array[index] - array[index - 1] > 1
                        return (
                          <div key={page} className="flex items-center gap-1">
                            {showEllipsisBefore && (
                              <span className="px-2 text-gray-500">...</span>
                            )}
                            <button
                              onClick={() => paginate(page)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                currentPage === page
                                  ? 'bg-accent text-white'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                              }`}
                              aria-label={`Page ${page}`}
                              aria-current={currentPage === page ? 'page' : undefined}
                            >
                              {page}
                            </button>
                          </div>
                        )
                      })}
                  </div>

                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <QuickViewModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  )
}

export default Products

