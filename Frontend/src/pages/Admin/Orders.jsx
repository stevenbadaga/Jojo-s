import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  Banknote,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  CreditCard,
  MapPin,
  MessageCircle,
  PackageCheck,
  RefreshCw,
  Search,
  ShoppingBag,
  Truck,
  UserRound,
  WalletCards,
  X,
} from 'lucide-react'
import AdminSidebar from '../../components/AdminSidebar'
import { ordersAPI } from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { getImageUrl } from '../../utils/imageUtils'

const STAGES = [
  { value: 'PENDING', label: 'Pending', helper: 'Order received', icon: Clock3 },
  { value: 'CONFIRMED', label: 'Confirmed', helper: 'Accepted by store', icon: Check },
  { value: 'PICKING', label: 'Picking', helper: 'Selecting items', icon: ShoppingBag },
  { value: 'PACKED', label: 'Packed', helper: 'Ready to dispatch', icon: PackageCheck },
  { value: 'OUT_FOR_DELIVERY', label: 'Out for delivery', helper: 'With delivery team', icon: Truck },
  { value: 'DELIVERED', label: 'Delivered', helper: 'Order complete', icon: CheckCircle2 },
]

const PAYMENT_STATUSES = [
  ['AWAITING_PAYMENT', 'Awaiting payment'],
  ['PAID', 'Paid'],
  ['UNPAID', 'Unpaid'],
  ['FAILED', 'Failed'],
  ['REFUNDED', 'Refunded'],
]

const money = (value) => `${new Intl.NumberFormat('en-RW').format(Number(value) || 0)} RWF`
const fmt = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('en-RW', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

const statusLabel = (status) => STAGES.find((stage) => stage.value === status)?.label || String(status || 'Pending').replaceAll('_', ' ')

const statusTone = (status) => {
  if (status === 'DELIVERED') return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
  if (status === 'CANCELLED') return 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20'
  if (status === 'OUT_FOR_DELIVERY') return 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20'
  if (status === 'PACKED' || status === 'PICKING') return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
  return 'bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/15'
}

const paymentTone = (status) => {
  if (status === 'PAID') return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
  if (status === 'FAILED' || status === 'REFUNDED') return 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20'
  return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
}

const Orders = () => {
  const toast = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('OPEN')
  const [paymentFilter, setPaymentFilter] = useState('ALL')
  const [selected, setSelected] = useState(null)
  const [working, setWorking] = useState(false)
  const [paymentForm, setPaymentForm] = useState({
    paymentStatus: 'AWAITING_PAYMENT',
    paymentMethod: 'MTN_MOMO',
    paymentReference: '',
    paymentNotes: '',
  })

  useEffect(() => { loadOrders() }, [])

  const loadOrders = async ({ silent = false } = {}) => {
    silent ? setRefreshing(true) : setLoading(true)
    try {
      const response = await ordersAPI.getAllOrders()
      const rows = Array.isArray(response.data) ? response.data : []
      setOrders(rows)
      setSelected((current) => current ? rows.find((order) => order.id === current.id) || current : current)
    } catch (error) {
      console.error('Failed to load orders:', error)
      toast.error(error.response?.data?.error || 'Could not load orders')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const metrics = useMemo(() => {
    const open = orders.filter((order) => !['DELIVERED', 'CANCELLED'].includes(order.status)).length
    const awaiting = orders.filter((order) => !['DELIVERED', 'CANCELLED'].includes(order.status) && order.payment_status !== 'PAID').length
    const paid = orders.filter((order) => order.payment_status === 'PAID' && order.status !== 'CANCELLED')
    return {
      open,
      awaiting,
      paidRevenue: paid.reduce((sum, order) => sum + (Number(order.total) || Number(order.subtotal) + Number(order.delivery_fee || 0)), 0),
      delivered: orders.filter((order) => order.status === 'DELIVERED').length,
    }
  }, [orders])

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return orders.filter((order) => {
      if (statusFilter === 'OPEN' && ['DELIVERED', 'CANCELLED'].includes(order.status)) return false
      if (statusFilter !== 'ALL' && statusFilter !== 'OPEN' && order.status !== statusFilter) return false
      if (paymentFilter !== 'ALL' && order.payment_status !== paymentFilter) return false
      if (!normalized) return true
      return [order.order_number, order.customer_name, order.customer_phone, order.delivery_location]
        .filter((value) => value !== null && value !== undefined)
        .some((value) => String(value).toLowerCase().includes(normalized))
    })
  }, [orders, query, statusFilter, paymentFilter])

  const openOrder = (order) => {
    setSelected(order)
    setPaymentForm({
      paymentStatus: order.payment_status || 'AWAITING_PAYMENT',
      paymentMethod: order.payment_method || 'MTN_MOMO',
      paymentReference: order.payment_reference || '',
      paymentNotes: order.payment_notes || '',
    })
  }

  const updateSelectedFromResponse = (data) => {
    const updated = data?.order || data
    if (!updated?.id) return
    setOrders((current) => current.map((order) => order.id === updated.id ? updated : order))
    setSelected(updated)
  }

  const updateStatus = async (status) => {
    if (!selected || working) return
    setWorking(true)
    try {
      const response = await ordersAPI.updateOrderStatus(selected.id, status, selected.tracking_number || undefined)
      updateSelectedFromResponse(response.data)
      toast.success(`Order #${selected.order_number || selected.id} moved to ${statusLabel(status)}`)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Could not update order status')
    } finally {
      setWorking(false)
    }
  }

  const savePayment = async (event) => {
    event.preventDefault()
    if (!selected || working) return
    setWorking(true)
    try {
      const response = await ordersAPI.updatePayment(selected.id, paymentForm)
      updateSelectedFromResponse(response.data)
      toast.success(`Payment status updated for order #${selected.order_number || selected.id}`)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Could not update payment')
    } finally {
      setWorking(false)
    }
  }

  const currentStageIndex = selected ? STAGES.findIndex((stage) => stage.value === selected.status) : -1
  const nextStage = selected && currentStageIndex >= 0 && currentStageIndex < STAGES.length - 1 ? STAGES[currentStageIndex + 1] : null
  const canCancel = selected && !['CANCELLED', 'DELIVERED'].includes(selected.status)

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F5F6F7] dark:bg-black">
        <AdminSidebar />
        <main className="flex-1 px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-[1600px] animate-pulse space-y-5"><div className="h-20 rounded-2xl bg-gray-200 dark:bg-[#080808]" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1,2,3,4].map((i) => <div key={i} className="h-32 rounded-2xl bg-gray-200 dark:bg-[#080808]" />)}</div><div className="h-[520px] rounded-2xl bg-gray-200 dark:bg-[#080808]" /></div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#F5F6F7] text-gray-950 dark:bg-black dark:text-white">
      <AdminSidebar />
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-[1600px] px-4 pb-12 pt-20 sm:px-6 lg:px-8 lg:py-7">
          <header className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div><p className="text-sm font-medium text-gray-500">Fulfilment operations</p><h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Orders & payments</h1><p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Confirm payment, move orders through fulfilment and keep customer delivery details in one clear operational workflow.</p></div>
            <button onClick={() => loadOrders({ silent: true })} disabled={refreshing} className="inline-flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-black text-gray-700 shadow-sm transition hover:border-gray-300 disabled:opacity-60 dark:border-white/10 dark:bg-[#080808] dark:text-gray-300"><RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh</button>
          </header>

          <section className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
            {[
              ['Open orders', metrics.open, ShoppingBag, 'Require fulfilment'],
              ['Awaiting payment', metrics.awaiting, WalletCards, 'Open payment actions'],
              ['Confirmed revenue', money(metrics.paidRevenue), CircleDollarSign, 'Paid, non-cancelled'],
              ['Delivered', metrics.delivered, CheckCircle2, 'Completed orders'],
            ].map(([label, value, Icon, helper]) => <div key={label} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-[0_8px_24px_rgba(16,24,40,0.04)] dark:border-white/10 dark:bg-[#080808] dark:shadow-none"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-[0.12em] text-gray-400">{label}</p><p className="mt-2 truncate text-xl font-black sm:text-2xl">{value}</p><p className="mt-1 text-[11px] text-gray-500">{helper}</p></div><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#108910]/10 text-[#108910]"><Icon className="h-4 w-4" /></span></div></div>)}
          </section>

          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_10px_30px_rgba(16,24,40,0.04)] dark:border-white/10 dark:bg-[#080808] dark:shadow-none">
            <div className="flex flex-col gap-3 border-b border-gray-100 p-4 dark:border-white/10 xl:flex-row xl:items-center xl:justify-between">
              <div className="relative w-full xl:max-w-md"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search order, customer, phone or location" className="w-full rounded-xl border border-gray-200 bg-[#F7F8F8] py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#108910] focus:ring-2 focus:ring-[#108910]/10 dark:border-white/10 dark:bg-[#0D0D0D]" /></div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-black outline-none dark:border-white/10 dark:bg-[#0D0D0D]"><option value="OPEN">Open orders</option><option value="ALL">All statuses</option>{STAGES.map((stage) => <option key={stage.value} value={stage.value}>{stage.label}</option>)}<option value="CANCELLED">Cancelled</option></select>
                <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-black outline-none dark:border-white/10 dark:bg-[#0D0D0D]"><option value="ALL">All payments</option>{PAYMENT_STATUSES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
              </div>
            </div>

            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1040px] text-left">
                <thead className="bg-[#F8F9F9] text-[10px] font-black uppercase tracking-[0.1em] text-gray-400 dark:bg-[#0D0D0D]"><tr><th className="px-5 py-3">Order</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Items</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3">Fulfilment</th><th className="px-5 py-3 text-right">Open</th></tr></thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/[0.07]">
                  {visible.map((order) => (
                    <tr key={order.id} onClick={() => openOrder(order)} className="cursor-pointer transition hover:bg-gray-50/70 dark:hover:bg-white/[0.025]">
                      <td className="px-5 py-4"><p className="text-sm font-black">#{order.order_number || order.id}</p><p className="mt-1 text-[10px] text-gray-500">{fmt(order.created_at)}</p></td>
                      <td className="px-4 py-4"><p className="max-w-[180px] truncate text-xs font-black">{order.customer_name || 'Guest customer'}</p><p className="mt-1 text-[10px] text-gray-500">{order.customer_phone}</p></td>
                      <td className="px-4 py-4"><div className="flex -space-x-2">{(order.items || []).slice(0, 3).map((item, index) => <img key={item.id || index} src={getImageUrl(item.product?.image)} alt="" className="h-9 w-9 rounded-full border-2 border-white object-cover dark:border-[#080808]" onError={(e) => { e.currentTarget.src = '/placeholder.png' }} />)}{(order.items || []).length > 3 && <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-gray-100 text-[10px] font-black dark:border-[#080808] dark:bg-white/[0.08]">+{order.items.length - 3}</span>}</div><p className="mt-1 text-[10px] text-gray-500">{(order.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0)} units</p></td>
                      <td className="px-4 py-4"><p className="text-sm font-black">{money(order.total)}</p><p className="mt-1 text-[10px] text-gray-500">incl. {money(order.delivery_fee)} delivery</p></td>
                      <td className="px-4 py-4"><span className={`inline-flex rounded-lg border px-2.5 py-1 text-[10px] font-black ${paymentTone(order.payment_status)}`}>{String(order.payment_status || 'UNPAID').replaceAll('_', ' ')}</span></td>
                      <td className="px-4 py-4"><span className={`inline-flex rounded-lg border px-2.5 py-1 text-[10px] font-black ${statusTone(order.status)}`}>{statusLabel(order.status)}</span></td>
                      <td className="px-5 py-4 text-right"><button onClick={(e) => { e.stopPropagation(); openOrder(order) }} className="inline-flex items-center gap-1 text-xs font-black text-[#108910]">Manage <ChevronRight className="h-4 w-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-white/[0.07] lg:hidden">
              {visible.map((order) => <button key={order.id} onClick={() => openOrder(order)} className="w-full p-4 text-left"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-black">Order #{order.order_number || order.id}</p><p className="mt-1 text-[11px] text-gray-500">{order.customer_name || 'Guest'} · {fmt(order.created_at)}</p></div><p className="text-sm font-black text-[#108910]">{money(order.total)}</p></div><div className="mt-3 flex flex-wrap gap-2"><span className={`rounded-lg border px-2 py-1 text-[9px] font-black ${statusTone(order.status)}`}>{statusLabel(order.status)}</span><span className={`rounded-lg border px-2 py-1 text-[9px] font-black ${paymentTone(order.payment_status)}`}>{String(order.payment_status || 'UNPAID').replaceAll('_', ' ')}</span></div></button>)}
            </div>

            {!visible.length && <div className="px-6 py-16 text-center"><ShoppingBag className="mx-auto h-8 w-8 text-gray-300" /><p className="mt-3 text-sm font-black">No orders match this view</p><p className="mt-1 text-xs text-gray-500">Change the filters or search terms.</p></div>}
          </section>
        </div>
      </main>

      {selected && (
        <div className="fixed inset-0 z-[90] flex justify-end bg-black/70 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && setSelected(null)}>
          <aside className="h-full w-full max-w-2xl overflow-y-auto border-l border-gray-200 bg-[#F7F8F8] shadow-2xl dark:border-white/10 dark:bg-black">
            <div className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 px-5 py-4 backdrop-blur dark:border-white/10 dark:bg-[#080808]/95">
              <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#108910]">Order operations</p><div className="mt-1 flex flex-wrap items-center gap-2"><h2 className="text-xl font-black sm:text-2xl">Order #{selected.order_number || selected.id}</h2><span className={`rounded-lg border px-2.5 py-1 text-[10px] font-black ${statusTone(selected.status)}`}>{statusLabel(selected.status)}</span></div><p className="mt-1 text-xs text-gray-500">Placed {fmt(selected.created_at)}</p></div><button onClick={() => setSelected(null)} className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl bg-gray-100 dark:bg-white/[0.06]"><X className="h-4 w-4" /></button></div>
            </div>

            <div className="space-y-4 p-4 sm:p-5">
              <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-[#080808]">
                <div className="mb-4 flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.12em] text-gray-400">Fulfilment timeline</p><p className="mt-1 text-sm font-black">Move the order through each operational stage</p></div>{working && <RefreshCw className="h-4 w-4 animate-spin text-[#108910]" />}</div>
                {selected.status === 'CANCELLED' ? <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-black text-red-600 dark:text-red-300">This order was cancelled. Reserved stock was returned to inventory.</div> : <div className="space-y-0">{STAGES.map((stage, index) => { const Icon = stage.icon; const reached = currentStageIndex >= index; const current = selected.status === stage.value; return <div key={stage.value} className="flex gap-3"><div className="flex flex-col items-center"><span className={`grid h-8 w-8 place-items-center rounded-full border ${reached ? 'border-[#108910] bg-[#108910] text-white' : 'border-gray-200 bg-white text-gray-300 dark:border-white/10 dark:bg-[#0D0D0D]'}`}><Icon className="h-3.5 w-3.5" /></span>{index < STAGES.length - 1 && <span className={`h-7 w-px ${currentStageIndex > index ? 'bg-[#108910]' : 'bg-gray-200 dark:bg-white/10'}`} />}</div><div className="pt-1"><p className={`text-xs font-black ${current ? 'text-[#108910]' : reached ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{stage.label}</p><p className="text-[10px] text-gray-500">{stage.helper}</p></div></div>})}</div>}
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">{nextStage && <button disabled={working} onClick={() => updateStatus(nextStage.value)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#108910] px-4 py-3 text-xs font-black text-white disabled:opacity-60">Move to {nextStage.label} <ChevronRight className="h-4 w-4" /></button>}{canCancel && <button disabled={working} onClick={() => updateStatus('CANCELLED')} className="rounded-xl border border-red-500/20 px-4 py-3 text-xs font-black text-red-600 transition hover:bg-red-500/10 dark:text-red-300">Cancel order</button>}</div>
              </section>

              <section className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-[#080808]"><div className="flex items-center gap-2 text-[#108910]"><UserRound className="h-4 w-4" /><p className="text-[10px] font-black uppercase tracking-[0.12em]">Customer</p></div><p className="mt-3 text-sm font-black">{selected.customer_name || 'Guest customer'}</p><p className="mt-1 text-xs text-gray-500">{selected.customer_phone}</p><a href={`https://wa.me/${String(selected.customer_phone || '').replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#108910]/10 px-3 py-2 text-[11px] font-black text-[#108910]"><MessageCircle className="h-4 w-4" /> WhatsApp customer</a></div>
                <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-[#080808]"><div className="flex items-center gap-2 text-[#108910]"><MapPin className="h-4 w-4" /><p className="text-[10px] font-black uppercase tracking-[0.12em]">Delivery</p></div><p className="mt-3 text-sm font-black capitalize">{String(selected.delivery_option || 'delivery').replaceAll('_', ' ')}</p><p className="mt-1 text-xs leading-5 text-gray-500">{selected.delivery_location || 'Store pickup'}</p>{selected.tracking_number && <p className="mt-3 font-mono text-[10px] text-gray-400">Tracking: {selected.tracking_number}</p>}</div>
              </section>

              <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-[#080808]">
                <div className="mb-3 flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.12em] text-gray-400">Order items</p><p className="mt-1 text-sm font-black">{(selected.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0)} units across {(selected.items || []).length} products</p></div><ShoppingBag className="h-4 w-4 text-[#108910]" /></div>
                <div className="divide-y divide-gray-100 dark:divide-white/[0.07]">{(selected.items || []).map((item, index) => <div key={item.id || index} className="flex items-center gap-3 py-3"><img src={getImageUrl(item.product?.image)} alt="" className="h-14 w-14 rounded-xl object-cover" onError={(e) => { e.currentTarget.src = '/placeholder.png' }} /><div className="min-w-0 flex-1"><p className="truncate text-xs font-black">{item.product?.name || `Product #${item.productId}`}</p><p className="mt-1 text-[10px] text-gray-500">{item.quantity} × {money(item.unitPrice)}</p></div><p className="text-xs font-black">{money(item.lineTotal || item.quantity * item.unitPrice)}</p></div>)}</div>
                <div className="mt-3 space-y-2 border-t border-gray-100 pt-3 text-xs dark:border-white/[0.07]"><div className="flex justify-between text-gray-500"><span>Subtotal</span><span className="font-bold text-gray-800 dark:text-gray-200">{money(selected.subtotal)}</span></div><div className="flex justify-between text-gray-500"><span>Delivery</span><span className="font-bold text-gray-800 dark:text-gray-200">{money(selected.delivery_fee)}</span></div><div className="flex justify-between border-t border-gray-100 pt-2 text-sm font-black dark:border-white/[0.07]"><span>Total</span><span className="text-[#108910]">{money(selected.total)}</span></div></div>
              </section>

              <form onSubmit={savePayment} className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-[#080808]">
                <div className="mb-4 flex items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-[#108910]"><CreditCard className="h-4 w-4" /><p className="text-[10px] font-black uppercase tracking-[0.12em]">Payment control</p></div><p className="mt-2 text-sm font-black">Record the verified payment state</p></div><span className={`rounded-lg border px-2.5 py-1 text-[10px] font-black ${paymentTone(selected.payment_status)}`}>{String(selected.payment_status || 'UNPAID').replaceAll('_', ' ')}</span></div>
                <div className="grid gap-3 sm:grid-cols-2"><label><span className="mb-1.5 block text-[11px] font-bold text-gray-500">Status</span><select value={paymentForm.paymentStatus} onChange={(e) => setPaymentForm({ ...paymentForm, paymentStatus: e.target.value })} className="input-field">{PAYMENT_STATUSES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label><span className="mb-1.5 block text-[11px] font-bold text-gray-500">Method</span><select value={paymentForm.paymentMethod} onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })} className="input-field"><option value="MTN_MOMO">MTN MoMo</option><option value="AIRTEL_MONEY">Airtel Money</option><option value="CASH">Cash</option><option value="BANK_TRANSFER">Bank transfer</option><option value="CARD">Card</option></select></label><label className="sm:col-span-2"><span className="mb-1.5 block text-[11px] font-bold text-gray-500">Transaction reference</span><input value={paymentForm.paymentReference} onChange={(e) => setPaymentForm({ ...paymentForm, paymentReference: e.target.value })} className="input-field font-mono" placeholder="e.g. MOMO-482913" /></label><label className="sm:col-span-2"><span className="mb-1.5 block text-[11px] font-bold text-gray-500">Internal payment note</span><textarea rows="2" value={paymentForm.paymentNotes} onChange={(e) => setPaymentForm({ ...paymentForm, paymentNotes: e.target.value })} className="input-field min-h-20 resize-y" placeholder="Optional confirmation note" /></label></div>
                {selected.paid_at && <p className="mt-3 text-[10px] font-bold text-gray-500">Paid at {fmt(selected.paid_at)}</p>}
                <button disabled={working} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-950 py-3 text-xs font-black text-white disabled:opacity-60 dark:bg-white dark:text-black"><Banknote className="h-4 w-4" /> Save payment record</button>
              </form>

              <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-[#080808]"><p className="text-[10px] font-black uppercase tracking-[0.12em] text-gray-400">Operational timestamps</p><div className="mt-3 grid grid-cols-2 gap-3 text-[11px]">{[['Confirmed', selected.confirmed_at], ['Picking', selected.picking_at], ['Packed', selected.packed_at], ['Out for delivery', selected.out_for_delivery_at], ['Delivered', selected.delivered_at], ['Cancelled', selected.cancelled_at]].map(([label, value]) => <div key={label}><p className="font-bold text-gray-500">{label}</p><p className="mt-1 font-black">{fmt(value)}</p></div>)}</div></section>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}

export default Orders
