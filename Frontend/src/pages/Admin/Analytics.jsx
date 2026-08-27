import { useState, useEffect } from 'react'
import { statsAPI } from '../../services/api'
import { DollarSign, TrendingUp, Calendar, Package, ShoppingBag, Users, ArrowLeft, Home } from 'lucide-react'
import { Link } from 'react-router-dom'
import AdminSidebar from '../../components/AdminSidebar'

const Analytics = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    weeklyRevenue: 0,
    todayRevenue: 0,
    totalCustomers: 0,
    revenueByMonth: {},
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const response = await statsAPI.getBusinessStats()
      const data = response.data
      setStats({
        totalProducts: data.totalProducts || 0,
        activeProducts: data.activeProducts || 0,
        totalOrders: data.totalOrders || 0,
        totalRevenue: data.totalRevenue || 0,
        monthlyRevenue: data.monthlyRevenue || 0,
        weeklyRevenue: data.weeklyRevenue || 0,
        todayRevenue: data.todayRevenue || 0,
        totalCustomers: data.totalCustomers || 0,
        revenueByMonth: data.revenueByMonth || {},
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    )
  }

  const revenueCards = [
    {
      title: 'Total Revenue',
      value: `${stats.totalRevenue.toLocaleString()} RWF`,
      icon: DollarSign,
      color: 'bg-accent',
      description: 'Lifetime revenue',
      trend: null,
    },
    {
      title: 'Monthly Revenue',
      value: `${stats.monthlyRevenue.toLocaleString()} RWF`,
      icon: Calendar,
      color: 'bg-indigo-500',
      description: 'This month',
      trend: stats.monthlyRevenue > 0 ? 'up' : null,
    },
    {
      title: 'Weekly Revenue',
      value: `${stats.weeklyRevenue.toLocaleString()} RWF`,
      icon: TrendingUp,
      color: 'bg-pink-500',
      description: 'This week',
      trend: stats.weeklyRevenue > 0 ? 'up' : null,
    },
    {
      title: 'Today\'s Revenue',
      value: `${stats.todayRevenue.toLocaleString()} RWF`,
      icon: DollarSign,
      color: 'bg-green-500',
      description: 'Today',
      trend: stats.todayRevenue > 0 ? 'up' : null,
    },
  ]

  const businessMetrics = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: 'bg-purple-500',
      link: '/admin/orders',
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-blue-500',
      link: '/admin/products',
      description: `${stats.activeProducts} active`,
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      icon: Users,
      color: 'bg-green-500',
      link: '/admin/orders',
      description: 'Registered users',
    },
  ]

  // Calculate average order value
  const avgOrderValue = stats.totalOrders > 0 
    ? Math.round(stats.totalRevenue / stats.totalOrders) 
    : 0

  // Calculate revenue per customer
  const revenuePerCustomer = stats.totalCustomers > 0
    ? Math.round(stats.totalRevenue / stats.totalCustomers)
    : 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <AdminSidebar />
      <div className="flex-1">
        <div className="px-4 pb-4 pt-16 sm:px-6 sm:pb-6 sm:pt-16 lg:p-8">
        <div className="lg:hidden flex flex-wrap items-center gap-2 mb-4">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-800 dark:text-gray-200 shadow-sm active:scale-[0.98] transition-transform"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-800 dark:text-gray-200 shadow-sm active:scale-[0.98] transition-transform"
          >
            <Home className="w-4 h-4" />
            Store
          </Link>
        </div>
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link
            to="/admin"
            className="hidden lg:inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-accent mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Revenue Analytics
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Detailed insights into your business performance and revenue
          </p>
        </div>

        {/* Revenue Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {revenueCards.map((card) => (
            <div key={card.title} className="card p-4 sm:p-6 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {card.title}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {card.value}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {card.description}
                  </p>
                </div>
                <div className={`${card.color} p-2.5 sm:p-3 rounded-lg text-white`}>
                  <card.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
              {card.trend && (
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>Active</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {businessMetrics.map((metric) => (
            <Link
              key={metric.title}
              to={metric.link}
              className="card p-4 sm:p-6 hover:shadow-lg transition-all border-2 border-transparent hover:border-accent/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {metric.title}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {metric.value}
                  </p>
                  {metric.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {metric.description}
                    </p>
                  )}
                </div>
                <div className={`${metric.color} p-2.5 sm:p-3 rounded-lg text-white`}>
                  <metric.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Revenue Insights */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 mb-8">
          <div className="card p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4">
              Revenue Insights
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">Average Order Value</span>
                <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                  {avgOrderValue.toLocaleString()} RWF
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">Revenue per Customer</span>
                <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                  {revenuePerCustomer.toLocaleString()} RWF
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Conversion Rate</span>
                <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                  {stats.totalCustomers > 0 
                    ? ((stats.totalOrders / stats.totalCustomers) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
            </div>
          </div>

          <div className="card p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4">
              Performance Summary
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Target Progress</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {stats.monthlyRevenue > 0 ? 'Active' : 'No revenue yet'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-accent h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (stats.monthlyRevenue / (stats.totalRevenue || 1)) * 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Quick Stats
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Orders per Day</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {stats.totalOrders > 0 ? (stats.totalOrders / 30).toFixed(1) : 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Daily Revenue Avg</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {stats.totalRevenue > 0 
                        ? Math.round(stats.totalRevenue / 30).toLocaleString() 
                        : 0} RWF
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Trend Chart */}
        {Object.keys(stats.revenueByMonth).length > 0 && (
          <div className="card p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-6">
              Revenue Trend (Last 6 Months)
            </h3>
            <div className="space-y-4">
              {Object.entries(stats.revenueByMonth)
                .sort(([a], [b]) => {
                  // Sort by month name or date
                  return a.localeCompare(b)
                })
                .map(([month, revenue]) => {
                  const maxRevenue = Math.max(...Object.values(stats.revenueByMonth))
                  return (
                    <div key={month} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {month}
                        </span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {revenue.toLocaleString()} RWF
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-accent to-orange-500 h-3 rounded-full transition-all"
                          style={{
                            width: `${maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}

export default Analytics

