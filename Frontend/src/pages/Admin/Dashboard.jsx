import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  CircleDollarSign,
  Package,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Users,
  WalletCards,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { statsAPI } from '../../services/api'
import AdminSidebar from '../../components/AdminSidebar'
import { getImageUrl } from '../../utils/imageUtils'

const money = (value) => `${new Intl.NumberFormat('en-RW').format(Number(value) || 0)} RWF`
const number = (value) => new Intl.NumberFormat('en-RW').format(Number(value) || 0)
const compactMoney = (value) => new Intl.NumberFormat('en-RW', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(value) || 0)

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { loadStats() }, [])

  const loadStats = async ({ silent = false } = {}) => {
    silent ? setRefreshing(true) : setLoading(true)
    try {
      setError('')
      const response = await statsAPI.getBusinessStats()
      setStats(response.data || {})
    } catch (err) {
      console.error('Failed to load dashboard:', err)
      setError(err.response?.data?.error || 'Dashboard data could not be loaded')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const safe = stats || {}
  const monthlyEntries = useMemo(() => Object.entries(safe.revenueByMonth || {}).map(([label, value]) => ({ label, value: Number(value) || 0 })), [safe.revenueByMonth])
  const maxMonth = Math.max(1, ...monthlyEntries.map((entry) => entry.value))
  const statusEntries = Object.entries(safe.ordersByStatus || {})
  const totalStatusOrders = Math.max(1, statusEntries.reduce((sum, [, value]) => sum + Number(value || 0), 0))

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F5F6F7] dark:bg-black">
        <AdminSidebar />
        <main className="flex-1 px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:py-8"><div className="mx-auto max-w-[1600px] animate-pulse space-y-5"><div className="h-20 rounded-2xl bg-gray-200 dark:bg-[#080808]" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1,2,3,4].map((i) => <div key={i} className="h-36 rounded-2xl bg-gray-200 dark:bg-[#080808]" />)}</div><div className="grid gap-5 xl:grid-cols-12"><div className="h-[410px] rounded-2xl bg-gray-200 dark:bg-[#080808] xl:col-span-8" /><div className="h-[410px] rounded-2xl bg-gray-200 dark:bg-[#080808] xl:col-span-4" /></div></div></main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#F5F6F7] text-gray-950 dark:bg-black dark:text-white">
      <AdminSidebar />
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-[1600px] px-4 pb-12 pt-20 sm:px-6 lg:px-8 lg:py-7">
          <header className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div><p className="text-sm font-medium text-gray-500">MarketMet operations</p><h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Business command center</h1><p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Live sales, fulfilment, inventory and customer signals in one decision-ready view.</p></div>
            <div className="flex gap-2"><button onClick={() => loadStats({ silent: true })} disabled={refreshing} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-black text-gray-700 shadow-sm disabled:opacity-60 dark:border-white/10 dark:bg-[#080808] dark:text-gray-300"><RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh</button><Link to="/admin/orders" className="inline-flex items-center gap-2 rounded-xl bg-[#108910] px-4 py-2.5 text-xs font-black text-white">Open orders <ArrowRight className="h-4 w-4" /></Link></div>
          </header>

          {error && <div className="mb-5 flex items-center justify-between gap-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300"><span>{error}</span><button onClick={() => loadStats({ silent: true })} className="font-black underline">Retry</button></div>}

          <section className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
            {[
              ['Confirmed revenue', money(safe.totalRevenue), CircleDollarSign, `${money(safe.todayRevenue)} today`, '/admin/analytics'],
              ['Open orders', number(safe.pendingOrders), ShoppingBag, `${number(safe.totalOrders)} total orders`, '/admin/orders'],
              ['Inventory value', money(safe.inventoryValue), Boxes, `${number(safe.inventoryUnits)} units on hand`, '/admin/products'],
              ['Customers', number(safe.totalCustomers), Users, `${number(safe.repeatCustomers)} repeat customers`, '/admin/customers'],
            ].map(([label, value, Icon, helper, link]) => <Link key={label} to={link} className="group rounded-2xl border border-gray-200 bg-white p-4 shadow-[0_8px_24px_rgba(16,24,40,0.04)] transition hover:-translate-y-0.5 hover:border-gray-300 dark:border-white/10 dark:bg-[#080808] dark:shadow-none dark:hover:border-white/20"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-[0.12em] text-gray-400">{label}</p><p className="mt-2 truncate text-xl font-black sm:text-2xl">{value}</p><p className="mt-1 text-[11px] text-gray-500">{helper}</p></div><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#108910]/10 text-[#108910]"><Icon className="h-4 w-4" /></span></div></Link>)}
          </section>

          <section className="mb-5 grid gap-5 xl:grid-cols-12">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_10px_30px_rgba(16,24,40,0.04)] dark:border-white/10 dark:bg-[#080808] dark:shadow-none xl:col-span-8">
              <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.12em] text-gray-400">Revenue performance</p><h2 className="mt-1 text-base font-black">Paid revenue trend</h2></div><Link to="/admin/analytics" className="inline-flex items-center gap-1.5 text-xs font-black text-[#108910]">Full analytics <ArrowRight className="h-3.5 w-3.5" /></Link></div>
              <div className="p-5">
                <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">{[['Today', safe.todayRevenue], ['Week', safe.weeklyRevenue], ['Month', safe.monthlyRevenue], ['Outstanding', safe.outstandingRevenue]].map(([label, value]) => <div key={label} className="rounded-xl border border-gray-100 bg-[#F7F8F8] p-3 dark:border-white/[0.08] dark:bg-[#0D0D0D]"><p className="text-[9px] font-black uppercase tracking-[0.1em] text-gray-400">{label}</p><p className="mt-1.5 text-sm font-black sm:text-base">{money(value)}</p></div>)}</div>
                {monthlyEntries.length ? <div className="relative h-60"><div className="absolute inset-0 flex flex-col justify-between">{[1,2,3,4,5].map((i) => <div key={i} className="border-t border-dashed border-gray-100 dark:border-white/[0.07]" />)}</div><div className="absolute inset-0 z-10 flex items-end gap-3">{monthlyEntries.map((entry) => <div key={entry.label} className="group flex h-full min-w-0 flex-1 flex-col justify-end"><div className="flex h-[calc(100%-30px)] items-end justify-center"><div className="relative w-full max-w-16 rounded-t-lg bg-[#108910] transition group-hover:bg-[#0b731b]" style={{ height: `${entry.value > 0 ? Math.max(5, (entry.value / maxMonth) * 100) : 2}%` }}><span className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-black px-2 py-1 text-[9px] font-bold text-white opacity-0 transition-opacity sm:block group-hover:opacity-100">{money(entry.value)}</span></div></div><p className="mt-2 truncate text-center text-[9px] font-bold text-gray-400">{entry.label.split(' ')[0].slice(0,3)}</p></div>)}</div></div> : <div className="grid h-60 place-items-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-500 dark:border-white/10">Paid revenue will appear here</div>}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_10px_30px_rgba(16,24,40,0.04)] dark:border-white/10 dark:bg-[#080808] dark:shadow-none xl:col-span-4">
              <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.12em] text-gray-400">Order pipeline</p><h2 className="mt-1 text-base font-black">Fulfilment workload</h2></div><ShoppingBag className="h-4 w-4 text-[#108910]" /></div>
              <div className="mt-5 space-y-3">{statusEntries.length ? statusEntries.map(([status, count]) => { const pct = Math.round((Number(count) / totalStatusOrders) * 100); return <div key={status}><div className="mb-1.5 flex items-center justify-between gap-3"><p className="text-[11px] font-black capitalize">{status.replaceAll('_',' ').toLowerCase()}</p><p className="text-[10px] font-bold text-gray-500">{count} · {pct}%</p></div><div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-white/[0.07]"><div className="h-full rounded-full bg-[#108910]" style={{ width: `${pct}%` }} /></div></div> }) : <p className="py-16 text-center text-xs text-gray-500">No orders yet</p>}</div>
              <div className="mt-5 grid grid-cols-2 gap-2"><div className="rounded-xl bg-emerald-500/10 p-3"><p className="text-[9px] font-black uppercase tracking-[0.1em] text-emerald-700 dark:text-emerald-300">Paid</p><p className="mt-1 text-lg font-black">{number((safe.paymentBreakdown || {}).PAID || 0)}</p></div><div className="rounded-xl bg-amber-500/10 p-3"><p className="text-[9px] font-black uppercase tracking-[0.1em] text-amber-700 dark:text-amber-300">Awaiting</p><p className="mt-1 text-lg font-black">{number((safe.paymentBreakdown || {}).AWAITING_PAYMENT || 0)}</p></div></div>
            </div>
          </section>

          <section className="mb-5 grid gap-5 xl:grid-cols-12">
            <div className="rounded-2xl border border-gray-200 bg-white shadow-[0_10px_30px_rgba(16,24,40,0.04)] dark:border-white/10 dark:bg-[#080808] dark:shadow-none xl:col-span-7">
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/10"><div><p className="text-[10px] font-black uppercase tracking-[0.12em] text-gray-400">Product performance</p><h2 className="mt-1 text-base font-black">Top sellers</h2></div><TrendingUp className="h-4 w-4 text-[#108910]" /></div>
              <div className="divide-y divide-gray-100 dark:divide-white/[0.07]">{(safe.topProducts || []).length ? safe.topProducts.slice(0,6).map((product, index) => <div key={product.productId} className="flex items-center gap-3 px-5 py-3.5"><span className="w-5 text-center text-[10px] font-black text-gray-400">{index + 1}</span><img src={getImageUrl(product.image)} alt="" className="h-10 w-10 rounded-xl object-cover" onError={(e) => { e.currentTarget.src = '/placeholder.png' }} /><div className="min-w-0 flex-1"><p className="truncate text-xs font-black">{product.name}</p><p className="mt-1 text-[10px] text-gray-500">{number(product.units)} units · {product.category}</p></div><p className="text-xs font-black text-[#108910]">{money(product.revenue)}</p></div>) : <div className="px-5 py-16 text-center text-xs text-gray-500">Top products will appear after paid orders</div>}</div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white shadow-[0_10px_30px_rgba(16,24,40,0.04)] dark:border-white/10 dark:bg-[#080808] dark:shadow-none xl:col-span-5">
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/10"><div><p className="text-[10px] font-black uppercase tracking-[0.12em] text-gray-400">Inventory attention</p><h2 className="mt-1 text-base font-black">Low & out of stock</h2></div><AlertTriangle className="h-4 w-4 text-amber-500" /></div>
              <div className="divide-y divide-gray-100 dark:divide-white/[0.07]">{(safe.lowStockProducts || []).length ? safe.lowStockProducts.slice(0,6).map((product) => <Link key={product.id} to="/admin/products" className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-gray-50 dark:hover:bg-white/[0.025]"><img src={getImageUrl(product.image)} alt="" className="h-10 w-10 rounded-xl object-cover" onError={(e) => { e.currentTarget.src = '/placeholder.png' }} /><div className="min-w-0 flex-1"><p className="truncate text-xs font-black">{product.name}</p><p className="mt-1 text-[10px] text-gray-500">Alert threshold {product.low_stock_threshold}</p></div><span className={`rounded-lg px-2.5 py-1 text-[10px] font-black ${(product.stock_quantity || 0) <= 0 ? 'bg-red-500/10 text-red-600' : 'bg-amber-500/10 text-amber-600'}`}>{number(product.stock_quantity)} left</span></Link>) : <div className="px-5 py-16 text-center"><CheckCircle2 className="mx-auto h-6 w-6 text-emerald-500" /><p className="mt-2 text-xs font-black">Inventory levels look healthy</p></div>}</div>
            </div>
          </section>

          <section className="grid gap-5 xl:grid-cols-12">
            <div className="rounded-2xl border border-gray-200 bg-white shadow-[0_10px_30px_rgba(16,24,40,0.04)] dark:border-white/10 dark:bg-[#080808] dark:shadow-none xl:col-span-8"><div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/10"><div><p className="text-[10px] font-black uppercase tracking-[0.12em] text-gray-400">Latest activity</p><h2 className="mt-1 text-base font-black">Recent orders</h2></div><Link to="/admin/orders" className="text-xs font-black text-[#108910]">View all</Link></div><div className="divide-y divide-gray-100 dark:divide-white/[0.07]">{(safe.recentOrders || []).slice(0,6).map((order) => <Link key={order.id} to="/admin/orders" className="grid grid-cols-[1fr_auto] gap-3 px-5 py-3.5 transition hover:bg-gray-50 dark:hover:bg-white/[0.025] sm:grid-cols-[100px_1fr_140px_auto]"><p className="text-xs font-black">#{order.order_number || order.id}</p><p className="hidden truncate text-xs font-bold text-gray-500 sm:block">{order.customer_name || 'Guest customer'}</p><p className="hidden text-xs font-black sm:block">{money(order.total)}</p><span className="rounded-lg bg-gray-100 px-2.5 py-1 text-[9px] font-black uppercase text-gray-600 dark:bg-white/[0.07] dark:text-gray-300">{String(order.status).replaceAll('_',' ')}</span></Link>)}</div></div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_10px_30px_rgba(16,24,40,0.04)] dark:border-white/10 dark:bg-[#080808] dark:shadow-none xl:col-span-4"><p className="text-[10px] font-black uppercase tracking-[0.12em] text-gray-400">Business quality</p><h2 className="mt-1 text-base font-black">Store health indicators</h2><div className="mt-5 space-y-3">{[['Average paid order', money(safe.averageOrderValue), CircleDollarSign], ['Gross order value', money(safe.grossOrderValue), TrendingUp], ['Out of stock', `${number(safe.outOfStockCount)} products`, Package], ['Low stock', `${number(safe.lowStockCount)} products`, AlertTriangle]].map(([label, value, Icon]) => <div key={label} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-[#F8F9F9] p-3 dark:border-white/[0.07] dark:bg-[#0D0D0D]"><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#108910]/10 text-[#108910]"><Icon className="h-3.5 w-3.5" /></span><div className="min-w-0 flex-1"><p className="text-[10px] font-bold text-gray-500">{label}</p><p className="mt-0.5 truncate text-xs font-black">{value}</p></div></div>)}</div></div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
