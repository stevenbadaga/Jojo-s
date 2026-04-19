import { Truck, Package, Clock, MapPin } from 'lucide-react'

const ShippingInfo = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Shipping Information
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Everything you need to know about our shipping and delivery options
          </p>
        </div>

        <div className="space-y-8">
          {/* Delivery Options */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Truck className="w-8 h-8 text-accent" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Delivery Options
              </h2>
            </div>
            <div className="space-y-6">
              <div className="border-l-4 border-accent pl-4">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                  Pickup (Free)
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Collect your order from our store location in Kigali, Rwanda.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Available during business hours: Monday - Friday 9:00 AM - 6:00 PM, Saturday 10:00 AM - 4:00 PM
                </p>
              </div>

              <div className="border-l-4 border-accent pl-4">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                  Kigali Delivery
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  We deliver within Kigali city limits.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Delivery fee: 2,000 RWF | Delivery time: 1-2 business days
                </p>
              </div>

              <div className="border-l-4 border-accent pl-4">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                  Upcountry Delivery
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  We deliver to locations outside Kigali.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Delivery fee: 5,000 RWF | Delivery time: 3-5 business days
                </p>
              </div>
            </div>
          </div>

          {/* Processing Time */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-8 h-8 text-accent" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Processing & Delivery Times
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Order Processing
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Orders are typically processed within 1-2 business days after payment confirmation.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Delivery Timeline
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                  <li>Kigali: 1-2 business days after processing</li>
                  <li>Upcountry: 3-5 business days after processing</li>
                  <li>Pickup: Ready within 1 business day</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Tracking */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Package className="w-8 h-8 text-accent" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Order Tracking
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Once your order ships, you'll receive a tracking number via email or WhatsApp. 
              You can use this to track your package's journey to your doorstep.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              For tracking inquiries, please contact us at +250 788 883 986 or email us at esoko@gmail.com
            </p>
          </div>

          {/* Important Notes */}
          <div className="card p-6 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Important Notes
            </h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>• Please ensure someone is available to receive the delivery</li>
              <li>• Delivery times may vary during holidays and peak seasons</li>
              <li>• We'll contact you via phone or WhatsApp before delivery</li>
              <li>• For custom orders, processing time may be extended</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShippingInfo

