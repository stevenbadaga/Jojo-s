import { useState, useEffect, useMemo } from 'react'
import { Package, CheckCircle, Clock, Truck, XCircle } from 'lucide-react'
import { ordersAPI } from '../services/api'
import { formatDateTimeRwanda } from '../utils/dateTime'

const OrderTracking = ({ orderId, orderNumber, phone, pollIntervalMs = 15000, emptyMessage = null }) => {
  const [trackingInfo, setTrackingInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)

  const canTrack = useMemo(() => {
    return Boolean(orderId || (orderNumber && phone))
  }, [orderId, orderNumber, phone])

  useEffect(() => {
    if (canTrack) {
      loadTrackingInfo(true)
    }
  }, [orderId, orderNumber, phone, canTrack])

  useEffect(() => {
    if (!canTrack) return
    const interval = setInterval(() => {
      loadTrackingInfo(false)
    }, pollIntervalMs)
    return () => clearInterval(interval)
  }, [orderId, orderNumber, phone, pollIntervalMs, canTrack])

  const loadTrackingInfo = async (showLoading) => {
    try {
      if (showLoading) {
        setLoading(true)
      }
      const response = orderId
        ? await ordersAPI.trackOrder(orderId)
        : await ordersAPI.trackOrderByNumber(orderNumber, phone)
      setTrackingInfo(response.data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to load tracking info:', error)
      // Don't show error toast - just handle gracefully
      // The order might not have tracking info yet
      setTrackingInfo(null)
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'DELIVERED':
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case 'SHIPPED':
        return <Truck className="w-6 h-6 text-blue-500" />
      case 'PROCESSING':
      case 'CONFIRMED':
        return <Package className="w-6 h-6 text-yellow-500" />
      case 'CANCELLED':
        return <XCircle className="w-6 h-6 text-red-500" />
      default:
        return <Clock className="w-6 h-6 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
      case 'SHIPPED':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
      case 'PROCESSING':
      case 'CONFIRMED':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
      case 'CANCELLED':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
    }
  }

  const getStatusSteps = (status) => {
    const steps = [
      { key: 'PENDING', label: 'Order Placed', completed: true },
      { key: 'CONFIRMED', label: 'Confirmed', completed: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(status) },
      { key: 'PROCESSING', label: 'Processing', completed: ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(status) },
      { key: 'SHIPPED', label: 'Shipped', completed: ['SHIPPED', 'DELIVERED'].includes(status) },
      { key: 'DELIVERED', label: 'Delivered', completed: status === 'DELIVERED' },
    ]
    return steps
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    )
  }

  if (!trackingInfo || !trackingInfo.status) {
    // If no tracking info, show basic status if available
    if (emptyMessage) {
      return (
        <div className="card p-6 text-sm text-gray-600 dark:text-gray-400">
          {emptyMessage}
        </div>
      )
    }
    return null
  }

  const status = trackingInfo.status || 'PENDING'
  const steps = getStatusSteps(status)
  const displayNumber = trackingInfo.orderNumber || trackingInfo.orderId

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Order Tracking
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Order #{displayNumber}
          </p>
        </div>
        <div className={`px-4 py-2 rounded-full font-medium ${getStatusColor(status)}`}>
          {status}
        </div>
      </div>
      {lastUpdated && (
        <div className="mb-6 text-xs text-gray-500 dark:text-gray-400">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}

      {/* Tracking Steps */}
      <div className="relative mb-6">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
        <div className="space-y-6">
          {steps.map((step, index) => (
            <div key={step.key} className="relative flex items-start gap-4">
              <div
                className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${
                  step.completed
                    ? 'bg-accent text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}
              >
                {step.completed ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Clock className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 pt-1">
                <p
                  className={`font-medium ${
                    step.completed
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {step.label}
                </p>
                {step.key === status && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Current status
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tracking Details */}
      <div className="border-t border-gray-200 dark:border-gray-800 pt-6 space-y-3">
        {trackingInfo.trackingNumber && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Tracking Number:
            </span>
            <span className="font-mono font-medium text-gray-900 dark:text-white">
              {trackingInfo.trackingNumber}
            </span>
          </div>
        )}
        {trackingInfo.createdAt && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Order Placed:
            </span>
            <span className="text-sm text-gray-900 dark:text-white">
              {formatDateTimeRwanda(trackingInfo.createdAt)}
            </span>
          </div>
        )}
        {trackingInfo.shippedAt && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Shipped:
            </span>
            <span className="text-sm text-gray-900 dark:text-white">
              {formatDateTimeRwanda(trackingInfo.shippedAt)}
            </span>
          </div>
        )}
        {trackingInfo.deliveredAt && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Delivered:
            </span>
            <span className="text-sm text-gray-900 dark:text-white">
              {formatDateTimeRwanda(trackingInfo.deliveredAt)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderTracking

