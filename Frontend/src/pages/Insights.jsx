import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, BarChart3, BookOpen, CalendarDays, Leaf, RefreshCw, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { insightsAPI } from '../services/api'

const fallbackImage = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&q=84'

const Insights = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setError('')
        const response = await insightsAPI.getPublic()
        setPosts(Array.isArray(response.data) ? response.data : [])
      } catch (err) {
        console.error('Failed to load insights:', err)
        setError('Insights are temporarily unavailable. Please try again shortly.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const featured = useMemo(() => posts.find((post) => post.featured) || posts[0] || null, [posts])
  const latest = useMemo(() => posts.filter((post) => post.id !== featured?.id), [posts, featured])

  return (
    <div className="min-h-screen bg-[#F6F7F8] dark:bg-black">
      <section className="relative overflow-hidden bg-[#071D1A] px-4 py-14 text-white sm:px-6 sm:py-20 lg:px-8">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-24 left-1/4 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-black text-emerald-300">
              <BarChart3 className="h-4 w-4" /> MarketMet Insights
            </div>
            <h1 className="max-w-4xl text-4xl font-black leading-[1.02] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              Smarter grocery choices, explained clearly.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-gray-300 sm:text-lg">
              Seasonal buying, freshness, food care and practical market knowledge designed for everyday shopping.
            </p>
          </div>

          <div className="lg:col-span-5">
            {featured ? (
              <Link to={`/insights/${featured.slug}`} className="group block overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-md">
                <div className="relative h-48 overflow-hidden sm:h-56">
                  <img src={featured.image || fallbackImage} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#04110e] via-[#04110e]/30 to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full bg-orange-500 px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em]">Featured</span>
                </div>
                <div className="p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-300">{featured.category || 'MarketMet Guide'}</p>
                  <h2 className="mt-2 text-xl font-black leading-tight">{featured.title}</h2>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-300">{featured.excerpt || featured.content}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-xs font-black text-emerald-300">Read insight <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
                </div>
              </Link>
            ) : (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                <Sparkles className="h-5 w-5 text-emerald-300" />
                <h2 className="mt-4 text-xl font-black">Useful market knowledge is on the way.</h2>
                <p className="mt-2 text-sm leading-6 text-gray-300">New MarketMet buying guides and freshness notes will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#108910]">Knowledge hub</p>
            <h2 className="mt-2 text-2xl font-black text-gray-900 dark:text-white sm:text-3xl">Latest insights</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Practical, current content published directly by the MarketMet team.</p>
          </div>
          <Link to="/products" className="inline-flex items-center gap-2 text-sm font-black text-[#108910] hover:underline">Explore the shop <ArrowRight className="h-4 w-4" /></Link>
        </div>

        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{[1,2,3,4,5,6].map((item) => <div key={item} className="h-96 animate-pulse rounded-3xl bg-gray-200 dark:bg-[#080808]" />)}</div>
        ) : error ? (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center dark:border-amber-500/20 dark:bg-amber-500/10"><RefreshCw className="mx-auto h-6 w-6 text-amber-600" /><p className="mt-3 text-sm font-black text-amber-900 dark:text-amber-200">{error}</p></div>
        ) : latest.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {latest.map((post) => (
              <Link key={post.id} to={`/insights/${post.slug}`} className="group overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-[#080808]">
                <div className="relative aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-white/[0.05]">
                  <img src={post.image || fallbackImage} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
                  <span className="absolute bottom-3 left-3 rounded-full border border-white/20 bg-black/35 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-white backdrop-blur-md">{post.category || 'Insight'}</span>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400"><CalendarDays className="h-3.5 w-3.5" />{new Date(post.published_at || post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  <h3 className="mt-3 text-xl font-black leading-snug text-gray-900 transition group-hover:text-[#108910] dark:text-white">{post.title}</h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-500 dark:text-gray-400">{post.excerpt || post.content}</p>
                  <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-white/[0.07]"><span className="text-xs font-bold text-gray-400">{post.author || 'MarketMet Editorial'}</span><ArrowRight className="h-4 w-4 text-gray-300 transition group-hover:translate-x-1 group-hover:text-[#108910]" /></div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-white/10 dark:bg-[#080808]"><BookOpen className="mx-auto h-8 w-8 text-gray-300" /><h3 className="mt-4 text-lg font-black">No published insights yet</h3><p className="mt-2 text-sm text-gray-500">The MarketMet team is preparing new shopping guidance.</p></div>
        )}

        <section className="mt-12 overflow-hidden rounded-3xl bg-[#071D1A] p-6 text-white sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-2xl"><div className="flex items-center gap-2 text-sm font-black text-emerald-300"><Leaf className="h-4 w-4" /> Fresh knowledge, not noise</div><h3 className="mt-2 text-2xl font-black">Useful content built around everyday grocery decisions.</h3><p className="mt-2 text-sm leading-6 text-gray-300">Insights are managed directly from MarketMet’s admin console, so articles can stay relevant as products, seasons and customer needs change.</p></div>
            <Link to="/products" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#108910] px-5 py-3 text-sm font-black text-white transition hover:bg-[#0b731b]">Shop groceries <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Insights
