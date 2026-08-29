import { Download, ShoppingBag, X } from 'lucide-react'
import { useEffect, useState } from 'react'

const DISMISS_KEY = 'marketmet_pwa_prompt_dismissed_at'
const DISMISS_DAYS = 14

const PWAInstallPrompt = () => {
  const [installEvent, setInstallEvent] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
    if (standalone) return

    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0)
    const stillDismissed = dismissedAt && Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000

    const handlePrompt = (event) => {
      event.preventDefault()
      setInstallEvent(event)
      if (!stillDismissed) window.setTimeout(() => setVisible(true), 1800)
    }

    const handleInstalled = () => {
      setVisible(false)
      setInstallEvent(null)
      localStorage.removeItem(DISMISS_KEY)
    }

    window.addEventListener('beforeinstallprompt', handlePrompt)
    window.addEventListener('appinstalled', handleInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  const dismiss = () => {
    setVisible(false)
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
  }

  const install = async () => {
    if (!installEvent) return
    await installEvent.prompt()
    try { await installEvent.userChoice } catch { /* browser may not expose choice */ }
    setVisible(false)
    setInstallEvent(null)
  }

  if (!visible || !installEvent) return null

  return (
    <div className="fixed bottom-20 left-3 right-3 z-[65] mx-auto max-w-md rounded-2xl border border-white/10 bg-[#071D1A]/95 p-3 text-white shadow-2xl backdrop-blur-xl sm:bottom-5 sm:left-auto sm:right-5 sm:mx-0">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-[#108910] text-white"><ShoppingBag className="h-5 w-5" /></span>
        <div className="min-w-0 flex-1"><p className="text-sm font-black">Install MarketMet</p><p className="mt-1 text-[11px] leading-5 text-gray-300">Add MarketMet to your device for faster access to groceries, orders and saved items.</p></div>
        <button onClick={dismiss} className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg text-gray-400 hover:bg-white/10 hover:text-white" aria-label="Dismiss install prompt"><X className="h-4 w-4" /></button>
      </div>
      <button onClick={install} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#108910] py-2.5 text-xs font-black text-white transition hover:bg-[#0b731b]"><Download className="h-4 w-4" /> Install app</button>
    </div>
  )
}

export default PWAInstallPrompt
