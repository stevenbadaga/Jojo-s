import { useState } from 'react'
import { Search } from 'lucide-react'
import OrderTracking from '../components/OrderTracking'

const TrackOrder = () => {
  const [orderNumber, setOrderNumber] = useState('')
  const [phone, setPhone] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const canSubmit = orderNumber.trim() && phone.trim()

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!canSubmit) return
    setSubmitted(true)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="card p-6 sm:p-8 mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-2">
          Track your order
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Enter your order number and the phone used at checkout to see live updates.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Order number
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. 1930"
              className="input-field"
              autoComplete="off"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Phone number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 0788 123 456"
              className="input-field"
              autoComplete="tel"
            />
          </div>
          <button
            type="submit"
            disabled={!canSubmit}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Search className="w-4 h-4" />
            Track order
          </button>
        </form>
      </div>

      {submitted && (
        <OrderTracking
          orderNumber={orderNumber.trim()}
          phone={phone.trim()}
          emptyMessage="No tracking info found for that order yet. Double-check the number and phone."
        />
      )}
    </div>
  )
}

export default TrackOrder
