import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Facebook, Instagram, X, Heart, ArrowRight, Sparkles, ShoppingBag } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative bg-[#002524] text-gray-200 overflow-hidden border-t border-emerald-900/50">
      {/* Background Decorative Glow */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#108910] rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FF6B00] rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 mb-8 sm:mb-12">
          {/* Instacart Brand Section */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#108910] text-white flex items-center justify-center shadow-lg">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">
                MarketMet
              </h3>
            </div>
            
            <p className="text-sm text-gray-300 leading-relaxed font-medium">
              Fresh Groceries to Your Door. Bringing farm-fresh organic produce, cold dairy, artisan bakery, and everyday household essentials straight to your door in as fast as 30 minutes.
            </p>
            
            {/* Social Media Icons */}
            <div>
              <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Connect With Us</p>
              <div className="flex flex-wrap gap-2.5">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#108910] text-white flex items-center justify-center transition-all duration-300"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#108910] text-white flex items-center justify-center transition-all duration-300"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#108910] text-white flex items-center justify-center transition-all duration-300"
                  aria-label="X (Twitter)"
                >
                  <X className="w-4 h-4" />
                </a>
                <a
                  href="https://wa.me/250780453704"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center transition-all duration-300"
                  aria-label="WhatsApp"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Grocery Aisles */}
          <div>
            <h4 className="text-white font-extrabold text-sm mb-4 flex items-center gap-2 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-[#FF6B00]" />
              Grocery Aisles
            </h4>
            <ul className="space-y-2">
              {[
                { to: '/products?category=Produce', label: '🥦 Fresh Produce' },
                { to: '/products?category=Dairy', label: '🥛 Dairy & Eggs' },
                { to: '/products?category=Bakery', label: '🍞 Fresh Bakery' },
                { to: '/products?category=Pantry', label: '🫒 Pantry & Oils' },
                { to: '/products?category=Beverages', label: '🧃 Juices & Drinks' },
              ].map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.to} 
                    className="text-gray-300 hover:text-emerald-400 text-sm font-medium transition-colors flex items-center gap-1.5"
                  >
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="text-white font-extrabold text-sm mb-4 flex items-center gap-2 uppercase tracking-wider">
              <Heart className="w-4 h-4 text-[#05A42E]" />
              Express Delivery
            </h4>
            <ul className="space-y-2">
              {[
                { to: '/account', label: 'My Account' },
                { to: '/order-tracking', label: 'Live Order Tracker' },
                { to: '/shipping-info', label: '30-Min Delivery Info' },
                { to: '/returns-refunds', label: 'Freshness Returns Guarantee' },
                { to: '/faq', label: 'Customer Help & FAQ' },
              ].map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.to} 
                    className="text-gray-300 hover:text-emerald-400 text-sm font-medium transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-white font-extrabold text-sm mb-4 flex items-center gap-2 uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-[#05A42E]" />
              Kigali Fulfillment Hub
            </h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#05A42E]">
                  <Mail className="w-4 h-4" />
                </div>
                <span>support@marketmet.com</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#05A42E]">
                  <Phone className="w-4 h-4" />
                </div>
                <span>+250 780 453 704</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#05A42E]">
                  <MapPin className="w-4 h-4" />
                </div>
                <span>Central Kigali • Same-day Express</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-emerald-900/60 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p>© {currentYear} MarketMet. Fresh Groceries to Your Door.</p>
          <div className="flex items-center gap-4">
            <Link to="/contact" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-emerald-400 transition-colors">Terms of Service</Link>
            <span>•</span>
            <Link to="/faq" className="hover:text-emerald-400 transition-colors">Help Center</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
