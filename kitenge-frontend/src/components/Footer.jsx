import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Facebook, Instagram, X, Heart, ArrowRight, Sparkles } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-900 to-black text-gray-300 overflow-hidden border-t border-gray-800">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-accent rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-10 mb-6 sm:mb-8">
          {/* Brand Section */}
          <div className="col-span-2 md:col-span-1 space-y-3 sm:space-y-4">
            <div>
              <h3 className="text-2xl sm:text-3xl font-black leading-[0.95] tracking-tight text-white mb-2 sm:mb-3 bg-gradient-to-r from-accent-400 via-accent-500 to-accent-600 to-accent-500 bg-clip-text text-transparent">
                ESOKO
              </h3>
              <p className="text-sm sm:text-[15px] text-gray-400 leading-relaxed mb-3 sm:mb-4 font-medium">
                Esoko brings fashion, home, beauty, accessories, and everyday essentials into one simple shopping experience.
              </p>
            </div>
            
            {/* Social Media Icons */}
            <div>
              <p className="text-sm font-bold text-white mb-2 sm:mb-3 uppercase tracking-wider">Follow Us</p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-gradient-to-br from-[#1877F2] to-[#166FE5] active:from-[#166FE5] active:to-[#1877F2] flex items-center justify-center transition-all duration-300 shadow-lg active:shadow-xl active:scale-110 active:-translate-y-1 touch-manipulation"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5 text-white group-active:scale-110 transition-transform duration-300" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCB045] active:from-[#6B2F94] active:via-[#E01A1A] active:to-[#E09A3A] flex items-center justify-center transition-all duration-300 shadow-lg active:shadow-xl active:scale-110 active:-translate-y-1 touch-manipulation"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5 text-white group-active:scale-110 transition-transform duration-300" />
                </a>
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-gradient-to-br from-black to-gray-900 active:from-gray-900 active:to-black flex items-center justify-center transition-all duration-300 shadow-lg active:shadow-xl active:scale-110 active:-translate-y-1 border border-gray-800 touch-manipulation"
                  aria-label="X (Twitter)"
                >
                  <X className="w-5 h-5 text-white group-active:scale-110 transition-transform duration-300" />
                </a>
                <a
                  href="https://wa.me/250788883986"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-gradient-to-br from-[#25D366] to-[#20BA5A] active:from-[#20BA5A] active:to-[#25D366] flex items-center justify-center transition-all duration-300 shadow-lg active:shadow-xl active:scale-110 active:-translate-y-1 touch-manipulation"
                  aria-label="WhatsApp"
                >
                  <svg className="w-5 h-5 text-white group-active:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-black text-sm sm:text-base mb-3 sm:mb-4 flex items-center gap-2 uppercase tracking-wide">
              <Sparkles className="w-5 h-5 text-accent" />
              Quick Links
            </h4>
            <ul className="grid grid-cols-1 min-[430px]:grid-cols-2 sm:grid-cols-1 gap-x-6 gap-y-1.5 sm:gap-y-2.5">
              {[
                { to: '/', label: 'Home' },
                { to: '/products', label: 'Products' },
                { to: '/about', label: 'About Us' },
                { to: '/contact', label: 'Contact' },
                { to: '/wishlist', label: 'Wishlist' },
              ].map((link) => (
                <li key={link.to}>
                  <Link 
                    to={link.to} 
                    className="group flex items-center gap-2 text-gray-400 hover:text-accent transition-all text-sm sm:text-base"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    <span className="group-hover:translate-x-1 transition-transform">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-black text-sm sm:text-base mb-3 sm:mb-4 flex items-center gap-2 uppercase tracking-wide">
              <Heart className="w-5 h-5 text-accent" />
              Customer Service
            </h4>
            <ul className="grid grid-cols-1 min-[430px]:grid-cols-2 sm:grid-cols-1 gap-x-6 gap-y-1.5 sm:gap-y-2.5">
              {[
                { to: '/account', label: 'My Account' },
                { to: '/profile', label: 'Profile Settings' },
                { to: '/shipping-info', label: 'Shipping Info' },
                { to: '/returns-refunds', label: 'Returns & Refunds' },
                { to: '/faq', label: 'FAQ' },
              ].map((link) => (
                <li key={link.to}>
                  <Link 
                    to={link.to} 
                    className="group flex items-center gap-2 text-gray-400 hover:text-accent transition-all text-sm sm:text-base"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    <span className="group-hover:translate-x-1 transition-transform">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-white font-black text-sm sm:text-base mb-3 sm:mb-4 flex items-center gap-2 uppercase tracking-wide">
              <MapPin className="w-5 h-5 text-accent" />
              Get in Touch
            </h4>
            <ul className="space-y-2.5 sm:space-y-3">
              <li>
                <a
                  href="mailto:esoko@gmail.com"
                  className="group flex items-start gap-3 text-gray-400 hover:text-accent transition-all"
                >
                  <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-accent/20 transition-colors mt-0.5">
                    <Mail className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Email</p>
                    <p className="text-sm sm:text-base">esoko@gmail.com</p>
                  </div>
                </a>
              </li>
              <li>
                <a
                  href="tel:+250788883986"
                  className="group flex items-start gap-3 text-gray-400 hover:text-accent transition-all"
                >
                  <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-accent/20 transition-colors mt-0.5">
                    <Phone className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                    <p className="text-sm sm:text-base">+250 788 883 986</p>
                  </div>
                </a>
              </li>
              <li>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Kigali,Rwanda"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 text-gray-400 hover:text-accent transition-all"
                >
                  <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-accent/20 transition-colors mt-0.5">
                    <MapPin className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Location</p>
                    <p className="text-sm sm:text-base">Kigali, Rwanda</p>
                  </div>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-5 sm:pt-7">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
              <Heart className="w-4 h-4 text-accent fill-current animate-pulse" />
              <p>
                Made with love in Rwanda © {currentYear} Esoko. All rights reserved.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm">
              <Link 
                to="/contact" 
                className="text-gray-400 hover:text-accent transition-colors"
              >
                Privacy Policy
              </Link>
              <span className="text-gray-600">•</span>
              <Link 
                to="/contact" 
                className="text-gray-400 hover:text-accent transition-colors"
              >
                Terms of Service
              </Link>
              <span className="text-gray-600">•</span>
              <Link 
                to="/faq" 
                className="text-gray-400 hover:text-accent transition-colors"
              >
                Help Center
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
