const BRAND_REPLACEMENTS = [
  [/Instacart Express/gi, 'Fast Delivery'],
  [/Hot Instacart Deals/gi, 'Hot MarketMet Deals'],
  [/Instacart/gi, 'MarketMet'],
]

const replaceBrandText = (value) => {
  if (!value || !/instacart/i.test(value)) return value

  return BRAND_REPLACEMENTS.reduce(
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

export const installBrandCleanup = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  cleanTree(document.body)

  const observer = new MutationObserver((mutations) => {
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
}
