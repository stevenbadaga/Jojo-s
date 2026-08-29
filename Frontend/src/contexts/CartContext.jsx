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

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  // Read localStorage during initialization so the first render never overwrites a saved cart.
  const [cart, setCart] = useState(readStoredCart)

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    } catch (error) {
      console.error('Failed to save cart:', error)
    }
  }, [cart])

  // Keep the cart synchronized when the store is open in more than one tab/window.
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
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id)

      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: Number(item.quantity || 0) + 1 }
            : item
        )
      }

      return [...prevCart, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId))
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const getCartTotal = () => {
    return cart.reduce(
      (total, item) => total + Number(item.price || 0) * Number(item.quantity || 0),
      0
    )
  }

  const getCartCount = () => {
    return cart.reduce((count, item) => count + Number(item.quantity || 0), 0)
  }

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

