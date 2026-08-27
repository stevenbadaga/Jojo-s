import { useEffect, useRef, useState } from 'react'
import { AlertCircle, CheckCircle2, Loader } from 'lucide-react'
import useBackendStatus from '../hooks/useBackendStatus'

const RECOVERY_BANNER_DURATION_MS = 3500

const BackendStatusBanner = () => {
  const { state } = useBackendStatus()
  const [showRecovered, setShowRecovered] = useState(false)
  const previousStateRef = useRef(state)

  useEffect(() => {
    let timeoutId

    if (state === 'ready' && ['connecting', 'offline'].includes(previousStateRef.current)) {
      setShowRecovered(true)
      timeoutId = window.setTimeout(() => {
        setShowRecovered(false)
      }, RECOVERY_BANNER_DURATION_MS)
    }

    if (state !== 'ready') {
      setShowRecovered(false)
    }

    previousStateRef.current = state

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [state])

  if (state === 'ready' && !showRecovered) {
    return null
  }

  if (state !== 'connecting' && state !== 'offline' && !showRecovered) {
    return null
  }

  const banner = showRecovered
    ? {
        className:
          'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/60 dark:text-emerald-100',
        icon: <CheckCircle2 className="h-5 w-5 flex-shrink-0" />,
        title: 'Backend connected',
        message: 'Live data is available again.',
      }
    : state === 'connecting'
      ? {
          className:
            'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/60 dark:text-amber-100',
          icon: <Loader className="h-5 w-5 flex-shrink-0 animate-spin" />,
          title: 'Backend is starting',
          message: 'The frontend is retrying automatically. This usually clears in a few seconds.',
        }
      : {
          className:
            'border-red-200 bg-red-50 text-red-900 dark:border-red-900/50 dark:bg-red-950/60 dark:text-red-100',
          icon: <AlertCircle className="h-5 w-5 flex-shrink-0" />,
          title: 'Backend is unavailable',
          message:
            'Start the backend in kitenge-backend, then keep this page open or refresh once it is ready.',
        }

  return (
    <div className={`border-b ${banner.className}`}>
      <div className="mx-auto flex max-w-7xl items-start gap-3 px-4 py-3 text-sm sm:px-6 lg:px-8">
        {banner.icon}
        <div className="min-w-0">
          <p className="font-semibold">{banner.title}</p>
          <p className="mt-0.5 opacity-90">{banner.message}</p>
        </div>
      </div>
    </div>
  )
}

export default BackendStatusBanner
