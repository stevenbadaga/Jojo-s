import { useState, useEffect, useRef } from 'react'
import { getImageUrl } from '../utils/imageUtils'

const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  placeholder = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
  onError,
  loading = 'lazy',
  ...props 
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef(null)
  const observerRef = useRef(null)

  useEffect(() => {
    if (!src) {
      setImageSrc(placeholder)
      return
    }

    const fullImageUrl = getImageUrl(src)

    // If loading is eager, load immediately
    if (loading === 'eager') {
      setImageSrc(fullImageUrl)
      return
    }

    // Use Intersection Observer for lazy loading
    if ('IntersectionObserver' in window) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setImageSrc(fullImageUrl)
              if (observerRef.current && imgRef.current) {
                observerRef.current.unobserve(imgRef.current)
              }
            }
          })
        },
        {
          rootMargin: '50px', // Start loading 50px before image enters viewport
        }
      )

      if (imgRef.current) {
        observerRef.current.observe(imgRef.current)
      }
    } else {
      // Fallback for browsers without IntersectionObserver
      setImageSrc(fullImageUrl)
    }

    return () => {
      if (observerRef.current && imgRef.current) {
        observerRef.current.unobserve(imgRef.current)
      }
    }
  }, [src, loading, placeholder])

  const handleLoad = () => {
    setIsLoaded(true)
  }

  const handleError = (e) => {
    setHasError(true)
    setImageSrc(placeholder)
    // Log error for debugging
    if (import.meta.env.DEV) {
      const fullUrl = getImageUrl(src)
      console.error('❌ Image failed to load:', {
        originalPath: src,
        fullUrl: fullUrl,
        error: e,
        hint: 'Check if backend is running and image exists at this URL'
      })
    }
    if (onError) {
      onError(e)
    }
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        onLoad={handleLoad}
        onError={handleError}
        loading={loading}
        {...props}
      />
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 border-t-accent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  )
}

export default LazyImage

