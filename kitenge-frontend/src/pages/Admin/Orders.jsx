import { useState, useEffect } from 'react'
import { ordersAPI, productsAPI } from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { Link } from 'react-router-dom'
import { Search, Trash2, Eye, Edit, Save, X, ShoppingBag, Calendar, TrendingUp, DollarSign, ChevronDown, Filter, ArrowLeft, Home } from 'lucide-react'
import AdminSidebar from '../../components/AdminSidebar'
import { getImageUrl } from '../../utils/imageUtils'
import { formatDateRwanda, formatDateTimeRwanda, getRwandaDateKey, parseBackendDate } from '../../utils/dateTime'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [timeFilter, setTimeFilter] = useState('all') // 'all', 'today', 'week', 'month'
  const [showTimeFilter, setShowTimeFilter] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [editingStatus, setEditingStatus] = useState(false)
  const [statusForm, setStatusForm] = useState({ status: '', trackingNumber: '' })
  const [productImages, setProductImages] = useState({}) // Store product images by productId
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, orderId: null, orderNumber: null })
  const toast = useToast()

  useEffect(() => {
    loadOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, searchQuery, timeFilter])

  const loadOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await ordersAPI.getAllOrders()
      // Ensure we always have an array
      const ordersData = Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : [])
      setOrders(ordersData)
      setFilteredOrders(ordersData)
      
      // Load product images for order items
      await loadProductImages(ordersData)
    } catch (error) {
      console.error('Failed to load orders:', error)
      setError('Failed to load orders. Please try refreshing the page.')
      toast.error('Failed to load orders. Please try again.')
      setOrders([])
      setFilteredOrders([])
    } finally {
      setLoading(false)
    }
  }

  const loadProductImages = async (ordersData) => {
    try {
      // Collect all unique product IDs from orders
      const productIds = new Set()
      ordersData.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach(item => {
            const productId = item.productId || item.product_id
            if (productId) productIds.add(productId)
          })
        }
      })

      // Fetch product details for each product ID
      const imageMap = {}
      for (const productId of productIds) {
        try {
          const productRes = await productsAPI.getProduct(productId)
          if (productRes.data?.image) {
            imageMap[productId] = productRes.data.image
          }
        } catch (err) {
          console.error(`Failed to load product ${productId}:`, err)
        }
      }
      setProductImages(imageMap)
    } catch (error) {
      console.error('Failed to load product images:', error)
    }
  }

  const getFirstProductImage = (order) => {
    if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
      return null
    }
    const firstItem = order.items[0]
    const productId = firstItem.productId || firstItem.product_id
    return productImages[productId] || null
  }

  const filterOrders = () => {
    // Ensure orders is an array before filtering
    if (!Array.isArray(orders)) {
      setFilteredOrders([])
      return
    }
    let filtered = [...orders]
    
    // Apply time filter
    if (timeFilter !== 'all') {
      const now = new Date()
      const todayKey = getRwandaDateKey(now)
      filtered = filtered.filter((o) => {
        const createdAt = o?.createdAt || o?.created_at
        if (!createdAt) return false
        const orderDate = parseBackendDate(createdAt)
        if (!orderDate) return false
        
        switch (timeFilter) {
          case 'today':
            return getRwandaDateKey(orderDate) === todayKey
          case 'week':
            const weekAgo = new Date(now)
            weekAgo.setDate(now.getDate() - 7)
            return orderDate >= weekAgo
          case 'month':
            const monthAgo = new Date(now)
            monthAgo.setMonth(now.getMonth() - 1)
            return orderDate >= monthAgo
          default:
            return true
        }
      })
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (o) => {
          const customerName = (o?.customerName || o?.customer_name || '').toLowerCase()
          const customerPhone = (o?.customerPhone || o?.customer_phone || '').toLowerCase()
          const orderNumber = (o?.orderNumber || o?.order_number || o?.id || '').toString()
          return (
            orderNumber.includes(query) ||
            customerName.includes(query) ||
            customerPhone.includes(query)
          )
        }
      )
    }
    
    setFilteredOrders(filtered)
  }

  const getTimeFilterLabel = () => {
    switch (timeFilter) {
      case 'today':
        return 'Today'
      case 'week':
        return 'This Week'
      case 'month':
        return 'This Month'
      default:
        return 'All Orders'
    }
  }

  // Group orders by month and week
  const groupOrdersByMonthAndWeek = (orders) => {
    const grouped = {}
    
    orders.forEach(order => {
      const createdAt = order.createdAt || order.created_at
      if (!createdAt) return
      
      const date = parseBackendDate(createdAt)
      const dateKey = getRwandaDateKey(date)
      if (!dateKey) return

      const [yearStr, monthStr, dayStr] = dateKey.split('-')
      const year = parseInt(yearStr, 10)
      const monthIndex = parseInt(monthStr, 10) - 1 // 0-11
      const dayOfMonth = parseInt(dayStr, 10)

      const monthKey = `${yearStr}-${monthStr}` // e.g., "2024-01"
      
      // Calculate week number within the month (1-5)
      const firstDay = new Date(Date.UTC(year, monthIndex, 1))
      const firstDayOfWeek = firstDay.getUTCDay() // 0-6 (Sunday = 0)
      const weekNumber = Math.ceil((dayOfMonth + firstDayOfWeek) / 7)
      
      if (!grouped[monthKey]) {
        grouped[monthKey] = {}
      }
      
      const weekKey = `Week ${weekNumber}`
      if (!grouped[monthKey][weekKey]) {
        grouped[monthKey][weekKey] = []
      }
      
      grouped[monthKey][weekKey].push(order)
    })
    
    // Sort months (newest first)
    const sortedMonths = Object.keys(grouped).sort((a, b) => b.localeCompare(a))
    
    // Sort weeks within each month (newest first)
    sortedMonths.forEach(monthKey => {
      const weeks = Object.keys(grouped[monthKey])
      weeks.sort((a, b) => {
        const weekNumA = parseInt(a.replace('Week ', ''))
        const weekNumB = parseInt(b.replace('Week ', ''))
        return weekNumB - weekNumA
      })
      
      // Sort orders within each week (newest first)
      weeks.forEach(weekKey => {
        grouped[monthKey][weekKey].sort((a, b) => {
          const dateA = parseBackendDate(a.createdAt || a.created_at) || new Date(0)
          const dateB = parseBackendDate(b.createdAt || b.created_at) || new Date(0)
          return dateB - dateA
        })
      })
    })
    
    return { grouped, sortedMonths }
  }

  // Get month name from key (e.g., "2024-01" -> "January 2024")
  const getMonthName = (monthKey) => {
    const [year, month] = monthKey.split('-')
    const date = new Date(Date.UTC(parseInt(year, 10), parseInt(month, 10) - 1, 1))
    return formatDateRwanda(date, { month: 'long', year: 'numeric' })
  }

  const getStatusBadgeClasses = (status) => {
    const normalized = (status || 'PENDING').toUpperCase()
    if (normalized === 'DELIVERED') {
      return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
    }
    if (normalized === 'SHIPPED') {
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
    }
    if (normalized === 'PROCESSING' || normalized === 'CONFIRMED') {
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
    }
    if (normalized === 'CANCELLED') {
      return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
    }
    return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
  }

  // Get order number with month/year context
  const getOrderNumberDisplay = (order) => {
    const orderNumber = order.orderNumber || order.order_number || order.id
    const createdAt = order.createdAt || order.created_at
    if (!createdAt) return `#${orderNumber}`
    
    const monthYear = formatDateRwanda(createdAt, { month: 'short', year: 'numeric' })
    return `#${orderNumber} (${monthYear})`
  }

  const handleDeleteClick = (order) => {
    const orderNumber = order.orderNumber || order.order_number || order.id
    setDeleteConfirm({ show: true, orderId: order.id, orderNumber: orderNumber })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.orderId) return
    
    try {
      await ordersAPI.deleteOrder(deleteConfirm.orderId)
      loadOrders()
      if (selectedOrder?.id === deleteConfirm.orderId) {
        setSelectedOrder(null)
      }
      toast.success('Order deleted successfully')
      setDeleteConfirm({ show: false, orderId: null, orderNumber: null })
    } catch (error) {
      console.error('Failed to delete order:', error)
      toast.error('Failed to delete order')
      setDeleteConfirm({ show: false, orderId: null, orderNumber: null })
    }
  }

  const handleDeleteCancel = () => {
    setDeleteConfirm({ show: false, orderId: null, orderNumber: null })
  }

  const handleStatusUpdate = async (e) => {
    e.preventDefault()
    if (!selectedOrder?.id) return
    
    try {
      await ordersAPI.updateOrderStatus(
        selectedOrder.id,
        statusForm.status,
        statusForm.trackingNumber
      )
      toast.success('Order status updated successfully!')
      setEditingStatus(false)
      
      // Reload orders list
      await loadOrders()
      
      // Fetch full order details again to update the modal
      try {
        const response = await ordersAPI.getOrder(selectedOrder.id)
        const fullOrder = response.data?.order || response.data
        if (fullOrder) {
          setSelectedOrder(fullOrder)
        }
      } catch (err) {
        // Fallback to finding in updated orders list
        const updatedOrder = orders.find((o) => o.id === selectedOrder.id)
        if (updatedOrder) {
          setSelectedOrder(updatedOrder)
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update order status')
    }
  }

  const openStatusEdit = () => {
    const status = selectedOrder.status || selectedOrder.Status || 'PENDING'
    const trackingNumber = selectedOrder.trackingNumber || selectedOrder.tracking_number || ''
    setStatusForm({
      status: status,
      trackingNumber: trackingNumber,
    })
    setEditingStatus(true)
  }

  const handleViewOrder = async (order) => {
    try {
      // Fetch full order details with items
      const response = await ordersAPI.getOrder(order.id)
      const fullOrder = response.data?.order || response.data || order
      setSelectedOrder(fullOrder)
    } catch (error) {
      console.error('Failed to load order details:', error)
      // Fallback to the order from the list
      setSelectedOrder(order)
      toast.error('Failed to load full order details')
    }
  }

  const getTotalRevenue = () => {
    if (!Array.isArray(orders)) return 0
    return orders.reduce(
      (sum, o) => {
        const subtotal = o?.subtotal || 0
        const deliveryFee = o?.delivery_fee || o?.deliveryFee || 0
        return sum + subtotal + deliveryFee
      },
      0
    )
  }

  const getTodayOrders = () => {
    if (!Array.isArray(orders)) return 0
    const todayKey = getRwandaDateKey(new Date())
    return orders.filter((o) => {
      const createdAt = o?.createdAt || o?.created_at
      if (!createdAt) return false
      const orderDate = parseBackendDate(createdAt)
      return orderDate ? getRwandaDateKey(orderDate) === todayKey : false
    }).length
  }

  const getThisMonthOrders = () => {
    if (!Array.isArray(orders)) return 0
    const nowKey = getRwandaDateKey(new Date())
    const currentMonthKey = nowKey ? nowKey.slice(0, 7) : null // YYYY-MM
    return orders.filter((o) => {
      const createdAt = o?.createdAt || o?.created_at
      if (!createdAt) return false
      const orderKey = getRwandaDateKey(createdAt)
      return currentMonthKey && orderKey ? orderKey.startsWith(currentMonthKey) : false
    }).length
  }

  const getThisYearOrders = () => {
    if (!Array.isArray(orders)) return 0
    const nowKey = getRwandaDateKey(new Date())
    const currentYear = nowKey ? nowKey.slice(0, 4) : null
    return orders.filter((o) => {
      const createdAt = o?.createdAt || o?.created_at
      if (!createdAt) return false
      const orderKey = getRwandaDateKey(createdAt)
      return currentYear && orderKey ? orderKey.startsWith(currentYear) : false
    }).length
  }

  const getThisMonthRevenue = () => {
    if (!Array.isArray(orders)) return 0
    const nowKey = getRwandaDateKey(new Date())
    const currentMonthKey = nowKey ? nowKey.slice(0, 7) : null // YYYY-MM
    return orders
      .filter((o) => {
        const createdAt = o?.createdAt || o?.created_at
        if (!createdAt) return false
        const orderKey = getRwandaDateKey(createdAt)
        return currentMonthKey && orderKey ? orderKey.startsWith(currentMonthKey) : false
      })
      .reduce((sum, o) => {
        const subtotal = o?.subtotal || 0
        const deliveryFee = o?.delivery_fee || o?.deliveryFee || 0
        return sum + subtotal + deliveryFee
      }, 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading orders...</p>
        </div>
      </div>
    )
  }

  if (error && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button onClick={loadOrders} className="btn-primary">
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

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

        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Orders
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            View incoming customer orders and their details.
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-8">
          <div className="card p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <ShoppingBag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">
              Total Orders
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {Array.isArray(orders) ? orders.length : 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              All time
            </p>
          </div>
          <div className="card p-4 sm:p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">
              Orders Today
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {getTodayOrders()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Since midnight
            </p>
          </div>
          <div className="card p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">
              Orders This Month
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {getThisMonthOrders()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Current month
            </p>
          </div>
          <div className="card p-4 sm:p-6 bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-800/20 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">
              Orders This Year
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {getThisYearOrders()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Current year
            </p>
          </div>
          <div className="card p-4 sm:p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">
              Revenue
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {getTotalRevenue().toLocaleString()} RWF
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Subtotal + delivery (all)
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, phone or ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          
          {/* Time Filter Dropdown */}
          <div className="relative w-full sm:w-auto">
            <button
              onClick={() => setShowTimeFilter(!showTimeFilter)}
              className="flex w-full sm:w-auto items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors min-w-[160px] justify-between"
            >
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span className="font-medium">{getTimeFilterLabel()}</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${showTimeFilter ? 'rotate-180' : ''}`} />
            </button>
            
            {showTimeFilter && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowTimeFilter(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 overflow-hidden">
                  <button
                    onClick={() => {
                      setTimeFilter('all')
                      setShowTimeFilter(false)
                    }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      timeFilter === 'all' 
                        ? 'bg-accent/10 text-accent font-medium' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    All Orders
                  </button>
                  <button
                    onClick={() => {
                      setTimeFilter('today')
                      setShowTimeFilter(false)
                    }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      timeFilter === 'today' 
                        ? 'bg-accent/10 text-accent font-medium' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => {
                      setTimeFilter('week')
                      setShowTimeFilter(false)
                    }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      timeFilter === 'week' 
                        ? 'bg-accent/10 text-accent font-medium' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    This Week
                  </button>
                  <button
                    onClick={() => {
                      setTimeFilter('month')
                      setShowTimeFilter(false)
                    }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      timeFilter === 'month' 
                        ? 'bg-accent/10 text-accent font-medium' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    This Month
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Orders Table - Grouped by Month and Week */}
        <div className="space-y-6">
          {filteredOrders.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery ? 'No orders found matching your search.' : 'No orders yet.'}
              </p>
            </div>
          ) : (() => {
            const { grouped, sortedMonths } = groupOrdersByMonthAndWeek(filteredOrders)
            
            return sortedMonths.map((monthKey) => {
              const monthName = getMonthName(monthKey)
              const weeks = Object.keys(grouped[monthKey]).sort((a, b) => {
                const weekNumA = parseInt(a.replace('Week ', ''))
                const weekNumB = parseInt(b.replace('Week ', ''))
                return weekNumB - weekNumA
              })
              
              return (
                <div key={monthKey} className="card overflow-hidden">
                  {/* Month Header */}
                  <div className="bg-gradient-to-r from-accent/10 to-accent/5 border-b border-accent/20 px-4 sm:px-6 py-3 sm:py-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-accent" />
                      {monthName}
                    </h3>
                  </div>
                  
                  {weeks.map((weekKey) => {
                    const weekOrders = grouped[monthKey][weekKey]
                    
                    return (
                      <div key={weekKey} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                        {/* Week Header */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 px-4 sm:px-6 py-2.5 sm:py-3">
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {weekKey} ({weekOrders.length} {weekOrders.length === 1 ? 'order' : 'orders'})
                          </h4>
                        </div>
                        
                        {/* Orders Table for this Week */}
                        <div className="sm:hidden divide-y divide-gray-200 dark:divide-gray-800">
                          {weekOrders.map((order) => {
                            const total =
                              (order.subtotal || 0) + (order.delivery_fee || order.deliveryFee || 0)
                            const customerName = order.customerName || order.customer_name
                            const customerPhone = order.customerPhone || order.customer_phone
                            const createdAt = order.createdAt || order.created_at
                            const deliveryLocation = order.deliveryLocation || order.delivery_location
                            const deliveryOption = order.deliveryOption || order.delivery_option
                            const displayName = customerName || 'Unknown'
                            const formattedDate = createdAt
                              ? formatDateTimeRwanda(createdAt, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : '-'
                            const productImage = getFirstProductImage(order)
                            const imageUrl = productImage ? getImageUrl(productImage) : '/placeholder.png'
                            const statusLabel = order.status || order.Status || 'PENDING'
                            const statusClasses = getStatusBadgeClasses(statusLabel)

                            return (
                              <div key={order.id} className="p-4 space-y-3">
                                <div className="flex items-start gap-3">
                                  <img
                                    src={imageUrl}
                                    alt="Product"
                                    className="w-14 h-14 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                                    onError={(e) => {
                                      e.target.src = '/placeholder.png'
                                    }}
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {getOrderNumberDisplay(order)}
                                      </p>
                                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {total.toLocaleString()} RWF
                                      </p>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {displayName}
                                      {customerPhone ? ` • ${customerPhone}` : ''}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                      {deliveryOption === 'pickup'
                                        ? 'Pickup'
                                        : deliveryLocation || 'Delivery'}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusClasses}`}>
                                    {statusLabel}
                                  </span>
                                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 capitalize">
                                    {order.channel || 'store'}
                                  </span>
                                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                    {formattedDate}
                                  </span>
                                </div>
                                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                                  <button
                                    onClick={() => handleViewOrder(order)}
                                    className="text-accent hover:text-accent-darker p-2"
                                    aria-label="View order"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteClick(order)}
                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2"
                                    aria-label="Delete order"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                        <div className="hidden sm:block overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                  ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                  Image
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                  Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                  Phone
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                  Channel
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                  Location
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                  Total
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                  Created
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                              {weekOrders.map((order) => {
                                const total =
                                  (order.subtotal || 0) + (order.delivery_fee || order.deliveryFee || 0)
                                // Handle both camelCase and snake_case field names
                                const customerName = order.customerName || order.customer_name
                                const customerPhone = order.customerPhone || order.customer_phone
                                const createdAt = order.createdAt || order.created_at
                                const deliveryLocation = order.deliveryLocation || order.delivery_location
                                const deliveryOption = order.deliveryOption || order.delivery_option
                                
                                // Show the actual customer name as entered, or "Unknown" if missing
                                const displayName = customerName || 'Unknown'
                                
                                // Format date
                                const formattedDate = createdAt
                                  ? formatDateTimeRwanda(createdAt, {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })
                                  : '-'
                                
                                // Get first product image
                                const productImage = getFirstProductImage(order)
                                const imageUrl = productImage ? getImageUrl(productImage) : '/placeholder.png'
                                
                                return (
                                  <tr
                                    key={order.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                                  >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                      {getOrderNumberDisplay(order)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center">
                                        <img
                                          src={imageUrl}
                                          alt="Product"
                                          className="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                                          onError={(e) => {
                                            e.target.src = '/placeholder.png'
                                          }}
                                        />
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                      {displayName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                      {customerPhone || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">
                                      {order.channel || 'store'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                                      {deliveryOption === 'pickup' ? (
                                        <span className="text-gray-400 italic">Pickup</span>
                                      ) : deliveryLocation ? (
                                        <span className="truncate block" title={deliveryLocation}>
                                          {deliveryLocation}
                                        </span>
                                      ) : (
                                        <span className="text-gray-400">-</span>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                      {total.toLocaleString()} RWF
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                      {formattedDate}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                      <div className="flex items-center justify-end gap-2">
                                        <button
                                          onClick={() => handleViewOrder(order)}
                                          className="text-accent hover:text-accent-darker transition-colors"
                                          title="View order details"
                                        >
                                          <Eye className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteClick(order)}
                                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                          title="Delete order"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })
          })()}
        </div>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Order {getOrderNumberDisplay(selectedOrder)}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    ID: {selectedOrder.id}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedOrder(null)
                    setEditingStatus(false)
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {/* Order Status Management */}
                <div className="card p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Order Status
                    </h3>
                    {!editingStatus && (
                      <button
                        onClick={openStatusEdit}
                        className="btn-outline text-sm flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Update Status
                      </button>
                    )}
                  </div>
                  {editingStatus ? (
                    <form onSubmit={handleStatusUpdate} className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Status
                        </label>
                        <select
                          value={statusForm.status}
                          onChange={(e) =>
                            setStatusForm({ ...statusForm, status: e.target.value })
                          }
                          className="input-field"
                          required
                        >
                          <option value="PENDING">Pending</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="PROCESSING">Processing</option>
                          <option value="SHIPPED">Shipped</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Tracking Number (optional)
                        </label>
                        <input
                          type="text"
                          value={statusForm.trackingNumber}
                          onChange={(e) =>
                            setStatusForm({ ...statusForm, trackingNumber: e.target.value })
                          }
                          className="input-field"
                          placeholder="Enter tracking number"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
                          <Save className="w-4 h-4" />
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingStatus(false)
                            setStatusForm({ status: '', trackingNumber: '' })
                          }}
                          className="btn-outline flex items-center justify-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        (selectedOrder.status || selectedOrder.Status) === 'DELIVERED' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                        (selectedOrder.status || selectedOrder.Status) === 'SHIPPED' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                        (selectedOrder.status || selectedOrder.Status) === 'PROCESSING' || (selectedOrder.status || selectedOrder.Status) === 'CONFIRMED' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                        (selectedOrder.status || selectedOrder.Status) === 'CANCELLED' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                        'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
                      }`}>
                        {selectedOrder.status || selectedOrder.Status || 'PENDING'}
                      </span>
                      {(selectedOrder.trackingNumber || selectedOrder.tracking_number) && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          Tracking: <span className="font-mono">{selectedOrder.trackingNumber || selectedOrder.tracking_number}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Customer
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedOrder.customerName || selectedOrder.customer_name || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Phone
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedOrder.customerPhone || selectedOrder.customer_phone || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Channel
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">
                      {selectedOrder.channel || 'store'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Delivery
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedOrder.deliveryOption || selectedOrder.delivery_option || 'N/A'}
                    </p>
                  </div>
                  {(selectedOrder.deliveryOption || selectedOrder.delivery_option) && (selectedOrder.deliveryOption || selectedOrder.delivery_option) !== 'pickup' && (selectedOrder.deliveryLocation || selectedOrder.delivery_location) && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Delivery Location
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white break-words">
                        {selectedOrder.deliveryLocation || selectedOrder.delivery_location}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Items
                  </p>
                  <div className="space-y-2">
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((item, idx) => {
                        const productId = item.productId || item.product_id
                        const productImage = productImages[productId]
                        const imageUrl = productImage 
                          ? getImageUrl(productImage)
                          : '/placeholder.png'
                        const quantity = item.quantity || 0
                        const unitPrice = item.unitPrice || item.unit_price || 0
                        const itemTotal = quantity * unitPrice
                        
                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                          >
                            <img
                              src={imageUrl}
                              alt="Product"
                              className="w-16 h-16 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                              onError={(e) => {
                                e.target.src = '/placeholder.png'
                              }}
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 dark:text-white">
                                Product #{productId}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Qty: {quantity} × {unitPrice.toLocaleString()} RWF
                              </p>
                            </div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {itemTotal.toLocaleString()} RWF
                            </p>
                          </div>
                        )
                      })
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 p-3">
                        No items found
                      </p>
                    )}
                  </div>
                </div>

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
                      {(selectedOrder.deliveryFee || selectedOrder.delivery_fee || 0).toLocaleString()} RWF
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-800 pt-2">
                    <span>Total</span>
                    <span>
                      {(
                        (selectedOrder.subtotal || 0) +
                        (selectedOrder.deliveryFee || selectedOrder.delivery_fee || 0)
                      ).toLocaleString()}{' '}
                      RWF
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteClick(selectedOrder)}
                  className="btn-outline text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full"
                >
                  Delete Order
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl transform transition-all">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30">
                <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
                Delete Order?
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                Are you sure you want to delete order <span className="font-semibold text-gray-900 dark:text-white">#{deleteConfirm.orderNumber}</span>? 
                <br />
                <span className="text-sm text-red-600 dark:text-red-400">This action cannot be undone.</span>
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteCancel}
                  className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors shadow-lg hover:shadow-xl"
                >
                  Delete Order
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}

export default Orders
