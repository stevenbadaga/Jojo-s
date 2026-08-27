import { User, Bell, Shield, MapPin, Settings, FileText } from 'lucide-react'

const tabs = [
  { id: 'profile', label: 'Personal Info', shortLabel: 'Info', icon: User },
  { id: 'notifications', label: 'Notifications', shortLabel: 'Alerts', icon: Bell },
  { id: 'security', label: 'Privacy & Security', shortLabel: 'Security', icon: Shield },
  { id: 'addresses', label: 'Addresses', shortLabel: 'Addresses', icon: MapPin },
  { id: 'preferences', label: 'Preferences', shortLabel: 'Prefs', icon: Settings },
  { id: 'account', label: 'Account', shortLabel: 'Account', icon: FileText },
]

const ProfileTabs = ({ activeTab, setActiveTab }) => (
  <div className="mb-6 sm:mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
    <div className="flex overflow-x-auto scrollbar-hide">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
              isActive
                ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.shortLabel}</span>
          </button>
        )
      })}
    </div>
  </div>
)

export default ProfileTabs
