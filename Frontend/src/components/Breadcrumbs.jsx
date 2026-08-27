import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

const Breadcrumbs = () => {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter((x) => x)

  // Don't show breadcrumbs on home page
  if (pathnames.length === 0) {
    return null
  }

  const getBreadcrumbName = (pathname) => {
    const nameMap = {
      products: 'Products',
      admin: 'Admin',
      account: 'Account',
      profile: 'Profile',
      wishlist: 'Wishlist',
      about: 'About',
      contact: 'Contact',
      'shipping-info': 'Shipping Info',
      'returns-refunds': 'Returns & Refunds',
      faq: 'FAQ',
      login: 'Login',
      register: 'Register',
      'forgot-password': 'Forgot Password',
      'reset-password': 'Reset Password',
      'verify-email': 'Verify Email',
    }

    // Check if it's a product ID (numeric)
    if (/^\d+$/.test(pathname)) {
      return 'Product Details'
    }

    return nameMap[pathname] || pathname.charAt(0).toUpperCase() + pathname.slice(1).replace(/-/g, ' ')
  }

  return (
    <nav className="mb-3 sm:mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
        <li>
          <Link
            to="/"
            className="flex items-center hover:text-accent transition-colors"
            aria-label="Home"
          >
            <Home className="w-4 h-4" />
          </Link>
        </li>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`
          const isLast = index === pathnames.length - 1
          const name = getBreadcrumbName(value)

          return (
            <li key={to} className="flex items-center">
              <ChevronRight className="w-4 h-4 mx-2 text-gray-400" aria-hidden="true" />
              {isLast ? (
                <span className="font-medium text-gray-900 dark:text-white" aria-current="page">
                  {name}
                </span>
              ) : (
                <Link
                  to={to}
                  className="hover:text-accent transition-colors"
                >
                  {name}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default Breadcrumbs

