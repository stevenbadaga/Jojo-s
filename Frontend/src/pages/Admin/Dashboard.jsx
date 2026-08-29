import { Link } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  DollarSign,
  Home,
  Package,
  RefreshCw,
  ShoppingBag,
  Users,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { statsAPI } from '../../services/api'
import AdminSidebar from '../../components/AdminSidebar'

const formatCurrency = (value) => `${new Intl.NumberFormat('en-RW').format(Number(value) || 0)} RWF`

const formatNumber = (value) => new Intl.NumberFormat('en-RW').format(Number(value) || 0)

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
    if (silent) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

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
      setError('Dashboard metrics could not be refreshed. Check the backend connection and try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const revenueEntries = useMemo(
    () => Object.entries(stats.revenueByMonth || {})
      .map(([month, revenue]) => ({ month, revenue: Number(revenue) || 0 }))
      .slice(-8),
    [stats.revenueByMonth]
  )

  const maxRevenue = Math.max(0, ...revenueEntries.map((entry) => entry.revenue))
  const completionRate = stats.totalOrders > 0
    ? Math.round((stats.completedOrders / stats.totalOrders) * 100)
    : 0
  const activeProductRate = stats.totalProducts > 0
    ? Math.round((stats.activeProducts / stats.totalProducts) * 100)
    : 0
  const averageOrderValue = stats.completedOrders > 0
    ? Math.round(stats.totalRevenue / stats.completedOrders)
    : stats.totalOrders > 0
      ? Math.round(stats.totalRevenue / stats.totalOrders)
      : 0

  const currentDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  const primaryMetrics = [
    {
      title: 'Total revenue',
      value: formatCurrency(stats.totalRevenue),
      description: 'Lifetime completed sales',
      icon: DollarSign,
      link: '/admin/analytics',
    },
    {
      title: 'Orders',
      value: formatNumber(stats.totalOrders),
      description: `${formatNumber(stats.completedOrders)} completed`,
      icon: ShoppingBag,
      link: '/admin/orders',
    },
    {
      title: 'Customers',
      value: formatNumber(stats.totalCustomers),
      description: 'Registered customer accounts',
      icon: Users,
      link: '/admin/customers',
    },
    {
      title: 'Active products',
      value: `${formatNumber(stats.activeProducts)} / ${formatNumber(stats.totalProducts)}`,
      description: `${activeProductRate}% of catalog live`,
      icon: Package,
      link: '/admin/products',
    },
  ]

  const periodSales = [
    {
      label: 'Today',
      value: stats.todayRevenue,
      description: 'Sales recorded today',
    },
    {
      label: 'This week',
      value: stats.weeklyRevenue,
      description: 'Current week revenue',
    },
    {
      label: 'This month',
      value: stats.monthlyRevenue,
      description: 'Current month revenue',
    },
  ]

  const quickActions = [
    {
      title: 'Manage products',
      description: 'Add, update, archive and organize catalog items.',
      icon: Package,
      link: '/admin/products',
    },
    {
      title: 'Review orders',
      description: 'Track fulfillment and update customer orders.',
      icon: ShoppingBag,
      link: '/admin/orders',
    },
    {
      title: 'Customer directory',
      description: 'View customer accounts and order activity.',
      icon: Users,
      link: '/admin/customers',
    },
    {
      title: 'Open analytics',
      description: 'See the detailed revenue and performance view.',
      icon: BarChart3,
      link: '/admin/analytics',
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7F6] dark:bg-gray-950 flex">
        <AdminSidebar />
        <main className="flex-1 min-w-0">
          <div className="max-w-[1600px] mx-auto px-4 pb-8 pt-20 sm:px-6 lg:px-8 lg:py-8 animate-pulse">
            <div className="h-9 w-56 rounded-lg bg-gray-200 dark:bg-gray-800 mb-3" />
            <div className="h-4 w-80 max-w-full rounded bg-gray-200 dark:bg-gray-800 mb-8" />
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-36 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800" />
              ))}
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 h-[420px] rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800" />
              <div className="h-[420px] rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F7F6] dark:bg-gray-950 flex">
      <AdminSidebar />

      <main className="flex-1 min-w-0">
        <div className="max-w-[1600px] mx-auto px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:py-8">
          <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#108910] mb-2">
                <span className="w-2 h-2 rounded-full bg-[#108910]" />
                Store operations
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-950 dark:text-white">
                Dashboard
              </h1>
              <p className="mt-2 text-sm sm:text-base text-gray-500 dark:text-gray-400">
                {currentDate} · A clear view of MarketMet sales and operations.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => loadStats({ silent: true })}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-200 shadow-sm hover:border-gray-300 dark:hover:border-gray-700 disabled:opacity-60 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-xl bg-[#002524] dark:bg-[#108910] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#003834] dark:hover:bg-[#0b731b] transition-colors"
              >
                <Home className="w-4 h-4" />
                View storefront
              </Link>
            </div>
          </header>

          {error && (
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 px-4 py-3.5">
              <div className="flex items-start gap-3">
                <Activity className="w-5 h-5 text-amber-700 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm font-medium text-amber-900 dark:text-amber-200">{error}</p>
              </div>
              <button
                type="button"
                onClick={() => loadStats({ silent: true })}
                className="text-sm font-bold text-amber-900 dark:text-amber-200 hover:underline"
              >
                Try again
              </button>
            </div>
          )}

          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6" aria-label="Business summary">
            {primaryMetrics.map((metric) => {
              const Icon = metric.icon
              return (
                <Link
                  key={metric.title}
                  to={metric.link}
                  className="group rounded-2xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 sm:p-6 shadow-[0_1px_2px_rgba(16,24,40,0.03)] hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <p className="text-sm font-bold text-gray-600 dark:text-gray-300">{metric.title}</p>
                    <div className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 group-hover:text-[#108910] group-hover:border-[#108910]/30 transition-colors">
                      <Icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
                    </div>
                  </div>
                  <p className="text-2xl sm:text-[28px] font-black tracking-tight text-gray-950 dark:text-white break-words leading-tight">
                    {metric.value}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{metric.description}</p>
                    <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-[#108910] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </div>
                </Link>
              )
            })}
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            <div className="xl:col-span-2 rounded-2xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-[0_1px_2px_rgba(16,24,40,0.03)] overflow-hidden">
              <div className="px-5 sm:px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <BarChart3 className="w-5 h-5 text-[#108910]" strokeWidth={1.8} />
                    <h2 className="text-lg font-black text-gray-950 dark:text-white">Sales performance</h2>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Revenue recorded across recent months.</p>
                </div>
                <Link
                  to="/admin/analytics"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-[#108910] hover:text-[#0b731b] transition-colors"
                >
                  Detailed analytics
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="p-5 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-7">
                  {periodSales.map((period) => (
                    <div key={period.label} className="rounded-xl bg-[#F7F9F8] dark:bg-gray-800/70 border border-gray-100 dark:border-gray-800 px-4 py-3.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">
                        <Calendar className="w-3.5 h-3.5" strokeWidth={1.8} />
                        {period.label}
                      </div>
                      <p className="text-lg font-black text-gray-950 dark:text-white">{formatCurrency(period.value)}</p>
                      <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">{period.description}</p>
                    </div>
                  ))}
                </div>

                {revenueEntries.length > 0 ? (
                  <div>
                    <div className="relative h-56 sm:h-64">
                      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none" aria-hidden="true">
                        {[1, 2, 3, 4, 5].map((line) => (
                          <div key={line} className="border-t border-dashed border-gray-100 dark:border-gray-800" />
                        ))}
                      </div>

                      <div className="absolute inset-0 flex items-end gap-2 sm:gap-4 z-10">
                        {revenueEntries.map((entry) => {
                          const height = maxRevenue > 0
                            ? entry.revenue === 0
                              ? 0
                              : Math.max(7, (entry.revenue / maxRevenue) * 100)
                            : 0

                          return (
                            <div key={entry.month} className="flex-1 min-w-0 h-full flex flex-col justify-end group/bar">
                              <div className="h-[calc(100%-24px)] flex items-end justify-center">
                                <div
                                  className="w-full max-w-14 rounded-t-lg bg-[#108910] hover:bg-[#0b731b] transition-colors relative"
                                  style={{ height: `${height}%` }}
                                  title={`${entry.month}: ${formatCurrency(entry.revenue)}`}
                                >
                                  {entry.revenue > 0 && (
                                    <div className="hidden sm:block opacity-0 group-hover/bar:opacity-100 absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-950 text-white px-2.5 py-1.5 text-[11px] font-bold shadow-lg transition-opacity z-20">
                                      {formatCurrency(entry.revenue)}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <span className="mt-2 text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 truncate text-center">
                                {entry.month}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-56 sm:h-64 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-950/30 flex flex-col items-center justify-center text-center px-6">
                    <BarChart3 className="w-8 h-8 text-gray-300 dark:text-gray-700 mb-3" strokeWidth={1.5} />
                    <p className="font-bold text-gray-700 dark:text-gray-300">No monthly sales data yet</p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">Revenue history will appear here as completed sales are recorded.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200/90 dark:border-gray-800 bg-[#002524] dark:bg-gray-900 text-white shadow-[0_1px_2px_rgba(16,24,40,0.03)] overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-white/10 dark:border-gray-800">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-5 h-5 text-[#5FE56F]" strokeWidth={1.8} />
                  <h2 className="text-lg font-black">Store health</h2>
                </div>
                <p className="text-sm text-white/60 dark:text-gray-400">Operational indicators calculated from live store totals.</p>
              </div>

              <div className="p-5 sm:p-6 space-y-6">
                <div>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 text-sm font-bold">
                      <CheckCircle2 className="w-4 h-4 text-[#5FE56F]" strokeWidth={1.8} />
                      Order completion
                    </div>
                    <span className="text-sm font-black">{completionRate}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 dark:bg-gray-800 overflow-hidden">
                    <div className="h-full rounded-full bg-[#5FE56F]" style={{ width: `${Math.min(100, completionRate)}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-white/50 dark:text-gray-500">{formatNumber(stats.completedOrders)} of {formatNumber(stats.totalOrders)} orders completed</p>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 text-sm font-bold">
                      <Package className="w-4 h-4 text-[#5FE56F]" strokeWidth={1.8} />
                      Catalog availability
                    </div>
                    <span className="text-sm font-black">{activeProductRate}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 dark:bg-gray-800 overflow-hidden">
                    <div className="h-full rounded-full bg-[#5FE56F]" style={{ width: `${Math.min(100, activeProductRate)}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-white/50 dark:text-gray-500">{formatNumber(stats.activeProducts)} products currently active</p>
                </div>

                <div className="pt-5 border-t border-white/10 dark:border-gray-800">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/50 dark:text-gray-500">Average order value</p>
                  <p className="mt-2 text-2xl font-black tracking-tight">{formatCurrency(averageOrderValue)}</p>
                  <p className="mt-1 text-xs text-white/50 dark:text-gray-500">Based on recorded revenue and orders.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-[0_1px_2px_rgba(16,24,40,0.03)] overflow-hidden">
            <div className="px-5 sm:px-6 py-5 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-black text-gray-950 dark:text-white">Management shortcuts</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Go directly to the areas used most often.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-gray-800">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Link
                    key={action.title}
                    to={action.link}
                    className="group p-5 sm:p-6 hover:bg-[#F7F9F8] dark:hover:bg-gray-800/60 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 mb-4 group-hover:text-[#108910] group-hover:border-[#108910]/30 transition-colors">
                      <Icon className="w-5 h-5" strokeWidth={1.8} />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-black text-gray-950 dark:text-white">{action.title}</h3>
                      <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-[#108910] group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">{action.description}</p>
                  </Link>
                )
              })}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
