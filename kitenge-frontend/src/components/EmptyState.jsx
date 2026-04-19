/**
 * Empty State Component
 * Provides consistent empty states across the application
 */
import { Link } from 'react-router-dom'
import { ShoppingBag, Package, Heart, Search, Inbox, ArrowRight } from 'lucide-react'

const EmptyState = ({ 
  icon: Icon = Inbox, 
  title, 
  description, 
  actionLabel, 
  actionLink, 
  actionOnClick,
  className = '' 
}) => {
  return (
    <div className={`text-center py-12 sm:py-16 lg:py-20 ${className}`}>
      <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full mb-6">
        <Icon className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto text-sm sm:text-base">
        {description}
      </p>
      {actionLabel && (
        actionLink ? (
          <Link
            to={actionLink}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {actionLabel}
            <ArrowRight className="w-5 h-5" />
          </Link>
        ) : actionOnClick ? (
          <button
            onClick={actionOnClick}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {actionLabel}
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : null
      )}
    </div>
  )
}

// Pre-configured empty states
export const EmptyProducts = ({ actionLabel = 'Browse All Products', actionLink = '/products' }) => (
  <EmptyState
    icon={ShoppingBag}
    title="No Products Found"
    description="We couldn't find any products matching your search. Try adjusting your filters or browse our full collection."
    actionLabel={actionLabel}
    actionLink={actionLink}
  />
)

export const EmptyWishlist = () => (
  <EmptyState
    icon={Heart}
    title="Your Wishlist is Empty"
    description="Start exploring products across fashion, home, beauty, accessories, and everyday essentials. Save items you love to your wishlist!"
    actionLabel="Start Shopping"
    actionLink="/products"
  />
)

export const EmptyOrders = () => (
  <EmptyState
    icon={Package}
    title="No Orders Yet"
    description="You haven't placed any orders yet. Start shopping to see your order history here."
    actionLabel="Start Shopping"
    actionLink="/products"
  />
)

export const EmptySearch = ({ searchQuery, onClear }) => (
  <EmptyState
    icon={Search}
    title={`No results for "${searchQuery}"`}
    description="Try adjusting your search terms or filters to find what you're looking for."
    actionLabel="Clear Search"
    actionOnClick={onClear}
  />
)

export const EmptyCart = ({ onClose }) => (
  <EmptyState
    icon={ShoppingBag}
    title="Your Cart is Empty"
    description="Add some products to get started! Browse our collection and add items to your cart."
    actionLabel="Continue Shopping"
    actionOnClick={onClose}
  />
)

export default EmptyState

