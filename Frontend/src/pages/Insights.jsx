import { ArrowRight, BarChart3, CalendarDays, Leaf, Lightbulb, PackageCheck, ShoppingBasket, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'

const insights = [
  {
    category: 'Market Watch',
    title: 'What is in season in Kigali right now?',
    summary: 'A quick guide to produce that is typically at its best value and freshness this time of year.',
    icon: CalendarDays,
    tag: 'Seasonal buying',
  },
  {
    category: 'Smart Shopping',
    title: 'How to build a better weekly grocery basket',
    summary: 'Balance essentials, fresh produce and pantry staples while keeping your weekly spend predictable.',
    icon: ShoppingBasket,
    tag: 'Budget planning',
  },
  {
    category: 'Freshness Guide',
    title: 'Simple ways to keep vegetables fresh for longer',
    summary: 'Storage habits that help reduce waste and protect quality after your MarketMet delivery arrives.',
    icon: PackageCheck,
    tag: 'Food care',
  },
  {
    category: 'Local Sourcing',
    title: 'Why local sourcing matters for freshness',
    summary: 'Shorter supply chains can support better quality, faster replenishment and stronger local producers.',
    icon: Leaf,
    tag: 'Local produce',
  },
  {
    category: 'Price Trends',
    title: 'Understanding everyday grocery price changes',
    summary: 'A simple view of why availability, seasonality and transport can affect what shoppers pay.',
    icon: TrendingUp,
    tag: 'Market trends',
  },
  {
    category: 'MarketMet Guide',
    title: 'How to get the most from a 30-minute grocery delivery',
    summary: 'Plan recurring essentials, save favourites and use your cart as a lightweight household shopping list.',
    icon: Lightbulb,
    tag: 'Shopping tips',
  },
]

const Insights = () => {
  return (
    <div className="min-h-screen bg-[#F6F7F8] dark:bg-gray-950">
      <section className="relative overflow-hidden bg-[#071D1A] text-white px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-24 left-1/4 w-80 h-80 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold text-emerald-300 mb-5">
              <BarChart3 className="w-4 h-4" /> MarketMet Insights
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Better shopping starts with better information.
            </h1>
            <p className="mt-5 max-w-2xl text-sm sm:text-lg text-gray-300 leading-relaxed">
              Fresh market trends, seasonal buying ideas, food-care guidance and practical notes for smarter grocery decisions.
            </p>
          </div>
          <div className="lg:col-span-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-emerald-300 font-black">Featured insight</p>
              <h2 className="text-xl font-black mt-3">Freshness, value and convenience can work together.</h2>
              <p className="text-sm text-gray-300 mt-3">Use this space for weekly observations, seasonal updates or short stories from the MarketMet supply chain.</p>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#108910] font-black">Knowledge hub</p>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-2">Latest insights</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">A professional space for useful content that gives customers another reason to return.</p>
          </div>
          <Link to="/products" className="inline-flex items-center gap-2 text-sm font-black text-[#108910] hover:underline">
            Explore the shop <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {insights.map((insight) => {
            const Icon = insight.icon
            return (
              <article
                key={insight.title}
                className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-[#108910] grid place-items-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-black text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">{insight.tag}</span>
                </div>
                <p className="text-xs font-black text-[#108910] mt-6">{insight.category}</p>
                <h3 className="text-xl font-black text-gray-900 dark:text-white mt-2 leading-snug">{insight.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 leading-relaxed">{insight.summary}</p>
                <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400">MarketMet Editorial</span>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#108910] group-hover:translate-x-1 transition-all" />
                </div>
              </article>
            )
          })}
        </div>

        <section className="mt-12 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-[#108910] font-black text-sm">
              <Lightbulb className="w-4 h-4" /> A growing content area
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-2">Turn MarketMet into more than a storefront.</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
              Insights can later be connected to the admin dashboard so you can publish new articles, market updates and buying guides without changing code.
            </p>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center gap-2 bg-[#108910] hover:bg-[#007000] text-white font-black px-5 py-3 rounded-full text-sm transition-colors"
          >
            Suggest a topic <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </main>
    </div>
  )
}

export default Insights
