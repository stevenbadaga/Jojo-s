const FEATURED_PRODUCE_IMAGE = 'https://images.unsplash.com/photo-1739488447641-05abf21e933f?auto=format&fit=crop&w=1400&q=88'
const HERO_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1751200270667-cb13feeac24c?auto=format&fit=crop&w=1400&q=88'

const applyHeroUpgrade = () => {
  const featuredImage = document.querySelector('img[alt="Fresh organic basket"]')
  if (featuredImage) {
    if (featuredImage.src !== FEATURED_PRODUCE_IMAGE) featuredImage.src = FEATURED_PRODUCE_IMAGE
    featuredImage.loading = 'eager'
    featuredImage.decoding = 'async'
    featuredImage.classList.add('marketmet-featured-produce-image')

    const offerMedia = featuredImage.parentElement
    offerMedia?.classList.add('marketmet-featured-offer-media')
    offerMedia?.parentElement?.classList.add('marketmet-featured-offer-card')
    featuredImage.closest('section')?.classList.add('marketmet-produce-hero')
  }

  const showcaseLabel = [...document.querySelectorAll('span')].find((node) =>
    node.textContent?.trim().toLowerCase() === 'live fresh showcase'
  )
  const showcase = showcaseLabel?.closest('.pt-4')
  if (showcase) showcase.classList.add('marketmet-produce-showcase')

  document.querySelectorAll('img').forEach((image) => {
    if (image.dataset.marketmetHeroFallbackBound === 'true') return
    if (!image.closest('.marketmet-produce-showcase')) return
    image.dataset.marketmetHeroFallbackBound = 'true'
    image.addEventListener('error', () => {
      if (image.src !== HERO_FALLBACK_IMAGE) image.src = HERO_FALLBACK_IMAGE
    })
  })
}

export const installHeroProduceUpgrade = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  const run = () => window.requestAnimationFrame(applyHeroUpgrade)
  run()

  const observer = new MutationObserver(run)
  observer.observe(document.documentElement, { childList: true, subtree: true })
}
