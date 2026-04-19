import { Heart, Users, Award, ShoppingBag } from 'lucide-react'
import { useState, useEffect } from 'react'

const About = () => {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageSrc, setImageSrc] = useState('/kitenge-fabrics-display.jpeg')
  
  // Try multiple image paths
  useEffect(() => {
    const imagePaths = [
      '/kitenge-fabrics-display.jpeg',
      './kitenge-fabrics-display.jpeg',
      'kitenge-fabrics-display.jpeg',
      `${window.location.origin}/kitenge-fabrics-display.jpeg`
    ]
    
    let currentIndex = 0
    
    const tryNextPath = () => {
      if (currentIndex >= imagePaths.length) {
        console.error('All image paths failed')
        setImageError(true)
        return
      }
      
      const img = new Image()
      img.src = imagePaths[currentIndex]
      
      img.onload = () => {
        console.log('âœ… Image loaded from:', imagePaths[currentIndex])
        setImageSrc(imagePaths[currentIndex])
        setImageLoaded(true)
      }
      
      img.onerror = () => {
        console.warn('âš ï¸ Failed to load from:', imagePaths[currentIndex])
        currentIndex++
        tryNextPath()
      }
    }
    
    tryNextPath()
  }, [])
  const features = [
    {
      icon: ShoppingBag,
      title: 'Wide Product Range',
      description: 'Fashion, home, beauty, accessories, and everyday essentials',
    },
    {
      icon: Award,
      title: 'Quality Guaranteed',
      description: 'Reliable products chosen for value, quality, and everyday use',
    },
    {
      icon: Users,
      title: 'Customer Focused',
      description: 'Built around smooth shopping, clear pricing, and dependable support',
    },
    {
      icon: Heart,
      title: 'Easy Shopping',
      description: 'Simple browsing, secure checkout, and delivery you can trust',
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
            About Esoko
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 font-medium max-w-3xl mx-auto">
            Your trusted online store for fashion, home, beauty, accessories, and everyday essentials
          </p>
        </div>

        {/* Our Story Section - Featured First */}
        <div className="card p-8 sm:p-10 lg:p-12 mb-12 bg-gradient-to-br from-white via-orange-50/50 to-white dark:from-gray-800 dark:via-orange-900/30 dark:to-gray-800 border-2 border-orange-200 dark:border-orange-700 shadow-xl">
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <span className="text-accent font-bold text-sm uppercase tracking-widest">Our Journey</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 leading-tight">
              Our Story
            </h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 mx-auto rounded-full"></div>
          </div>
          <div className="grid md:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] gap-8 sm:gap-12 items-center mb-6">
            <div className="order-2 md:order-1 space-y-6">
              <p className="text-gray-800 dark:text-gray-200 mb-5 text-lg sm:text-xl leading-relaxed font-medium">
                Esoko was created to make online shopping more convenient, reliable,
                and accessible for everyday customers. We carefully select products
                that combine value, quality, and style for modern living.
              </p>
              <p className="text-gray-800 dark:text-gray-200 mb-5 text-lg sm:text-xl leading-relaxed font-medium">
                Today, Esoko is growing into a versatile ecommerce destination
                where shoppers can discover fashion, home goods, beauty items,
                accessories, and other everyday finds in one place.
              </p>
              <p className="text-gray-800 dark:text-gray-200 text-lg sm:text-xl leading-relaxed font-medium">
                Our mission is simple: make it easier to shop with confidence by
                offering dependable products, clear pricing, secure checkout, and
                customer support that stays close to the people we serve.
              </p>
            </div>
            <div className="w-full max-w-md lg:max-w-lg md:ml-auto rounded-3xl overflow-hidden shadow-2xl hover:shadow-accent-lg transition-all duration-500 order-1 md:order-2 group relative bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 min-h-[224px] sm:min-h-[288px] md:min-h-[340px]">
              {!imageError ? (
                <div className="relative w-full h-56 sm:h-72 md:h-[340px] lg:h-[380px]">
                  <img
                    src={imageSrc}
                    alt="Featured Esoko products arranged on display shelves"
                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                    style={{ display: 'block', opacity: 1 }}
                    loading="eager"
                    onError={(e) => {
                      console.error('âŒ Image failed to load:', e.target.src)
                      setImageError(true)
                    }}
                    onLoad={(e) => {
                      console.log('âœ… Image loaded successfully:', e.target.src)
                      setImageLoaded(true)
                    }}
                  />
                  {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-200/60 to-orange-300/60 dark:from-orange-800/40 dark:to-orange-900/40 pointer-events-none">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-56 sm:h-72 md:h-[340px] lg:h-[380px] flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600 text-white">
                  <div className="text-center p-8">
                    <ShoppingBag className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-4" />
                    <div className="text-2xl sm:text-3xl font-black mb-2">Esoko</div>
                    <div className="text-base sm:text-lg font-medium opacity-90">Marketplace and everyday finds</div>
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

