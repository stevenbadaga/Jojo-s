import { useEffect, useRef, useState } from 'react'
import { Download, Share, X } from 'lucide-react'

const isIOS = () =>
  /iphone|ipad|ipod/i.test(window.navigator.userAgent) ||
  (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1)

const isStandalone = () => {
  const standaloneMedia = window.matchMedia('(display-mode: standalone)').matches
  const legacyStandalone = window.navigator.standalone === true
  return standaloneMedia || legacyStandalone
}

export default function InstallAppPrompt() {
  const [installEvent, setInstallEvent] = useState(null)
  const [visible, setVisible] = useState(false)
  const [installed, setInstalled] = useState(false)
  const [mobileIOS, setMobileIOS] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    const ios = isIOS()
    setMobileIOS(ios)

    const hideIfInstalled = () => {
      if (isStandalone()) {
        setInstalled(true)
        setVisible(false)
      }
    }

    // iOS Safari does not expose beforeinstallprompt. The only reliable
    // flow is to show one in-page guide for Safari's Share > Add to Home Screen.
    if (isStandalone()) {
      setInstalled(true)
      return undefined
    }

    const showPrompt = () => {
      window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => {
        if (!isStandalone()) setVisible(true)
      }, 900)
    }

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault()
      setInstallEvent(event)
      showPrompt()
    }

    const handleInstalled = () => {
      setInstalled(true)
      setVisible(false)
      setInstallEvent(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)
    window.addEventListener('pageshow', hideIfInstalled)
    document.addEventListener('visibilitychange', hideIfInstalled)

    showPrompt()

    return () => {
      window.clearTimeout(timerRef.current)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleInstalled)
      window.removeEventListener('pageshow', hideIfInstalled)
      document.removeEventListener('visibilitychange', hideIfInstalled)
    }
  }, [])

  if (!visible || installed) return null

  const install = async () => {
    if (!installEvent) return

    try {
      await installEvent.prompt()
      const choice = await installEvent.userChoice

      if (choice?.outcome === 'accepted') {
        setInstalled(true)
        setVisible(false)
      } else {
        setVisible(false)
      }
    } catch (error) {
      console.warn('MarketMet install prompt failed:', error)
      setVisible(false)
    } finally {
      setInstallEvent(null)
    }
  }

  const dismiss = () => {
    setVisible(false)
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] mx-auto w-auto max-w-sm rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl sm:left-auto sm:right-5 sm:w-[min(360px,calc(100vw-2rem))] dark:border-white/10 dark:bg-[#101816]">
      <button
        type="button"
        onClick={dismiss}
        aria-label="Close install prompt"
        className="absolute right-3 top-3 rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex gap-3 pr-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#108910]/10 text-[#108910]">
          {mobileIOS ? (
            <Share className="h-5 w-5" strokeWidth={2} />
          ) : (
            <Download className="h-5 w-5" strokeWidth={2} />
          )}
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {mobileIOS ? 'Add MarketMet to your Home Screen' : 'Download MarketMet on your device'}
          </p>
          <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
            {mobileIOS
              ? 'In Safari, tap Share, then choose “Add to Home Screen”.'
              : 'Download MarketMet for quick access from your device.'}
          </p>
        </div>
      </div>

      {installEvent ? (
        <button
          type="button"
          onClick={install}
          className="mt-3 w-full rounded-xl bg-[#108910] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b740b] focus:outline-none focus:ring-2 focus:ring-[#108910]/30"
        >
          Download MarketMet
        </button>
      ) : mobileIOS ? (
        <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-[#108910]/10 px-3 py-2.5 text-center text-xs font-medium text-[#0b740b]">
          <Share className="h-4 w-4 shrink-0" />
          <span>Share → Add to Home Screen</span>
        </div>
      ) : null}
    </div>
  )
}
