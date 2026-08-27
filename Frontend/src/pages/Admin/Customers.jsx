import { useState, useEffect } from 'react'
import { userAPI, ordersAPI, statsAPI } from '../../services/api'
import { Users, ShoppingBag, DollarSign, Mail, Phone, MapPin, Calendar, ArrowLeft, Search, Eye, Trash2, AlertTriangle, Home } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useToast } from '../../contexts/ToastContext'
import { useAuth } from '../../contexts/AuthContext'
import AdminSidebar from '../../components/AdminSidebar'
import { formatDateRwanda } from '../../utils/dateTime'

const Customers = () => {
  const [customers, setCustomers] = useState([])
  const [filteredCustomers, setFilteredCustomers] = useState([])
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalOrders: 0,
    totalRevenue: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [customerOrders, setCustomerOrders] = useState([])
  const [deletingUserId, setDeletingUserId] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const toast = useToast()
  const { user: currentUser } = useAuth()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterCustomers()
  }, [customers, searchQuery])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load customers
      try {
        const usersRes = await userAPI.getAllUsers()
        console.log('Users response:', usersRes)
        const usersData = Array.isArray(usersRes.data) ? usersRes.data : (Array.isArray(usersRes) ? usersRes : [])
        console.log('Users data:', usersData)
        setCustomers(usersData)
        setFilteredCustomers(usersData)
      } catch (error) {
        console.error('Failed to load customers:', error)
        console.error('Error details:', error.response?.data)
        toast.error(error.response?.data?.error || 'Failed to load customers. Please try again.')
        setCustomers([])
        setFilteredCustomers([])
      }
      
      // Load orders for customer statistics
      try {
        const ordersRes = await ordersAPI.getAllOrders()
        const ordersData = Array.isArray(ordersRes.data) ? ordersRes.data : []
        setOrders(ordersData)
      } catch (error) {
        console.error('Failed to load orders:', error)
        setOrders([])
      }
      
      // Load stats
      try {
        const statsRes = await statsAPI.getBusinessStats()
        const statsData = statsRes.data
        setStats({
          totalCustomers: statsData.totalCustomers || customers.length,
          totalOrders: statsData.totalOrders || 0,
          totalRevenue: statsData.totalRevenue || 0,
        })
      } catch (error) {
        console.error('Failed to load stats:', error)
        // Set default stats based on loaded data
        setStats({
          totalCustomers: customers.length,
          totalOrders: orders.length,
          totalRevenue: 0,
        })
      }
    } catch (error) {
      console.error('Failed to load data:', error)
      toast.error('Failed to load data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const filterCustomers = () => {
    if (!Array.isArray(customers)) {
      setFilteredCustomers([])
      return
    }
    
    let filtered = [...customers]
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (c) =>
          c?.email?.toLowerCase().includes(query) ||
          c?.name?.toLowerCase().includes(query) ||
          c?.phone?.includes(query)
      )
    }
    setFilteredCustomers(filtered)
  }

  const getCustomerStats = (customerId) => {
    if (!Array.isArray(orders)) return { orderCount: 0, totalSpent: 0 }
    
    const customerOrdersList = orders.filter((o) => o.user_id === customerId)
    const totalSpent = customerOrdersList.reduce(
      (sum, o) => sum + (o.subtotal || 0) + (o.delivery_fee || 0),
      0
    )
    return {
      orderCount: customerOrdersList.length,
      totalSpent,
    }
  }

  const viewCustomerDetails = async (customer) => {
    setSelectedCustomer(customer)
    // Load orders for this customer
    try {
      const customerOrdersList = orders.filter((o) => o.user_id === customer.id)
      setCustomerOrders(customerOrdersList)
    } catch (error) {
      console.error('Failed to load customer orders:', error)
      setCustomerOrders([])
    }
  }

  const handleDeleteUser = async (userId) => {
    try {
      setDeletingUserId(userId)
      await userAPI.deleteUser(userId)
      toast.success('User deleted successfully')
      // Reload data
      await loadData()
      setShowDeleteConfirm(null)
    } catch (error) {
      console.error('Failed to delete user:', error)
      toast.error(error.response?.data?.error || 'Failed to delete user')
    } finally {
      setDeletingUserId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading customers...</p>
        </div>
      </div>
    )
  }

  const customerMetrics = [
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      icon: Users,
      color: 'bg-green-500',
      description: 'Registered users',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: 'bg-purple-500',
      description: 'All time',
    },
    {
      title: 'Total Revenue',
      value: `${stats.totalRevenue.toLocaleString()} RWF`,
      icon: DollarSign,
      color: 'bg-accent',
      description: 'From all customers',
    },
  ]

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
            Customers
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Manage and view all registered customers
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {customerMetrics.map((metric) => (
            <div key={metric.title} className="card p-4 sm:p-6 hover:shadow-lg transition-all">
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
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="mb-4 sm:mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>

        {/* Customers Table */}
        <div className="space-y-4">
          {/* Mobile Cards */}
          <div className="sm:hidden space-y-4">
            {filteredCustomers.length === 0 ? (
              <div className="card p-8 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {searchQuery ? 'No customers found matching your search.' : 'No customers yet.'}
                </p>
              </div>
            ) : (
              filteredCustomers.map((customer) => {
                const customerStats = getCustomerStats(customer.id)
                return (
                  <div key={customer.id} className="card p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                          {customer.name || 'No name'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">ID: #{customer.id}</p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          customer.role === 'ADMIN'
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                            : customer.role === 'MANAGER'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                            : customer.role === 'STAFF'
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                            : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        }`}
                      >
                        {customer.role || 'CUSTOMER'}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                      {customer.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>
                          {customer.city && customer.country
                            ? `${customer.city}, ${customer.country}`
                            : customer.city || customer.country || '-'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-800">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Orders</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {customerStats.orderCount}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Total Spent</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {customerStats.totalSpent.toLocaleString()} RWF
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => viewCustomerDetails(customer)}
                          className="text-accent hover:text-accent-darker p-2"
                          aria-label="View customer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {currentUser?.id !== customer.id ? (
                          <button
                            onClick={() => setShowDeleteConfirm(customer.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-2"
                            aria-label="Delete customer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500">You</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Desktop Table */}
          <div className="card overflow-hidden hidden sm:block">
            <div className="overflow-x-auto">
              <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Total Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Role
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <p className="text-gray-500 dark:text-gray-400">
                        {searchQuery ? 'No customers found matching your search.' : 'No customers yet.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => {
                    const stats = getCustomerStats(customer.id)
                    return (
                      <tr
                        key={customer.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {customer.name || 'No name'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              ID: #{customer.id}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {customer.email}
                          </div>
                          {customer.phone && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {customer.phone}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {customer.city && customer.country
                            ? `${customer.city}, ${customer.country}`
                            : customer.city || customer.country || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {stats.orderCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {stats.totalSpent.toLocaleString()} RWF
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              customer.role === 'ADMIN'
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                : customer.role === 'MANAGER'
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                                : customer.role === 'STAFF'
                                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                                : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                            }`}
                          >
                            {customer.role || 'CUSTOMER'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => viewCustomerDetails(customer)}
                              className="text-accent hover:text-accent-darker p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                              title="View details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {currentUser?.id !== customer.id && (
                              <button
                                onClick={() => setShowDeleteConfirm(customer.id)}
                                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                title="Delete user"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                            {currentUser?.id === customer.id && (
                              <span className="text-xs text-gray-400 dark:text-gray-500 p-2" title="Cannot delete your own account">
                                You
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        </div>

        {/* Customer Detail Modal */}
        {selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && setSelectedCustomer(null)}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Customer Details
                </h2>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Customer Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Name</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedCustomer.name || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedCustomer.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Phone</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedCustomer.phone || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Role</p>
                    <span
                      className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                        selectedCustomer.role === 'ADMIN'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                          : selectedCustomer.role === 'MANAGER'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                          : selectedCustomer.role === 'STAFF'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                          : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                      }`}
                    >
                      {selectedCustomer.role || 'CUSTOMER'}
                    </span>
                  </div>
                  {selectedCustomer.address && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Address</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedCustomer.address}
                        {selectedCustomer.city && `, ${selectedCustomer.city}`}
                        {selectedCustomer.country && `, ${selectedCustomer.country}`}
                      </p>
                    </div>
                  )}
                </div>

                {/* Customer Statistics */}
                {(() => {
                  const customerStats = getCustomerStats(selectedCustomer.id)
                  return (
                    <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Orders</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {customerStats.orderCount}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Spent</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {customerStats.totalSpent.toLocaleString()} RWF
                        </p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Order Value</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {customerStats.orderCount > 0
                            ? Math.round(customerStats.totalSpent / customerStats.orderCount).toLocaleString()
                            : 0}{' '}
                          RWF
                        </p>
                      </div>
                    </div>
                  )
                })()}

                {/* Customer Orders */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Order History ({customerOrders.length})
                  </h3>
                  {customerOrders.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      No orders yet
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {customerOrders.map((order) => {
                        const total = (order.subtotal || 0) + (order.delivery_fee || 0)
                        return (
                          <div
                            key={order.id}
                            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  Order #{order.id}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {order.created_at ? formatDateRwanda(order.created_at) : 'Date unknown'}
                                </p>
                              </div>
                              <span
                                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  order.status === 'DELIVERED'
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                    : order.status === 'SHIPPED'
                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                                    : order.status === 'CANCELLED'
                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                                }`}
                              >
                                {order.status || 'PENDING'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {order.items?.length || 0} items
                              </p>
                              <p className="font-bold text-gray-900 dark:text-white">
                                {total.toLocaleString()} RWF
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Delete User
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      This action cannot be undone
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  Are you sure you want to delete this user? All associated data will be permanently removed.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    disabled={deletingUserId !== null}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteUser(showDeleteConfirm)}
                    disabled={deletingUserId !== null}
                    className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {deletingUserId ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        <span>Delete User</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}

export default Customers

