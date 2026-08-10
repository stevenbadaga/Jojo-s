import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { isBackendConnectionIssue, productsAPI } from '../services/api'
import { Mail, Lock, Eye, EyeOff, User, Phone } from 'lucide-react'
import { getImageUrl } from '../utils/imageUtils'

const Register = () => {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [products, setProducts] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const { register } = useAuth()
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

  const validateField = (fieldName, value) => {
    const errors = { ...fieldErrors }

    switch (fieldName) {
      case 'name':
        if (!value.trim()) {
          errors.name = 'Name is required'
        } else if (value.trim().length < 2) {
          errors.name = 'Name must be at least 2 characters'
        } else {
          delete errors.name
        }
        break
      case 'phone':
        if (!value.trim()) {
          errors.phone = 'Phone number is required'
        } else if (!/^\+?[\d\s-]{8,}$/.test(value.trim())) {
          errors.phone = 'Please enter a valid phone number'
        } else {
          delete errors.phone
        }
        break
      case 'email':
        if (!value.trim()) {
          errors.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = 'Please enter a valid email address'
        } else {
          delete errors.email
        }
        break
      case 'password':
        if (!value) {
          errors.password = 'Password is required'
        } else if (value.length < 6) {
          errors.password = 'Password must be at least 6 characters'
        } else if (!/(?=.*[a-z])/.test(value)) {
          errors.password = 'Password should contain at least one lowercase letter'
        } else {
          delete errors.password
        }
        if (touched.confirmPassword && confirmPassword) {
          if (value !== confirmPassword) {
            errors.confirmPassword = 'Passwords do not match'
          } else {
            delete errors.confirmPassword
          }
        }
        break
      case 'confirmPassword':
        if (!value) {
          errors.confirmPassword = 'Please confirm your password'
        } else if (value !== password) {
          errors.confirmPassword = 'Passwords do not match'
        } else {
          delete errors.confirmPassword
        }
        break
    }

    setFieldErrors(errors)
  }

  const handleBlur = (fieldName) => {
    setTouched({ ...touched, [fieldName]: true })
  }

  const handleChange = (fieldName, value, setter) => {
    setter(value)
    if (touched[fieldName]) {
      validateField(fieldName, value)
    }
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const allTouched = { name: true, phone: true, email: true, password: true, confirmPassword: true }
    setTouched(allTouched)

    validateField('name', name)
    validateField('phone', phone)
    validateField('email', email)
    validateField('password', password)
    validateField('confirmPassword', confirmPassword)

    const hasErrors =
      Object.keys(fieldErrors).length > 0 ||
      !name.trim() ||
      !phone.trim() ||
      !email.trim() ||
      !password ||
      password.length < 6 ||
      password !== confirmPassword

    if (hasErrors) {
      setError('Please fix the errors in the form')
      return
    }

    setLoading(true)
    const result = await register(name, phone, email, password)
    setLoading(false)

    if (result.success) {
      navigate(result.data.isAdmin ? '/admin' : '/')
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="min-h-[calc(100svh-3rem)] lg:min-h-[calc(100svh-4rem)] flex flex-col lg:flex-row">
      <div className="flex-1 flex items-center justify-center px-4 pt-4 pb-14 sm:px-6 sm:pt-6 sm:pb-16 lg:p-8 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="w-full max-w-md">
          <div className="bg-white/90 dark:bg-gray-900/70 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 rounded-3xl shadow-xl lg:shadow-none lg:bg-transparent lg:dark:bg-transparent lg:border-0 p-6 sm:p-8 lg:p-0">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900 dark:text-white">Create your account</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 sm:mb-8">
            Save your wishlist &amp; access it anytime.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50/80 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleChange('name', e.target.value, setName)}
                  onBlur={() => handleBlur('name')}
                  className={`input-field pl-10 min-h-[48px] text-base ${fieldErrors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Your full name"
                  style={{ fontSize: '16px' }}
                  autoComplete="name"
                  required
                />
              </div>
              {touched.name && fieldErrors.name && <p className="mt-1 text-sm text-red-500">{fieldErrors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => handleChange('phone', e.target.value, setPhone)}
                  onBlur={() => handleBlur('phone')}
                  className={`input-field pl-10 min-h-[48px] text-base ${fieldErrors.phone ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="e.g., +250 788 123 456"
                  style={{ fontSize: '16px' }}
                  autoComplete="tel"
                  required
                />
              </div>
              {touched.phone && fieldErrors.phone && <p className="mt-1 text-sm text-red-500">{fieldErrors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleChange('email', e.target.value, setEmail)}
                  onBlur={() => handleBlur('email')}
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => handleChange('password', e.target.value, setPassword)}
                  onBlur={() => handleBlur('password')}
                  className={`input-field pl-10 pr-12 min-h-[48px] text-base ${fieldErrors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Enter password (min. 6 characters)"
                  style={{ fontSize: '16px' }}
                  autoComplete="new-password"
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
              {touched.password && fieldErrors.password && <p className="mt-1 text-sm text-red-500">{fieldErrors.password}</p>}
              {touched.password && password && !fieldErrors.password && <p className="mt-1 text-sm text-green-500">✓ Password looks good</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value, setConfirmPassword)}
                  onBlur={() => handleBlur('confirmPassword')}
                  className={`input-field pl-10 pr-12 min-h-[48px] text-base ${fieldErrors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Repeat password"
                  style={{ fontSize: '16px' }}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {touched.confirmPassword && fieldErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{fieldErrors.confirmPassword}</p>
              )}
              {touched.confirmPassword && confirmPassword && !fieldErrors.confirmPassword && password === confirmPassword && (
                <p className="mt-1 text-sm text-green-500 flex items-center gap-1">
                  <span>✓</span> Passwords match
                </p>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full min-h-[52px] text-base touch-manipulation">
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:text-accent-darker font-medium">
              Sign in
            </Link>
          </p>
          </div>
        </div>
      </div>

      {/* Desktop Product Carousel */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-700">
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
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-green-700" />
        )}

        <div className="relative z-10 flex items-center justify-center p-12 text-white">
          <div className="bg-black/50 backdrop-blur-md rounded-3xl px-10 py-12 border border-white/30 shadow-2xl max-w-lg text-center">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
              Welcome to JOJO Groceries
            </h2>
            <p className="text-xl lg:text-2xl text-white/95 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] leading-relaxed">
              Create an account to save items, track orders, and shop fresh produce & groceries with ease.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
