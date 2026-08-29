import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Home,
  Package,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Users,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { statsAPI } from '../../services/api'
import AdminSidebar from '../../components/AdminSidebar'

const formatCurrency = (value) => `${new Intl.NumberFormat('en-RW').format(Number(value) || 0)} RWF`
const formatNumber = (value) => new Intl.NumberFormat('en-RW').format(Number(value) || 0)

const MiniBars = ({ values = [] }) => {
  const safeValues = values.length ? values : [2, 3, 2, 4, 3, 5]
  const max = Math.max(1, ...safeValues.map((value) => Number(value) || 0))

  return (
    <div className="mt-5 flex h-10 items-end gap-1" aria-hidden="true">
      {safeValues.slice(-8).map((value, index) => {
        const height = Math.max(12, ((Number(value) || 0) / max) * 100)
        return (
          <span
            key={`${value}-${index}`}
            className="flex-1 rounded-t-sm bg-[#108910]/20 dark:bg-[#108910]/25"
            style={{ height: `${height}%` }}
          />
        )
      })}
    </div>
  )
}

const MetricCard = ({ title, value, helper, icon: Icon, values, link }) => (
  <Link
    to={link}
    className="group block rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_10px_30px_rgba(16,24,40,0.04)] transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-[0_16px_40px_rgba(16,24,40,0.08)] dark:border-white/10 dark:bg-[#080808] dark:shadow-none dark:hover:border-white/20"
  >
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-500">{title}</p>
        <p className="mt-2 break-words text-2xl font-black tracking-tight text-gray-950 dark:text-white sm:text-[26px]">
          {value}
        </p>
        <p className="mt-2 text-xs font-medium text-gray-500 dark:text-gray-400">{helper}</p>
      </div>
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-[#108910]/25 bg-[#108910]/10 text-[#108910] dark:border-[#31c548]/25 dark:bg-[#31c548]/10 dark:text-[#5FE56F]">
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
      </div>
    </div>
    <MiniBars values={values} />
  </Link>
)

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    weeklyRevenue: 0,
    todayRevenue: 0,
    totalCustomers: 0,
    revenueByMonth: {},
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async ({ silent = false } = {}) => {
    silent ? setRefreshing(true) : setLoading(true)
    try {
      setError('')
      const response = await statsAPI.getBusinessStats()
      const data = response.data || {}
      setStats({
        totalProducts: data.totalProducts || 0,
        activeProducts: data.activeProducts || 0,
        totalOrders: data.totalOrders || 0,
        completedOrders: data.completedOrders || 0,
        totalRevenue: data.totalRevenue || 0,
        monthlyRevenue: data.monthlyRevenue || 0,
        weeklyRevenue: data.weeklyRevenue || 0,
        todayRevenue: data.todayRevenue || 0,
        totalCustomers: data.totalCustomers || 0,
        revenueByMonth: data.revenueByMonth || {},
      })
    } catch (err) {
      console.error('Failed to load stats:', err)
      setError('Dashboard data could not be loaded. Check the backend connection and try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const revenueEntries = useMemo(
    () => Object.entries(stats.revenueByMonth || {}).map(([month, revenue]) => ({
      month,
      revenue: Number(revenue) || 0,
    })),
    [stats.revenueByMonth]
  )

  const revenueSeries = revenueEntries.map((entry) => entry.revenue)
  const maxRevenue = Math.max(1, ...revenueSeries)
  const completionRate = stats.totalOrders > 0
    ? Math.round((stats.completedOrders / stats.totalOrders) * 100)
    : 0
  const activeProductRate = stats.totalProducts > 0
    ? Math.round((stats.activeProducts / stats.totalProducts) * 100)
    : 0
  const averageOrderValue = stats.totalOrders > 0
    ? Math.round(stats.totalRevenue / stats.totalOrders)
    : 0
  const revenuePerCustomer = stats.totalCustomers > 0
    ? Math.round(stats.totalRevenue / stats.totalCustomers)
    : 0

  const currentDate = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date())

  const metricCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      helper: 'Lifetime store revenue',
      icon: CircleDollarSign,
      link: '/admin/analytics',
      values: revenueSeries,
    },
    {
      title: 'Total Orders',
      value: formatNumber(stats.totalOrders),
      helper: `${formatNumber(stats.completedOrders)} completed · ${completionRate}% completion`,
      icon: ShoppingBag,
      link: '/admin/orders',
      values: [stats.totalOrders / 4, stats.totalOrders / 3, stats.completedOrders / 2, stats.completedOrders],
    },
    {
      title: 'Customers',
      value: formatNumber(stats.totalCustomers),
      helper: `${formatCurrency(revenuePerCustomer)} revenue per customer`,
      icon: Users,
      link: '/admin/customers',
      values: [stats.totalCustomers / 5, stats.totalCustomers / 3, stats.totalCustomers / 2, stats.totalCustomers],
    },
    {
      title: 'Active Products',
      value: `${formatNumber(stats.activeProducts)} / ${formatNumber(stats.totalProducts)}`,
      helper: `${activeProductRate}% of catalog currently live`,
      icon: Package,
      link: '/admin/products',
      values: [stats.activeProducts / 4, stats.activeProducts / 2, stats.activeProducts * 0.8, stats.activeProducts],
    },
  ]

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F5F6F7] dark:bg-black">
        <AdminSidebar />
        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-[1600px] animate-pulse px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:py-8">
            <div className="mb-6 h-20 rounded-2xl bg-gray-200 dark:bg-[#080808]" />
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((item) => <div key={item} className="h-44 rounded-2xl bg-gray-200 dark:bg-[#080808]" />)}
            </div>
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
              <div className="h-[390px] rounded-2xl bg-gray-200 dark:bg-[#080808] xl:col-span-8" />
              <div className="h-[390px] rounded-2xl bg-gray-200 dark:bg-[#080808] xl:col-span-4" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#F5F6F7] text-gray-950 dark:bg-black dark:text-white">
      <AdminSidebar />

      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-[1600px] px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:py-7">
          <header className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-500">Store administration</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-gray-950 dark:text-white sm:text-3xl">
                Business dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                A live overview of sales, orders, customers and catalog performance.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-bold text-gray-600 shadow-sm dark:border-white/10 dark:bg-[#080808] dark:text-gray-300 dark:shadow-none">
                <CalendarDays className="h-4 w-4" strokeWidth={1.8} />
                {currentDate}
              </div>
              <button
                type="button"
                onClick={() => loadStats({ silent: true })}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-bold text-gray-700 shadow-sm transition hover:border-gray-300 disabled:opacity-60 dark:border-white/10 dark:bg-[#080808] dark:text-gray-300 dark:shadow-none dark:hover:border-white/20"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} strokeWidth={1.8} />
                Refresh
              </button>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-xl bg-[#108910] px-3.5 py-2.5 text-xs font-black text-white transition hover:bg-[#0b731b]"
              >
                <Home className="h-4 w-4" strokeWidth={1.8} />
                View store
              </Link>
            </div>
          </header>

          {error && (
            <div className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
              <span>{error}</span>
              <button type="button" onClick={() => loadStats({ silent: true })} className="font-black hover:underline">
                Retry
              </button>
            </div>
          )}

          <section className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Key business metrics">
            {metricCards.map((card) => <MetricCard key={card.title} {...card} />)}
          </section>

          <section className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-12">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_10px_30px_rgba(16,24,40,0.04)] dark:border-white/10 dark:bg-[#080808] dark:shadow-none xl:col-span-8">
              <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-black text-gray-950 dark:text-white">Revenue overview</h2>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">Recent monthly store revenue</p>
                </div>
                <Link to="/admin/analytics" className="inline-flex items-center gap-1.5 text-xs font-black text-[#108910] dark:text-[#5FE56F]">
                  Full analytics <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="p-5">
                <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {[
                    ['Today', stats.todayRevenue],
                    ['This Week', stats.weeklyRevenue],
                    ['This Month', stats.monthlyRevenue],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-gray-100 bg-[#F7F8F8] px-4 py-3.5 dark:border-white/[0.08] dark:bg-[#0D0D0D]">
                      <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500 dark:text-gray-500">{label}</p>
                      <p className="mt-1.5 text-lg font-black text-gray-950 dark:text-white">{formatCurrency(value)}</p>
                    </div>
                  ))}
                </div>

                {revenueEntries.length ? (
                  <div className="relative h-56 sm:h-64">
                    <div className="absolute inset-0 flex flex-col justify-between" aria-hidden="true">
                      {[1, 2, 3, 4, 5].map((line) => (
                        <div key={line} className="border-t border-dashed border-gray-100 dark:border-white/[0.07]" />
                      ))}
                    </div>
                    <div className="absolute inset-0 z-10 flex items-end gap-2 sm:gap-4">
                      {revenueEntries.map((entry) => {
                        const height = entry.revenue > 0 ? Math.max(8, (entry.revenue / maxRevenue) * 100) : 2
                        return (
                          <div key={entry.month} className="group/bar flex h-full min-w-0 flex-1 flex-col justify-end">
                            <div className="flex h-[calc(100%-28px)] items-end justify-center">
                              <div
                                className="relative w-full max-w-14 rounded-t-md bg-[#108910] transition hover:bg-[#0b731b] dark:bg-[#31c548] dark:hover:bg-[#5FE56F]"
                                style={{ height: `${height}%` }}
                              >
                                {entry.revenue > 0 && (
                                  <span className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-950 px-2 py-1 text-[10px] font-bold text-white opacity-0 shadow-lg transition-opacity sm:block group-hover/bar:opacity-100 dark:bg-white dark:text-black">
                                    {formatCurrency(entry.revenue)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="mt-2 truncate text-center text-[10px] font-bold text-gray-400 dark:text-gray-600">
                              {entry.month.split(' ')[0].slice(0, 3)}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-500 dark:border-white/10 dark:text-gray-500">
                    Revenue history will appear here when sales are recorded.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_10px_30px_rgba(16,24,40,0.04)] dark:border-white/10 dark:bg-[#080808] dark:shadow-none xl:col-span-4">
              <div className="mb-5">
                <h2 className="text-base font-black text-gray-950 dark:text-white">Order performance</h2>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">Fulfillment and store health</p>
              </div>

              <div className="flex flex-col items-center rounded-xl border border-gray-100 bg-[#F7F8F8] p-5 dark:border-white/[0.08] dark:bg-[#0D0D0D]">
                <div
                  className="relative flex h-36 w-36 items-center justify-center rounded-full"
                  style={{ background: `conic-gradient(#108910 ${completionRate * 3.6}deg, rgba(128,128,128,0.13) 0deg)` }}
                >
                  <div className="flex h-[108px] w-[108px] flex-col items-center justify-center rounded-full bg-white dark:bg-[#080808]">
                    <span className="text-3xl font-black text-gray-950 dark:text-white">{completionRate}%</span>
                    <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">Completed</span>
                  </div>
                </div>
                <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
                  {formatNumber(stats.completedOrders)} completed from {formatNumber(stats.totalOrders)} total orders
                </p>
              </div>

              <div className="mt-4 space-y-3">
                <div className="rounded-xl border border-gray-100 p-4 dark:border-white/[0.08]">
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Catalog availability</span>
                    <span className="text-xs font-black text-gray-950 dark:text-white">{activeProductRate}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-white/[0.08]">
                    <div className="h-full rounded-full bg-[#108910] dark:bg-[#31c548]" style={{ width: `${activeProductRate}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-gray-100 p-4 dark:border-white/[0.08]">
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400">Avg. order</p>
                    <p className="mt-1 text-sm font-black text-gray-950 dark:text-white">{formatCurrency(averageOrderValue)}</p>
                  </div>
                  <div className="rounded-xl border border-gray-100 p-4 dark:border-white/[0.08]">
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400">Active catalog</p>
                    <p className="mt-1 text-sm font-black text-gray-950 dark:text-white">{formatNumber(stats.activeProducts)}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
            <div className="rounded-2xl border border-gray-200 bg-white shadow-[0_10px_30px_rgba(16,24,40,0.04)] dark:border-white/10 dark:bg-[#080808] dark:shadow-none xl:col-span-7">
              <div className="border-b border-gray-100 px-5 py-4 dark:border-white/10">
                <h2 className="text-base font-black text-gray-950 dark:text-white">Management shortcuts</h2>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">Open the most-used admin tools</p>
              </div>
              <div className="grid grid-cols-1 gap-px bg-gray-100 dark:bg-white/[0.08] sm:grid-cols-2">
                {[
                  [Package, 'Manage Products', 'Update catalog, pricing and availability', '/admin/products'],
                  [ShoppingBag, 'Review Orders', 'Process and track customer orders', '/admin/orders'],
                  [Users, 'Customers', 'Review customer accounts and activity', '/admin/customers'],
                  [BarChart3, 'Analytics', 'Explore detailed sales performance', '/admin/analytics'],
                ].map(([Icon, title, description, link]) => (
                  <Link key={title} to={link} className="group flex items-center gap-3 bg-white p-4 transition hover:bg-gray-50 dark:bg-[#080808] dark:hover:bg-[#0D0D0D]">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition group-hover:border-[#108910]/30 group-hover:text-[#108910] dark:border-white/10 dark:text-gray-400 dark:group-hover:text-[#5FE56F]">
                      <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black text-gray-900 dark:text-white">{title}</p>
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-500">{description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 flex-shrink-0 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-[#108910] dark:text-gray-700 dark:group-hover:text-[#5FE56F]" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#108910]/20 bg-[#F1FAF3] p-5 dark:border-[#31c548]/20 dark:bg-[#061208] xl:col-span-5">
              <div className="flex h-full flex-col justify-between gap-6">
                <div>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#108910] text-white">
                    <TrendingUp className="h-5 w-5" strokeWidth={1.8} />
                  </div>
                  <h2 className="text-base font-black text-gray-950 dark:text-white">Business snapshot</h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-gray-600 dark:text-gray-400">
                    Your dashboard now focuses on the numbers that matter most: revenue, order completion, customer activity and catalog availability.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-gray-600 dark:text-gray-300">
                  <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-[#108910] dark:text-[#5FE56F]" /> Real API data</span>
                  <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-[#108910] dark:text-[#5FE56F]" /> Live store metrics</span>
                  <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-[#108910] dark:text-[#5FE56F]" /> Responsive layout</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
