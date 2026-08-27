import { ShieldCheck, RotateCcw, Sparkles, MessageCircle, AlertCircle, Heart } from 'lucide-react'

const ReturnsRefunds = () => {
  return (
    <div className="min-h-screen bg-[#F6F7F8] dark:bg-gray-950 py-8 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950 text-[#108910] dark:text-emerald-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Instacart 100% Freshness Guarantee</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
            100% Fresh Produce or Instant Refund
          </h1>

          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 font-medium">
            Your satisfaction is our priority. If any item delivered by MarketMet doesn't meet your standards, we'll replace or refund it immediately.
          </p>
        </div>

        {/* Freshness Banner */}
        <div className="bg-gradient-to-r from-[#002524] to-[#003834] text-white p-8 rounded-3xl shadow-xl space-y-4 border border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#108910] text-white flex items-center justify-center font-black shadow-md">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white">100% Quality & Ripeness Promise</h3>
              <p className="text-xs text-gray-300 font-medium">Hand-checked by personal shoppers in Kigali</p>
            </div>
          </div>

          <p className="text-sm text-gray-200 leading-relaxed font-medium">
            Not happy with your organic berries, avocados, or fresh milk? Simply send a photo of the item on WhatsApp within 24 hours of delivery, and we will issue an instant replacement or Mobile Money refund—no questions asked!
          </p>

          <a
            href="https://wa.me/250780453704?text=Hi%20MarketMet,%20I'd%20like%20to%20request%20a%20freshness%20refund"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white font-extrabold px-6 py-3 rounded-2xl shadow-md transition-all text-xs sm:text-sm"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Request WhatsApp Refund</span>
          </a>
        </div>

        {/* Guarantee Steps Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-[#108910] font-black text-lg flex items-center justify-center">
              1
            </div>
            <h4 className="font-extrabold text-gray-900 dark:text-white text-base">Snap a quick photo</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
              If an item is bruised or damaged, take a quick photo of the produce or label.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-[#108910] font-black text-lg flex items-center justify-center">
              2
            </div>
            <h4 className="font-extrabold text-gray-900 dark:text-white text-base">Send via WhatsApp</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
              Send the photo to +250 780 453 704 with your order number.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-[#108910] font-black text-lg flex items-center justify-center">
              3
            </div>
            <h4 className="font-extrabold text-gray-900 dark:text-white text-base">Instant Mobile Refund</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
              Receive an instant MoMo refund or replacement item delivered on the next driver run.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}

export default ReturnsRefunds
