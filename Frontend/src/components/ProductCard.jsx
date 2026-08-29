import { AlertTriangle, Check, Heart, Minus, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
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

  const cartItem = cart.find((item) => item.id === product.id)
  const cartQuantity = Number(cartItem?.quantity || 0)
  const hasQuantity = Number.isFinite(Number(product.stock_quantity))
  const availableStock = hasQuantity ? Math.max(0, Number(product.stock_quantity)) : (product.in_stock === false ? 0 : Infinity)
  const soldOut = product.in_stock === false || availableStock <= 0
  const lowStock = !soldOut && hasQuantity && availableStock <= Number(product.low_stock_threshold ?? 5)
  const reachedLimit = Number.isFinite(availableStock) && cartQuantity >= availableStock

  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!isAuthenticated) {
        const localWishlist = JSON.parse(localStorage.getItem('kb_wishlist') || '[]')
        setIsWishlisted(localWishlist.includes(product.id))
        return
      }
      try {
        const wishlistRes = await wishlistAPI.getWishlist()
        setIsWishlisted((wishlistRes.data || []).includes(product.id))
      } catch {
        const localWishlist = JSON.parse(localStorage.getItem('kb_wishlist') || '[]')
        setIsWishlisted(localWishlist.includes(product.id))
      }
    }
    checkWishlistStatus()
  }, [product.id, isAuthenticated])

  useEffect(() => {
    const handleWishlistChange = () => {
      if (!isAuthenticated) {
        const localWishlist = JSON.parse(localStorage.getItem('kb_wishlist') || '[]')
        setIsWishlisted(localWishlist.includes(product.id))
      } else {
        wishlistAPI.getWishlist()
          .then((res) => setIsWishlisted((res.data || []).includes(product.id)))
          .catch(() => {
            const localWishlist = JSON.parse(localStorage.getItem('kb_wishlist') || '[]')
            setIsWishlisted(localWishlist.includes(product.id))
          })
      }
    }
    window.addEventListener('wishlist:changed', handleWishlistChange)
    return () => window.removeEventListener('wishlist:changed', handleWishlistChange)
  }, [product.id, isAuthenticated])

  const handleWishlist = async (event) => {
    event.stopPropagation()
    if (!isAuthenticated) {
      const localWishlist = JSON.parse(localStorage.getItem('kb_wishlist') || '[]')
      const updated = isWishlisted ? localWishlist.filter((id) => id !== product.id) : [...localWishlist, product.id]
      localStorage.setItem('kb_wishlist', JSON.stringify(updated))
      setIsWishlisted(!isWishlisted)
      toast.success(isWishlisted ? `${product.name} removed from wishlist` : `${product.name} added to wishlist`)
      window.dispatchEvent(new Event('wishlist:changed'))
      return
    }

    setIsLoading(true)
    try {
      await wishlistAPI.toggleWishlist(product.id, isWishlisted ? 'remove' : 'add')
      setIsWishlisted(!isWishlisted)
      toast.success(isWishlisted ? `${product.name} removed from wishlist` : `${product.name} added to wishlist`)
      window.dispatchEvent(new Event('wishlist:changed'))
    } catch (error) {
      toast.error(error.response?.data?.error || `Failed to ${isWishlisted ? 'remove from' : 'add to'} wishlist`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToCart = (event) => {
    event.stopPropagation()
    if (soldOut) return toast.warning('This product is currently out of stock')
    if (reachedLimit) return toast.warning(`Only ${availableStock} ${product.unit || 'item'}${availableStock === 1 ? '' : 's'} available`)
    addToCart(product)
    toast.success(`${product.name} added to cart`, 3000, { image: product.image, productName: product.name })
  }

  const handleIncrement = (event) => {
    event.stopPropagation()
    if (reachedLimit) return toast.warning(`You have reached the available stock for ${product.name}`)
    updateQuantity(product.id, cartQuantity + 1)
  }

  const handleDecrement = (event) => {
    event.stopPropagation()
    updateQuantity(product.id, cartQuantity - 1)
  }

  const calculateDiscount = () => {
    if (product.discount && product.discount > 0) return product.discount
    if (product.original_price && product.price && product.original_price > product.price) {
      return Math.max(0, Math.round(((product.original_price - product.price) / product.original_price) * 100))
    }
    return 0
  }

  const discountPercent = product.is_promo ? calculateDiscount() : 0

  return (
    <article onClick={() => onView && onView(product)} className="group relative flex h-full cursor-pointer flex-col justify-between rounded-2xl border border-gray-200/90 bg-white p-3 shadow-sm transition-all duration-300 hover:border-emerald-500/50 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900 sm:p-4">
      <div>
        <div className="relative mb-3 flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-gray-50 transition-transform duration-300 group-hover:scale-[1.02] dark:bg-gray-800/80">
          <LazyImage src={product.image} alt={product.name} className="h-full w-full rounded-xl object-cover" loading="lazy" />

          <div className="absolute left-2 top-2 z-10 flex flex-col gap-1">
            {product.is_promo && discountPercent > 0 && <span className="rounded-full bg-[#FF6B00] px-2 py-0.5 text-[10px] font-black text-white shadow-md sm:text-xs">-{discountPercent}%</span>}
            {soldOut && <span className="rounded-full bg-gray-950 px-2 py-0.5 text-[10px] font-black text-white">Sold out</span>}
            {lowStock && <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-black text-white"><AlertTriangle className="h-3 w-3" /> Only {availableStock} left</span>}
          </div>

          <button onClick={handleWishlist} disabled={isLoading} aria-label={isWishlisted ? 'Remove from saved items' : 'Save item'} className={`absolute right-2 top-2 z-10 rounded-full p-2 shadow-sm backdrop-blur-md transition-all ${isWishlisted ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500 dark:bg-gray-900/90 dark:text-gray-300'}`}>
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div className="space-y-1">
          <div className="flex flex-wrap items-baseline gap-2"><span className="text-lg font-extrabold text-gray-900 dark:text-white sm:text-xl">{Number(product.price || 0).toLocaleString()} RWF</span>{product.original_price && product.original_price > product.price && <span className="text-xs font-semibold text-gray-400 line-through sm:text-sm">{product.original_price.toLocaleString()} RWF</span>}</div>
          <h3 className="line-clamp-2 text-sm font-bold text-gray-900 transition-colors group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-400 sm:text-base">{product.name}</h3>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{product.category || 'Groceries'} · per {product.unit || 'item'}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
        <span className={`flex items-center gap-1 text-[11px] font-semibold ${soldOut ? 'text-gray-400' : lowStock ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
          {soldOut ? <><AlertTriangle className="h-3 w-3" /> Unavailable</> : lowStock ? <><AlertTriangle className="h-3 w-3" /> Limited stock</> : <><Check className="h-3 w-3" /> In stock</>}
        </span>

        {cartQuantity === 0 ? (
          <button onClick={handleAddToCart} disabled={soldOut} className="flex items-center gap-1.5 rounded-full bg-[#108910] px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#007000] hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-gray-700 sm:px-4 sm:text-sm"><Plus className="h-4 w-4 stroke-[3]" /><span>Add</span></button>
        ) : (
          <div onClick={(event) => event.stopPropagation()} className="flex items-center gap-2 rounded-full bg-[#108910] px-2 py-1 text-xs font-bold text-white shadow-md sm:text-sm">
            <button onClick={handleDecrement} className="flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:bg-white/20" aria-label={`Decrease ${product.name}`}><Minus className="h-3.5 w-3.5 stroke-[3]" /></button>
            <span className="px-1 text-sm">{cartQuantity}</span>
            <button onClick={handleIncrement} disabled={reachedLimit} className="flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40" aria-label={`Increase ${product.name}`}><Plus className="h-3.5 w-3.5 stroke-[3]" /></button>
          </div>
        )}
      </div>
    </article>
  )
}

export default ProductCard
