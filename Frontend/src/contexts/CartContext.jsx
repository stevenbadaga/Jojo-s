import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([])

  useEffect(() => {
    loadCart()
  }, [])

  useEffect(() => {
    saveCart()
  }, [cart])

  const loadCart = () => {
    try {
      const saved = localStorage.getItem('kb_cart')
      if (saved) {
        setCart(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Failed to load cart:', error)
    }
  }

  const saveCart = () => {
    try {
      localStorage.setItem('kb_cart', JSON.stringify(cart))
    } catch (error) {
      console.error('Failed to save cart:', error)
    }
  }

  const addToCart = (product) => {
    console.log('addToCart called with:', product)
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id)
      if (existing) {
        const updated = prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
        console.log('Updated cart (existing item):', updated)
        return updated
      }
      const newCart = [...prevCart, { ...product, quantity: 1 }]
      console.log('Updated cart (new item):', newCart)
      return newCart
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
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0)
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

