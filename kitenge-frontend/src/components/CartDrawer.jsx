import { X, Plus, Minus, Trash2, ShoppingBag, Sparkles } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'
import { useState, useEffect } from 'react'
import { EmptyCart } from '../components/EmptyState'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const ADMIN_WHATSAPP_NUMBER = '250788883986'

const CartDrawer = () => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
  } = useCart()
  const { user, isAuthenticated } = useAuth()
  const toast = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [deliveryOption, setDeliveryOption] = useState('kigali')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [deliveryLocation, setDeliveryLocation] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const closeCart = () => {
    setIsOpen(false)
    window.dispatchEvent(new Event('cart:close'))
  }

  useEffect(() => {
    if (isOpen && isAuthenticated && user) {
      setCustomerName(prev => (!prev.trim() && user.name ? user.name : prev))
      setCustomerPhone(prev => (!prev.trim() && user.phone ? user.phone : prev))
    }
  }, [isOpen, isAuthenticated, user])

  const deliveryFees = {
    pickup: 0,
    kigali: 2000,
    upcountry: 3500,
  }

  const deliveryFee = deliveryFees[deliveryOption] || 0
  const subtotal = getCartTotal()
  const grandTotal = subtotal + deliveryFee

  const handleCheckout = async () => {
    if (!customerPhone.trim()) {
      toast.warning('Please enter your WhatsApp phone number')
      return
    }

    if (deliveryOption !== 'pickup' && !deliveryLocation.trim()) {
      toast.warning('Please enter your delivery address')
      return
    }

    setIsProcessing(true)
    try {
      const orderData = {
        customerName: customerName.trim() || null,
        customerPhone: customerPhone.trim(),
        channel: 'whatsapp',
        subtotal: subtotal,
        deliveryOption: deliveryOption,
        deliveryFee: deliveryFee,
        deliveryLocation: deliveryOption !== 'pickup' ? deliveryLocation.trim() : null,
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
      }

      const checkoutCustomerName = customerName.trim() ? customerName.trim() : 'Guest'
      const checkoutDeliveryLabel =
        deliveryOption === 'pickup'
          ? 'Pickup (Free)'
          : deliveryOption === 'kigali'
            ? 'Kigali Express (2,000 RWF)'
            : 'Upcountry Delivery (3,500 RWF)'

      const checkoutMessageLines = [
        '🛒 *INSTACART EXPRESS GROCERY ORDER*',
        '',
        `👤 *Customer:* ${checkoutCustomerName}`,
        `📱 *Phone:* ${customerPhone.trim()}`,
        `🚚 *Delivery:* ${checkoutDeliveryLabel}`,
      ]

      if (deliveryOption !== 'pickup' && deliveryLocation.trim()) {
        checkoutMessageLines.push(`📍 *Location:* ${deliveryLocation.trim()}`)
      }

      checkoutMessageLines.push('', '📦 *ITEMS:*')
      cart.forEach((item, index) => {
        checkoutMessageLines.push(
          `${index + 1}. ${item.name} - Qty: ${item.quantity} × ${item.price.toLocaleString()} RWF`
        )
      })

      checkoutMessageLines.push(
        '',
        `💵 *Subtotal:* ${subtotal.toLocaleString()} RWF`,
        `🚚 *Delivery Fee:* ${deliveryFee.toLocaleString()} RWF`,
        `💰 *TOTAL AMOUNT:* ${grandTotal.toLocaleString()} RWF`,
        '',
        '⚡ *Please confirm my 30-min express grocery order!*'
      )

      const checkoutText = checkoutMessageLines.join('\n')
      const whatsappCheckoutUrl = `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(checkoutText)}`

      const beaconUrl = `${API_BASE_URL}/orders/beacon`
      const beaconBody = JSON.stringify(orderData)
      try {
        if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
          navigator.sendBeacon(beaconUrl, beaconBody)
        } else {
          fetch(beaconUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
            body: beaconBody,
            keepalive: true,
          }).catch(() => {})
        }
      } catch {
        // ignore
      }

      clearCart()
      closeCart()
      window.location.assign(whatsappCheckoutUrl)
    } catch (error) {
      console.error('Checkout failed:', error)
      toast.error('Failed to initiate checkout. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    const handleCartOpen = () => {
      setIsOpen(true)
    }
    window.addEventListener('cart:open', handleCartOpen)
    return () => window.removeEventListener('cart:open', handleCartOpen)
  }, [])

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={closeCart}
      />
      <div
        className="fixed right-0 top-0 h-[100dvh] w-full sm:max-w-md bg-white dark:bg-gray-900 z-50 shadow-2xl overflow-hidden transform transition-transform"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">
          {/* Instacart Header with Delivery Progress */}
          <div className="sticky top-0 bg-white dark:bg-gray-900 z-10 p-4 border-b border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#108910] rounded-xl flex items-center justify-center text-white shadow-md">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
                    Instacart Express Cart
                  </h2>
                  {cart.length > 0 && (
                    <p className="text-xs text-gray-500 font-semibold">
                      {cart.length} {cart.length === 1 ? 'grocery item' : 'grocery items'}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={closeCart}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Instacart Free Delivery Progress Bar */}
            {cart.length > 0 && (
              <div className="bg-[#F0FDF4] dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/50 space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-[#108910] dark:text-emerald-300">
                  <span>
                    {subtotal >= 15000 
                      ? '🎉 Free Express Delivery Unlocked!' 
                      : `Add ${(15000 - subtotal).toLocaleString()} RWF for FREE Express Delivery`}
                  </span>
                  <span>{Math.min(100, Math.round((subtotal / 15000) * 100))}%</span>
                </div>
                <div className="w-full bg-emerald-200 dark:bg-emerald-900 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-[#108910] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (subtotal / 15000) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <EmptyCart onClose={closeCart} />
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 bg-[#F6F7F8] dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700 items-center justify-between"
                >
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-xl shadow-sm flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-500 font-semibold">
                      {item.price.toLocaleString()} RWF
                    </p>
                    <p className="text-xs font-black text-[#108910]">
                      Total: {(item.price * item.quantity).toLocaleString()} RWF
                    </p>
                  </div>

                  {/* Instacart Stepper */}
                  <div className="flex items-center gap-1 bg-[#108910] text-white rounded-full px-2 py-1 shadow-sm text-xs font-bold">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-5 h-5 rounded-full hover:bg-white/20 flex items-center justify-center"
                    >
                      <Minus className="w-3 h-3 stroke-[3]" />
                    </button>
                    <span className="px-1">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-5 h-5 rounded-full hover:bg-white/20 flex items-center justify-center"
                    >
                      <Plus className="w-3 h-3 stroke-[3]" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Checkout Footer */}
          {cart.length > 0 && (
            <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 space-y-3 shadow-2xl">
              <div className="space-y-2 bg-[#F6F7F8] dark:bg-gray-800 p-3 rounded-2xl">
                <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900 dark:text-white">{subtotal.toLocaleString()} RWF</span>
                </div>
                <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-400">
                  <span>Delivery Option</span>
                  <span className="font-bold text-gray-900 dark:text-white">{deliveryFee.toLocaleString()} RWF</span>
                </div>
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between text-base font-extrabold text-gray-900 dark:text-white">
                  <span>Grand Total</span>
                  <span className="text-[#108910] font-black">{grandTotal.toLocaleString()} RWF</span>
                </div>
              </div>

              {/* Delivery Options & Address Inputs */}
              <div className="space-y-2">
                <select
                  value={deliveryOption}
                  onChange={(e) => setDeliveryOption(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-bold bg-white dark:bg-gray-800"
                >
                  <option value="kigali">🚀 Kigali Express Delivery (2,000 RWF)</option>
                  <option value="pickup">🏪 Store Pickup (Free)</option>
                  <option value="upcountry">🚚 Upcountry Express (3,500 RWF)</option>
                </select>

                {deliveryOption !== 'pickup' && (
                  <input
                    type="text"
                    placeholder="Delivery address / landmark *"
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
                  />
                )}

                <input
                  type="tel"
                  placeholder="WhatsApp phone number *"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-xs text-gray-900 dark:text-white font-semibold"
                />
              </div>

              {/* Instacart 1-Click WhatsApp Express Button */}
              <button
                onClick={handleCheckout}
                disabled={isProcessing || !customerPhone.trim() || (deliveryOption !== 'pickup' && !deliveryLocation.trim())}
                className="w-full bg-[#108910] hover:bg-[#007000] active:scale-95 text-white font-extrabold py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {isProcessing ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#FF6B00]" />
                    <span>Place Instacart Express Order</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default CartDrawer
