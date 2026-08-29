const SUPERMARKET_HERO_IMAGE =
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=2400&q=88'

const enhanceHome = () => {
  if (window.location.pathname !== '/') return

  const sections = Array.from(document.querySelectorAll('main section'))
  const hero = sections.find((section) => section.textContent?.includes('Fresh groceries delivered'))
  if (!hero) return

  hero.classList.add('marketmet-home-hero')
  hero.style.setProperty('--marketmet-hero-image', `url("${SUPERMARKET_HERO_IMAGE}")`)

  // Remove any cinematic video layer left behind by an older deployment.
  hero.querySelectorAll('.home-cinematic-layer').forEach((layer) => layer.remove())
}

const refreshEnhancements = () => {
  window.requestAnimationFrame(enhanceHome)
}

export const installCinematicEnhancements = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  const originalPushState = history.pushState
  const originalReplaceState = history.replaceState

  history.pushState = function (...args) {
    const result = originalPushState.apply(this, args)
    refreshEnhancements()
    return result
  }

  history.replaceState = function (...args) {
    const result = originalReplaceState.apply(this, args)
    refreshEnhancements()
    return result
  }

  window.addEventListener('popstate', refreshEnhancements)
  window.addEventListener('load', refreshEnhancements)

  const observer = new MutationObserver(() => refreshEnhancements())
  observer.observe(document.body, { childList: true, subtree: true })

  refreshEnhancements()
}
