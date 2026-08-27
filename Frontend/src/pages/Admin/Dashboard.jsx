import { Link } from 'react-router-dom'
import { Package, ShoppingBag, DollarSign, TrendingUp, Users, Calendar, BarChart3, User, Plus, ArrowRight, Activity, Box, ShoppingCart, Wallet, UserCircle, Calendar as CalendarIcon, TrendingDown, LineChart, Settings, Layers, Sparkles, Zap } from 'lucide-react'
import { useState, useEffect } from 'react'
import { statsAPI } from '../../services/api'
import AdminSidebar from '../../components/AdminSidebar'

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
        completedOrders: data.completedOrders || 0,
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Box,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
      iconBg: 'bg-blue-500',
      link: '/admin/products',
      description: `${stats.activeProducts} active`,
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
      iconBg: 'bg-purple-500',
      link: '/admin/orders',
      description: 'All time',
    },
    {
      title: 'Total Revenue',
      value: `${stats.totalRevenue.toLocaleString()} RWF`,
      icon: Wallet,
      gradient: 'from-emerald-500 to-teal-600',
      bgGradient: 'from-emerald-50 to-teal-100 dark:from-emerald-900/20 dark:to-teal-800/20',
      iconBg: 'bg-emerald-500',
      link: '/admin/analytics',
      description: 'Lifetime',
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      icon: UserCircle,
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20',
      iconBg: 'bg-green-500',
      link: '/admin/customers',
      description: 'Registered users',
    },
    {
      title: 'Monthly Revenue',
      value: `${stats.monthlyRevenue.toLocaleString()} RWF`,
      icon: CalendarIcon,
      gradient: 'from-indigo-500 to-indigo-600',
      bgGradient: 'from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20',
      iconBg: 'bg-indigo-500',
      link: '/admin/analytics',
      description: 'This month',
    },
    {
      title: 'Weekly Revenue',
      value: `${stats.weeklyRevenue.toLocaleString()} RWF`,
      icon: TrendingUp,
      gradient: 'from-pink-500 to-pink-600',
      bgGradient: 'from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20',
      iconBg: 'bg-pink-500',
      link: '/admin/analytics',
      description: 'This week',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <AdminSidebar />
      <div className="flex-1">
        <div className="p-4 pt-20 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <BarChart3 className="w-8 h-8 text-emerald-600" />
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Welcome to MarketMet Store Management
                </p>
              </div>
              <Link
                to="/"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-semibold transition-colors"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Back to Store
              </Link>
            </div>
          </div>

          {/* Business Summary */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-1 w-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full"></div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Business Overview
              </h2>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            {statCards.map((card, index) => {
              const Icon = card.icon
              return (
                <Link
                  key={index}
                  to={card.link}
                  className="card p-6 hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${card.gradient} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {card.description}
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-1">
                    {card.value}
                  </h3>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {card.title}
                  </p>
                </Link>
              )
            })}
          </div>

          {/* Charts & Actions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Revenue Trend Chart */}
            {Object.keys(stats.revenueByMonth).length > 0 && (
              <div className="card p-4 sm:p-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                    <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                      Revenue Trend
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Monthly Performance Overview
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {Object.entries(stats.revenueByMonth).map(([month, revenue]) => {
                    const maxRevenue = Math.max(...Object.values(stats.revenueByMonth))
                    const percentage = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0
                    return (
                      <div key={month} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {month}
                          </span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {revenue.toLocaleString()} RWF
                          </span>
                        </div>
                        <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Quick Actions Card */}
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                    Quick Store Actions
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Direct access to management tools
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  to="/admin/products"
                  className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-emerald-500 bg-gray-50 dark:bg-gray-800/50 hover:bg-emerald-50/50 transition-all group"
                >
                  <Package className="w-6 h-6 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="font-bold text-gray-900 dark:text-white">Manage Products</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Add or edit catalog items</p>
                </Link>

                <Link
                  to="/admin/orders"
                  className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-emerald-500 bg-gray-50 dark:bg-gray-800/50 hover:bg-emerald-50/50 transition-all group"
                >
                  <ShoppingCart className="w-6 h-6 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="font-bold text-gray-900 dark:text-white">Fulfill Orders</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Review pending orders</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
