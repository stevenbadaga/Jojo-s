import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const RETRYABLE_METHODS = new Set(['get', 'head', 'options'])
const RETRY_DELAYS_MS = [500, 1000, 1500, 2500]
const BACKEND_WARNING_COOLDOWN_MS = 10000

let lastBackendWarningAt = 0
let backendStatus = {
  state: 'unknown',
  lastChangeAt: Date.now(),
  lastSuccessAt: 0,
  lastErrorAt: 0,
}

const backendStatusListeners = new Set()

const emitBackendStatus = () => {
  backendStatusListeners.forEach((listener) => listener())
}

const setBackendStatus = (nextState) => {
  const now = Date.now()
  const mergedState = {
    ...backendStatus,
    ...nextState,
  }

  if (mergedState.state !== backendStatus.state) {
    mergedState.lastChangeAt = now
  }

  const changed =
    mergedState.state !== backendStatus.state ||
    mergedState.lastChangeAt !== backendStatus.lastChangeAt ||
    mergedState.lastSuccessAt !== backendStatus.lastSuccessAt ||
    mergedState.lastErrorAt !== backendStatus.lastErrorAt

  if (!changed) {
    return
  }

  backendStatus = mergedState
  emitBackendStatus()
}

const markBackendReady = () => {
  setBackendStatus({
    state: 'ready',
    lastSuccessAt: Date.now(),
  })
}

const markBackendConnecting = () => {
  setBackendStatus({
    state: 'connecting',
  })
}

const markBackendOffline = () => {
  setBackendStatus({
    state: 'offline',
    lastErrorAt: Date.now(),
  })
}

const wait = (delayMs) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, delayMs)
  })

const logBackendWarningOnce = () => {
  if (!import.meta.env.DEV) {
    return
  }

  const now = Date.now()
  if (now - lastBackendWarningAt < BACKEND_WARNING_COOLDOWN_MS) {
    return
  }

  lastBackendWarningAt = now
  console.warn(
    `Backend unavailable at ${API_BASE_URL}. The frontend will keep waiting and retry safe requests automatically.`
  )
}

export const getBackendStatusSnapshot = () => backendStatus

export const subscribeToBackendStatus = (listener) => {
  backendStatusListeners.add(listener)
  return () => {
    backendStatusListeners.delete(listener)
  }
}

export const isBackendConnectionIssue = (error) => {
  if (!error) {
    return false
  }

  if (error.code === 'ERR_CANCELED') {
    return false
  }

  return (
    error.code === 'ERR_NETWORK' ||
    error.code === 'ECONNABORTED' ||
    error.message === 'Network Error' ||
    (!error.response && Boolean(error.request))
  )
}

export const getApiErrorMessage = (error, fallbackMessage) => {
  if (isBackendConnectionIssue(error)) {
    return 'Backend is starting or temporarily unavailable. Please wait a few seconds and try again.'
  }

  return error?.response?.data?.error || fallbackMessage
}

if (import.meta.env.DEV) {
  console.log('API Base URL:', API_BASE_URL)
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('kb_jwt_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    config.__backendRetryCount = config.__backendRetryCount || 0

    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => {
    markBackendReady()
    return response
  },
  async (error) => {
    if (error?.response) {
      markBackendReady()
    }

    if (isBackendConnectionIssue(error)) {
      const config = error.config
      const method = (config?.method || 'get').toLowerCase()
      const retryCount = config?.__backendRetryCount || 0

      if (config && RETRYABLE_METHODS.has(method) && retryCount < RETRY_DELAYS_MS.length) {
        markBackendConnecting()
        config.__backendRetryCount = retryCount + 1
        await wait(RETRY_DELAYS_MS[retryCount])
        return api.request(config)
      }

      markBackendOffline()
      logBackendWarningOnce()
    }

    if (error?.response?.status === 401 || error?.response?.status === 403) {
      localStorage.removeItem('kb_jwt_token')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    if (import.meta.env.DEV && error?.response && error.response.status >= 500) {
      console.error('API Error:', error.response.status, error.response.statusText, error.config?.url)
    }

    return Promise.reject(error)
  }
)

export const authAPI = {
  register: (data) => api.post('/register', data),
  login: (data) => api.post('/login', data),
  checkAuth: () => api.get('/check-auth'),
  forgotPassword: (email) => api.post('/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/reset-password', { token, newPassword }),
  verifyTwoFactor: (email, code) => api.post('/verify-2fa', { email, code }),
  verifyEmail: (token) => api.post('/verify-email', { token }),
  resendVerification: (email) => api.post('/resend-verification', { email }),
}

export const productsAPI = {
  getPublicProducts: () => api.get('/public-products'),
  getAllProducts: () => api.get('/products'),
  getProduct: (id) => api.get(`/products/${id}`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  toggleActive: (id, active) => api.patch(`/products/${id}/active`, { active }),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  uploadImage: (file) => {
    const formData = new FormData()
    formData.append('image', file)
    return api.post('/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

export const ordersAPI = {
  createOrder: (data) => api.post('/orders', data),
  getAllOrders: () => api.get('/orders'),
  getMyOrders: () => api.get('/orders/my-orders'),
  getOrder: (id) => api.get(`/orders/${id}`),
  deleteOrder: (id) => api.delete(`/orders/${id}`),
  trackOrder: (id) => api.get(`/orders/${id}/track`),
  trackOrderByNumber: (orderNumber, phone) =>
    api.post('/orders/track', { orderNumber, phone }),
  updateOrderStatus: (id, status, trackingNumber) =>
    api.put(`/orders/${id}/status`, { status, trackingNumber }),
}

export const statsAPI = {
  getBusinessStats: () => api.get('/stats/business'),
}

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (currentPassword, newPassword) =>
    api.post('/users/change-password', { currentPassword, newPassword }),
  updateTwoFactor: (enabled) => api.put('/users/two-factor', { enabled }),
  uploadProfileImage: (file) => {
    const formData = new FormData()
    formData.append('image', file)
    return api.post('/users/profile-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  deactivateAccount: () => api.post('/users/deactivate'),
  deleteAccount: () => api.delete('/users/me'),
  getAllUsers: () => api.get('/users/all'),
  deleteUser: (userId) => api.delete(`/users/${userId}`),
  getAddresses: () => api.get('/users/addresses'),
  addAddress: (data) => api.post('/users/addresses', data),
  updateAddress: (addressId, data) => api.put(`/users/addresses/${addressId}`, data),
  deleteAddress: (addressId) => api.delete(`/users/addresses/${addressId}`),
  getPreferences: () => api.get('/users/preferences'),
  updatePreferences: (data) => api.put('/users/preferences', data),
  getNotifications: () => api.get('/users/notifications'),
  updateNotifications: (data) => api.put('/users/notifications', data),
}

export const reviewsAPI = {
  getProductReviews: (productId) => api.get(`/reviews/product/${productId}`),
  getProductRating: (productId) => api.get(`/reviews/product/${productId}/rating`),
  createReview: (data) => api.post('/reviews', data),
  deleteReview: (reviewId) => api.delete(`/reviews/${reviewId}`),
}

export const wishlistAPI = {
  getWishlist: () => api.get('/wishlist'),
  toggleWishlist: (productId, action) => api.post('/wishlist', { productId, action }),
}

export const contactAPI = {
  sendMessage: (data) => api.post('/contact', data),
}

export default api
