const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const CACHE_KEY = 'marketmet_contact_email'
const MARKETMET_EMAIL_PATTERN = /[A-Z0-9._%+-]+@marketmet(?:\.[A-Z0-9.-]+)+/gi

let contactEmail = ''
let observer = null

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())

const applyToTree = (root = document) => {
  if (!contactEmail || typeof document === 'undefined') return

  const scope = root?.querySelectorAll ? root : document

  scope.querySelectorAll?.('a[href^="mailto:"]').forEach((link) => {
    link.setAttribute('href', `mailto:${contactEmail}`)
    if (MARKETMET_EMAIL_PATTERN.test(link.textContent || '')) {
      link.textContent = contactEmail
    }
    MARKETMET_EMAIL_PATTERN.lastIndex = 0
  })

  const walkerRoot = root?.nodeType ? root : document.body
  if (!walkerRoot) return

  const walker = document.createTreeWalker(walkerRoot, NodeFilter.SHOW_TEXT)
  let node = walker.nextNode()

  while (node) {
    const parentTag = node.parentElement?.tagName
    if (!['SCRIPT', 'STYLE', 'INPUT', 'TEXTAREA', 'OPTION'].includes(parentTag)) {
      const original = node.nodeValue || ''
      const updated = original.replace(MARKETMET_EMAIL_PATTERN, contactEmail)
      if (updated !== original) node.nodeValue = updated
    }
    MARKETMET_EMAIL_PATTERN.lastIndex = 0
    node = walker.nextNode()
  }
}

const loadContactEmail = async () => {
  const envEmail = String(import.meta.env.VITE_CONTACT_EMAIL || '').trim()
  const cached = typeof localStorage !== 'undefined' ? localStorage.getItem(CACHE_KEY) : ''

  if (isValidEmail(envEmail)) contactEmail = envEmail
  else if (isValidEmail(cached)) contactEmail = cached

  if (contactEmail) applyToTree(document)

  try {
    const response = await fetch(`${API_BASE_URL}/public-config`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })
    if (!response.ok) return
    const data = await response.json()
    const nextEmail = String(data?.contactEmail || '').trim()
    if (!isValidEmail(nextEmail)) return

    contactEmail = nextEmail
    localStorage.setItem(CACHE_KEY, nextEmail)
    applyToTree(document)
  } catch {
    // Keep the cached/env value when the API is temporarily unavailable.
  }
}

export const installContactEmailSync = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  loadContactEmail()

  if (observer) return
  observer = new MutationObserver((mutations) => {
    if (!contactEmail) return
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
          applyToTree(node)
        } else if (node.nodeType === Node.TEXT_NODE && MARKETMET_EMAIL_PATTERN.test(node.nodeValue || '')) {
          node.nodeValue = (node.nodeValue || '').replace(MARKETMET_EMAIL_PATTERN, contactEmail)
        }
        MARKETMET_EMAIL_PATTERN.lastIndex = 0
      })
    })
  })

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  })
}
