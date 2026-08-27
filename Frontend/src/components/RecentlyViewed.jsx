import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Clock, X } from 'lucide-react'
import ProductCard from './ProductCard'
import { getImageUrl } from '../utils/imageUtils'

const RecentlyViewed = () => {
  const [recentProducts, setRecentProducts] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecentProducts()
  }, [])

  const loadRecentProducts = async () => {
    try {
      // Get recently viewed product IDs from localStorage
      const recentIds = JSON.parse(localStorage.getItem('kb_recently_viewed') || '[]')
      
      if (recentIds.length === 0) {
        setLoading(false)
        return
      }

      // Fetch product details for recently viewed IDs
      const { productsAPI } = await import('../services/api')
      const response = await productsAPI.getPublicProducts()
      const allProducts = response.data || []
      
      // Filter to only recently viewed products, maintaining order
      const recent = recentIds
        .map(id => allProducts.find(p => p.id === id))
        .filter(Boolean)
        .slice(0, 8) // Show max 8 products
      
      setProducts(allProducts)
      setRecentProducts(recent)
    } catch (error) {
      console.error('Failed to load recently viewed products:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearRecent = () => {
    localStorage.removeItem('kb_recently_viewed')
    setRecentProducts([])
  }

  if (loading || recentProducts.length === 0) {
    return null
  }

  return (
    <section className="py-12 sm:py-16 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Recently Viewed
            </h2>
          </div>
          {recentProducts.length > 0 && (
            <button
              onClick={clearRecent}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center gap-1.5 transition-colors"
              aria-label="Clear recently viewed"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {recentProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onView={(product) => {
                // Track view
                const recentIds = JSON.parse(localStorage.getItem('kb_recently_viewed') || '[]')
                const updated = [product.id, ...recentIds.filter(id => id !== product.id)].slice(0, 20)
                localStorage.setItem('kb_recently_viewed', JSON.stringify(updated))
                window.location.href = `/products/${product.id}`
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default RecentlyViewed

