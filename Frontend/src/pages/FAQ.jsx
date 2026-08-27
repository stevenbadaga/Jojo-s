import { useState } from 'react'
import { ChevronDown, ShoppingBag, Truck, Package, Sparkles, HelpCircle } from 'lucide-react'

const FAQ = () => {
  const [openCategoryIndex, setOpenCategoryIndex] = useState(0)
  const [openQuestionIndex, setOpenQuestionIndex] = useState(null)

  const faqs = [
    {
      category: '🚀 30-Min Delivery & Fulfillment',
      icon: Truck,
      questions: [
        {
          q: 'How fast is MarketMet Express delivery?',
          a: 'For Kigali Central orders, our personal shoppers handpick and deliver your items in as fast as 30 minutes! Upcountry orders take 1-2 days.'
        },
        {
          q: 'What are the express delivery fees?',
          a: 'Store Pickup is FREE. Kigali Express Delivery is 2,000 RWF (Free when your order is 15,000 RWF or more!). Upcountry Express is 3,500 RWF.'
        },
        {
          q: 'How do personal shoppers select my produce?',
          a: 'Our Kigali personal shoppers are trained to inspect every fruit, vegetable, and dairy container for peak freshness, firm ripeness, and clean packaging.'
        },
        {
          q: 'Can I choose a specific delivery time slot?',
          a: 'Yes! During WhatsApp checkout, you can request immediate 30-minute delivery or schedule a specific delivery window for later today.'
        }
      ]
    },
    {
      category: '🥦 Freshness & Organic Quality',
      icon: ShoppingBag,
      questions: [
        {
          q: 'What is the MarketMet 100% Freshness Guarantee?',
          a: 'If any produce item or dairy product arrives bruised, damaged, or not up to your standards, let us know within 24 hours for an instant 100% refund or replacement.'
        },
        {
          q: 'Where do you source your organic vegetables & fruits?',
          a: 'We partner directly with small Rwandan organic farms across Musanze, Rwamagana, and Kigali local markets to receive daily fresh morning harvests.'
        },
        {
          q: 'How are cold items transported?',
          a: 'Milk, cheeses, eggs, and cold juices are transported in insulated, temperature-controlled delivery boxes to ensure they arrive cold and fresh.'
        }
      ]
    },
    {
      category: '💳 Express Checkout & Payments',
      icon: Package,
      questions: [
        {
          q: 'How does 1-Click WhatsApp Express Checkout work?',
          a: 'Simply add items to your cart and tap "Place Instacart Express Order". It automatically formats your grocery list and connects you directly with our Kigali fulfillment desk on WhatsApp for instant confirmation.'
        },
        {
          q: 'What payment methods can I use?',
          a: 'We accept Mobile Money (MTN MoMo, Airtel Money), Bank Transfers, and Cash on Delivery.'
        }
      ]
    }
  ]

  const toggleQuestion = (index) => {
    setOpenQuestionIndex(openQuestionIndex === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-[#F6F7F8] dark:bg-gray-950 py-8 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950 text-[#108910] dark:text-emerald-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Instacart Grocery Help Center</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
            Frequently Asked Questions
          </h1>

          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 font-medium">
            Everything you need to know about MarketMet Express delivery, organic freshness guarantee, and WhatsApp checkout.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none justify-center">
          {faqs.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => {
                setOpenCategoryIndex(idx)
                setOpenQuestionIndex(null)
              }}
              className={`px-5 py-3 rounded-2xl font-extrabold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 shadow-sm ${
                openCategoryIndex === idx
                  ? 'bg-[#108910] text-white shadow-md scale-105'
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span>{cat.category}</span>
            </button>
          ))}
        </div>

        {/* Questions Accordion */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 sm:p-10 shadow-xl space-y-4">
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FF6B00]" />
            <span>{faqs[openCategoryIndex].category}</span>
          </h3>

          <div className="space-y-3">
            {faqs[openCategoryIndex].questions.map((item, qIdx) => (
              <div
                key={qIdx}
                className="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden transition-all bg-[#F6F7F8] dark:bg-gray-800/40"
              >
                <button
                  onClick={() => toggleQuestion(qIdx)}
                  className="w-full p-4 text-left font-extrabold text-gray-900 dark:text-white text-sm sm:text-base flex items-center justify-between gap-4"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#108910] transition-transform duration-300 flex-shrink-0 ${
                      openQuestionIndex === qIdx ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {openQuestionIndex === qIdx && (
                  <div className="p-4 pt-0 text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium leading-relaxed border-t border-gray-200/60 dark:border-gray-700/60 mt-1">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

export default FAQ
