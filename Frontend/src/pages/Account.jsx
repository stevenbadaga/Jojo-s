import { useAuth } from '../contexts/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { useEffect, useState, useMemo, useCallback } from 'react'
import { User, Package, Heart, ShoppingBag, DollarSign, Eye, Calendar, Phone, MapPin, Filter, ArrowUpDown, Settings } from 'lucide-react'
import { ordersAPI, wishlistAPI, productsAPI } from '../services/api'
import { useToast } from '../contexts/ToastContext'
import OrderTracking from '../components/OrderTracking'
import { OrderCardSkeleton, LoadingSpinner } from '../components/SkeletonLoader'
import { EmptyOrders } from '../components/EmptyState'
import { formatDateTimeRwanda, parseBackendDate } from '../utils/dateTime'

const Account = () => {
  const { user, isAuthenticated, isAdmin } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [orders, setOrders] = useState([])
  const [wishlistCount, setWishlistCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [products, setProducts] = useState({}) // Cache product details
  const [sortBy, setSortBy] = useState('newest') // newest, oldest, amount
  const [filterStatus, setFilterStatus] = useState('all') // all, recent, thisMonth

  const loadData = useCallback(async () => {
    if (!user || !user.id) {
      console.error('User not available for loading account data')
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      // Regular users get their own orders by userId
      try {
        const ordersRes = await ordersAPI.getMyOrders()
        console.log('Orders loaded:', ordersRes.data)
        // Backend returns array directly, not wrapped in data
        const ordersList = Array.isArray(ordersRes.data) ? ordersRes.data : []
        setOrders(ordersList)
      } catch (error) {
        console.error('Failed to load my orders:', error)
        console.error('Error details:', error.response?.data)
        // If 401/403, user might not be authenticated properly
        if (error.response?.status === 401 || error.response?.status === 403) {
          toast.error('Please login again to view your orders')
          // Don't navigate immediately - let user see the message
        } else {
          console.log('No orders found or error loading orders')
        }
        setOrders([])
      }

      // Load wishlist count
      try {
        const wishlistRes = await wishlistAPI.getWishlist()
        setWishlistCount(wishlistRes.data?.length || 0)
      } catch (error) {
        // Wishlist might not be available for all users
        console.log('Wishlist not available:', error.message)
        setWishlistCount(0)
      }
    } catch (error) {
      console.error('Failed to load account data:', error)
      toast.error('Failed to load account information. Please try refreshing the page.')
    } finally {
      setLoading(false)
    }
  }, [user, toast])

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    
    // Wait for user to be loaded
    if (!user) {
      console.log('Account: Waiting for user to load...')
      return
    }
    
    // Admin should use the admin dashboard, not the account page
    if (isAdmin) {
      console.log('Account: User is admin, redirecting to admin dashboard')
      navigate('/admin')
      return
    }
    
    // Load data for regular users
    console.log('Account: Loading data for regular user:', user.email)
    loadData()
  }, [isAuthenticated, navigate, user, isAdmin, loadData])

  // Load product details for order items
  useEffect(() => {
    const loadProductDetails = async () => {
      if (orders.length === 0) return
      
      try {
        // Collect all unique product IDs from orders
        const productIds = new Set()
        orders.forEach(order => {
          if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
              if (item.product_id) productIds.add(item.product_id)
            })
          }
        })

        if (productIds.size === 0) return

        // Fetch product details for each product ID
        const productPromises = Array.from(productIds).map(async (id) => {
          try {
            const res = await productsAPI.getProduct(id)
            return { id, product: res.data }
          } catch (error) {
            console.error(`Failed to load product ${id}:`, error)
            return { id, product: null }
          }
        })

        const productResults = await Promise.all(productPromises)
        const productsMap = {}
        productResults.forEach(({ id, product }) => {
          if (product) productsMap[id] = product
        })
        setProducts(productsMap)
      } catch (error) {
        console.error('Error loading product details:', error)
      }
    }

    loadProductDetails()
  }, [orders])

  const getTotalSpent = () => {
    return orders.reduce(
      (sum, order) => sum + (order.subtotal || 0) + (order.delivery_fee || 0),
      0
    )
  }


  // Map internal order IDs to per-customer sequential numbers (1, 2, 3, ...)
  const orderDisplayNumbers = useMemo(() => {
    if (!orders || orders.length === 0) return {}
    // Sort by created_at ascending so the earliest order is #1
    const sorted = [...orders].sort((a, b) => {
      const dateA = a.created_at ? parseBackendDate(a.created_at) : null
      const dateB = b.created_at ? parseBackendDate(b.created_at) : null
      const safeA = dateA || new Date(0)
      const safeB = dateB || new Date(0)
      return safeA - safeB
    })
    const map = {}
    sorted.forEach((order, index) => {
      if (order && order.id != null) {
        map[order.id] = index + 1
      }
    })
    return map
  }, [orders])

  // Filter and sort orders for display
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = [...orders]

    // Apply filters
    if (filterStatus === 'recent') {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      filtered = filtered.filter(order => {
        if (!order.created_at) return false
        const d = parseBackendDate(order.created_at)
        return d ? d >= sevenDaysAgo : false
      })
    } else if (filterStatus === 'thisMonth') {
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)
      filtered = filtered.filter(order => {
        if (!order.created_at) return false
        const d = parseBackendDate(order.created_at)
        return d ? d >= startOfMonth : false
      })
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        const dateA = a.created_at ? parseBackendDate(a.created_at) : null
        const dateB = b.created_at ? parseBackendDate(b.created_at) : null
        const safeA = dateA || new Date(0)
        const safeB = dateB || new Date(0)
        return safeB - safeA
      } else if (sortBy === 'oldest') {
        const dateA = a.created_at ? parseBackendDate(a.created_at) : null
        const dateB = b.created_at ? parseBackendDate(b.created_at) : null
        const safeA = dateA || new Date(0)
        const safeB = dateB || new Date(0)
        return safeA - safeB
      } else if (sortBy === 'amount') {
        const totalA = (a.subtotal || 0) + (a.delivery_fee || 0)
        const totalB = (b.subtotal || 0) + (b.delivery_fee || 0)
        return totalB - totalA
      }
      return 0
    })

    return filtered
  }, [orders, sortBy, filterStatus])

  const getProductName = (productId) => {
    if (!productId) return 'Unknown Product'
    return products[productId]?.name || `Product #${productId}`
  }

  const getProductImage = (productId) => {
    if (!productId) return '/placeholder.png'
    return products[productId]?.image || '/placeholder.png'
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Date unknown'
    // Show full date and time in Rwanda timezone
    return formatDateTimeRwanda(dateString, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isAuthenticated) {
    return null
  }

  // Wait for user to load
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading user information...</p>
        </div>
      </div>
    )
  }

  // Redirect admin (should have been done in useEffect, but double-check here)
  if (isAdmin) {
    return null // Will redirect in useEffect
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <OrderCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const totalSpent = getTotalSpent()

  const statCards = [
    {
      title: 'Total Orders',
      value: filteredAndSortedOrders.length || orders.length,
      icon: ShoppingBag,
      color: 'bg-blue-500',
      description: orders.length > 0 ? 'Your orders' : 'No orders yet',
    },
    {
      title: 'Total Spent',
      value: `${totalSpent.toLocaleString()} RWF`,
      icon: DollarSign,
      color: 'bg-green-500',
      description: 'Lifetime value',
    },
    {
      title: 'Wishlist Items',
      value: wishlistCount,
      icon: Heart,
      color: 'bg-red-500',
      link: '/wishlist',
      description: 'Saved items',
    },
    {
      title: 'Account Status',
      value: 'Active',
      icon: User,
      color: 'bg-purple-500',
      description: user?.email,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              My Account
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Welcome back, {user?.email}
            </p>
          </div>
          <Link
            to="/profile"
            className="btn-outline flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px]"
          >
            <Settings className="w-4 h-4" />
            Manage Profile
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {statCards.map((stat) => {
            const CardContent = (
              <div className="card p-4 sm:p-6 hover:shadow-soft transition-all group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {stat.description}
                    </p>
                  </div>
                  <div
                    className={`${stat.color} p-2.5 sm:p-3 rounded-lg text-white group-hover:scale-110 transition-transform`}
                  >
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </div>
            )

            return stat.link ? (
              <Link key={stat.title} to={stat.link}>
                {CardContent}
              </Link>
            ) : (
              <div key={stat.title}>{CardContent}</div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Link
            to="/wishlist"
            className="card p-5 sm:p-8 hover:shadow-soft transition-all group"
          >
            <Heart className="w-12 h-12 text-accent mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              My Wishlist
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              View and manage your saved items
            </p>
          </Link>

          <div className="card p-5 sm:p-8">
            <User className="w-12 h-12 text-accent mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Profile Settings
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Email: {user?.email}
            </p>
          </div>
        </div>

        {/* Order History */}
        <div className="card p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-5 sm:mb-6">
            <div className="flex items-center gap-3">
              <Package className="w-6 h-6 text-accent" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Order History
              </h2>
            </div>
            {orders.length > 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {filteredAndSortedOrders.length} of {orders.length} {orders.length === 1 ? 'order' : 'orders'}
              </p>
            )}
          </div>

          {/* Filters and Sort */}
          {orders.length > 0 && (
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="input-field text-sm py-2 px-3 w-full sm:w-auto"
                >
                  <option value="all">All Orders</option>
                  <option value="recent">Last 7 Days</option>
                  <option value="thisMonth">This Month</option>
                </select>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <ArrowUpDown className="w-4 h-4 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-field text-sm py-2 px-3 w-full sm:w-auto"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="amount">Highest Amount</option>
                </select>
              </div>
            </div>
          )}

          {orders.length === 0 ? (
            <EmptyOrders />
          ) : filteredAndSortedOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                No orders match your filters.
              </p>
              <button
                onClick={() => {
                  setFilterStatus('all')
                  setSortBy('newest')
                }}
                className="text-accent hover:underline mt-4"
              >
                Clear filters →
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedOrders.map((order) => {
                const total = (order.subtotal || 0) + (order.delivery_fee || 0)
                const itemCount = order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0
                const displayNumber = orderDisplayNumbers[order.id] || order.id
                return (
                  <div
                    key={order.id}
                    className="p-4 sm:p-5 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700 hover:border-accent/30"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                          <p className="font-bold text-lg text-gray-900 dark:text-white">
                            Order #{displayNumber}
                          </p>
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full">
                            Completed
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(order.created_at)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            {itemCount} {itemCount === 1 ? 'item' : 'items'}
                          </div>
                          {order.delivery_option && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {order.delivery_option}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-left sm:text-right sm:ml-4">
                        <p className="font-bold text-xl text-gray-900 dark:text-white mb-2">
                          {total.toLocaleString()} RWF
                        </p>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-sm text-accent hover:text-accent-darker font-medium flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                      </div>
                    </div>
                    
                    {/* Order Items Preview */}
                    {order.items && Array.isArray(order.items) && order.items.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2">
                          {order.items.slice(0, 4).map((item, idx) => {
                            if (!item || !item.product_id) return null
                            return (
                              <div key={idx} className="flex-shrink-0 flex items-center gap-2">
                                <img
                                  src={getProductImage(item.product_id)}
                                  alt={getProductName(item.product_id)}
                                  className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg"
                                  onError={(e) => {
                                    e.target.src = '/placeholder.png'
                                  }}
                                />
                                <div className="min-w-0">
                                  <p className="text-xs font-medium text-gray-900 dark:text-white truncate max-w-[100px]">
                                    {getProductName(item.product_id)}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Qty: {item.quantity || 0}
                                  </p>
                                </div>
                              </div>
                            )
                          })}
                          {order.items.length > 4 && (
                            <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg">
                              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                +{order.items.length - 4}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50">
            <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Order #{orderDisplayNumbers[selectedOrder.id] || selectedOrder.id}
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl sm:text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Customer
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedOrder.customer_name || 'Guest'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Phone
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedOrder.customer_phone || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Channel
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedOrder.channel || 'store'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Delivery
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedOrder.delivery_option || 'N/A'}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Items ({selectedOrder.items?.length || 0})
                  </p>
                  <div className="space-y-3">
                    {selectedOrder.items && Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((item, idx) => {
                        if (!item || !item.product_id) return null
                        const product = products[item.product_id]
                        return (
                          <div
                            key={idx}
                            className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                          >
                            <img
                              src={getProductImage(item.product_id)}
                              alt={getProductName(item.product_id)}
                              className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0"
                              onError={(e) => {
                                e.target.src = '/placeholder.png'
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 dark:text-white mb-1">
                                {getProductName(item.product_id)}
                              </p>
                              {product?.category && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                  {product.category}
                                </p>
                              )}
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Quantity: <span className="font-medium">{item.quantity || 0}</span> ×{' '}
                                  <span className="font-medium">{(item.unit_price || 0).toLocaleString()} RWF</span>
                                </p>
                                <p className="font-bold text-gray-900 dark:text-white">
                                  {((item.quantity || 0) * (item.unit_price || 0)).toLocaleString()} RWF
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-sm">No items found in this order</p>
                    )}
                  </div>
                </div>

                {/* Order Tracking */}
                {selectedOrder?.id && (
                  <div className="mb-6">
                    <OrderTracking orderId={selectedOrder.id} />
                  </div>
                )}

                <div className="border-t border-gray-200 dark:border-gray-800 pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Subtotal
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {(selectedOrder.subtotal || 0).toLocaleString()} RWF
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Delivery Fee
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {(selectedOrder.delivery_fee || 0).toLocaleString()} RWF
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-800 pt-2">
                    <span>Total</span>
                    <span>
                      {(
                        (selectedOrder.subtotal || 0) +
                        (selectedOrder.delivery_fee || 0)
                      ).toLocaleString()}{' '}
                      RWF
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Account

