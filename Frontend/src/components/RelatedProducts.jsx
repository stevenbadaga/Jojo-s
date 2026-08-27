import { useState, useEffect } from 'react'
import { productsAPI } from '../services/api'
import ProductCard from './ProductCard'
import { ProductGridSkeleton } from './SkeletonLoader'

const RelatedProducts = ({ currentProductId, category, limit = 4 }) => {
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRelatedProducts()
  }, [currentProductId, category])

  const loadRelatedProducts = async () => {
    try {
      const response = await productsAPI.getPublicProducts()
      const allProducts = response.data || []
      
      // Filter related products: same category, exclude current product
      const related = allProducts
        .filter(
          (product) =>
            product.id !== currentProductId &&
            product.category === category &&
            product.in_stock !== false
        )
        .slice(0, limit)

      // If not enough products in same category, add other products
      if (related.length < limit) {
        const others = allProducts
          .filter(
            (product) =>
              product.id !== currentProductId &&
              product.category !== category &&
              product.in_stock !== false
          )
          .slice(0, limit - related.length)
        setRelatedProducts([...related, ...others])
      } else {
        setRelatedProducts(related)
      }
    } catch (error) {
      console.error('Failed to load related products:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8">
            Related Products
          </h2>
          <ProductGridSkeleton count={limit} />
        </div>
      </section>
    )
  }

  if (relatedProducts.length === 0) {
    return null
  }

  return (
    <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8">
          Related Products
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {relatedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onView={(product) => {
                window.location.href = `/products/${product.id}`
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default RelatedProducts

