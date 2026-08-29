import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ArrowRight, Eye, EyeOff, Lock, Mail, Phone, ShieldCheck, User } from 'lucide-react'
import AuthCinematicPanel from '../components/AuthCinematicPanel'

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
  const { register } = useAuth()
  const navigate = useNavigate()

  const validateField = (fieldName, value) => {
    const errors = { ...fieldErrors }

    if (fieldName === 'name') {
      if (!value.trim()) errors.name = 'Name is required'
      else if (value.trim().length < 2) errors.name = 'Name must be at least 2 characters'
      else delete errors.name
    }

    if (fieldName === 'phone') {
      if (!value.trim()) errors.phone = 'Phone number is required'
      else if (!/^\+?[\d\s-]{8,}$/.test(value.trim())) errors.phone = 'Please enter a valid phone number'
      else delete errors.phone
    }

    if (fieldName === 'email') {
      if (!value.trim()) errors.email = 'Email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors.email = 'Please enter a valid email address'
      else delete errors.email
    }

    if (fieldName === 'password') {
      if (!value) errors.password = 'Password is required'
      else if (value.length < 6) errors.password = 'Password must be at least 6 characters'
      else if (!/(?=.*[a-z])/.test(value)) errors.password = 'Include at least one lowercase letter'
      else delete errors.password

      if (touched.confirmPassword && confirmPassword) {
        if (value !== confirmPassword) errors.confirmPassword = 'Passwords do not match'
        else delete errors.confirmPassword
      }
    }

    if (fieldName === 'confirmPassword') {
      if (!value) errors.confirmPassword = 'Please confirm your password'
      else if (value !== password) errors.confirmPassword = 'Passwords do not match'
      else delete errors.confirmPassword
    }

    setFieldErrors(errors)
    return errors
  }

  const handleChange = (fieldName, value, setter) => {
    setter(value)
    if (touched[fieldName]) validateField(fieldName, value)
    if (error) setError('')
  }

  const handleBlur = (fieldName, value) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }))
    validateField(fieldName, value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const nextErrors = {}
    if (!name.trim() || name.trim().length < 2) nextErrors.name = 'Enter your full name'
    if (!phone.trim() || !/^\+?[\d\s-]{8,}$/.test(phone.trim())) nextErrors.phone = 'Enter a valid phone number'
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = 'Enter a valid email address'
    if (!password || password.length < 6) nextErrors.password = 'Use at least 6 characters'
    else if (!/(?=.*[a-z])/.test(password)) nextErrors.password = 'Include at least one lowercase letter'
    if (!confirmPassword || confirmPassword !== password) nextErrors.confirmPassword = 'Passwords do not match'

    setTouched({ name: true, phone: true, email: true, password: true, confirmPassword: true })
    setFieldErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      setError('Please review the highlighted fields.')
      return
    }

    setLoading(true)
    const result = await register(name.trim(), phone.trim(), email.trim(), password)
    setLoading(false)

    if (result.success) {
      navigate(result.data.isAdmin ? '/admin' : '/')
    } else {
      setError(result.error || 'Unable to create your account. Please try again.')
    }
  }

  const fieldError = (key) => touched[key] && fieldErrors[key]

  return (
    <div className="marketmet-auth-shell marketmet-auth-register-shell">
      <section className="marketmet-auth-form-pane">
        <div className="marketmet-auth-mobile-visual" aria-hidden="true">
          <div>
            <span>Your fresh-market account</span>
            <strong>Join MarketMet</strong>
          </div>
        </div>

        <div className="marketmet-auth-card marketmet-auth-register-card">
          <div className="marketmet-auth-eyebrow"><ShieldCheck className="w-4 h-4" /> Simple, secure registration</div>
          <div className="marketmet-auth-heading">
            <h1>Create your account</h1>
            <p>Save favourites, follow deliveries and enjoy a faster checkout experience.</p>
          </div>

          {error && (
            <div className="marketmet-auth-alert" role="alert">
              <strong>We need a little more information.</strong>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="marketmet-auth-form">
            <div className="marketmet-auth-grid">
              <div className="marketmet-auth-field">
                <label htmlFor="register-name">Full name</label>
                <div className="marketmet-auth-input-wrap">
                  <User className="marketmet-auth-input-icon" />
                  <input
                    id="register-name"
                    type="text"
                    value={name}
                    onChange={(e) => handleChange('name', e.target.value, setName)}
                    onBlur={() => handleBlur('name', name)}
                    placeholder="Your full name"
                    autoComplete="name"
                    required
                  />
                </div>
                {fieldError('name') && <span className="marketmet-auth-field-error">{fieldErrors.name}</span>}
              </div>

              <div className="marketmet-auth-field">
                <label htmlFor="register-phone">Phone number</label>
                <div className="marketmet-auth-input-wrap">
                  <Phone className="marketmet-auth-input-icon" />
                  <input
                    id="register-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => handleChange('phone', e.target.value, setPhone)}
                    onBlur={() => handleBlur('phone', phone)}
                    placeholder="+250 7xx xxx xxx"
                    autoComplete="tel"
                    required
                  />
                </div>
                {fieldError('phone') && <span className="marketmet-auth-field-error">{fieldErrors.phone}</span>}
              </div>
            </div>

            <div className="marketmet-auth-field">
              <label htmlFor="register-email">Email address</label>
              <div className="marketmet-auth-input-wrap">
                <Mail className="marketmet-auth-input-icon" />
                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => handleChange('email', e.target.value, setEmail)}
                  onBlur={() => handleBlur('email', email)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
              {fieldError('email') && <span className="marketmet-auth-field-error">{fieldErrors.email}</span>}
            </div>

            <div className="marketmet-auth-grid">
              <div className="marketmet-auth-field">
                <label htmlFor="register-password">Password</label>
                <div className="marketmet-auth-input-wrap">
                  <Lock className="marketmet-auth-input-icon" />
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => handleChange('password', e.target.value, setPassword)}
                    onBlur={() => handleBlur('password', password)}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="marketmet-auth-password-toggle"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                {fieldError('password') && <span className="marketmet-auth-field-error">{fieldErrors.password}</span>}
              </div>

              <div className="marketmet-auth-field">
                <label htmlFor="register-confirm">Confirm password</label>
                <div className="marketmet-auth-input-wrap">
                  <Lock className="marketmet-auth-input-icon" />
                  <input
                    id="register-confirm"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value, setConfirmPassword)}
                    onBlur={() => handleBlur('confirmPassword', confirmPassword)}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="marketmet-auth-password-toggle"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                {fieldError('confirmPassword') && <span className="marketmet-auth-field-error">{fieldErrors.confirmPassword}</span>}
              </div>
            </div>

            <p className="marketmet-auth-password-note">Use a password you don’t reuse elsewhere. You can reset it securely by email.</p>

            <button type="submit" disabled={loading} className="marketmet-auth-submit">
              <span>{loading ? 'Creating account…' : 'Create account'}</span>
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          <div className="marketmet-auth-footnote">
            <span>Already have an account?</span>
            <Link to="/login">Sign in</Link>
          </div>
        </div>
      </section>

      <AuthCinematicPanel mode="register" />
    </div>
  )
}

export default Register
