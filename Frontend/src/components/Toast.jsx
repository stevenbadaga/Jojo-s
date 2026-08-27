import { X, CheckCircle, AlertCircle, Info, XCircle, ShoppingCart } from 'lucide-react'
import { useEffect, useState } from 'react'

const Toast = ({ message, type = 'info', onClose, duration = 5000, image, productName }) => {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (duration > 0) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - (100 / (duration / 100))
          if (newProgress <= 0) {
            onClose()
            return 0
          }
          return newProgress
        })
      }, 100)

      return () => clearInterval(interval)
    }
  }, [duration, onClose])

  const icons = {
    success: <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2.5} />,
    error: <XCircle className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2.5} />,
    warning: <AlertCircle className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2.5} />,
    info: <Info className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2.5} />,
  }

  const iconBgColors = {
    success: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30',
    error: 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30',
    warning: 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30',
    info: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30',
  }

  const iconColors = {
    success: 'text-green-600 dark:text-green-400',
    error: 'text-red-600 dark:text-red-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    info: 'text-blue-600 dark:text-blue-400',
  }

  const bgColors = {
    success: 'bg-white dark:bg-gray-900 border-green-400 dark:border-green-600 shadow-2xl shadow-green-500/25 dark:shadow-green-500/15',
    error: 'bg-white dark:bg-gray-900 border-red-400 dark:border-red-600 shadow-2xl shadow-red-500/25 dark:shadow-red-500/15',
    warning: 'bg-white dark:bg-gray-900 border-yellow-400 dark:border-yellow-600 shadow-2xl shadow-yellow-500/25 dark:shadow-yellow-500/15',
    info: 'bg-white dark:bg-gray-900 border-blue-400 dark:border-blue-600 shadow-2xl shadow-blue-500/25 dark:shadow-blue-500/15',
  }

  const textColors = {
    success: 'text-gray-900 dark:text-gray-100',
    error: 'text-gray-900 dark:text-gray-100',
    warning: 'text-gray-900 dark:text-gray-100',
    info: 'text-gray-900 dark:text-gray-100',
  }

  const progressColors = {
    success: 'bg-gradient-to-r from-green-500 to-emerald-500',
    error: 'bg-gradient-to-r from-red-500 to-rose-500',
    warning: 'bg-gradient-to-r from-yellow-500 to-amber-500',
    info: 'bg-gradient-to-r from-blue-500 to-cyan-500',
  }

  const isCartNotification = type === 'success' && image

  return (
    <div
      className={`relative flex items-start sm:items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl border-2 min-w-[280px] sm:min-w-[320px] max-w-[calc(100vw-2rem)] sm:max-w-md animate-slide-in-right backdrop-blur-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] sm:active:scale-100 ${bgColors[type]}`}
      role="alert"
    >
      {/* Progress Bar */}
      {duration > 0 && (
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-200/50 dark:bg-gray-700/50 rounded-t-2xl overflow-hidden">
          <div
            className={`h-full transition-all duration-100 ease-linear ${progressColors[type]}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Icon Container (if no image) */}
      {!isCartNotification && (
        <div className={`flex-shrink-0 p-2.5 sm:p-3 rounded-xl ${iconBgColors[type]} ${iconColors[type]} shadow-sm min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center`}>
          {icons[type]}
        </div>
      )}

      {/* Product Image (for cart notifications) */}
      {isCartNotification && (
        <div className="flex-shrink-0 relative">
          <img
            src={image}
            alt={productName || 'Product'}
            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg"
            onError={(e) => {
              e.target.src = '/placeholder.png'
            }}
          />
          <div className="absolute -top-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 shadow-lg">
            <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" strokeWidth={3} />
          </div>
        </div>
      )}

      {/* Message */}
      <div className="flex-1 min-w-0 pt-0.5">
        {isCartNotification && (
          <div className="flex items-center gap-1.5 mb-1.5 sm:mb-2">
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">
              Added to Cart
            </span>
          </div>
        )}
        <p className={`text-sm sm:text-base md:text-lg font-bold ${textColors[type]} leading-snug sm:leading-tight break-words`}>
          {message}
        </p>
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="flex-shrink-0 p-2 sm:p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 rounded-lg transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center touch-manipulation"
        aria-label="Close"
      >
        <X className="w-5 h-5 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400" />
      </button>
    </div>
  )
}

export default Toast

