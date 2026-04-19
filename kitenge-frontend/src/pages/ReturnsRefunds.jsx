import { RotateCcw, Shield, Clock, AlertCircle } from 'lucide-react'

const ReturnsRefunds = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Returns & Refunds Policy
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Our commitment to your satisfaction
          </p>
        </div>

        <div className="space-y-8">
          {/* Return Policy */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <RotateCcw className="w-8 h-8 text-accent" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Return Policy
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                  Return Window
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  You have <strong>7 days</strong> from the date of delivery to return items for a full refund or exchange.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                  Return Conditions
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                  <li>Items must be unused, unwashed, and in original condition</li>
                  <li>Original tags and packaging must be intact</li>
                  <li>Items must not be damaged or altered in any way</li>
                  <li>Proof of purchase (order number or receipt) is required</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                  Items Not Eligible for Return
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                  <li>Custom-made or personalized items</li>
                  <li>Items that have been worn, washed, or damaged</li>
                  <li>Items without original tags or packaging</li>
                  <li>Sale or clearance items (unless defective)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Refund Process */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-accent" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Refund Process
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  How to Return
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
                  <li>Contact us via WhatsApp (+250 788 883 986) or email (esoko@gmail.com) to initiate a return</li>
                  <li>Provide your order number and reason for return</li>
                  <li>We'll provide return instructions and authorization</li>
                  <li>Package the item securely in its original packaging</li>
                  <li>Return the item to our store or arrange for pickup</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Refund Timeline
                </h3>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Once we receive and inspect your returned item, we'll process your refund within <strong>5-7 business days</strong>.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                      Refunds will be issued to the original payment method used for the purchase.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Exchanges */}
          <div className="card p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Exchanges
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We're happy to exchange items for a different size or color, subject to availability.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Exchanges must be initiated within 7 days of delivery. 
              If the new item has a different price, we'll process the difference accordingly.
            </p>
          </div>

          {/* Defective Items */}
          <div className="card p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                Defective or Damaged Items
              </h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              If you receive a defective or damaged item, please contact us immediately. 
              We'll arrange for a replacement or full refund at no cost to you.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Please include photos of the defect or damage when contacting us.
            </p>
          </div>

          {/* Contact */}
          <div className="card p-6 bg-gray-100 dark:bg-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Need Help?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              If you have any questions about returns or refunds, please don't hesitate to contact us:
            </p>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>📱 WhatsApp: +250 788 883 986</p>
              <p>📧 Email: esoko@gmail.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReturnsRefunds

