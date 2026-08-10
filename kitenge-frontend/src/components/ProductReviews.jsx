import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { reviewsAPI } from '../services/api'
import { Star, MessageSquare, Trash2 } from 'lucide-react'

const ProductReviews = ({ productId }) => {
  const { isAuthenticated, user } = useAuth()
  const toast = useToast()
  const [reviews, setReviews] = useState([])
  const [averageRating, setAverageRating] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadReviews()
  }, [productId])

  const loadReviews = async () => {
    try {
      const [reviewsRes, ratingRes] = await Promise.all([
        reviewsAPI.getProductReviews(productId),
        reviewsAPI.getProductRating(productId),
      ])
      setReviews(reviewsRes.data || [])
      setAverageRating(ratingRes.data?.averageRating || 0)
    } catch (error) {
      console.error('Failed to load reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.warning('Please login to leave a review')
      return
    }

    setSubmitting(true)
    try {
      await reviewsAPI.createReview({
        productId,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      })
      toast.success('Review submitted successfully!')
      setReviewForm({ rating: 5, comment: '' })
      setShowForm(false)
      loadReviews()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return

    try {
      await reviewsAPI.deleteReview(reviewId)
      toast.success('Review deleted successfully')
      loadReviews()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete review')
    }
  }

  const renderStars = (rating, interactive = false, onChange = null) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : 'div'}
            onClick={interactive && onChange ? () => onChange(star) : undefined}
            className={interactive ? 'cursor-pointer' : ''}
            disabled={!interactive}
          >
            <Star
              className={`w-5 h-5 ${
                star <= rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    )
  }

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Customer Reviews
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {renderStars(Math.round(averageRating))}
              <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">
                {averageRating.toFixed(1)}
              </span>
            </div>
            <span className="text-gray-500 dark:text-gray-400">
              ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        </div>
        {isAuthenticated && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Write a Review
          </button>
        )}
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="card p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Write a Review
          </h3>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rating
              </label>
              {renderStars(reviewForm.rating, true, (rating) =>
                setReviewForm({ ...reviewForm, rating })
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Comment
              </label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) =>
                  setReviewForm({ ...reviewForm, comment: e.target.value })
                }
                className="input-field"
                rows={4}
                placeholder="Share your thoughts about this product..."
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setReviewForm({ rating: 5, comment: '' })
                }}
                className="btn-outline"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No reviews yet. Be the first to review this product!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="card p-6 bg-white dark:bg-gray-800/80 border border-gray-200/90 dark:border-gray-700 rounded-2xl shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h4 className="font-extrabold text-gray-900 dark:text-white">
                      {review.userName || 'Kigali Shopper'}
                    </h4>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#108910] bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      ✓ Verified Shopper Purchase
                    </span>
                    {renderStars(review.rating)}
                  </div>
                  <p className="text-xs text-gray-400 font-medium">
                    {new Date(review.createdAt || Date.now()).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                {isAuthenticated && user?.id === review.userId && (
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              {review.comment && (
                <p className="text-gray-700 dark:text-gray-300 mt-2 text-sm leading-relaxed font-medium">
                  "{review.comment}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductReviews

