import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'
import { authAPI } from '../services/api'

const ResendVerification = () => {
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await authAPI.resendVerification(email)
      toast.success('Verification email sent! Please check your inbox.')
      setSent(true)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send verification email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-accent mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

        <div className="card p-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
            Resend Verification Email
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Enter your email address and we'll send you a new verification link.
          </p>

          {sent ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Email Sent!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We've sent a verification link to <strong>{email}</strong>
              </p>
              <Link to="/login" className="text-accent hover:underline">
                Go to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-10"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Verification Email'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResendVerification

