import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  CheckCheck,
  CircleCheck,
  Clock3,
  CreditCard,
  PackageCheck,
  RefreshCw,
  ShoppingBag,
  Truck,
  X,
  XCircle,
} from 'lucide-react'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'
import { isBackendConnectionIssue, notificationAPI, ordersAPI } from '../services/api'

const POLL_INTERVAL_MS = 30000
const MAX_NOTIFICATIONS = 60

const statusMeta = {
  PENDING: { icon: ShoppingBag, tone: 'emerald' },
  CONFIRMED: { icon: CircleCheck, tone: 'emerald' },
  PICKING: { icon: ShoppingBag, tone: 'amber' },
  PROCESSING: { icon: ShoppingBag, tone: 'amber' },
  PACKED: { icon: PackageCheck, tone: 'amber' },
  OUT_FOR_DELIVERY: { icon: Truck, tone: 'blue' },
  SHIPPED: { icon: Truck, tone: 'blue' },
  DELIVERED: { icon: CircleCheck, tone: 'emerald' },
  CANCELLED: { icon: XCircle, tone: 'red' },
}

const toneClasses = {
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300',
  red: 'bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300',
  slate: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
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

const normalizeServerNotification = (item) => ({
  id: `server:${item.id}`,
  serverId: item.id,
  orderId: item.order_id || null,
  title: item.title || 'MarketMet update',
  message: item.message || 'There is a new update for you.',
  createdAt: item.created_at || new Date().toISOString(),
  type: String(item.type || 'ORDER').toLowerCase(),
  status: null,
  tone: String(item.title || '').toLowerCase().includes('cancel') ? 'red' : String(item.title || '').toLowerCase().includes('delivery') ? 'blue' : 'emerald',
  read: Boolean(item.read),
  href: item.order_id ? '/account' : null,
})

const adminOrderNotification = (order, read = false) => {
  const status = String(order.status || 'PENDING').toUpperCase()
  const number = order.order_number ?? order.orderNumber ?? order.id
  const customer = order.customer_name || order.customerName || 'Customer'
  const total = Number(order.total ?? (Number(order.subtotal || 0) + Number(order.delivery_fee || 0)))
  const meta = statusMeta[status] || statusMeta.PENDING
  return {
    id: `admin-order:${order.id}:${status}`,
    orderId: order.id,
    orderNumber: number,
    title: status === 'PENDING' ? `New order · #${number}` : `Order update · #${number}`,
    message: status === 'PENDING'
      ? `${customer} placed an order${total ? ` worth ${total.toLocaleString()} RWF` : ''}. Review payment and fulfilment.`
      : `${customer}'s order is now ${status.replaceAll('_', ' ').toLowerCase()}.`,
    createdAt: order.created_at || order.createdAt || new Date().toISOString(),
    type: 'order',
    status,
    tone: meta.tone,
    read,
    href: '/admin/orders',
  }
}

const NotificationCenter = ({ onOpenPaymentModal }) => {
  const toast = useToast()
  const navigate = useNavigate()
  const { isAuthenticated, isAdmin, user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState('all')
  const [refreshing, setRefreshing] = useState(false)
  const [syncError, setSyncError] = useState(false)
  const [lastSyncAt, setLastSyncAt] = useState(null)
  const [desktopAlertsEnabled, setDesktopAlertsEnabled] = useState(false)
  const dropdownRef = useRef(null)
  const knownAdminStates = useRef(new Map())
  const firstAdminSync = useRef(true)

  const localStorageKey = `marketmet_admin_notifications_${user?.id || 'guest'}`
  const unreadCount = notifications.filter((item) => !item.read).length

  const showDesktopAlert = useCallback((notification) => {
    if (!('Notification' in window) || Notification.permission !== 'granted' || !document.hidden) return
    try {
      const alert = new Notification(notification.title, {
        body: notification.message,
        icon: '/marketmet-icon.svg',
        tag: notification.id,
      })
      alert.onclick = () => {
        window.focus()
        if (notification.href) navigate(notification.href)
        alert.close()
      }
    } catch (error) {
      console.error('Desktop notification failed:', error)
    }
  }, [navigate])

  const appendLocal = useCallback((notification, { desktop = false } = {}) => {
    if (!notification?.id) return
    setNotifications((current) => {
      if (current.some((item) => item.id === notification.id)) return current
      return [notification, ...current].slice(0, MAX_NOTIFICATIONS)
    })
    if (desktop) showDesktopAlert(notification)
  }, [showDesktopAlert])

  const loadCustomerNotifications = useCallback(async ({ silent = true } = {}) => {
    if (!isAuthenticated || isAdmin) return
    if (!silent) setRefreshing(true)
    try {
      const response = await notificationAPI.getAll()
      const rows = Array.isArray(response.data) ? response.data : []
      setNotifications(rows.map(normalizeServerNotification).slice(0, MAX_NOTIFICATIONS))
      setLastSyncAt(new Date())
      setSyncError(false)
    } catch (error) {
      if (!isBackendConnectionIssue(error)) console.error('Persistent notification sync failed:', error)
      setSyncError(true)
    } finally {
      if (!silent) setRefreshing(false)
    }
  }, [isAdmin, isAuthenticated])

  const loadAdminNotifications = useCallback(async ({ silent = true } = {}) => {
    if (!isAuthenticated || !isAdmin) return
    if (!silent) setRefreshing(true)
    try {
      const response = await ordersAPI.getAllOrders()
      const orders = Array.isArray(response.data) ? response.data : []
      const previous = knownAdminStates.current

      if (firstAdminSync.current) {
        let saved = []
        try {
          const parsed = JSON.parse(localStorage.getItem(localStorageKey) || '[]')
          saved = Array.isArray(parsed) ? parsed : []
        } catch { saved = [] }
        const existingIds = new Set(saved.map((item) => item.id))
        const seeded = orders.slice(0, 12).map((order) => adminOrderNotification(order, true)).filter((item) => !existingIds.has(item.id))
        setNotifications([...seeded, ...saved].slice(0, MAX_NOTIFICATIONS))
        firstAdminSync.current = false
      } else {
        orders.forEach((order) => {
          const status = String(order.status || 'PENDING').toUpperCase()
          const oldStatus = previous.get(String(order.id))
          if (!oldStatus || oldStatus !== status) appendLocal(adminOrderNotification(order, false), { desktop: true })
        })
      }

      knownAdminStates.current = new Map(orders.map((order) => [String(order.id), String(order.status || 'PENDING').toUpperCase()]))
      setLastSyncAt(new Date())
      setSyncError(false)
    } catch (error) {
      if (!isBackendConnectionIssue(error)) console.error('Admin notification sync failed:', error)
      setSyncError(true)
    } finally {
      if (!silent) setRefreshing(false)
    }
  }, [appendLocal, isAdmin, isAuthenticated, localStorageKey])

  const sync = useCallback((options) => {
    if (!isAuthenticated) return Promise.resolve()
    return isAdmin ? loadAdminNotifications(options) : loadCustomerNotifications(options)
  }, [isAdmin, isAuthenticated, loadAdminNotifications, loadCustomerNotifications])

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([])
      return
    }
    firstAdminSync.current = true
    knownAdminStates.current = new Map()
    sync()
    const timer = window.setInterval(() => sync(), POLL_INTERVAL_MS)
    const onVisible = () => { if (document.visibilityState === 'visible') sync() }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [isAuthenticated, isAdmin, sync])

  useEffect(() => {
    if (!isAdmin || !isAuthenticated) return
    try { localStorage.setItem(localStorageKey, JSON.stringify(notifications.slice(0, MAX_NOTIFICATIONS))) } catch { /* ignore */ }
  }, [isAdmin, isAuthenticated, localStorageKey, notifications])

  useEffect(() => {
    const onAppNotification = (event) => {
      const detail = event.detail || {}
      if (!detail.title && !detail.message) return
      appendLocal({
        id: detail.id || `local:${Date.now()}`,
        title: detail.title || 'MarketMet update',
        message: detail.message || 'There is a new update for you.',
        createdAt: detail.createdAt || new Date().toISOString(),
        type: detail.type || 'system',
        tone: detail.tone || 'slate',
        read: false,
        href: detail.href || null,
      }, { desktop: true })
    }
    window.addEventListener('marketmet:notify', onAppNotification)
    return () => window.removeEventListener('marketmet:notify', onAppNotification)
  }, [appendLocal])

  useEffect(() => {
    if ('Notification' in window) setDesktopAlertsEnabled(Notification.permission === 'granted')
    const clickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false)
    }
    document.addEventListener('mousedown', clickOutside)
    return () => document.removeEventListener('mousedown', clickOutside)
  }, [])

  const requestDesktopAlerts = async () => {
    if (!('Notification' in window)) return toast.warning('Desktop notifications are not supported by this browser.')
    try {
      const permission = await Notification.requestPermission()
      const enabled = permission === 'granted'
      setDesktopAlertsEnabled(enabled)
      enabled ? toast.success('Desktop alerts enabled') : toast.warning('Notification permission was not enabled')
    } catch {
      toast.error('Could not enable desktop notifications')
    }
  }

  const markRead = async (item) => {
    setNotifications((current) => current.map((notification) => notification.id === item.id ? { ...notification, read: true } : notification))
    if (!isAdmin && item.serverId) {
      try { await notificationAPI.markRead(item.serverId) } catch (error) { console.error('Failed to mark notification read:', error) }
    }
  }

  const markAllRead = async () => {
    setNotifications((current) => current.map((item) => ({ ...item, read: true })))
    if (!isAdmin) {
      try { await notificationAPI.markAllRead() } catch (error) { console.error('Failed to mark all notifications read:', error) }
    }
  }

  const dismiss = (item) => {
    if (!isAdmin && item.serverId) {
      markRead(item)
      return
    }
    setNotifications((current) => current.filter((notification) => notification.id !== item.id))
  }

  const openNotification = async (item) => {
    await markRead(item)
    if (item.href) {
      setIsOpen(false)
      navigate(item.href)
    }
  }

  const filtered = useMemo(() => notifications.filter((item) => {
    if (filter === 'unread') return !item.read
    if (filter === 'orders') return item.type === 'order'
    return true
  }), [filter, notifications])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => { setIsOpen((value) => !value); if (!isOpen) sync() }}
        className="relative rounded-full p-2.5 text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
        aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        aria-expanded={isOpen}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#108910] px-1 text-[10px] font-black text-white ring-2 ring-white dark:ring-gray-900">{unreadCount > 99 ? '99+' : unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-[70] mt-3 w-[min(92vw,420px)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#090909]">
          <div className="flex items-center justify-between gap-3 border-b border-gray-200 p-4 dark:border-white/10">
            <div><div className="flex items-center gap-2"><h3 className="text-sm font-black">Notifications</h3><span className={`h-2 w-2 rounded-full ${syncError ? 'bg-amber-500' : 'bg-emerald-500'}`} /></div><p className="mt-0.5 text-[11px] text-gray-500">{syncError ? 'Reconnecting…' : lastSyncAt ? `${isAdmin ? 'Live order feed' : 'Synced inbox'} · ${relativeTime(lastSyncAt)}` : 'Connecting…'}</p></div>
            <div className="flex items-center gap-1"><button onClick={() => sync({ silent: false })} className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/[0.06]" title="Refresh"><RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /></button>{unreadCount > 0 && <button onClick={markAllRead} className="rounded-full p-2 text-gray-500 hover:bg-emerald-50 hover:text-[#108910] dark:hover:bg-emerald-950/40" title="Mark all read"><CheckCheck className="h-4 w-4" /></button>}<button onClick={() => setIsOpen(false)} className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/[0.06]"><X className="h-4 w-4" /></button></div>
          </div>

          <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-3 py-2.5 dark:border-white/[0.07]">
            <div className="flex gap-1">{[['all','All'],['unread','Unread'],['orders','Orders']].map(([value,label]) => <button key={value} onClick={() => setFilter(value)} className={`rounded-full px-2.5 py-1 text-[10px] font-black ${filter === value ? 'bg-gray-950 text-white dark:bg-white dark:text-black' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/[0.06]'}`}>{label}</button>)}</div>
            {!desktopAlertsEnabled && <button onClick={requestDesktopAlerts} className="text-[10px] font-black text-[#108910]">Enable desktop alerts</button>}
          </div>

          <div className="max-h-[430px] overflow-y-auto">
            {filtered.length ? filtered.map((item) => {
              const meta = statusMeta[item.status] || { icon: item.type === 'payment' ? CreditCard : Clock3, tone: item.tone || 'slate' }
              const Icon = meta.icon
              return <div key={item.id} className={`group flex gap-3 border-b border-gray-100 p-3.5 transition dark:border-white/[0.07] ${item.read ? 'bg-white dark:bg-[#090909]' : 'bg-emerald-50/50 dark:bg-emerald-950/10'}`}>
                <button onClick={() => openNotification(item)} className="flex min-w-0 flex-1 gap-3 text-left">
                  <span className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl ${toneClasses[meta.tone] || toneClasses.slate}`}><Icon className="h-4 w-4" /></span>
                  <span className="min-w-0 flex-1"><span className="flex items-start justify-between gap-3"><strong className="text-xs font-black text-gray-900 dark:text-white">{item.title}</strong><small className="whitespace-nowrap text-[9px] font-bold text-gray-400">{relativeTime(item.createdAt)}</small></span><span className="mt-1 block text-[11px] leading-5 text-gray-500 dark:text-gray-400">{item.message}</span></span>
                </button>
                <button onClick={() => dismiss(item)} className="h-7 w-7 flex-shrink-0 rounded-lg text-gray-300 opacity-0 transition hover:bg-gray-100 hover:text-gray-600 group-hover:opacity-100 dark:hover:bg-white/[0.06]" title={isAdmin ? 'Dismiss' : 'Mark read'}><X className="mx-auto h-3.5 w-3.5" /></button>
              </div>
            }) : <div className="px-6 py-12 text-center"><Bell className="mx-auto h-7 w-7 text-gray-300" /><p className="mt-3 text-xs font-black">No notifications here</p><p className="mt-1 text-[11px] text-gray-500">New order and payment updates will appear automatically.</p></div>}
          </div>

          {!isAdmin && onOpenPaymentModal && <div className="border-t border-gray-100 p-3 dark:border-white/[0.07]"><button onClick={() => { setIsOpen(false); onOpenPaymentModal() }} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#108910]/10 py-2.5 text-[11px] font-black text-[#108910]"><CreditCard className="h-4 w-4" /> Payment help</button></div>}
        </div>
      )}
    </div>
  )
}

export default NotificationCenter
