import { useState } from 'react'
import { Mail, Phone, MapPin, Send, Clock, MessageCircle } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'
import { contactAPI } from '../services/api'

const Contact = () => {
  const toast = useToast()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required'
    } else if (formData.subject.trim().length < 3) {
      newErrors.subject = 'Subject must be at least 3 characters'
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }
    
    setLoading(true)
    setErrors({})

    try {
      const response = await contactAPI.sendMessage(formData)
      toast.success(response.data?.message || 'Thank you! Your message has been sent. We will get back to you soon.')
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (error) {
      console.error('Failed to send contact message:', error)
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.details || 
                          'Failed to send message. Please try again later.'
      toast.error(errorMessage)
      
      if (error.response?.data?.details) {
        setErrors(error.response.data.details)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl mb-3 sm:mb-6 shadow-lg">
            <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Contact Us
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Have questions about JOJO Groceries? We'd love to hear from you!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            {/* Get in Touch Card */}
            <div className="card p-6 sm:p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  Get in Touch
                </h2>
              </div>
              <div className="space-y-4">
                <a
                  href="mailto:jojogroceries@gmail.com"
                  className="flex items-start gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-100 dark:hover:from-emerald-900/20 dark:hover:to-emerald-800/20 border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-300 group"
                >
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 transition-colors flex-shrink-0">
                    <Mail className="w-6 h-6 text-accent group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-base sm:text-lg">
                      Email
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 group-hover:text-accent transition-colors break-all">
                      jojogroceries@gmail.com
                    </p>
                  </div>
                </a>
                <a
                  href="tel:+250788883986"
                  className="flex items-start gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-100 dark:hover:from-emerald-900/20 dark:hover:to-emerald-800/20 border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-300 group"
                >
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 transition-colors flex-shrink-0">
                    <Phone className="w-6 h-6 text-accent group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-base sm:text-lg">
                      Phone
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 group-hover:text-accent transition-colors">
                      +250 788 883 986
                    </p>
                  </div>
                </a>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Kigali,Rwanda"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-100 dark:hover:from-emerald-900/20 dark:hover:to-emerald-800/20 border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-300 group"
                >
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 transition-colors flex-shrink-0">
                    <MapPin className="w-6 h-6 text-accent group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-base sm:text-lg">
                      Address
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 group-hover:text-accent transition-colors">
                      Kigali, Rwanda
                    </p>
                  </div>
                </a>
              </div>
            </div>

            {/* Business Hours Card */}
            <div className="card p-6 sm:p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-emerald-600 to-green-600 rounded-xl">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Store Hours
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <span className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                    Monday - Saturday
                  </span>
                  <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    7:00 AM - 8:00 PM
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <span className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                    Sunday
                  </span>
                  <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    8:00 AM - 6:00 PM
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="card p-6 sm:p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl">
                <Send className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Send us a Message
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              <div>
                <label className="block text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value })
                    if (errors.name) setErrors({ ...errors, name: '' })
                  }}
                  className={`input-field h-12 text-base ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Your full name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value })
                    if (errors.email) setErrors({ ...errors, email: '' })
                  }}
                  className={`input-field h-12 text-base ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => {
                    setFormData({ ...formData, subject: e.target.value })
                    if (errors.subject) setErrors({ ...errors, subject: '' })
                  }}
                  className={`input-field h-12 text-base ${errors.subject ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="What's this about?"
                />
                {errors.subject && (
                  <p className="mt-1 text-sm text-red-500">{errors.subject}</p>
                )}
              </div>
              <div>
                <label className="block text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => {
                    setFormData({ ...formData, message: e.target.value })
                    if (errors.message) setErrors({ ...errors, message: '' })
                  }}
                  className={`input-field text-base resize-none ${errors.message ? 'border-red-500 focus:ring-red-500' : ''}`}
                  rows={6}
                  placeholder="Tell us what's on your mind..."
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-500">{errors.message}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full h-12 sm:h-14 text-base sm:text-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 touch-manipulation min-h-[52px]"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact
