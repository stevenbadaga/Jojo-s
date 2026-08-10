import { useState } from 'react'
import { X, CheckCircle2, ShieldCheck, Phone, Copy, ExternalLink, ArrowRight, MessageCircle } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'

const ADMIN_PHONE = '+250780453704'
const ADMIN_WHATSAPP = '250780453704'

const PaymentConfirmationModal = ({ isOpen, onClose, orderData }) => {
  const toast = useToast()
  const [paymentMethod, setPaymentMethod] = useState('momo')
  const [transactionId, setTransactionId] = useState('')
  const [senderPhone, setSenderPhone] = useState('')
  const [senderName, setSenderName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  if (!isOpen) return null

  const orderId = orderData?.id || orderData?.orderNumber || 'JOJO-' + Math.floor(100000 + Math.random() * 900000)
  const totalAmount = orderData?.total || orderData?.amount || 0

  const copyMoMoCode = () => {
    navigator.clipboard.writeText('*182*8*1*0780453704#')
    setCopiedCode(true)
    toast.success('MoMo Merchant code copied to clipboard!')
    setTimeout(() => setCopiedCode(false), 3000)
  }

  const handleSubmitPayment = (e) => {
    e.preventDefault()

    if (!transactionId.trim()) {
      toast.error('Please enter your MoMo Transaction ID / Reference Code')
      return
    }

    setSubmitting(true)

    setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
      toast.success('Payment submitted for instant verification!')

      // Trigger Web Push Browser Notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('💳 JOJO Payment Submitted', {
          body: `Order #${orderId} (RWF ${totalAmount.toLocaleString()}) payment is under live verification.`,
          icon: '/favicon.ico'
        })
      }
    }, 1000)
  }

  const handleWhatsAppVerify = () => {
    const message = `*JOJO GROCERIES PAYMENT CONFIRMATION*%0A%0A` +
      `📦 *Order ID:* #${orderId}%0A` +
      `💰 *Amount Paid:* ${totalAmount.toLocaleString()} RWF%0A` +
      `💳 *Payment Method:* ${paymentMethod.toUpperCase()}%0A` +
      `🔢 *Transaction Ref:* ${transactionId || 'Pending'}%0A` +
      `📱 *Sender Phone:* ${senderPhone || 'Not specified'}%0A` +
      `👤 *Payer Name:* ${senderName || 'Valued Shopper'}%0A%0A` +
      `Please verify my payment and dispatch my 30-minute express delivery.`

    window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${message}`, '_blank')
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="relative w-full max-w-xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden my-8">
        
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-[#002524] to-[#003834] text-white p-6 sm:p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#108910] text-white flex items-center justify-center font-black shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">Confirm Payment</h2>
              <p className="text-xs text-gray-300 font-medium">Order #{orderId} • Instacart Express</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Order Summary Banner */}
          <div className="bg-[#F6F7F8] dark:bg-gray-800/60 p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider block">Total Amount Due</span>
              <span className="text-2xl font-black text-[#108910]">
                {totalAmount > 0 ? `${totalAmount.toLocaleString()} RWF` : 'Calculated at Checkout'}
              </span>
            </div>
            <span className="bg-emerald-50 dark:bg-emerald-950 text-[#108910] text-xs font-black px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              ✓ 30-Min Delivery Ready
            </span>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmitPayment} className="space-y-6">
              
              {/* Payment Method Tabs */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider block">
                  Select Payment Method *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('momo')}
                    className={`p-3.5 rounded-2xl font-extrabold text-xs flex items-center gap-2 border transition-all ${
                      paymentMethod === 'momo'
                        ? 'border-[#108910] bg-emerald-50 dark:bg-emerald-950 text-[#108910] shadow-sm'
                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span className="text-base">📱</span>
                    <span>MTN Mobile Money</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('airtel')}
                    className={`p-3.5 rounded-2xl font-extrabold text-xs flex items-center gap-2 border transition-all ${
                      paymentMethod === 'airtel'
                        ? 'border-[#108910] bg-emerald-50 dark:bg-emerald-950 text-[#108910] shadow-sm'
                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span className="text-base">📱</span>
                    <span>Airtel Money</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3.5 rounded-2xl font-extrabold text-xs flex items-center gap-2 border transition-all ${
                      paymentMethod === 'card'
                        ? 'border-[#108910] bg-emerald-50 dark:bg-emerald-950 text-[#108910] shadow-sm'
                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span className="text-base">💳</span>
                    <span>Credit / Debit Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-3.5 rounded-2xl font-extrabold text-xs flex items-center gap-2 border transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-[#108910] bg-emerald-50 dark:bg-emerald-950 text-[#108910] shadow-sm'
                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span className="text-base">💵</span>
                    <span>Cash on Delivery</span>
                  </button>
                </div>
              </div>

              {/* MoMo Merchant Code Helper Box */}
              {(paymentMethod === 'momo' || paymentMethod === 'airtel') && (
                <div className="bg-[#002524] text-white p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-300 font-bold">Quick MoMo Merchant Code:</span>
                    <button
                      type="button"
                      onClick={copyMoMoCode}
                      className="text-[#FF6B00] hover:underline font-extrabold flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedCode ? 'Copied!' : 'Copy USSD Code'}</span>
                    </button>
                  </div>
                  <div className="bg-black/30 p-3 rounded-xl flex items-center justify-between font-mono font-bold text-sm text-emerald-400">
                    <span>*182*8*1*0780453704#</span>
                    <span className="text-xs text-white font-sans">JOJO Groceries</span>
                  </div>
                  <p className="text-[11px] text-gray-300">
                    Dial the USSD code on your phone, complete payment, then enter your transaction reference below.
                  </p>
                </div>
              )}

              {/* Form Input Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                    Transaction ID / MoMo Reference Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="e.g. TXN-8921092 or 0780453704-9812"
                    className="w-full p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold outline-none focus:border-[#108910] bg-[#F6F7F8] dark:bg-gray-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                      Sender Phone Number
                    </label>
                    <input
                      type="text"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      placeholder="+250 780 453 704"
                      className="w-full p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold outline-none focus:border-[#108910] bg-[#F6F7F8] dark:bg-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                      Account / Payer Name
                    </label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Your name on account"
                      className="w-full p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold outline-none focus:border-[#108910] bg-[#F6F7F8] dark:bg-gray-800"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#108910] hover:bg-[#007000] active:scale-95 text-white font-extrabold py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Confirm & Verify Payment</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppVerify}
                  className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white font-extrabold py-3 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Send Receipt on WhatsApp (+250 780 453 704)</span>
                </button>
              </div>

            </form>
          ) : (
            /* Confirmation Success State */
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#108910] flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                  Payment Submitted Successfully!
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium max-w-md mx-auto">
                  Your payment for Order <span className="font-bold text-gray-900 dark:text-white">#{orderId}</span> is under live verification. Our Kigali fulfillment team will dispatch your 30-minute delivery shortly.
                </p>
              </div>

              <div className="bg-[#F6F7F8] dark:bg-gray-800 p-4 rounded-2xl text-xs space-y-2 text-left border border-gray-200 dark:border-gray-700 max-w-md mx-auto">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-semibold">Transaction Ref:</span>
                  <span className="font-mono font-bold text-gray-900 dark:text-white">{transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-semibold">Payment Status:</span>
                  <span className="font-bold text-[#108910]">✓ PENDING VERIFICATION</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 justify-center pt-2">
                <button
                  onClick={handleWhatsAppVerify}
                  className="w-full sm:w-auto bg-[#25D366] hover:bg-[#20BA5A] text-white font-black py-3 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-xs"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Notify Manager on WhatsApp</span>
                </button>

                <button
                  onClick={onClose}
                  className="w-full sm:w-auto bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black py-3 px-6 rounded-2xl shadow-md transition-all text-xs"
                >
                  Close Window
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  )
}

export default PaymentConfirmationModal
