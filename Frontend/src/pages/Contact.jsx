import { useState } from 'react'
import { Mail, Phone, MapPin, Send, Clock, MessageCircle, Sparkles } from 'lucide-react'
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
    <div className="min-h-screen bg-[#F6F7F8] dark:bg-gray-950 py-8 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950 text-[#108910] dark:text-emerald-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instacart Express Support Desk</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
            We're here to help with your fresh groceries
          </h1>

          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 font-medium">
            Have questions about your 30-minute delivery, store fulfillment, or fresh organic items? Contact our Kigali support team 7 days a week.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Contact Details & Direct WhatsApp */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Direct WhatsApp Express Support Card */}
            <div className="bg-gradient-to-br from-[#002524] to-[#003834] text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-4 border border-emerald-800">
              <div className="flex items-center justify-between">
                <span className="bg-[#25D366] text-white font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                  Instant Support
                </span>
                <span className="text-xs text-emerald-300 font-bold">Live 7am - 9pm</span>
              </div>

              <h3 className="text-2xl font-black text-white">Need 1-on-1 assistance?</h3>

              <p className="text-gray-300 text-sm font-medium">
                Chat directly with our Kigali customer care team on WhatsApp for order changes or delivery tracking.
              </p>

              <a
                href="https://wa.me/250780453704?text=Hi%20MarketMet,%20I%20need%20help%20with%20my%20order"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white font-black py-3.5 px-6 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>Chat on WhatsApp Now</span>
              </a>
            </div>

            {/* Contact Details Card */}
            <div className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-5">
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">
                Kigali Fulfillment Hub
              </h3>

              <a
                href="mailto:support@marketmet.com"
                className="flex items-start gap-4 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
              >
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-[#108910] rounded-xl group-hover:scale-105 transition-transform">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Us</h4>
                  <p className="font-bold text-sm text-gray-900 dark:text-white">support@marketmet.com</p>
                </div>
              </a>

              <a
                href="tel:+250780453704"
                className="flex items-start gap-4 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
              >
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-[#108910] rounded-xl group-hover:scale-105 transition-transform">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Call Helpline</h4>
                  <p className="font-bold text-sm text-gray-900 dark:text-white">+250 780 453 704</p>
                </div>
              </a>

              <div className="flex items-start gap-4 p-3 rounded-2xl">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-[#108910] rounded-xl">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Main Hub Location</h4>
                  <p className="font-bold text-sm text-gray-900 dark:text-white">Central Kigali • Rwanda</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-3 rounded-2xl">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-[#108910] rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Operating Hours</h4>
                  <p className="font-bold text-sm text-gray-900 dark:text-white">Mon - Sun: 7:00 AM - 9:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Message Form */}
          <div className="lg:col-span-7 bg-white dark:bg-gray-900 p-6 sm:p-10 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                Send Us a Message
              </h2>
              <p className="text-xs text-gray-500 font-medium">Fill out the form below and our team will respond within 15 minutes.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value })
                    if (errors.name) setErrors({ ...errors, name: '' })
                  }}
                  className={`w-full p-3 rounded-xl border ${errors.name ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} text-sm font-semibold outline-none focus:border-[#108910] bg-[#F6F7F8] dark:bg-gray-800`}
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value })
                    if (errors.email) setErrors({ ...errors, email: '' })
                  }}
                  className={`w-full p-3 rounded-xl border ${errors.email ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} text-sm font-semibold outline-none focus:border-[#108910] bg-[#F6F7F8] dark:bg-gray-800`}
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => {
                    setFormData({ ...formData, subject: e.target.value })
                    if (errors.subject) setErrors({ ...errors, subject: '' })
                  }}
                  className={`w-full p-3 rounded-xl border ${errors.subject ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} text-sm font-semibold outline-none focus:border-[#108910] bg-[#F6F7F8] dark:bg-gray-800`}
                  placeholder="Order question, delivery inquiry, feedback..."
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                  Message Details *
                </label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => {
                    setFormData({ ...formData, message: e.target.value })
                    if (errors.message) setErrors({ ...errors, message: '' })
                  }}
                  className={`w-full p-3 rounded-xl border ${errors.message ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} text-sm font-semibold outline-none focus:border-[#108910] bg-[#F6F7F8] dark:bg-gray-800 resize-none`}
                  rows={5}
                  placeholder="How can we help with your MarketMet order?"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#108910] hover:bg-[#007000] active:scale-95 text-white font-extrabold py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message to MarketMet Team</span>
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
