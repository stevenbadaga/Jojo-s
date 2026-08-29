import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { authAPI, getApiErrorMessage } from '../services/api'
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react'
import AuthCinematicPanel from '../components/AuthCinematicPanel'

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
  const { login, isAdmin, checkAuth } = useAuth()
  const navigate = useNavigate()

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
        const isAdminUser = result.data.isAdmin === true || result.data.admin === true
        navigate(isAdminUser ? '/admin' : '/')
      }
      return
    }

    let errorMessage = result.error || 'Login failed'
    const lowered = errorMessage.toLowerCase()
    if (lowered.includes('invalid') || lowered.includes('credentials')) {
      errorMessage = 'Invalid credentials'
    } else if (lowered.includes('user not found')) {
      errorMessage = 'User not found'
    } else if (lowered.includes('network') || lowered.includes('connection')) {
      errorMessage = 'The service is reconnecting. Please wait a few seconds and try again.'
    }
    setError(errorMessage)
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
    <div className="marketmet-auth-shell">
      <section className="marketmet-auth-form-pane">
        <div className="marketmet-auth-mobile-visual" aria-hidden="true">
          <div>
            <span>Fresh groceries, one secure account</span>
            <strong>Welcome back to MarketMet</strong>
          </div>
        </div>

        <div className="marketmet-auth-card">
          <div className="marketmet-auth-eyebrow"><ShieldCheck className="w-4 h-4" /> Secure account access</div>
          <div className="marketmet-auth-heading">
            <h1>Welcome back</h1>
            <p>Sign in to continue shopping, manage favourites and track your orders.</p>
          </div>

          {error && (
            <div className="marketmet-auth-alert" role="alert">
              <strong>We couldn’t sign you in.</strong>
              <span>
                {error.toLowerCase().includes('invalid credentials')
                  ? 'The email or password you entered is incorrect.'
                  : error.toLowerCase().includes('user not found')
                    ? 'No account was found with this email address.'
                    : error}
              </span>
            </div>
          )}

          {!requires2FA ? (
            <form onSubmit={handleSubmit} className="marketmet-auth-form">
              <div className="marketmet-auth-field">
                <label htmlFor="login-email">Email address</label>
                <div className="marketmet-auth-input-wrap">
                  <Mail className="marketmet-auth-input-icon" />
                  <input
                    id="login-email"
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
                        const next = { ...fieldErrors }
                        delete next.email
                        setFieldErrors(next)
                      }
                    }}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>
                {touched.email && fieldErrors.email && <span className="marketmet-auth-field-error">{fieldErrors.email}</span>}
              </div>

              <div className="marketmet-auth-field">
                <div className="marketmet-auth-label-row">
                  <label htmlFor="login-password">Password</label>
                  <Link to="/forgot-password">Forgot password?</Link>
                </div>
                <div className="marketmet-auth-input-wrap">
                  <Lock className="marketmet-auth-input-icon" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
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
              </div>

              <button type="submit" disabled={loading} className="marketmet-auth-submit">
                <span>{loading ? 'Signing in…' : 'Sign in'}</span>
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>
          ) : (
            <form onSubmit={handle2FAVerify} className="marketmet-auth-form">
              <div className="marketmet-auth-info">
                We sent a 6-digit verification code to <strong>{email}</strong>.
              </div>
              <div className="marketmet-auth-field">
                <label htmlFor="login-2fa">Verification code</label>
                <input
                  id="login-2fa"
                  className="marketmet-auth-code-input"
                  type="text"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  inputMode="numeric"
                  required
                />
              </div>
              <button type="submit" disabled={loading || twoFactorCode.length !== 6} className="marketmet-auth-submit">
                <span>{loading ? 'Verifying…' : 'Verify and continue'}</span>
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
              <button
                type="button"
                className="marketmet-auth-secondary"
                onClick={() => {
                  setRequires2FA(false)
                  setTwoFactorCode('')
                  setError('')
                }}
              >
                Back to sign in
              </button>
            </form>
          )}

          <div className="marketmet-auth-footnote">
            <span>New to MarketMet?</span>
            <Link to="/register">Create an account</Link>
          </div>
        </div>
      </section>

      <AuthCinematicPanel mode="login" />
    </div>
  )
}

export default Login
