const GROCERY_VIDEO = 'https://cdn.coverr.co/videos/coverr-woman-shopping-for-fresh-produce/1080p.mp4'

const makeVideo = (className = '') => {
  const video = document.createElement('video')
  video.className = className
  video.autoplay = true
  video.muted = true
  video.loop = true
  video.playsInline = true
  video.preload = 'metadata'
  video.setAttribute('aria-hidden', 'true')

  const source = document.createElement('source')
  source.src = GROCERY_VIDEO
  source.type = 'video/mp4'
  video.appendChild(source)

  video.addEventListener('error', () => {
    video.style.display = 'none'
  })

  return video
}

const enhanceHome = () => {
  if (window.location.pathname !== '/') return

  const sections = Array.from(document.querySelectorAll('main section'))
  const hero = sections.find((section) => section.textContent?.includes('Fresh groceries delivered'))
  if (!hero || hero.querySelector('.home-cinematic-layer')) return

  const layer = document.createElement('div')
  layer.className = 'home-cinematic-layer hidden md:block'
  layer.appendChild(makeVideo())
  hero.prepend(layer)
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
