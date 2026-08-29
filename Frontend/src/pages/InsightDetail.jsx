import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, CalendarDays, Leaf, Share2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { insightsAPI } from '../services/api'

const fallbackImage = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1800&q=86'

const InsightDetail = () => {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const response = await insightsAPI.getBySlug(slug)
        if (active) setPost(response.data)
      } catch (err) {
        if (active) setError(err.response?.data?.error || 'This insight could not be loaded.')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [slug])

  const share = async () => {
    const data = { title: post?.title || 'MarketMet Insight', url: window.location.href }
    if (navigator.share) {
      try { await navigator.share(data) } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard?.writeText(window.location.href)
    }
  }

  if (loading) return <div className="min-h-screen bg-[#F6F7F8] px-4 py-16 dark:bg-black"><div className="mx-auto max-w-4xl animate-pulse"><div className="h-5 w-32 rounded bg-gray-200 dark:bg-[#111]" /><div className="mt-8 h-20 rounded-2xl bg-gray-200 dark:bg-[#111]" /><div className="mt-8 aspect-[16/8] rounded-3xl bg-gray-200 dark:bg-[#111]" /><div className="mt-8 space-y-3">{[1,2,3,4,5].map((i) => <div key={i} className="h-4 rounded bg-gray-200 dark:bg-[#111]" />)}</div></div></div>

  if (error || !post) return <div className="grid min-h-[70vh] place-items-center bg-[#F6F7F8] px-4 dark:bg-black"><div className="max-w-md text-center"><h1 className="text-2xl font-black">Insight unavailable</h1><p className="mt-3 text-sm text-gray-500">{error}</p><Link to="/insights" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#108910] px-5 py-3 text-sm font-black text-white"><ArrowLeft className="h-4 w-4" /> Back to Insights</Link></div></div>

  const paragraphs = String(post.content || '').split(/\n\s*\n/).map((value) => value.trim()).filter(Boolean)

  return (
    <article className="min-h-screen bg-[#F6F7F8] dark:bg-black">
      <header className="bg-[#071D1A] px-4 py-12 text-white sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Link to="/insights" className="inline-flex items-center gap-2 text-xs font-black text-emerald-300 transition hover:text-white"><ArrowLeft className="h-4 w-4" /> All Insights</Link>
          <div className="mt-8 max-w-4xl">
            <span className="inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-300">{post.category || 'MarketMet Insight'}</span>
            <h1 className="mt-5 text-4xl font-black leading-[1.03] tracking-[-0.045em] sm:text-5xl lg:text-6xl">{post.title}</h1>
            {post.excerpt && <p className="mt-5 max-w-3xl text-base leading-7 text-gray-300 sm:text-lg">{post.excerpt}</p>}
            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-gray-400"><span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4" />{new Date(post.published_at || post.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</span><span>By {post.author || 'MarketMet Editorial'}</span><button onClick={share} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 font-bold text-gray-300 hover:bg-white/5"><Share2 className="h-3.5 w-3.5" /> Share</button></div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-gray-100 shadow-sm dark:border-white/10 dark:bg-[#080808]"><img src={post.image || fallbackImage} alt="" className="aspect-[16/8] w-full object-cover" /></div>
        <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#080808] sm:p-10">
          <div className="mb-7 flex items-center gap-2 border-b border-gray-100 pb-5 text-xs font-black uppercase tracking-[0.12em] text-[#108910] dark:border-white/[0.07]"><Leaf className="h-4 w-4" /> MarketMet Editorial</div>
          <div className="space-y-6">{paragraphs.map((paragraph, index) => <p key={index} className="text-[15px] leading-8 text-gray-700 dark:text-gray-300 sm:text-base">{paragraph}</p>)}</div>
        </div>

        <div className="mx-auto mt-8 flex max-w-3xl flex-col gap-3 rounded-3xl bg-[#071D1A] p-6 text-white sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-black text-emerald-300">Ready to shop?</p><p className="mt-1 text-lg font-black">Put the insight into practice with fresh groceries.</p></div><Link to="/products" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#108910] px-5 py-3 text-sm font-black text-white">Explore the shop <ArrowRight className="h-4 w-4" /></Link></div>
      </main>
    </article>
  )
}

export default InsightDetail
