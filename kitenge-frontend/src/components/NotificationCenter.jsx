import { useState, useEffect, useRef } from 'react'
import { Bell, Check, Sparkles, Truck, ShoppingBag, CreditCard, ShieldCheck, X } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: '🚚 Express Driver Assigned',
    message: 'Your personal shopper Jean-Paul is on the way with your 30-min Kigali grocery order.',
    time: '2 mins ago',
    type: 'order',
    read: false,
  },
  {
    id: 2,
    title: '💳 Payment Received & Verified',
    message: 'Payment for order #JOJO-8921 has been verified. Receipt sent to your email.',
    time: '15 mins ago',
    type: 'payment',
    read: false,
  },
  {
    id: 3,
    title: '🥦 Fresh Harvest Arrival!',
    message: 'Organic Musanze Strawberries & Fresh Rwandan Avocados just arrived at Kigali Hub.',
    time: '1 hour ago',
    type: 'promo',
    read: true,
  },
]

const NotificationCenter = ({ onOpenPaymentModal }) => {
  const toast = useToast()
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState('all')
  const [pushEnabled, setPushEnabled] = useState(false)
  const dropdownRef = useRef(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    if ('Notification' in window) {
      setPushEnabled(Notification.permission === 'granted')
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const requestWebPush = async () => {
    if (!('Notification' in window)) {
      toast.error('Browser push notifications are not supported on your device.')
      return
    }

    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        setPushEnabled(true)
        toast.success('Live device notifications enabled!')
        new Notification('🥬 JOJO Groceries Notifications Active', {
          body: 'You will now receive live 30-minute delivery & payment updates on your device.',
          icon: '/favicon.ico',
        })
      } else {
        toast.error('Notification permission was denied.')
      }
    } catch (e) {
      console.error('Error requesting notification permission:', e)
    }
  }

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
    toast.success('All notifications marked as read')
  }

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read
    if (filter === 'order') return n.type === 'order' || n.type === 'payment'
    return true
  })

  return (
    <div className="relative" ref={dropdownRef}>
      
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#108910] text-white text-[10px] font-black flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 z-50 overflow-hidden animate-scale-in">
          
          {/* Panel Header */}
          <div className="bg-gradient-to-r from-[#002524] to-[#003834] text-white p-4 sm:p-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF6B00]" />
              <h3 className="font-extrabold text-sm sm:text-base text-white">Live System Notifications</h3>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[11px] font-bold text-emerald-300 hover:underline"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Web Push Banner */}
          {!pushEnabled && (
            <div className="bg-emerald-50 dark:bg-emerald-950/60 p-3 px-4 border-b border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between text-xs">
              <span className="text-gray-700 dark:text-gray-300 font-medium">Get live alerts on your phone</span>
              <button
                onClick={requestWebPush}
                className="bg-[#108910] text-white font-extrabold px-3 py-1 rounded-full text-[10px] hover:bg-[#007000] transition-colors"
              >
                Enable Push
              </button>
            </div>
          )}

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-1.5 p-2 bg-[#F6F7F8] dark:bg-gray-800/40 border-b border-gray-200 dark:border-gray-800 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full font-extrabold text-[11px] transition-colors ${
                filter === 'all'
                  ? 'bg-[#108910] text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-full font-extrabold text-[11px] transition-colors ${
                filter === 'unread'
                  ? 'bg-[#108910] text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('order')}
              className={`px-3 py-1 rounded-full font-extrabold text-[11px] transition-colors ${
                filter === 'order'
                  ? 'bg-[#108910] text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Orders
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-start gap-3 ${
                    !notif.read ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#108910] flex items-center justify-center flex-shrink-0 font-bold text-xs mt-0.5">
                    {notif.type === 'order' && <Truck className="w-4 h-4" />}
                    {notif.type === 'payment' && <CreditCard className="w-4 h-4" />}
                    {notif.type === 'promo' && <ShoppingBag className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-xs text-gray-900 dark:text-white">
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-gray-400 font-medium">{notif.time}</span>
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                      {notif.message}
                    </p>

                    {notif.type === 'payment' && onOpenPaymentModal && (
                      <button
                        onClick={() => {
                          setIsOpen(false)
                          onOpenPaymentModal()
                        }}
                        className="text-[11px] font-black text-[#108910] hover:underline flex items-center gap-1 mt-1"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Confirm Payment Now</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-gray-500 font-medium">
                No notifications found.
              </div>
            )}
          </div>

          {/* Panel Footer */}
          <div className="p-3 bg-[#F6F7F8] dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 text-center">
            <button
              onClick={() => {
                setIsOpen(false)
                if (onOpenPaymentModal) onOpenPaymentModal()
              }}
              className="w-full bg-[#108910] hover:bg-[#007000] text-white font-extrabold py-2 px-4 rounded-xl text-xs shadow-sm transition-all"
            >
              💳 Confirm Payment for Current Order
            </button>
          </div>

        </div>
      )}

    </div>
  )
}

export default NotificationCenter
