import { Heart, Users, Award, ShoppingBag } from 'lucide-react'
import { useState } from 'react'

const About = () => {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const imageSrc = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'

  const features = [
    {
      icon: ShoppingBag,
      title: 'Wide Grocery Range',
      description: 'Fresh fruits, crisp vegetables, dairy, pantry staples, beverages, and daily market finds',
    },
    {
      icon: Award,
      title: 'Freshness Guaranteed',
      description: 'Hand-picked quality food items sourced daily for peak freshness and taste',
    },
    {
      icon: Users,
      title: 'Customer Focused',
      description: 'Built around smooth order fulfillment, transparent pricing, and responsive support',
    },
    {
      icon: Heart,
      title: 'Reliable Home Delivery',
      description: 'Fast and careful delivery straight from our market to your doorstep',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-16">
          <div className="inline-block mb-4">
            <span className="text-accent font-bold text-sm uppercase tracking-widest">About Us</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight">
            About JOJO Groceries
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 font-medium max-w-3xl mx-auto">
            Your trusted online grocery store for fresh produce, fruits, vegetables, dairy, and daily household essentials
          </p>
        </div>

        {/* Our Story Section - Featured First */}
        <div className="card p-8 sm:p-10 lg:p-12 mb-12 bg-gradient-to-br from-white via-emerald-50/50 to-white dark:from-gray-800 dark:via-emerald-900/30 dark:to-gray-800 border-2 border-emerald-200 dark:border-emerald-700 shadow-xl">
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <span className="text-accent font-bold text-sm uppercase tracking-widest">Our Journey</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 leading-tight">
              Our Story
            </h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-500 mx-auto rounded-full"></div>
          </div>
          <div className="grid md:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] gap-8 sm:gap-12 items-center mb-6">
            <div className="order-2 md:order-1 space-y-6">
              <p className="text-gray-800 dark:text-gray-200 mb-5 text-lg sm:text-xl leading-relaxed font-medium">
                JOJO Groceries was created to bring fresh, wholesome food and everyday household supplies directly to your doorstep with maximum convenience and reliability.
              </p>
              <p className="text-gray-800 dark:text-gray-200 mb-5 text-lg sm:text-xl leading-relaxed font-medium">
                We partner with local farms and trusted suppliers across Rwanda to ensure that every fruit, vegetable, dairy item, and pantry item meets the highest standards of quality.
              </p>
              <p className="text-gray-800 dark:text-gray-200 text-lg sm:text-xl leading-relaxed font-medium">
                Our mission is simple: simplify fresh grocery shopping by providing affordable prices, swift delivery, easy online checkout, and exceptional service every day.
              </p>
            </div>
            <div className="w-full max-w-md lg:max-w-lg md:ml-auto rounded-3xl overflow-hidden shadow-2xl hover:shadow-accent-lg transition-all duration-500 order-1 md:order-2 group relative bg-gradient-to-br from-emerald-100 to-green-200 dark:from-emerald-900/40 dark:to-green-800/40 min-h-[224px] sm:min-h-[288px] md:min-h-[340px]">
              {!imageError ? (
                <div className="relative w-full h-56 sm:h-72 md:h-[340px] lg:h-[380px]">
                  <img
                    src={imageSrc}
                    alt="Fresh JOJO Groceries market products on display"
                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                    style={{ display: 'block', opacity: 1 }}
                    loading="eager"
                    onError={() => setImageError(true)}
                    onLoad={() => setImageLoaded(true)}
                  />
                  {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-200/60 to-green-300/60 dark:from-emerald-800/40 dark:to-green-900/40 pointer-events-none">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-56 sm:h-72 md:h-[340px] lg:h-[380px] flex items-center justify-center bg-gradient-to-br from-emerald-500 to-green-700 text-white">
                  <div className="text-center p-8">
                    <ShoppingBag className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-4" />
                    <div className="text-2xl sm:text-3xl font-black mb-2">JOJO Groceries</div>
                    <div className="text-base sm:text-lg font-medium opacity-90">Fresh produce & everyday groceries</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-12">
          {features.map((feature, idx) => (
            <div key={idx} className="card p-6 sm:p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="p-3 bg-gradient-to-br from-accent-50 to-accent-100 dark:from-accent-900/30 dark:to-accent-800/30 rounded-xl w-fit mb-4">
                <feature.icon className="w-8 h-8 sm:w-10 sm:h-10 text-accent" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 font-medium leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

export default About
