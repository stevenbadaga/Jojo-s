const GROCERY_VIDEO = 'https://cdn.coverr.co/videos/coverr-woman-shopping-for-fresh-produce/1080p.mp4'
const GROCERY_POSTER = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1800&q=85'

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

const enhanceAuth = () => {
  const path = window.location.pathname
  const isAuth = path === '/login' || path === '/register'
  document.body.classList.toggle('auth-cinematic-page', isAuth)
  if (!isAuth) return

  const panel = document.querySelector('main div.hidden.lg\\:flex.flex-1.relative.overflow-hidden')
  if (!panel || panel.querySelector('.auth-cinematic-panel')) return

  const cinematic = document.createElement('div')
  cinematic.className = 'auth-cinematic-panel'
  cinematic.style.background = `linear-gradient(rgba(3,9,5,.25), rgba(3,9,5,.55)), url("${GROCERY_POSTER}") center/cover no-repeat`
  cinematic.appendChild(makeVideo())

  const copy = document.createElement('div')
  copy.className = 'auth-cinematic-copy'
  copy.innerHTML = path === '/login'
    ? `<div class="auth-cinematic-kicker">MarketMet • Fresh every day</div>
       <h2>Welcome back to better grocery shopping.</h2>
       <p>Fresh produce, everyday essentials and dependable delivery—all in one account.</p>
       <div class="auth-cinematic-metrics"><span>Fresh produce</span><span>Secure account</span><span>Fast checkout</span></div>`
    : `<div class="auth-cinematic-kicker">Join MarketMet</div>
       <h2>Your fresh-market experience starts here.</h2>
       <p>Create an account to save favourites, track orders and move through checkout faster.</p>
       <div class="auth-cinematic-metrics"><span>Saved favourites</span><span>Order tracking</span><span>Member convenience</span></div>`

  cinematic.appendChild(copy)
  panel.appendChild(cinematic)
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
  window.requestAnimationFrame(() => {
    enhanceAuth()
    enhanceHome()
  })
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
