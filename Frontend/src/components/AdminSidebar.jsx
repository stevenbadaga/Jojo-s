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
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { name: 'Products', icon: Package, path: '/admin/products' },
    { name: 'Orders', icon: ShoppingBag, path: '/admin/orders' },
    { name: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
    { name: 'Customers', icon: Users, path: '/admin/customers' },
  ]

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin'
    return location.pathname.startsWith(path)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsMobileOpen((open) => !open)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm lg:hidden dark:border-white/10 dark:bg-black dark:text-white"
        aria-label="Toggle admin navigation"
        aria-expanded={isMobileOpen}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {isMobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-[2px] lg:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-label="Close admin navigation"
        />
      )}

      <aside
        className={`
          admin-sidebar fixed left-0 top-0 z-40 flex h-screen w-[264px] flex-shrink-0 flex-col
          border-r border-gray-200 bg-white transition-transform duration-300 ease-out
          dark:border-white/10 dark:bg-black lg:sticky
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="border-b border-gray-100 px-5 py-5 dark:border-white/10">
          <Link
            to="/admin"
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#108910] text-white shadow-sm">
              <ShoppingBag className="h-5 w-5" strokeWidth={1.9} />
            </div>
            <div className="min-w-0">
              <h2 className="text-[17px] font-black tracking-tight text-gray-950 dark:text-white">
                MarketMet
              </h2>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400 dark:text-gray-600">
                Store Console
              </p>
            </div>
          </Link>
        </div>

        <div className="px-4 pb-2 pt-5">
          <p className="px-3 text-[10px] font-black uppercase tracking-[0.16em] text-gray-400 dark:text-gray-600">
            Main Menu
          </p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4" aria-label="Admin navigation">
          {menuItems.map((item) => {
            const active = isActive(item.path)
            const Icon = item.icon

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={`
                  flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-bold transition-all
                  ${active
                    ? 'bg-[#108910] text-white shadow-[0_8px_24px_rgba(16,137,16,0.20)]'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-950 dark:text-gray-400 dark:hover:bg-white/[0.05] dark:hover:text-white'
                  }
                `}
              >
                <Icon className="h-[18px] w-[18px] flex-shrink-0" strokeWidth={1.8} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="px-4 pb-4">
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-white/[0.08] dark:bg-[#080808]">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#31c548] shadow-[0_0_10px_rgba(49,197,72,0.7)]" />
              <p className="text-xs font-black text-gray-800 dark:text-gray-200">Store online</p>
            </div>
            <p className="text-[11px] leading-5 text-gray-500 dark:text-gray-500">
              Sales, customers, orders and catalog management in one place.
            </p>
          </div>
        </div>

        <div className="space-y-1 border-t border-gray-100 p-3 dark:border-white/10">
          <Link
            to="/profile"
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50 hover:text-gray-950 dark:text-gray-400 dark:hover:bg-white/[0.05] dark:hover:text-white"
          >
            <Settings className="h-[18px] w-[18px]" strokeWidth={1.8} />
            <span>Settings</span>
          </Link>
          <Link
            to="/"
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50 hover:text-gray-950 dark:text-gray-400 dark:hover:bg-white/[0.05] dark:hover:text-white"
          >
            <Home className="h-[18px] w-[18px]" strokeWidth={1.8} />
            <span>View storefront</span>
          </Link>
        </div>
      </aside>
    </>
  )
}

export default AdminSidebar
