import { useState, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { Mail, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'
import { authAPI } from '../services/api'

const VerifyEmail = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const toast = useToast()
  const token = searchParams.get('token')
  const [status, setStatus] = useState('verifying') // verifying, success, error
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (token) {
      verifyEmail()
    } else {
      setStatus('error')
      setMessage('Invalid verification link')
    }
  }, [token])

  const verifyEmail = async () => {
    try {
      await authAPI.verifyEmail(token)
      setStatus('success')
      setMessage('Your email has been verified successfully!')
      toast.success('Email verified successfully!')
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (error) {
      setStatus('error')
      setMessage(error.response?.data?.error || 'Failed to verify email')
      toast.error(error.response?.data?.error || 'Failed to verify email')
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

        <div className="card p-8 text-center">
          {status === 'verifying' && (
            <>
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Verifying Email...
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Please wait while we verify your email address.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Email Verified!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                Redirecting to login page...
              </p>
              <Link to="/login" className="text-accent hover:underline">
                Go to Login
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Verification Failed
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
              <div className="space-y-2">
                <Link to="/login" className="block text-accent hover:underline">
                  Go to Login
                </Link>
                <button
                  onClick={() => navigate('/resend-verification')}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-accent"
                >
                  Resend verification email
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default VerifyEmail

