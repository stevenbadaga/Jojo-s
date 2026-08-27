import { useEffect } from 'react'

/**
 * Hook for keyboard navigation support
 * @param {Object} options - Configuration options
 * @param {Function} options.onEscape - Callback for Escape key
 * @param {Function} options.onEnter - Callback for Enter key
 * @param {boolean} options.enabled - Whether the hook is enabled
 */
export const useKeyboardNavigation = ({ onEscape, onEnter, enabled = true }) => {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onEscape) {
        e.preventDefault()
        onEscape()
      }
      if (e.key === 'Enter' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && onEnter) {
        e.preventDefault()
        onEnter()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onEscape, onEnter, enabled])
}

/**
 * Hook for focus trap (useful for modals)
 * @param {Object} ref - Ref to the container element
 * @param {boolean} enabled - Whether the trap is enabled
 */
export const useFocusTrap = (ref, enabled = true) => {
  useEffect(() => {
    if (!enabled || !ref.current) return

    const container = ref.current
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTab = (e) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    container.addEventListener('keydown', handleTab)
    firstElement?.focus()

    return () => {
      container.removeEventListener('keydown', handleTab)
    }
  }, [ref, enabled])
}

