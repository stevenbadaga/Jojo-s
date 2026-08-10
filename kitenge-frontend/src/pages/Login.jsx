import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { authAPI, getApiErrorMessage, isBackendConnectionIssue, productsAPI } from '../services/api'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { getImageUrl } from '../utils/imageUtils'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [requires2FA, setRequires2FA] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [products, setProducts] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const { login, isAdmin, checkAuth } = useAuth()
  const navigate = useNavigate()

  const loadProducts = async () => {
    try {
      const response = await productsAPI.getPublicProducts()
      const productsWithImages = (response.data || [])
        .filter((product) => product.image && product.image.trim() !== '')
        .slice(0, 8)
      setProducts(productsWithImages)
    } catch (error) {
      if (!isBackendConnectionIssue(error)) {
        console.error('Failed to load products:', error)
      }
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    if (products.length <= 1) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % products.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [products.length])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(email, password)
    setLoading(false)

    if (result.success) {
      if (result.data.requiresTwoFactor) {
        setRequires2FA(true)
      } else {
        const isAdminUser = result.data.isAdmin === true || result.data.admin === true || false
        navigate(isAdminUser ? '/admin' : '/')
      }
    } else {
      let errorMessage = result.error || 'Login failed'
      if (
        errorMessage.toLowerCase().includes('invalid credentials') ||
        errorMessage.toLowerCase().includes('invalid') ||
        errorMessage.toLowerCase().includes('credentials')
      ) {
        errorMessage = 'Invalid credentials'
      } else if (errorMessage.toLowerCase().includes('user not found')) {
        errorMessage = 'User not found'
      } else if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('connection')) {
        errorMessage = 'Backend is starting. Please wait a few seconds and try again.'
      }
      setError(errorMessage)
    }
  }

  const handle2FAVerify = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await authAPI.verifyTwoFactor(email, twoFactorCode)
      if (response.data.token) {
        localStorage.setItem('kb_jwt_token', response.data.token)
        await checkAuth()
        const isAdminUser = response.data.isAdmin === true || response.data.admin === true || isAdmin
        navigate(isAdminUser ? '/admin' : '/')
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Invalid verification code'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100svh-3rem)] lg:min-h-[calc(100svh-4rem)] flex flex-col lg:flex-row">
      <div className="flex-1 flex items-center justify-center px-4 pt-4 pb-14 sm:px-6 sm:pt-6 sm:pb-16 lg:p-8 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="w-full max-w-md lg:mt-0">
          <div className="bg-white/90 dark:bg-gray-900/70 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 rounded-3xl shadow-xl lg:shadow-none lg:bg-transparent lg:dark:bg-transparent lg:border-0 p-6 sm:p-8 lg:p-0">
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-black mb-3 text-gray-900 dark:text-white">
              Hello Again
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 font-medium">
              Your next favourite finds are waiting for you.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 sm:p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1.5 text-sm sm:text-base">
                        Unable to Login
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                        {error.toLowerCase().includes('invalid credentials') || error.toLowerCase().includes('invalid')
                          ? 'The email or password you entered is incorrect. Please try again.'
                          : error.toLowerCase().includes('user not found')
                            ? 'No account found with this email address.'
                            : error.toLowerCase().includes('network') || error.toLowerCase().includes('connection')
                              ? 'The backend is still starting. Keep this page open and try again in a few seconds.'
                              : error}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setError('')}
                      className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      aria-label="Dismiss error"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!requires2FA ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' })
                    }}
                    onBlur={() => {
                      setTouched({ ...touched, email: true })
                      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                        setFieldErrors({ ...fieldErrors, email: 'Please enter a valid email address' })
                      } else {
                        const newErrors = { ...fieldErrors }
                        delete newErrors.email
                        setFieldErrors(newErrors)
                      }
                    }}
                    className={`input-field pl-10 min-h-[48px] text-base ${fieldErrors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="you@example.com"
                    style={{ fontSize: '16px' }}
                    autoComplete="email"
                    required
                  />
                </div>
                {touched.email && fieldErrors.email && <p className="mt-1 text-sm text-red-500">{fieldErrors.email}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                  <Link to="/forgot-password" className="text-sm text-accent hover:underline">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouched({ ...touched, password: true })}
                    className="input-field pl-10 pr-12 min-h-[48px] text-base"
                    placeholder="Enter password"
                    style={{ fontSize: '16px' }}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full min-h-[48px] text-base touch-manipulation">
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          ) : (
            <form onSubmit={handle2FAVerify} className="space-y-4">
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  A verification code has been sent to <strong>{email}</strong>. Please enter the code below.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Verification Code</label>
                <input
                  type="text"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="input-field text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Enter the 6-digit code sent to your email</p>
              </div>

              <button
                type="submit"
                disabled={loading || twoFactorCode.length !== 6}
                className="btn-primary w-full disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setRequires2FA(false)
                  setTwoFactorCode('')
                  setError('')
                }}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-accent w-full"
              >
                Back to login
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-accent hover:text-accent-darker font-medium">
              Create one
            </Link>
          </p>
          </div>
        </div>
      </div>

      {/* Desktop Product Carousel */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gradient-to-br from-emerald-700 via-green-800 to-teal-900">
        {products.length > 0 ? (
          <>
            {products.map((product, index) => (
              <div
                key={product.id}
                className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                  index === currentSlide ? 'opacity-100 z-0 scale-100' : 'opacity-0 z-0 scale-105'
                }`}
              >
                <img
                  src={getImageUrl(product.image)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  loading="eager"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.png'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60" />
              </div>
            ))}
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 via-green-800 to-teal-900" />
        )}

        <div className="relative z-10 flex items-center justify-center p-12 text-white">
          <div className="bg-black/50 backdrop-blur-md rounded-3xl px-10 py-12 border border-white/30 shadow-2xl max-w-lg text-center">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
              Hello Again
            </h2>
            <p className="text-xl lg:text-2xl text-white/95 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] leading-relaxed">
              Your next favourite finds are waiting for you.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
