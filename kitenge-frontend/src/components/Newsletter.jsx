import { useState } from 'react'
import { Mail, Check, AlertCircle } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'

const Newsletter = () => {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle, loading, success, error
  const toast = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }

    setStatus('loading')
    
    try {
      // Save to localStorage for now (can be connected to backend later)
      const subscribers = JSON.parse(localStorage.getItem('kb_newsletter_subscribers') || '[]')
      
      if (subscribers.includes(email)) {
        setStatus('error')
        toast.warning('You are already subscribed!')
        return
      }

      subscribers.push(email)
      localStorage.setItem('kb_newsletter_subscribers', JSON.stringify(subscribers))
      
      setStatus('success')
      toast.success('Successfully subscribed to our newsletter!')
      setEmail('')
      
      // Reset status after 3 seconds
      setTimeout(() => setStatus('idle'), 3000)
    } catch (error) {
      console.error('Newsletter subscription failed:', error)
      setStatus('error')
      toast.error('Failed to subscribe. Please try again.')
    }
  }

  return (
    <section className="py-10 sm:py-14 md:py-16 bg-gradient-to-br from-emerald-50 via-green-100 to-emerald-50 dark:from-emerald-950/20 dark:via-green-900/20 dark:to-emerald-900/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card p-6 sm:p-8 md:p-12 text-center">
          <div className="mb-5 sm:mb-6 md:mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-accent-100 to-accent-200 dark:from-accent-900/30 dark:to-accent-800/30 rounded-full mb-4 sm:mb-5 shadow-lg">
              <Mail className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-accent" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2 sm:mb-3 leading-tight">
              Stay Updated
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto font-medium px-2">
              Subscribe to our newsletter and be the first to know about new arrivals, exclusive offers, and special promotions.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="input-field pl-11 sm:pl-12 pr-4 w-full text-base sm:text-sm"
                  required
                  disabled={status === 'loading'}
                />
              </div>
              <button
                type="submit"
                disabled={status === 'loading' || status === 'success'}
                className="btn-primary whitespace-nowrap px-6 sm:px-8 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[48px] touch-manipulation"
              >
                {status === 'loading' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span className="hidden sm:inline">Subscribing...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : status === 'success' ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Subscribed!</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>Subscribe</span>
                  </>
                )}
              </button>
            </div>

            {status === 'error' && (
              <div className="mt-3 flex items-center justify-center gap-2 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span>Something went wrong. Please try again.</span>
              </div>
            )}

            <p className="mt-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}

export default Newsletter

