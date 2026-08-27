/**
 * Centralized image URL helper
 * Handles both relative and absolute image paths
 */

const getImageBaseUrl = () => {
  // Get API base URL from environment or default
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
  
  // Remove /api suffix if present to get base server URL
  const baseUrl = apiUrl.replace('/api', '')
  
  return baseUrl
}

/**
 * Get full image URL from image path
 * @param {string} imagePath - The image path (can be relative, absolute, or full URL)
 * @returns {string} - Full image URL
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath || imagePath.trim() === '') {
    return '/placeholder.png'
  }

  // If already a full URL (http/https), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }

  const baseUrl = getImageBaseUrl()
  
  // If starts with /, it's an absolute path from server root (e.g., /uploads/image.jpg)
  if (imagePath.startsWith('/')) {
    // If baseUrl is localhost and we're likely on a deployed site, try to detect
    if (baseUrl.includes('localhost') && window.location.hostname !== 'localhost') {
      console.warn('Image URL uses localhost but site is deployed. Set VITE_API_URL environment variable.')
    }
    const fullUrl = `${baseUrl}${imagePath}`
    
    // Debug logging in development
    if (import.meta.env.DEV) {
      console.log('🖼️ Image URL:', fullUrl, 'from path:', imagePath)
    }
    
    return fullUrl
  }

  // Otherwise, it's a relative path (e.g., uploads/image.jpg or image.jpg)
  // Backend serves from /uploads/, so if it doesn't start with /uploads/, add it
  let relativePath = imagePath
  if (!relativePath.startsWith('uploads/')) {
    relativePath = `uploads/${relativePath}`
  }
  
  const fullUrl = `${baseUrl}/${relativePath}`
  
  // Debug logging in development
  if (import.meta.env.DEV) {
    console.log('🖼️ Image URL:', fullUrl, 'from path:', imagePath)
  }
  
  return fullUrl
}

/**
 * Get placeholder image URL
 * @returns {string} - Placeholder image URL
 */
export const getPlaceholderImage = () => {
  return '/placeholder.png'
}

