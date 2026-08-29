import { createContext, useContext, useEffect, useState } from 'react'

const CartContext = createContext()
const CART_STORAGE_KEY = 'kb_cart'

const readStoredCart = () => {
  if (typeof window === 'undefined') return []
  try {
    const saved = window.localStorage.getItem(CART_STORAGE_KEY)
    if (!saved) return []
    const parsed = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('Failed to load cart:', error)
    return []
  }
}

const stockLimit = (item) => {
  const value = Number(item?.stock_quantity)
  if (Number.isFinite(value)) return Math.max(0, value)
  return item?.in_stock === false ? 0 : Number.POSITIVE_INFINITY
}

const clampQuantity = (item, requested) => {
  const normalized = Math.max(0, Number.parseInt(requested, 10) || 0)
  const limit = stockLimit(item)
  return Number.isFinite(limit) ? Math.min(normalized, limit) : normalized
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(readStoredCart)

  useEffect(() => {
    try { window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart)) } catch (error) { console.error('Failed to save cart:', error) }
  }, [cart])

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key !== CART_STORAGE_KEY) return
      try {
        const nextCart = event.newValue ? JSON.parse(event.newValue) : []
        setCart(Array.isArray(nextCart) ? nextCart : [])
      } catch (error) {
        console.error('Failed to sync cart:', error)
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const addToCart = (product) => {
    const available = stockLimit(product)
    if (available <= 0) return false
    let changed = false
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id)
      if (existing) {
        const next = clampQuantity({ ...existing, ...product }, Number(existing.quantity || 0) + 1)
        if (next === Number(existing.quantity || 0)) return prevCart
        changed = true
        return prevCart.map((item) => item.id === product.id ? { ...item, ...product, quantity: next } : item)
      }
      changed = true
      return [...prevCart, { ...product, quantity: 1 }]
    })
    return changed
  }

  const removeFromCart = (productId) => setCart((prevCart) => prevCart.filter((item) => item.id !== productId))

  const updateQuantity = (productId, quantity) => {
    if (Number(quantity) <= 0) {
      removeFromCart(productId)
      return
    }
    setCart((prevCart) => prevCart.map((item) => {
      if (item.id !== productId) return item
      const next = clampQuantity(item, quantity)
      return next > 0 ? { ...item, quantity: next } : item
    }))
  }

  const syncProductAvailability = (products = []) => {
    if (!Array.isArray(products) || !products.length) return
    const byId = new Map(products.map((product) => [product.id, product]))
    setCart((current) => current
      .map((item) => {
        const fresh = byId.get(item.id)
        if (!fresh) return item
        const merged = { ...item, ...fresh }
        const quantity = clampQuantity(merged, item.quantity)
        return { ...merged, quantity }
      })
      .filter((item) => item.quantity > 0 && stockLimit(item) > 0))
  }

  const clearCart = () => setCart([])
  const getCartTotal = () => cart.reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 0), 0)
  const getCartCount = () => cart.reduce((count, item) => count + Number(item.quantity || 0), 0)
  const getAvailableStock = (productId) => stockLimit(cart.find((item) => item.id === productId))

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, syncProductAvailability, clearCart, getCartTotal, getCartCount, getAvailableStock }}>
      {children}
    </CartContext.Provider>
  )
}
