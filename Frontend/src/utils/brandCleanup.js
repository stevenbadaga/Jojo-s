const TEXT_REPLACEMENTS = [
  [/Instacart Grocery Aisles/gi, 'Shop Groceries'],
  [
    /Shop fresh organic produce, fruits, vegetables, cold dairy, artisan bakery, and everyday market groceries\./gi,
    'Fresh groceries, everyday essentials, and local favorites.',
  ],
  [/Instacart Express/gi, 'Fast Delivery'],
  [/Hot Instacart Deals/gi, 'Hot MarketMet Deals'],
  [/Instacart/gi, 'MarketMet'],
]

const replaceBrandText = (value) => {
  if (!value) return value

  return TEXT_REPLACEMENTS.reduce(
    (result, [pattern, replacement]) => result.replace(pattern, replacement),
    value
  )
}

const cleanTextNode = (node) => {
  if (node?.nodeType !== Node.TEXT_NODE) return
  const nextValue = replaceBrandText(node.nodeValue)
  if (nextValue !== node.nodeValue) node.nodeValue = nextValue
}

const cleanTree = (root) => {
  if (!root) return

  if (root.nodeType === Node.TEXT_NODE) {
    cleanTextNode(root)
    return
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let node = walker.nextNode()
  while (node) {
    cleanTextNode(node)
    node = walker.nextNode()
  }
}

const syncRoute = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  document.documentElement.dataset.route = window.location.pathname
}

export const installBrandCleanup = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  syncRoute()
  cleanTree(document.body)

  const observer = new MutationObserver((mutations) => {
    syncRoute()
    mutations.forEach((mutation) => {
      if (mutation.type === 'characterData') {
        cleanTextNode(mutation.target)
        return
      }

      mutation.addedNodes.forEach((node) => cleanTree(node))
    })
  })

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
  })

  window.addEventListener('popstate', syncRoute)
  window.addEventListener('hashchange', syncRoute)
}
