import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { productsAPI } from '../services/api'
import { useCart } from '../contexts/CartContext'
import { useToast } from '../contexts/ToastContext'
import ProductReviews from '../components/ProductReviews'
import RelatedProducts from '../components/RelatedProducts'
import SocialShare from '../components/SocialShare'
import Breadcrumbs from '../components/Breadcrumbs'
import { ShoppingCart, Heart, ArrowLeft, Plus, Minus, ZoomIn, X, Star, ShieldCheck, Truck, RefreshCw } from 'lucide-react'
import { getImageUrl } from '../utils/imageUtils'
import { LoadingSpinner } from '../components/SkeletonLoader'
import { DEFAULT_GROCERY_PRODUCTS } from '../data/groceryData'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const toast = useToast()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
  const imageRef = useRef(null)
  const zoomRef = useRef(null)

  useEffect(() => {
    loadProduct()
  }, [id])

  const loadProduct = async () => {
    try {
      const response = await productsAPI.getProduct(id)
      const productData = response.data
      setProduct(productData)
      
      if (productData && productData.id) {
        const recentIds = JSON.parse(localStorage.getItem('kb_recently_viewed') || '[]')
        const updated = [productData.id, ...recentIds.filter(pid => pid !== productData.id)].slice(0, 20)
        localStorage.setItem('kb_recently_viewed', JSON.stringify(updated))
      }
    } catch (error) {
      const fallbackItem = DEFAULT_GROCERY_PRODUCTS.find(p => String(p.id) === String(id)) || DEFAULT_GROCERY_PRODUCTS[0]
      if (fallbackItem) {
        setProduct(fallbackItem)
      } else {
        toast.error('Product not found')
        navigate('/products')
      }
    } finally {
      setLoading(false)
    }
  }

  const calculateDiscount = (prod) => {
    if (!prod) return 0
    if (prod.discount && prod.discount > 0) return prod.discount
    if (prod.original_price && prod.price && prod.original_price > prod.price) {
      const calculated = Math.round(((prod.original_price - prod.price) / prod.original_price) * 100)
      if (calculated > 0) return calculated
    }
    return 0
  }

  const handleAddToCart = () => {
    if (product?.in_stock === false) {
      toast.warning('This product is out of stock')
      return
    }
    for (let i = 0; i < quantity; i++) {
      addToCart(product)
    }
    toast.success(product.name, 4000, {
      image: product.image,
      productName: product.name,
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4 text-lg">Product not found</p>
          <Link to="/products" className="text-accent hover:underline font-medium">
            Browse all products →
          </Link>
        </div>
      </div>
    )
  }

  const images = product.image ? [product.image] : ['https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80']
  const discountPercent = calculateDiscount(product)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs />
        
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 hover:text-emerald-600 mb-6 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to products
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 p-6 sm:p-8 lg:p-12">
            {/* Image Section */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-gray-900 group shadow-inner">
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'
                  }}
                />
                {discountPercent > 0 && (
                  <span className="absolute top-4 left-4 bg-emerald-600 text-white font-black text-xs px-3 py-1.5 rounded-full shadow-lg">
                    {discountPercent}% OFF
                  </span>
                )}
                {product.category && (
                  <span className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-white font-bold text-xs px-3 py-1.5 rounded-full backdrop-blur-md">
                    {product.category}
                  </span>
                )}
              </div>
            </div>

            {/* Product Details Section */}
            <div className="flex flex-col justify-between space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
                  {product.name}
                </h1>
                
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-5 h-5 fill-amber-400" />
                    <span className="font-bold text-slate-800 dark:text-slate-200 ml-1">
                      {product.rating || 4.9}
                    </span>
                  </div>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500 text-sm font-medium">
                    {product.reviewsCount || 48} verified reviews
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full">
                    Fresh Harvest
                  </span>
                </div>

                <div className="flex items-baseline gap-4 mb-6">
                  <span className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400">
                    {product.price?.toLocaleString()} RWF
                  </span>
                  {product.original_price && product.original_price > product.price && (
                    <span className="text-lg text-slate-400 line-through">
                      {product.original_price?.toLocaleString()} RWF
                    </span>
                  )}
                </div>

                <p className="text-slate-600 dark:text-gray-300 leading-relaxed text-base mb-6">
                  {product.description || 'Farm-fresh quality grocery product sourced daily for peak freshness and natural flavor.'}
                </p>

                {/* Quality Guarantees */}
                <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-gray-900/60 rounded-2xl mb-8 text-center border border-slate-100 dark:border-gray-700">
                  <div className="flex flex-col items-center gap-1.5 p-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">100% Organic</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 p-2">
                    <Truck className="w-5 h-5 text-emerald-600" />
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Same-Day Delivery</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 p-2">
                    <RefreshCw className="w-5 h-5 text-emerald-600" />
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Freshness Guarantee</span>
                  </div>
                </div>
              </div>

              {/* Quantity & CTA */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-slate-200 dark:border-gray-700 rounded-full p-1 bg-slate-50 dark:bg-gray-900">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                      <Minus className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                    </button>
                    <span className="w-10 text-center font-bold text-slate-800 dark:text-white">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                      <Plus className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-[#108910] hover:bg-[#007000] active:scale-95 text-white font-extrabold py-3.5 px-6 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-base"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Express Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Reviews */}
        <div className="mt-12">
          <ProductReviews productId={product.id} />
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
