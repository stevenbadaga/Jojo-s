import { Heart, Plus, Minus, Eye, Check } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { wishlistAPI } from '../services/api'
import LazyImage from './LazyImage'

const ProductCard = ({ product, onView }) => {
  const { cart, addToCart, updateQuantity } = useCart()
  const { isAuthenticated } = useAuth()
  const toast = useToast()
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Find if this item is in cart and get quantity
  const cartItem = cart.find((item) => item.id === product.id)
  const cartQuantity = cartItem ? cartItem.quantity : 0

  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!isAuthenticated) {
        const localWishlist = JSON.parse(
          localStorage.getItem('kb_wishlist') || '[]'
        )
        setIsWishlisted(localWishlist.includes(product.id))
      } else {
        try {
          const wishlistRes = await wishlistAPI.getWishlist()
          const wishlistIds = wishlistRes.data || []
          setIsWishlisted(wishlistIds.includes(product.id))
        } catch (error) {
          const localWishlist = JSON.parse(
            localStorage.getItem('kb_wishlist') || '[]'
          )
          setIsWishlisted(localWishlist.includes(product.id))
        }
      }
    }
    checkWishlistStatus()
  }, [product.id, isAuthenticated])

  useEffect(() => {
    const handleWishlistChange = () => {
      if (!isAuthenticated) {
        const localWishlist = JSON.parse(
          localStorage.getItem('kb_wishlist') || '[]'
        )
        setIsWishlisted(localWishlist.includes(product.id))
      } else {
        wishlistAPI.getWishlist()
          .then(res => {
            const wishlistIds = res.data || []
            setIsWishlisted(wishlistIds.includes(product.id))
          })
          .catch(() => {
            const localWishlist = JSON.parse(
              localStorage.getItem('kb_wishlist') || '[]'
            )
            setIsWishlisted(localWishlist.includes(product.id))
          })
      }
    }

    window.addEventListener('wishlist:changed', handleWishlistChange)
    return () => {
      window.removeEventListener('wishlist:changed', handleWishlistChange)
    }
  }, [product.id, isAuthenticated])

  const handleWishlist = async (e) => {
    e.stopPropagation()
    if (!isAuthenticated) {
      const localWishlist = JSON.parse(
        localStorage.getItem('kb_wishlist') || '[]'
      )
      if (isWishlisted) {
        const updated = localWishlist.filter((id) => id !== product.id)
        localStorage.setItem('kb_wishlist', JSON.stringify(updated))
        toast.success(`${product.name} removed from wishlist`)
      } else {
        localStorage.setItem(
          'kb_wishlist',
          JSON.stringify([...localWishlist, product.id])
        )
        toast.success(`${product.name} added to wishlist`)
      }
      setIsWishlisted(!isWishlisted)
      window.dispatchEvent(new Event('wishlist:changed'))
      return
    }

    setIsLoading(true)
    try {
      await wishlistAPI.toggleWishlist(
        product.id,
        isWishlisted ? 'remove' : 'add'
      )
      setIsWishlisted(!isWishlisted)
      toast.success(
        isWishlisted 
          ? `${product.name} removed from wishlist`
          : `${product.name} added to wishlist`
      )
      window.dispatchEvent(new Event('wishlist:changed'))
    } catch (error) {
      console.error('Wishlist toggle failed:', error)
      toast.error(
        error.response?.data?.error || 
        `Failed to ${isWishlisted ? 'remove from' : 'add to'} wishlist`
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToCart = (e) => {
    e.stopPropagation()
    if (product.in_stock === false) {
      toast.warning('This product is out of stock')
      return
    }
    addToCart(product)
    toast.success(`${product.name} added to cart`, 3000, {
      image: product.image,
      productName: product.name,
    })
  }

  const handleIncrement = (e) => {
    e.stopPropagation()
    updateQuantity(product.id, cartQuantity + 1)
  }

  const handleDecrement = (e) => {
    e.stopPropagation()
    updateQuantity(product.id, cartQuantity - 1)
  }

  const calculateDiscount = () => {
    if (product.discount && product.discount > 0) return product.discount
    if (product.original_price && product.price && product.original_price > product.price) {
      const calculated = Math.round(((product.original_price - product.price) / product.original_price) * 100)
      if (calculated > 0) return calculated
    }
    return 0
  }

  const discountPercent = product.is_promo ? calculateDiscount() : 0

  return (
    <article 
      onClick={() => onView && onView(product)}
      className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/90 dark:border-gray-800 hover:border-emerald-500/50 shadow-sm hover:shadow-xl transition-all duration-300 p-3 sm:p-4 flex flex-col justify-between relative cursor-pointer h-full"
    >
      <div>
        {/* Instacart Product Image Container */}
        <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-800/80 flex items-center justify-center mb-3 group-hover:scale-[1.02] transition-transform duration-300">
          <LazyImage
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover rounded-xl"
            loading="lazy"
          />

          {/* Badges Overlay */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {product.is_promo && discountPercent > 0 && (
              <span className="bg-[#FF6B00] text-white text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full shadow-md">
                -{discountPercent}%
              </span>
            )}
            {!product.in_stock && (
              <span className="bg-gray-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                Sold out
              </span>
            )}
          </div>

          {/* Top Right Wishlist & Quick View */}
          <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
            <button
              onClick={handleWishlist}
              disabled={isLoading}
              className={`p-2 rounded-full backdrop-blur-md transition-all shadow-sm ${
                isWishlisted
                  ? 'bg-red-500 text-white'
                  : 'bg-white/90 text-gray-600 hover:text-red-500 hover:bg-white dark:bg-gray-900/90 dark:text-gray-300'
              }`}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Instacart Price & Details */}
        <div className="space-y-1">
          {/* Price */}
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white">
              {product.price.toLocaleString()} RWF
            </span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-xs sm:text-sm text-gray-400 line-through font-semibold">
                {product.original_price.toLocaleString()} RWF
              </span>
            )}
          </div>

          {/* Product Title */}
          <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white line-clamp-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
            {product.name}
          </h3>

          {/* Unit Weight / Brand Subtitle */}
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {product.category ? `${product.category} • Fresh Produce` : 'Fresh Daily Produce'}
          </p>
        </div>
      </div>

      {/* Instacart Iconic Floating Bottom Add / Stepper Button */}
      <div className="mt-4 pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
          <Check className="w-3 h-3" /> In stock
        </span>

        {cartQuantity === 0 ? (
          <button
            onClick={handleAddToCart}
            disabled={product.in_stock === false}
            className="bg-[#108910] hover:bg-[#007000] active:scale-95 text-white px-3 sm:px-4 py-1.5 rounded-full font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all disabled:opacity-50"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add</span>
          </button>
        ) : (
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#108910] text-white rounded-full px-2 py-1 flex items-center gap-2 font-bold text-xs sm:text-sm shadow-md animate-fade-in"
          >
            <button
              onClick={handleDecrement}
              className="w-6 h-6 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <Minus className="w-3.5 h-3.5 stroke-[3]" />
            </button>
            <span className="px-1 text-sm">{cartQuantity}</span>
            <button
              onClick={handleIncrement}
              className="w-6 h-6 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>
        )}
      </div>
    </article>
  )
}

export default ProductCard
