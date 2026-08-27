import { createContext, useContext, useState, useCallback } from 'react'
import Toast from '../components/Toast'

const ToastContext = createContext()

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'info', duration = 5000, options = {}) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type, duration, ...options }])
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const success = useCallback((message, duration, options) => {
    return showToast(message, 'success', duration, options)
  }, [showToast])

  const error = useCallback((message, duration) => {
    return showToast(message, 'error', duration)
  }, [showToast])

  const warning = useCallback((message, duration) => {
    return showToast(message, 'warning', duration)
  }, [showToast])

  const info = useCallback((message, duration) => {
    return showToast(message, 'info', duration)
  }, [showToast])

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[9999] flex flex-col gap-3 sm:gap-4 pointer-events-none px-4 sm:px-0 max-w-[calc(100vw-2rem)] sm:max-w-md" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
        {toasts.map((toast, index) => (
          <div 
            key={toast.id} 
            className="pointer-events-auto"
            style={{
              animationDelay: `${index * 0.1}s`
            }}
          >
            <Toast
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              image={toast.image}
              productName={toast.productName}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(120%) scale(0.9);
            opacity: 0;
          }
          to {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }
        @keyframes slide-out-right {
          from {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
          to {
            transform: translateX(120%) scale(0.9);
            opacity: 0;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-slide-out-right {
          animation: slide-out-right 0.3s cubic-bezier(0.4, 0, 1, 1);
        }
      `}</style>
    </ToastContext.Provider>
  )
}

