import { Truck, Package, Clock, MapPin, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react'

const ShippingInfo = () => {
  return (
    <div className="min-h-screen bg-[#F6F7F8] dark:bg-gray-950 py-8 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950 text-[#108910] dark:text-emerald-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instacart Express Fulfillment Policy</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
            Fast 30-Minute Grocery Delivery
          </h1>

          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 font-medium">
            Everything you need to know about JOJO Express delivery windows, free delivery threshold, and temperature-controlled vans.
          </p>
        </div>

        {/* Free Delivery Promo Bar */}
        <div className="bg-gradient-to-r from-[#002524] to-[#003834] text-white p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-emerald-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#108910] text-white flex items-center justify-center font-black shadow-md flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">🎉 Free Express Delivery Unlocked!</h3>
              <p className="text-xs text-gray-300 font-medium">Add 15,000 RWF or more of groceries to unlock 100% FREE express delivery.</p>
            </div>
          </div>
          <span className="bg-[#FF6B00] text-white text-xs font-black px-4 py-2 rounded-full uppercase tracking-wider flex-shrink-0">
            Kigali Express
          </span>
        </div>

        {/* Delivery Options Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-[#108910] flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">🚀 30-Min Express</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
              Delivered straight from JOJO Kigali Hub to your door in as fast as 30 minutes.
            </p>
            <div className="pt-2 text-xs font-black text-[#108910]">
              2,000 RWF (Free over 15k RWF)
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-[#108910] flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">🏪 Free Store Pickup</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
              Handpicked and ready for pickup at our Kigali hub within 15 minutes.
            </p>
            <div className="pt-2 text-xs font-black text-[#108910]">
              100% Free
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-[#108910] flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">🚚 Upcountry Express</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
              Express delivery to Musanze, Rubavu, Huye and all major towns in Rwanda.
            </p>
            <div className="pt-2 text-xs font-black text-[#108910]">
              3,500 RWF (1-2 Days)
            </div>
          </div>
        </div>

        {/* Quality Guarantees */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 sm:p-12 border border-gray-200 dark:border-gray-800 shadow-xl space-y-6">
          <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#108910]" />
            <span>How we keep your groceries cold & fresh</span>
          </h3>

          <div className="grid sm:grid-cols-2 gap-4 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#F6F7F8] dark:bg-gray-800">
              <CheckCircle2 className="w-5 h-5 text-[#108910] flex-shrink-0 mt-0.5" />
              <span>Insulated thermal bags for dairy, fresh milk, and eggs.</span>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#F6F7F8] dark:bg-gray-800">
              <CheckCircle2 className="w-5 h-5 text-[#108910] flex-shrink-0 mt-0.5" />
              <span>Personal shopper hand-checks every organic fruit and vegetable.</span>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#F6F7F8] dark:bg-gray-800">
              <CheckCircle2 className="w-5 h-5 text-[#108910] flex-shrink-0 mt-0.5" />
              <span>Live order notifications sent directly to your WhatsApp.</span>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#F6F7F8] dark:bg-gray-800">
              <CheckCircle2 className="w-5 h-5 text-[#108910] flex-shrink-0 mt-0.5" />
              <span>Contactless delivery available upon request during checkout.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default ShippingInfo
