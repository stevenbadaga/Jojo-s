import { Heart, Users, Award, ShoppingBag, ShieldCheck, Zap, Sparkles, CheckCircle2, Truck, Leaf } from 'lucide-react'
import { useState } from 'react'

const About = () => {
  const [imageError, setImageError] = useState(false)
  const imageSrc = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'

  const impactStats = [
    { value: '100+', label: 'Local Rwandan Farms', icon: '🌾' },
    { value: '30 Min', label: 'Average Express Delivery', icon: '⚡' },
    { value: '10,000+', label: 'Fresh Orders Handpicked', icon: '🛒' },
    { value: '99.8%', label: 'Organic Quality Rating', icon: '⭐' },
  ]

  const corePillars = [
    {
      icon: Leaf,
      title: 'Farm-Direct Sourcing',
      description: 'We partner directly with local Kigali organic growers and small Rwandan family farms for daily harvest.',
    },
    {
      icon: ShieldCheck,
      title: '100% Freshness Guarantee',
      description: 'Every apple, avocado, and dairy item is inspected by your personal shopper. Not fresh? Instant 24h refund.',
    },
    {
      icon: Zap,
      title: '30-Min Express Delivery',
      description: 'Equipped with climate-controlled delivery vans to ensure cold dairy and fresh crisp produce arrive in peak condition.',
    },
    {
      icon: Heart,
      title: 'Storefront Low Prices',
      description: 'Enjoy the same low prices you find in local Kigali supermarkets without any inflated markup.',
    },
  ]

  return (
    <div className="min-h-screen bg-[#F6F7F8] dark:bg-gray-950">
      {/* Instacart Top Banner */}
      <section className="bg-gradient-to-br from-[#002524] via-[#003834] to-[#004D47] text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#108910]/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-extrabold text-emerald-300">
            <Sparkles className="w-4 h-4 text-[#FF6B00]" />
            <span>Powered by Instacart Design • Kigali Fresh Network</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            Connecting Kigali families with <span className="text-[#05A42E]">fresh organic produce</span>
          </h1>

          <p className="text-gray-200 text-base sm:text-xl max-w-3xl mx-auto leading-relaxed font-medium">
            JOJO Groceries brings local farm harvests, crisp vegetables, artisan bread, and cold dairy directly to your door in as fast as 30 minutes.
          </p>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
        
        {/* Impact Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {impactStats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200/90 dark:border-gray-800 text-center shadow-sm hover:shadow-md transition-all"
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-3xl sm:text-4xl font-black text-[#108910] dark:text-emerald-400">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-gray-700 dark:text-gray-300 mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Our Story Card */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 sm:p-12 border border-gray-200/90 dark:border-gray-800 shadow-xl grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-5">
            <span className="text-xs font-black text-[#108910] bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full uppercase tracking-wider">
              Our Farm-To-Table Journey
            </span>

            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-white leading-tight">
              Reimagining fresh grocery delivery for Kigali
            </h2>

            <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed font-medium">
              Founded with a mission to empower local Rwandan agriculture, JOJO Groceries bridges the gap between regional organic farmers and busy urban households.
            </p>

            <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed font-medium">
              When you order with JOJO Groceries, a trained personal shopper selects each item with care—picking the firmest avocados, sweetest strawberries, and freshest milk—before delivering them straight to your kitchen.
            </p>

            <div className="pt-2 flex items-center gap-3 text-xs font-bold text-gray-700 dark:text-gray-300">
              <span className="flex items-center gap-1.5 text-[#108910]">
                <CheckCircle2 className="w-4 h-4" /> 100% Quality Inspected
              </span>
              <span className="flex items-center gap-1.5 text-[#108910]">
                <CheckCircle2 className="w-4 h-4" /> Climate Van Transport
              </span>
            </div>
          </div>

          <div className="md:col-span-5 relative">
            <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800">
              <img
                src={imageSrc}
                alt="Fresh produce basket"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>

        {/* 4 Core Pillars Grid */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-2">
              Why Kigali chooses JOJO Groceries
            </h3>
            <p className="text-gray-500 text-sm sm:text-base font-medium">
              Built on quality, speed, and trusted local service
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {corePillars.map((pillar, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200/90 dark:border-gray-800 space-y-4 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#108910] text-white flex items-center justify-center shadow-md">
                  <pillar.icon className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-extrabold text-gray-900 dark:text-white">
                  {pillar.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed font-medium">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

export default About
