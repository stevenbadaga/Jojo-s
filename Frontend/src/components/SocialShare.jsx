import { Facebook, Instagram, X as XIcon, Link2, Share2 } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'

const SocialShare = ({ product, variant = 'full', className = '' }) => {
  const toast = useToast()

  const getShareUrl = () => {
    if (typeof window === 'undefined') return ''
    if (!product?.id) return window.location.href

    try {
      return new URL(`/products/${product.id}`, window.location.origin).toString()
    } catch {
      return window.location.href
    }
  }

  const shareUrl = getShareUrl()
  const shareTitle = product?.name || 'MarketMet (Fresh Groceries to Your Door.)'
  const shareText = product?.name
    ? `Check out "${product.name}" on MarketMet (Fresh Groceries to Your Door.).`
    : 'Check this out on MarketMet (Fresh Groceries to Your Door.).'

  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`

  const copyLink = async () => {
    if (!shareUrl) return

    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Link copied to clipboard')
    } catch (error) {
      try {
        const textarea = document.createElement('textarea')
        textarea.value = shareUrl
        textarea.setAttribute('readonly', '')
        textarea.style.position = 'absolute'
        textarea.style.left = '-9999px'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        toast.success('Link copied to clipboard')
      } catch {
        toast.error('Could not copy link')
      }
    }
  }

  const nativeShare = async () => {
    if (!shareUrl) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        })
      } catch (error) {
        // User cancelled share
        if (error?.name === 'AbortError') return
        // Fallback to copy
        await copyLink()
      }
      return
    }

    await copyLink()
  }

  const handleInstagram = async () => {
    window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer')
    await copyLink()
    toast.info('Instagram does not support direct web sharing. Paste the copied link in Instagram.')
  }

  const iconBaseClass =
    'group inline-flex items-center justify-center w-11 h-11 rounded-full shadow-sm ring-1 ring-black/10 dark:ring-white/10 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900'

  if (variant === 'icons') {
    return (
      <div className={`flex flex-col sm:flex-row sm:items-center gap-3 ${className}`}>
        <span className="text-sm text-gray-600 dark:text-gray-400 mr-1 sm:mr-2">
          Share on
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${iconBaseClass} bg-[#1877F2] hover:bg-[#166FE5] text-white`}
            aria-label="Share on Facebook"
          >
            <Facebook className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </a>
          <button
            type="button"
            onClick={handleInstagram}
            className={`${iconBaseClass} bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCB045] hover:from-[#6B2F94] hover:via-[#E01A1A] hover:to-[#E09A3A] text-white`}
            aria-label="Share on Instagram"
          >
            <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
          <a
            href={xUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${iconBaseClass} bg-black hover:bg-gray-900 text-white border border-gray-800`}
            aria-label="Share on X (Twitter)"
          >
            <XIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${iconBaseClass} bg-[#25D366] hover:bg-[#20BA5A] text-white`}
            aria-label="Share on WhatsApp"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
          </a>
        </div>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 flex-wrap ${className}`}>
        <button
          type="button"
          onClick={nativeShare}
          className="group w-9 h-9 rounded-xl bg-accent text-white hover:bg-accent-darker flex items-center justify-center transition-colors shadow-sm"
          aria-label="Share"
        >
          <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </button>

        <button
          type="button"
          onClick={copyLink}
          className="group w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center transition-colors shadow-sm"
          aria-label="Copy link"
        >
          <Link2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </button>

        <a
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group w-9 h-9 rounded-xl bg-[#1877F2] hover:bg-[#166FE5] flex items-center justify-center transition-all shadow-sm hover:shadow-md hover:scale-105"
          aria-label="Share on Facebook"
        >
          <Facebook className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
        </a>

        <button
          type="button"
          onClick={handleInstagram}
          className="group w-9 h-9 rounded-xl bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCB045] hover:from-[#6B2F94] hover:via-[#E01A1A] hover:to-[#E09A3A] flex items-center justify-center transition-all shadow-sm hover:shadow-md hover:scale-105"
          aria-label="Share on Instagram"
        >
          <Instagram className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
        </button>

        <a
          href={xUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group w-9 h-9 rounded-xl bg-black hover:bg-gray-900 flex items-center justify-center transition-all shadow-sm hover:shadow-md hover:scale-105 border border-gray-800"
          aria-label="Share on X (Twitter)"
        >
          <XIcon className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
        </a>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group w-9 h-9 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] flex items-center justify-center transition-all shadow-sm hover:shadow-md hover:scale-105"
          aria-label="Share on WhatsApp"
        >
          <svg className="w-4 h-4 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
        </a>
      </div>
    )
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Share
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copyLink}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 dark:border-gray-800 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            aria-label="Copy product link"
          >
            <Link2 className="w-4 h-4" />
            <span className="hidden sm:inline">Copy link</span>
          </button>
          <button
            type="button"
            onClick={nativeShare}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-accent text-white text-sm hover:bg-accent-darker transition-colors"
            aria-label="Share"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <a
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group w-10 h-10 rounded-xl bg-[#1877F2] hover:bg-[#166FE5] flex items-center justify-center transition-all shadow-sm hover:shadow-md hover:scale-105"
          aria-label="Share on Facebook"
        >
          <Facebook className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
        </a>
        <button
          type="button"
          onClick={handleInstagram}
          className="group w-10 h-10 rounded-xl bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCB045] hover:from-[#6B2F94] hover:via-[#E01A1A] hover:to-[#E09A3A] flex items-center justify-center transition-all shadow-sm hover:shadow-md hover:scale-105"
          aria-label="Share on Instagram"
        >
          <Instagram className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
        </button>
        <a
          href={xUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group w-10 h-10 rounded-xl bg-black hover:bg-gray-900 flex items-center justify-center transition-all shadow-sm hover:shadow-md hover:scale-105 border border-gray-800"
          aria-label="Share on X (Twitter)"
        >
          <XIcon className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
        </a>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group w-10 h-10 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] flex items-center justify-center transition-all shadow-sm hover:shadow-md hover:scale-105"
          aria-label="Share on WhatsApp"
        >
          <svg className="w-4 h-4 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
        </a>
      </div>
    </div>
  )
}

export default SocialShare

