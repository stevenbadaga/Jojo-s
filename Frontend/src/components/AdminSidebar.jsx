import { Link, useLocation } from 'react-router-dom'
import {
  BarChart3,
  Home,
  LayoutDashboard,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  Users,
  X,
} from 'lucide-react'
import { useState } from 'react'

const AdminSidebar = () => {
  const location = useLocation()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const menuItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin',
    },
    {
      name: 'Products',
      icon: Package,
      path: '/admin/products',
    },
    {
      name: 'Orders',
      icon: ShoppingBag,
      path: '/admin/orders',
    },
    {
      name: 'Analytics',
      icon: BarChart3,
      path: '/admin/analytics',
    },
    {
      name: 'Customers',
      icon: Users,
      path: '/admin/customers',
    },
  ]

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsMobileOpen((open) => !open)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-center text-gray-700 dark:text-gray-200"
        aria-label="Toggle admin navigation"
        aria-expanded={isMobileOpen}
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {isMobileOpen && (
        <button
          type="button"
          className="lg:hidden fixed inset-0 bg-gray-950/40 backdrop-blur-[1px] z-40"
          onClick={() => setIsMobileOpen(false)}
          aria-label="Close admin navigation"
        />
      )}

      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-40 h-screen w-[272px] flex-shrink-0
          bg-white dark:bg-gray-900 border-r border-gray-200/90 dark:border-gray-800
          transform transition-transform duration-300 ease-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
      >
        <div className="px-5 py-5 border-b border-gray-100 dark:border-gray-800">
          <Link
            to="/admin"
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#108910] text-white flex items-center justify-center shadow-sm group-hover:bg-[#0b731b] transition-colors">
              <ShoppingBag className="w-5 h-5" strokeWidth={1.9} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#108910] leading-none mb-1.5">
                Store console
              </p>
              <h2 className="text-lg font-black tracking-tight text-gray-950 dark:text-white leading-none">
                MarketMet
              </h2>
            </div>
          </Link>
        </div>

        <div className="px-4 pt-6 pb-2">
          <p className="px-3 text-[10px] font-black uppercase tracking-[0.18em] text-gray-400 dark:text-gray-600">
            Management
          </p>
        </div>

        <nav className="flex-1 px-3 pb-4 space-y-1 overflow-y-auto" aria-label="Admin navigation">
          {menuItems.map((item) => {
            const active = isActive(item.path)
            const Icon = item.icon

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={`
                  relative flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-bold transition-colors
                  ${active
                    ? 'bg-[#EAF7ED] dark:bg-[#108910]/15 text-[#0B6B22] dark:text-[#5FE56F]'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-950 dark:hover:text-white'
                  }
                `}
              >
                {active && (
                  <span className="absolute left-0 w-1 h-6 rounded-r-full bg-[#108910]" aria-hidden="true" />
                )}
                <Icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={1.8} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="px-4 pb-4">
          <div className="rounded-2xl bg-[#F7F9F8] dark:bg-gray-800/70 border border-gray-100 dark:border-gray-800 p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-[#108910]" />
              <p className="text-xs font-black text-gray-800 dark:text-gray-200">Store management</p>
            </div>
            <p className="text-[11px] leading-5 text-gray-500 dark:text-gray-400">
              Review sales, orders, products and customers from one place.
            </p>
          </div>
        </div>

        <div className="p-3 border-t border-gray-100 dark:border-gray-800 space-y-1">
          <Link
            to="/profile"
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-950 dark:hover:text-white transition-colors"
          >
            <Settings className="w-[18px] h-[18px]" strokeWidth={1.8} />
            <span>Settings</span>
          </Link>
          <Link
            to="/"
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-950 dark:hover:text-white transition-colors"
          >
            <Home className="w-[18px] h-[18px]" strokeWidth={1.8} />
            <span>View storefront</span>
          </Link>
        </div>
      </aside>
    </>
  )
}

export default AdminSidebar
