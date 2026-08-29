import { useEffect, useMemo, useState } from 'react'
import {
  BarChart3,
  Boxes,
  CircleDollarSign,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Users,
  WalletCards,
} from 'lucide-react'
import AdminSidebar from '../../components/AdminSidebar'
import { statsAPI } from '../../services/api'
import { getImageUrl } from '../../utils/imageUtils'

const money = (value) => `${new Intl.NumberFormat('en-RW').format(Number(value) || 0)} RWF`
const number = (value) => new Intl.NumberFormat('en-RW').format(Number(value) || 0)

const Analytics = () => {
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
      console.error('Analytics load failed:', err)
      setError(err.response?.data?.error || 'Analytics could not be loaded')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const safe = stats || {}
  const daily = safe.dailyRevenue || []
  const maxDaily = Math.max(1, ...daily.map((entry) => Number(entry.revenue) || 0))
  const categories = safe.categoryPerformance || []
  const maxCategory = Math.max(1, ...categories.map((entry) => Number(entry.revenue) || 0))
  const paymentEntries = useMemo(() => Object.entries(safe.paymentBreakdown || {}), [safe.paymentBreakdown])
  const paymentTotal = Math.max(1, paymentEntries.reduce((sum, [, value]) => sum + Number(value || 0), 0))

  if (loading) {
    return <div className="flex min-h-screen bg-[#F5F6F7] dark:bg-black"><AdminSidebar /><main className="flex-1 px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:py-8"><div className="mx-auto max-w-[1600px] animate-pulse space-y-5"><div className="h-20 rounded-2xl bg-gray-200 dark:bg-[#080808]" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1,2,3,4].map((i) => <div key={i} className="h-32 rounded-2xl bg-gray-200 dark:bg-[#080808]" />)}</div><div className="h-[420px] rounded-2xl bg-gray-200 dark:bg-[#080808]" /></div></main></div>
  }

  return (
    <div className="flex min-h-screen bg-[#F5F6F7] text-gray-950 dark:bg-black dark:text-white">
      <AdminSidebar />
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-[1600px] px-4 pb-12 pt-20 sm:px-6 lg:px-8 lg:py-7">
          <header className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-sm font-medium text-gray-500">Performance intelligence</p><h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Sales analytics</h1><p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Paid revenue, product performance, category mix and payment conversion for operational decision-making.</p></div><button onClick={() => loadStats({ silent: true })} disabled={refreshing} className="inline-flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-black text-gray-700 shadow-sm disabled:opacity-60 dark:border-white/10 dark:bg-[#080808] dark:text-gray-300"><RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh</button></header>

          {error && <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">{error}</div>}

          <section className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
            {[
              ['Paid revenue', money(safe.totalRevenue), CircleDollarSign, `${money(safe.monthlyRevenue)} this month`],
              ['Gross order value', money(safe.grossOrderValue), TrendingUp, `${money(safe.outstandingRevenue)} outstanding`],
              ['Average paid order', money(safe.averageOrderValue), ShoppingBag, `${number(safe.totalOrders)} orders total`],
              ['Repeat customers', number(safe.repeatCustomers), Users, `${number(safe.totalCustomers)} registered customers`],
            ].map(([label, value, Icon, helper]) => <div key={label} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-[0_8px_24px_rgba(16,24,40,0.04)] dark:border-white/10 dark:bg-[#080808] dark:shadow-none"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-[0.12em] text-gray-400">{label}</p><p className="mt-2 truncate text-xl font-black sm:text-2xl">{value}</p><p className="mt-1 text-[11px] text-gray-500">{helper}</p></div><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#108910]/10 text-[#108910]"><Icon className="h-4 w-4" /></span></div></div>)}
          </section>

          <section className="mb-5 grid gap-5 xl:grid-cols-12">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_10px_30px_rgba(16,24,40,0.04)] dark:border-white/10 dark:bg-[#080808] dark:shadow-none xl:col-span-8">
              <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[0.12em] text-gray-400">Last 14 days</p><h2 className="mt-1 text-base font-black">Daily paid revenue</h2></div><BarChart3 className="h-4 w-4 text-[#108910]" /></div>
              <div className="mt-6 h-64"><div className="relative flex h-full items-end gap-1.5 sm:gap-2">{daily.length ? daily.map((entry) => { const height = entry.revenue > 0 ? Math.max(4, (entry.revenue / maxDaily) * 100) : 2; return <div key={entry.date} className="group flex h-full flex-1 flex-col justify-end"><div className="relative flex h-[calc(100%-28px)] items-end"><div className="w-full rounded-t-md bg-[#108910] transition group-hover:bg-[#0b731b]" style={{ height: `${height}%` }}><span className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-black px-2 py-1 text-[9px] font-bold text-white opacity-0 group-hover:opacity-100 sm:block">{money(entry.revenue)}</span></div></div><p className="mt-2 text-center text-[8px] font-bold text-gray-400">{new Date(`${entry.date}T00:00:00`).getDate()}</p></div> }) : <div className="grid h-full w-full place-items-center rounded-xl border border-dashed border-gray-200 text-xs text-gray-500 dark:border-white/10">Revenue appears after paid orders</div>}</div></div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_10px_30px_rgba(16,24,40,0.04)] dark:border-white/10 dark:bg-[#080808] dark:shadow-none xl:col-span-4"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[0.12em] text-gray-400">Payment conversion</p><h2 className="mt-1 text-base font-black">Payment status mix</h2></div><WalletCards className="h-4 w-4 text-[#108910]" /></div><div className="mt-5 space-y-4">{paymentEntries.length ? paymentEntries.map(([status, count]) => { const pct = Math.round((Number(count) / paymentTotal) * 100); return <div key={status}><div className="mb-1.5 flex items-center justify-between gap-2"><p className="text-[11px] font-black capitalize">{status.replaceAll('_',' ').toLowerCase()}</p><p className="text-[10px] font-bold text-gray-500">{count} · {pct}%</p></div><div className="h-2 rounded-full bg-gray-100 dark:bg-white/[0.07]"><div className="h-full rounded-full bg-[#108910]" style={{ width: `${pct}%` }} /></div></div> }) : <p className="py-16 text-center text-xs text-gray-500">No payment data yet</p>}</div></div>
          </section>

          <section className="mb-5 grid gap-5 xl:grid-cols-12">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_10px_30px_rgba(16,24,40,0.04)] dark:border-white/10 dark:bg-[#080808] dark:shadow-none xl:col-span-7"><div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/10"><div><p className="text-[10px] font-black uppercase tracking-[0.12em] text-gray-400">Merchandising</p><h2 className="mt-1 text-base font-black">Top products by paid revenue</h2></div><TrendingUp className="h-4 w-4 text-[#108910]" /></div><div className="divide-y divide-gray-100 dark:divide-white/[0.07]">{(safe.topProducts || []).length ? safe.topProducts.map((product, index) => <div key={product.productId} className="grid grid-cols-[28px_44px_1fr_auto] items-center gap-3 px-5 py-3.5"><span className="text-center text-[10px] font-black text-gray-400">{index + 1}</span><img src={getImageUrl(product.image)} alt="" className="h-11 w-11 rounded-xl object-cover" onError={(e) => { e.currentTarget.src = '/placeholder.png' }} /><div className="min-w-0"><p className="truncate text-xs font-black">{product.name}</p><p className="mt-1 text-[10px] text-gray-500">{number(product.units)} units · {product.category}</p></div><p className="text-xs font-black text-[#108910]">{money(product.revenue)}</p></div>) : <div className="px-5 py-16 text-center text-xs text-gray-500">Product rankings appear after paid orders</div>}</div></div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_10px_30px_rgba(16,24,40,0.04)] dark:border-white/10 dark:bg-[#080808] dark:shadow-none xl:col-span-5"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[0.12em] text-gray-400">Category performance</p><h2 className="mt-1 text-base font-black">Revenue contribution</h2></div><Boxes className="h-4 w-4 text-[#108910]" /></div><div className="mt-5 space-y-4">{categories.length ? categories.map((category) => { const pct = Math.round((Number(category.revenue) / maxCategory) * 100); return <div key={category.category}><div className="mb-1.5 flex items-end justify-between gap-3"><div><p className="text-[11px] font-black">{category.category}</p><p className="mt-0.5 text-[9px] text-gray-500">{number(category.units)} units</p></div><p className="text-[10px] font-black">{money(category.revenue)}</p></div><div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-white/[0.07]"><div className="h-full rounded-full bg-[#108910]" style={{ width: `${pct}%` }} /></div></div> }) : <p className="py-16 text-center text-xs text-gray-500">Category data will appear here</p>}</div></div>
          </section>

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[['Inventory units', number(safe.inventoryUnits), Boxes], ['Inventory value', money(safe.inventoryValue), CircleDollarSign], ['Low-stock products', number(safe.lowStockCount), TrendingUp], ['Out-of-stock products', number(safe.outOfStockCount), ShoppingBag]].map(([label, value, Icon]) => <div key={label} className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-[#080808]"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#108910]/10 text-[#108910]"><Icon className="h-4 w-4" /></span><div className="min-w-0"><p className="text-[10px] font-bold text-gray-500">{label}</p><p className="mt-1 truncate text-sm font-black">{value}</p></div></div>)}</section>
        </div>
      </main>
    </div>
  )
}

export default Analytics
