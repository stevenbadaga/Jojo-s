import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  CheckCheck,
  CircleCheck,
  Clock3,
  PackageCheck,
  RefreshCw,
  ShoppingBag,
  Truck,
  X,
  XCircle,
} from 'lucide-react'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'
import { isBackendConnectionIssue, ordersAPI } from '../services/api'

const POLL_INTERVAL_MS = 30000
const MAX_NOTIFICATIONS = 40

const statusCopy = {
  PENDING: {
    title: 'Order received',
    message: 'Your order has been received and is waiting for confirmation.',
    icon: ShoppingBag,
    tone: 'emerald',
  },
  CONFIRMED: {
    title: 'Order confirmed',
    message: 'Your order has been confirmed and will be prepared shortly.',
    icon: CircleCheck,
    tone: 'emerald',
  },
  PROCESSING: {
    title: 'Order being prepared',
    message: 'Your groceries are being picked and prepared for dispatch.',
    icon: PackageCheck,
    tone: 'amber',
  },
  SHIPPED: {
    title: 'Order on the way',
    message: 'Your order has left MarketMet and is on its way to you.',
    icon: Truck,
    tone: 'blue',
  },
  DELIVERED: {
    title: 'Order delivered',
    message: 'Your MarketMet order has been delivered successfully.',
    icon: CircleCheck,
    tone: 'emerald',
  },
  CANCELLED: {
    title: 'Order cancelled',
    message: 'This order was cancelled. Contact support if you need assistance.',
    icon: XCircle,
    tone: 'red',
  },
}

const safeDate = (value) => {
  const date = value ? new Date(value) : new Date()
  return Number.isNaN(date.getTime()) ? new Date() : date
}

const relativeTime = (value) => {
  const date = safeDate(value)
  const diff = Math.max(0, Date.now() - date.getTime())
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const orderNumber = (order) => order?.order_number ?? order?.orderNumber ?? order?.id
const orderStatus = (order) => String(order?.status || 'PENDING').toUpperCase()
const orderCreatedAt = (order) => order?.created_at ?? order?.createdAt ?? new Date().toISOString()

const buildOrderNotification = (order, isAdmin, read = false) => {
  const status = orderStatus(order)
  const copy = statusCopy[status] || statusCopy.PENDING
  const number = orderNumber(order)
  const customer = order?.customer_name || order?.customerName || 'Customer'
  const amount = Number(order?.subtotal || 0) + Number(order?.delivery_fee ?? order?.deliveryFee ?? 0)

  let title = `${copy.title} · #${number}`
  let message = copy.message

  if (isAdmin) {
    if (status === 'PENDING') {
      title = `New order · #${number}`
      message = `${customer} placed an order${amount > 0 ? ` worth ${amount.toLocaleString()} RWF` : ''}. Review and confirm it.`
    } else {
      message = `Order #${number} for ${customer} is now ${status.toLowerCase().replace('_', ' ')}.`
    }
  }

  return {
    id: `order:${order.id}:${status}`,
    orderId: order.id,
    orderNumber: number,
    title,
    message,
    createdAt: orderCreatedAt(order),
    type: 'order',
    status,
    tone: copy.tone,
    read,
    href: isAdmin ? '/admin/orders' : '/account',
  }
}

const toneClasses = {
  emerald: 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300',
  amber: 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300',
  blue: 'bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300',
  red: 'bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-300',
  slate: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
}

const NotificationCenter = () => {
  const toast = useToast()
  const navigate = useNavigate()
  const { isAuthenticated, isAdmin, user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState('all')
  const [desktopAlertsEnabled, setDesktopAlertsEnabled] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [lastSyncAt, setLastSyncAt] = useState(null)
  const [syncError, setSyncError] = useState(false)
  const dropdownRef = useRef(null)
  const knownOrderStatesRef = useRef(new Map())
  const initialSyncDoneRef = useRef(false)

  const storageKey = `marketmet_notifications_v2_${user?.id || 'guest'}`
  const unreadCount = notifications.filter((item) => !item.read).length

  useEffect(() => {
    initialSyncDoneRef.current = false
    knownOrderStatesRef.current = new Map()

    try {
      const saved = window.localStorage.getItem(storageKey)
      const parsed = saved ? JSON.parse(saved) : []
      setNotifications(Array.isArray(parsed) ? parsed.slice(0, MAX_NOTIFICATIONS) : [])
    } catch {
      setNotifications([])
    }
  }, [storageKey])

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(notifications.slice(0, MAX_NOTIFICATIONS)))
    } catch (error) {
      console.error('Failed to save notifications:', error)
    }
  }, [notifications, storageKey])

  useEffect(() => {
    if ('Notification' in window) {
      setDesktopAlertsEnabled(Notification.permission === 'granted')
    }
  }, [])

  const showDesktopAlert = useCallback((notification) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return
    if (!document.hidden) return

    try {
      const desktopNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
      })
      desktopNotification.onclick = () => {
        window.focus()
        if (notification.href) navigate(notification.href)
        desktopNotification.close()
      }
    } catch (error) {
      console.error('Desktop notification failed:', error)
    }
  }, [navigate])

  const appendNotification = useCallback((notification, { desktop = false } = {}) => {
    if (!notification?.id) return

    setNotifications((current) => {
      if (current.some((item) => item.id === notification.id)) return current
      return [notification, ...current].slice(0, MAX_NOTIFICATIONS)
    })

    if (desktop) showDesktopAlert(notification)
  }, [showDesktopAlert])

  const syncOrders = useCallback(async ({ silent = true } = {}) => {
    if (!isAuthenticated) {
      setLastSyncAt(new Date())
      setSyncError(false)
      return
    }

    if (!silent) setRefreshing(true)

    try {
      const response = isAdmin ? await ordersAPI.getAllOrders() : await ordersAPI.getMyOrders()
      const orders = Array.isArray(response.data) ? response.data : response.data?.orders || []
      const ordered = [...orders].sort(
        (a, b) => safeDate(orderCreatedAt(b)).getTime() - safeDate(orderCreatedAt(a)).getTime()
      )

      const previousStates = knownOrderStatesRef.current
      const firstSync = !initialSyncDoneRef.current

      if (firstSync) {
        const existingIds = new Set(notifications.map((item) => item.id))
        const recent = ordered.slice(0, 12).map((order) => buildOrderNotification(order, isAdmin, true))
        const missing = recent.filter((item) => !existingIds.has(item.id))
        if (missing.length) {
          setNotifications((current) => [...missing, ...current].slice(0, MAX_NOTIFICATIONS))
        }
      } else {
        ordered.forEach((order) => {
          const status = orderStatus(order)
          const previousStatus = previousStates.get(String(order.id))
          const changed = previousStatus && previousStatus !== status
          const isNew = !previousStatus

          if (changed || isNew) {
            appendNotification(buildOrderNotification(order, isAdmin, false), { desktop: true })
          }
        })
      }

      knownOrderStatesRef.current = new Map(
        ordered.map((order) => [String(order.id), orderStatus(order)])
      )
      initialSyncDoneRef.current = true
      setLastSyncAt(new Date())
      setSyncError(false)
    } catch (error) {
      if (!isBackendConnectionIssue(error)) {
        console.error('Notification sync failed:', error)
      }
      setSyncError(true)
    } finally {
      if (!silent) setRefreshing(false)
    }
  }, [appendNotification, isAdmin, isAuthenticated, notifications])

  useEffect(() => {
    syncOrders()
    const timer = window.setInterval(() => syncOrders(), POLL_INTERVAL_MS)

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') syncOrders()
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [syncOrders])

  useEffect(() => {
    const handleAppNotification = (event) => {
      const detail = event?.detail || {}
      const notification = {
        id: detail.id || `local:${Date.now()}`,
        title: detail.title || 'MarketMet update',
        message: detail.message || 'There is a new update for you.',
        createdAt: detail.createdAt || new Date().toISOString(),
        type: detail.type || 'system',
        tone: detail.tone || 'slate',
        read: false,
        href: detail.href || null,
      }
      appendNotification(notification, { desktop: true })
    }

    window.addEventListener('marketmet:notify', handleAppNotification)
    return () => window.removeEventListener('marketmet:notify', handleAppNotification)
  }, [appendNotification])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const requestDesktopAlerts = async () => {
    if (!('Notification' in window)) {
      toast.error('Desktop notifications are not supported by this browser.')
      return
    }

    try {
      const permission = await Notification.requestPermission()
      const enabled = permission === 'granted'
      setDesktopAlertsEnabled(enabled)

      if (enabled) {
        toast.success('Desktop order alerts enabled')
        new Notification('MarketMet alerts enabled', {
          body: 'You will be alerted when an order is created or its status changes while MarketMet is open.',
          icon: '/favicon.ico',
          tag: 'marketmet-alerts-enabled',
        })
      } else {
        toast.warning('Desktop notification permission was not enabled.')
      }
    } catch (error) {
      console.error('Notification permission failed:', error)
      toast.error('Could not enable desktop notifications.')
    }
  }

  const markAllRead = () => {
    setNotifications((current) => current.map((item) => ({ ...item, read: true })))
  }

  const markRead = (id) => {
    setNotifications((current) => current.map((item) => (
      item.id === id ? { ...item, read: true } : item
    )))
  }

  const dismiss = (id) => {
    setNotifications((current) => current.filter((item) => item.id !== id))
  }

  const openNotification = (notification) => {
    markRead(notification.id)
    if (notification.href) {
      setIsOpen(false)
      navigate(notification.href)
    }
  }

  const filteredNotifications = useMemo(() => notifications.filter((item) => {
    if (filter === 'unread') return !item.read
    if (filter === 'orders') return item.type === 'order'
    return true
  }), [filter, notifications])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen((value) => !value)
          if (!isOpen) syncOrders()
        }}
        className="relative p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors"
        aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        aria-expanded={isOpen}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#108910] text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white dark:ring-gray-900">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-[min(92vw,420px)] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 z-[70] overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm text-gray-950 dark:text-white">Notifications</h3>
                <span className={`w-2 h-2 rounded-full ${syncError ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {syncError
                  ? 'Reconnecting to live updates…'
                  : lastSyncAt
                    ? `Live · updated ${relativeTime(lastSyncAt)}`
                    : 'Connecting to live updates…'}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => syncOrders({ silent: false })}
                className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Refresh notifications"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="p-2 rounded-full text-gray-500 hover:text-[#108910] hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                  aria-label="Mark all notifications as read"
                  title="Mark all read"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Close notifications"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!desktopAlertsEnabled && (
            <div className="px-4 py-3 bg-emerald-50/80 dark:bg-emerald-950/30 border-b border-emerald-100 dark:border-emerald-900/50 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-900 dark:text-white">Desktop order alerts</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Get an alert when MarketMet is open in another tab.</p>
              </div>
              <button
                onClick={requestDesktopAlerts}
                className="flex-shrink-0 bg-[#108910] hover:bg-[#087608] text-white font-extrabold px-3 py-1.5 rounded-full text-[10px] transition-colors"
              >
                Enable
              </button>
            </div>
          )}

          <div className="flex items-center gap-1.5 p-2.5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900">
            {[
              ['all', `All ${notifications.length}`],
              ['unread', `Unread ${unreadCount}`],
              ['orders', 'Orders'],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`px-3 py-1.5 rounded-full font-extrabold text-[11px] transition-colors ${
                  filter === value
                    ? 'bg-[#108910] text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => {
                const statusInfo = statusCopy[notification.status]
                const Icon = statusInfo?.icon || (notification.type === 'order' ? ShoppingBag : Clock3)

                return (
                  <div
                    key={notification.id}
                    className={`group relative flex items-start gap-3 p-4 transition-colors ${
                      notification.read
                        ? 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                        : 'bg-emerald-50/55 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                    }`}
                  >
                    <button
                      onClick={() => openNotification(notification)}
                      className="absolute inset-0 w-full h-full cursor-pointer"
                      aria-label={`Open notification: ${notification.title}`}
                    />

                    <div className={`relative z-10 w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${toneClasses[notification.tone] || toneClasses.slate}`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="relative z-10 flex-1 min-w-0 pointer-events-none">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-extrabold text-xs text-gray-950 dark:text-white leading-snug">
                          {notification.title}
                        </h4>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap pt-0.5">
                          {relativeTime(notification.createdAt)}
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400 font-medium leading-relaxed mt-1 pr-5">
                        {notification.message}
                      </p>
                      {notification.href && (
                        <span className="inline-block mt-2 text-[10px] font-black text-[#108910]">
                          View details →
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(event) => {
                        event.stopPropagation()
                        dismiss(notification.id)
                      }}
                      className="relative z-20 opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded-full text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                      aria-label="Dismiss notification"
                      title="Dismiss"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    {!notification.read && (
                      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#108910]" />
                    )}
                  </div>
                )
              })
            ) : (
              <div className="px-6 py-12 text-center">
                <div className="w-11 h-11 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-sm font-extrabold text-gray-900 dark:text-white">
                  {filter === 'unread' ? 'You are all caught up' : 'No notifications yet'}
                </p>
                <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                  Order confirmations and delivery status changes will appear here automatically.
                </p>
              </div>
            )}
          </div>

          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900 flex items-center justify-between">
            <span className="text-[10px] text-gray-500">
              Checks for updates every 30 seconds
            </span>
            {isAuthenticated && (
              <button
                onClick={() => {
                  setIsOpen(false)
                  navigate(isAdmin ? '/admin/orders' : '/account')
                }}
                className="text-[11px] font-black text-[#108910] hover:underline"
              >
                {isAdmin ? 'Open order management' : 'View my orders'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationCenter
