import { Minus, Plus, ShoppingBag, Sparkles, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useCart } from '../contexts/CartContext'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'
import { isBackendConnectionIssue, ordersAPI } from '../services/api'
import { getImageUrl } from '../utils/imageUtils'
import { EmptyCart } from './EmptyState'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const ADMIN_WHATSAPP_NUMBER = '250780453704'
const deliveryFees = { pickup: 0, kigali: 2000, upcountry: 3500 }
const stockLimit = (item) => Number.isFinite(Number(item?.stock_quantity)) ? Math.max(0, Number(item.stock_quantity)) : Infinity

const CartDrawer = () => {
  const { cart, updateQuantity, clearCart, getCartTotal } = useCart()
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
      setCustomerName((previous) => (!previous.trim() && user.name ? user.name : previous))
      setCustomerPhone((previous) => (!previous.trim() && user.phone ? user.phone : previous))
      setDeliveryLocation((previous) => (!previous.trim() && user.address ? user.address : previous))
    }
  }, [isOpen, isAuthenticated, user])

  useEffect(() => {
    const handleCartOpen = () => setIsOpen(true)
    window.addEventListener('cart:open', handleCartOpen)
    return () => window.removeEventListener('cart:open', handleCartOpen)
  }, [])

  const deliveryFee = deliveryFees[deliveryOption] || 0
  const estimatedSubtotal = getCartTotal()
  const estimatedTotal = estimatedSubtotal + deliveryFee

  const persistCheckoutNotification = (createdOrder) => {
    const number = createdOrder?.order_number ?? createdOrder?.orderNumber ?? createdOrder?.id ?? 'New'
    const total = Number(createdOrder?.total ?? estimatedTotal)
    window.dispatchEvent(new CustomEvent('marketmet:notify', { detail: {
      id: createdOrder?.id ? `checkout:${createdOrder.id}:${Date.now()}` : `checkout:${Date.now()}`,
      orderId: createdOrder?.id || null,
      orderNumber: number,
      title: `Order received · #${number}`,
      message: `Your MarketMet order for ${total.toLocaleString()} RWF was submitted successfully. Payment and confirmation are next.`,
      createdAt: new Date().toISOString(), type: 'order', status: 'PENDING', tone: 'emerald', read: false,
      href: isAuthenticated ? '/account' : null,
    } }))
  }

  const submitOrder = async (orderData) => {
    try {
      const response = await ordersAPI.createOrder(orderData)
      return response.data?.order || response.data || null
    } catch (error) {
      if (!isBackendConnectionIssue(error)) throw error
      const beaconUrl = `${API_BASE_URL}/orders/beacon`
      const beaconBody = JSON.stringify(orderData)
      if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function' && navigator.sendBeacon(beaconUrl, beaconBody)) return null
      await fetch(beaconUrl, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: beaconBody, keepalive: true })
      return null
    }
  }

  const handleCheckout = async () => {
    if (!customerPhone.trim()) return toast.warning('Please enter your WhatsApp phone number')
    if (deliveryOption !== 'pickup' && !deliveryLocation.trim()) return toast.warning('Please enter your delivery address')
    if (!cart.length) return toast.warning('Your cart is empty')

    const unavailable = cart.find((item) => item.in_stock === false || stockLimit(item) <= 0)
    if (unavailable) return toast.warning(`${unavailable.name} is currently out of stock. Remove it before checkout.`)
    const overLimit = cart.find((item) => Number.isFinite(stockLimit(item)) && Number(item.quantity) > stockLimit(item))
    if (overLimit) return toast.warning(`Only ${stockLimit(overLimit)} ${overLimit.unit || 'item'}${stockLimit(overLimit) === 1 ? '' : 's'} of ${overLimit.name} are available.`)

    setIsProcessing(true)
    try {
      const orderData = {
        customerName: customerName.trim() || null,
        customerPhone: customerPhone.trim(),
        channel: 'WHATSAPP',
        deliveryOption,
        deliveryLocation: deliveryOption !== 'pickup' ? deliveryLocation.trim() : null,
        paymentMethod: 'MTN_MOMO',
        items: cart.map((item) => ({ productId: item.id, quantity: Number(item.quantity) || 1 })),
      }
      const createdOrder = await submitOrder(orderData)
      persistCheckoutNotification(createdOrder)

      const serverSubtotal = Number(createdOrder?.subtotal ?? estimatedSubtotal)
      const serverDeliveryFee = Number(createdOrder?.delivery_fee ?? deliveryFee)
      const serverTotal = Number(createdOrder?.total ?? (serverSubtotal + serverDeliveryFee))
      const number = createdOrder?.order_number ?? createdOrder?.orderNumber ?? createdOrder?.id
      const deliveryLabel = deliveryOption === 'pickup'
        ? 'Store Pickup (Free)'
        : deliveryOption === 'kigali'
          ? 'Kigali Delivery (2,000 RWF)'
          : 'Upcountry Delivery (3,500 RWF)'

      const lines = [
        '🛒 *MARKETMET GROCERY ORDER*',
        '',
        ...(number ? [`🧾 *Order:* #${number}`] : []),
        `👤 *Customer:* ${customerName.trim() || 'Guest'}`,
        `📱 *Phone:* ${customerPhone.trim()}`,
        `🚚 *Delivery:* ${deliveryLabel}`,
      ]

      if (deliveryOption !== 'pickup' && deliveryLocation.trim()) {
        lines.push(`📍 *Location:* ${deliveryLocation.trim()}`)
      }

      lines.push('', '📦 *ITEMS:*')
      cart.forEach((item, index) => {
        lines.push(`${index + 1}. ${item.name} - Qty: ${Number(item.quantity) || 1} × ${Number(item.price || 0).toLocaleString()} RWF`)
      })

      lines.push(
        '',
        `💵 *Subtotal:* ${serverSubtotal.toLocaleString()} RWF`,
        `🚚 *Delivery Fee:* ${serverDeliveryFee.toLocaleString()} RWF`,
        `💰 *TOTAL AMOUNT:* ${serverTotal.toLocaleString()} RWF`,
        '',
        'Please confirm my MarketMet order.'
      )

      const whatsappCheckoutUrl = `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`
      clearCart()
      closeCart()
      toast.success(number ? `Order #${number} created successfully` : 'Order submitted successfully')
      window.setTimeout(() => window.location.assign(whatsappCheckoutUrl), 250)
    } catch (error) {
      console.error('Checkout failed:', error)
      toast.error(error.response?.data?.error || (isBackendConnectionIssue(error) ? 'Connection was lost while placing the order. Please try again.' : 'We could not create your order. Please try again.'))
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return <>
    <button className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={closeCart} aria-label="Close cart" />
    <aside className="fixed right-0 top-0 z-50 h-[100dvh] w-full overflow-hidden bg-white shadow-2xl dark:bg-[#090909] sm:max-w-md">
      <div className="flex h-full flex-col">
        <header className="sticky top-0 z-10 space-y-3 border-b border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#090909]">
          <div className="flex items-center justify-between"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#108910] text-white"><ShoppingBag className="h-5 w-5" /></span><div><h2 className="text-lg font-black">Your cart</h2>{cart.length > 0 && <p className="text-xs font-semibold text-gray-500">{cart.length} {cart.length === 1 ? 'product' : 'products'} selected</p>}</div></div><button onClick={closeCart} className="grid h-9 w-9 place-items-center rounded-full hover:bg-gray-100 dark:hover:bg-white/[0.06]" aria-label="Close cart"><X className="h-5 w-5 text-gray-500" /></button></div>
          {cart.length > 0 && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 dark:border-emerald-500/20 dark:bg-emerald-950/30"><div className="flex justify-between gap-3 text-xs font-black text-[#108910] dark:text-emerald-300"><span>{estimatedSubtotal >= 15000 ? 'Free-delivery threshold reached' : `Add ${(15000 - estimatedSubtotal).toLocaleString()} RWF to reach 15,000 RWF`}</span><span>{Math.min(100, Math.round((estimatedSubtotal / 15000) * 100))}%</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-emerald-200 dark:bg-emerald-900"><div className="h-full rounded-full bg-[#108910]" style={{ width: `${Math.min(100, (estimatedSubtotal / 15000) * 100)}%` }} /></div></div>}
        </header>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">{cart.length === 0 ? <EmptyCart onClose={closeCart} /> : cart.map((item) => { const limit = stockLimit(item); const atLimit = Number.isFinite(limit) && Number(item.quantity) >= limit; return <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-[#F7F8F8] p-3 dark:border-white/10 dark:bg-[#111]"><img src={getImageUrl(item.image)} alt={item.name} className="h-16 w-16 flex-shrink-0 rounded-xl object-cover" onError={(e) => { e.currentTarget.src = '/placeholder.png' }} /><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-black">{item.name}</h3><p className="mt-1 text-[11px] font-bold text-gray-500">{Number(item.price || 0).toLocaleString()} RWF · per {item.unit || 'item'}</p><p className="mt-1 text-xs font-black text-[#108910]">{(Number(item.price || 0) * Number(item.quantity || 0)).toLocaleString()} RWF</p>{Number.isFinite(limit) && <p className={`mt-1 text-[9px] font-bold ${atLimit ? 'text-amber-600' : 'text-gray-400'}`}>{limit} available</p>}</div><div className="flex items-center gap-1 rounded-full bg-[#108910] px-2 py-1 text-xs font-black text-white"><button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="grid h-6 w-6 place-items-center rounded-full hover:bg-white/20"><Minus className="h-3.5 w-3.5" /></button><span className="min-w-5 text-center">{item.quantity}</span><button disabled={atLimit} onClick={() => updateQuantity(item.id, item.quantity + 1)} className="grid h-6 w-6 place-items-center rounded-full hover:bg-white/20 disabled:opacity-40"><Plus className="h-3.5 w-3.5" /></button></div></div> })}</div>
        {cart.length > 0 && <footer className="sticky bottom-0 space-y-3 border-t border-gray-200 bg-white p-4 shadow-2xl dark:border-white/10 dark:bg-[#090909]"><div className="rounded-2xl bg-[#F7F8F8] p-3 text-xs dark:bg-[#111]"><div className="flex justify-between text-gray-500"><span>Estimated subtotal</span><strong className="text-gray-900 dark:text-white">{estimatedSubtotal.toLocaleString()} RWF</strong></div><div className="mt-2 flex justify-between text-gray-500"><span>Delivery</span><strong className="text-gray-900 dark:text-white">{deliveryFee.toLocaleString()} RWF</strong></div><div className="mt-2 flex justify-between border-t border-gray-200 pt-2 text-base font-black dark:border-white/10"><span>Estimated total</span><span className="text-[#108910]">{estimatedTotal.toLocaleString()} RWF</span></div><p className="mt-2 text-[9px] leading-4 text-gray-400">Final pricing and stock are validated securely by MarketMet when the order is submitted.</p></div><div className="grid gap-2 sm:grid-cols-2"><input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer name" className="input-field text-xs" /><input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="WhatsApp number *" className="input-field text-xs" /></div><select value={deliveryOption} onChange={(e) => setDeliveryOption(e.target.value)} className="input-field text-xs font-bold"><option value="kigali">Kigali delivery · 2,000 RWF</option><option value="pickup">Store pickup · Free</option><option value="upcountry">Upcountry delivery · 3,500 RWF</option></select>{deliveryOption !== 'pickup' && <input value={deliveryLocation} onChange={(e) => setDeliveryLocation(e.target.value)} placeholder="Delivery address / landmark *" className="input-field text-xs" />}<button onClick={handleCheckout} disabled={isProcessing || !customerPhone.trim() || (deliveryOption !== 'pickup' && !deliveryLocation.trim())} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#108910] py-3.5 text-sm font-black text-white shadow-lg hover:bg-[#007000] disabled:opacity-50">{isProcessing ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <><Sparkles className="h-4 w-4" /> Place MarketMet order</>}</button><a href="tel:*182*1*1*0780453704%23" className="flex w-full items-center justify-center rounded-xl border border-emerald-700/50 bg-[#002524] py-2.5 text-xs font-black text-emerald-400">Pay with MoMo USSD · *182*1*1*0780453704#</a></footer>}
      </div>
    </aside>
  </>
}

export default CartDrawer
