import { useState } from 'react'
import { ChevronDown, ChevronUp, ShoppingBag, CreditCard, Truck, User, Package } from 'lucide-react'

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      category: 'Shopping',
      icon: ShoppingBag,
      questions: [
        {
          q: 'How do I place an order?',
          a: 'Browse our products, add items to your cart, and proceed to checkout. You can checkout via WhatsApp where you\'ll be connected directly with us to complete your order.'
        },
        {
          q: 'Do you handle special requests or bulk orders?',
          a: 'Yes. If you need help with bulk purchases, business orders, or sourcing a specific item, contact us via WhatsApp (+250 788 883 986) or email (jojogroceries@gmail.com).'
        },
        {
          q: 'What payment methods do you accept?',
          a: 'We accept mobile money (MTN, Airtel), bank transfers, and cash on delivery for local orders. Payment details will be provided during checkout.'
        },
        {
          q: 'Can I modify or cancel my order?',
          a: 'Orders can be modified or cancelled within 24 hours of placement. Please contact us immediately via WhatsApp or email with your order number.'
        }
      ]
    },
    {
      category: 'Shipping & Delivery',
      icon: Truck,
      questions: [
        {
          q: 'How long does shipping take?',
          a: 'Kigali deliveries take 1-2 business days, upcountry deliveries take 3-5 business days, and pickup orders are ready within 1 business day after processing.'
        },
        {
          q: 'What are the delivery fees?',
          a: 'Pickup is free. Kigali delivery is 2,000 RWF, and upcountry delivery is 5,000 RWF.'
        },
        {
          q: 'Do you ship internationally?',
          a: 'Currently, we only ship within Rwanda. For international shipping inquiries, please contact us directly.'
        },
        {
          q: 'How can I track my order?',
          a: 'Once your order ships, you\'ll receive a tracking number via email or WhatsApp. You can also contact us directly for order status updates.'
        }
      ]
    },
    {
      category: 'Returns & Refunds',
      icon: Package,
      questions: [
        {
          q: 'What is your return policy?',
          a: 'You have 7 days from delivery to return items in original, unused condition with tags attached. Personalized or special-order items are not eligible for return.'
        },
        {
          q: 'How do I return an item?',
          a: 'Contact us via WhatsApp or email with your order number. We\'ll provide return instructions and authorization. Returns can be dropped off at our store or we can arrange pickup.'
        },
        {
          q: 'How long do refunds take?',
          a: 'Refunds are processed within 5-7 business days after we receive and inspect the returned item. The refund will be issued to your original payment method.'
        },
        {
          q: 'Can I exchange an item?',
          a: 'Yes! We offer exchanges for different sizes or colors, subject to availability. Exchanges must be initiated within 7 days of delivery.'
        }
      ]
    },
    {
      category: 'Account & Orders',
      icon: User,
      questions: [
        {
          q: 'Do I need an account to shop?',
          a: 'No, you can shop as a guest. However, creating an account allows you to track orders, save your wishlist, and enjoy faster checkout.'
        },
        {
          q: 'How do I create an account?',
          a: 'Click on "Login" in the header, then select "Register" to create a new account. You\'ll need to verify your email address.'
        },
        {
          q: 'I forgot my password. What should I do?',
          a: 'Click "Forgot Password" on the login page and enter your email. You\'ll receive instructions to reset your password.'
        },
        {
          q: 'How do I view my order history?',
          a: 'Log in to your account and navigate to "My Account" to view all your past orders and their status.'
        }
      ]
    },
    {
      category: 'Product Information',
      icon: ShoppingBag,
      questions: [
        {
          q: 'What options are available?',
          a: 'Available options vary by product. Check individual product pages for sizes, colors, styles, and other listed variants.'
        },
        {
          q: 'Are the colors accurate in photos?',
          a: 'We strive for accurate color representation, but colors may vary slightly due to screen settings. If color is critical, please contact us for more details.'
        },
        {
          q: 'Do you have a physical store?',
          a: 'Yes! Our store is located in Kigali, Rwanda. You can visit us during business hours or arrange for pickup of online orders.'
        },
        {
          q: 'Can I see products before buying?',
          a: 'Yes! You can visit our physical store in Kigali to see products in person. We also provide detailed product descriptions and images online.'
        }
      ]
    }
  ]

  const toggleQuestion = (categoryIndex, questionIndex) => {
    const index = `${categoryIndex}-${questionIndex}`
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Find answers to common questions about shopping with us
          </p>
        </div>

        <div className="space-y-8">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex} className="card p-6">
              <div className="flex items-center gap-3 mb-6">
                <category.icon className="w-6 h-6 text-accent" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {category.category}
                </h2>
              </div>
              <div className="space-y-3">
                {category.questions.map((faq, questionIndex) => {
                  const index = `${categoryIndex}-${questionIndex}`
                  const isOpen = openIndex === index
                  return (
                    <div
                      key={questionIndex}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => toggleQuestion(categoryIndex, questionIndex)}
                        className="w-full px-4 py-4 flex items-center justify-between text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <span className="font-semibold text-gray-900 dark:text-white pr-4">
                          {faq.q}
                        </span>
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-accent flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="px-4 py-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            {faq.a}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Still Have Questions */}
        <div className="mt-12 card p-6 bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-800/20 border border-emerald-200 dark:border-emerald-800">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            Still Have Questions?
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We're here to help! Get in touch with us through any of these channels:
          </p>
          <div className="space-y-2 text-gray-700 dark:text-gray-300">
            <p>📱 WhatsApp: +250 788 883 986</p>
            <p>📧 Email: jojogroceries@gmail.com</p>
            <p>📍 Visit us: Kigali, Rwanda</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FAQ

