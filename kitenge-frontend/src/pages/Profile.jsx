import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useToast } from '../contexts/ToastContext'
import { userAPI } from '../services/api'
import { getImageUrl } from '../utils/imageUtils'
import ProfileHeader from '../components/profile/ProfileHeader'
import ProfileTabs from '../components/profile/ProfileTabs'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Lock, 
  Save, 
  Eye, 
  EyeOff,
  CheckCircle,
  Shield,
  Bell,
  Settings,
  Trash2,
  Download,
  Plus,
  Home,
  Briefcase,
  Calendar,
  AlertCircle,
  Monitor,
  Moon,
  Sun,
  Languages,
  DollarSign,
  Smartphone,
  FileText
} from 'lucide-react'

const Profile = () => {
  const { user, setUser, isAuthenticated, loading: authLoading, logout } = useAuth()
  const { setThemeMode } = useTheme()
  const navigate = useNavigate()
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [profile, setProfile] = useState({
    email: '',
    name: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    profileImageUrl: '',
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [profileImagePreview, setProfileImagePreview] = useState(null)
  const [accountInfo, setAccountInfo] = useState({
    createdAt: null,
    emailVerified: false,
    lastLogin: null,
  })
  const [notifications, setNotifications] = useState({
    emailOrderUpdates: true,
    emailPromotions: true,
    emailNewsletters: false,
    smsOrderUpdates: false,
    smsPromotions: false,
  })
  const [addresses, setAddresses] = useState([])
  const [editingAddress, setEditingAddress] = useState(null)
  const [newAddress, setNewAddress] = useState({
    label: '',
    street: '',
    city: '',
    country: '',
    isDefault: false,
  })
  const [preferences, setPreferences] = useState({
    language: 'en',
    currency: 'RWF',
    theme: 'system',
    dateFormat: 'MM/DD/YYYY',
    timezone: 'Africa/Kigali',
  })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [updatingTwoFactor, setUpdatingTwoFactor] = useState(false)

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !isAuthenticated) {
      navigate('/login')
      return
    }
    
    if (isAuthenticated) {
      loadProfile()
    }
  }, [isAuthenticated, authLoading, navigate])

  const loadProfile = async () => {
    try {
      const response = await userAPI.getProfile()
      const data = response.data
      setProfile({
        email: data.email || '',
        name: data.name || '',
        phone: data.phone || '',
        address: data.address || '',
        city: data.city || '',
        country: data.country || '',
        profileImageUrl: data.profileImageUrl || '',
      })

      setTwoFactorEnabled(Boolean(data.twoFactorEnabled))
      setProfileImagePreview(data.profileImageUrl ? getImageUrl(data.profileImageUrl) : null)
      
      // Load account info
      setAccountInfo({
        createdAt: data.createdAt || data.created_at || null,
        emailVerified: data.emailVerified ?? data.email_verified ?? false,
        lastLogin: data.lastLogin || data.last_login || null,
      })
      
      // Load preferences from backend
      try {
        const prefsRes = await userAPI.getPreferences()
        if (prefsRes.data) {
          setPreferences(prev => ({ ...prev, ...prefsRes.data }))
          if (prefsRes.data.theme) {
            setThemeMode(prefsRes.data.theme)
          }
        }
      } catch (e) {
        console.error('Failed to load preferences:', e)
        // Keep default preferences
      }
      
      // Load addresses from backend
      try {
        const addressesRes = await userAPI.getAddresses()
        if (addressesRes.data && Array.isArray(addressesRes.data)) {
          setAddresses(addressesRes.data)
        }
      } catch (e) {
        console.error('Failed to load addresses:', e)
        // Keep empty addresses array
      }
      
      // Load notifications from backend
      try {
        const notificationsRes = await userAPI.getNotifications()
        if (notificationsRes.data) {
          setNotifications(notificationsRes.data)
        }
      } catch (e) {
        console.error('Failed to load notifications:', e)
        // Keep default notifications
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
      // Don't show error toast, just log it
      console.error('Profile load error details:', error.response?.data)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const payload = {
        email: profile.email,
        name: profile.name,
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        country: profile.country,
      }
      const response = await userAPI.updateProfile(payload)
      const data = response.data
      toast.success('Profile updated successfully!')

      setProfile(prev => ({
        ...prev,
        email: data.email ?? prev.email,
        name: data.name ?? prev.name,
        phone: data.phone ?? prev.phone,
        address: data.address ?? prev.address,
        city: data.city ?? prev.city,
        country: data.country ?? prev.country,
        profileImageUrl: data.profileImageUrl ?? prev.profileImageUrl,
      }))
      setAccountInfo(prev => ({
        ...prev,
        createdAt: data.createdAt ?? prev.createdAt,
        emailVerified: data.emailVerified ?? prev.emailVerified,
        lastLogin: data.lastLogin ?? prev.lastLogin,
      }))
      if (data.profileImageUrl) {
        setProfileImagePreview(getImageUrl(data.profileImageUrl))
      }
      
      // Keep auth user in sync (name / email / profile image)
      setUser((prev) => ({
        ...prev,
        email: data.email ?? prev?.email,
        name: data.name ?? prev?.name,
        profileImageUrl: data.profileImageUrl ?? prev?.profileImageUrl,
      }))
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setChangingPassword(true)

    try {
      await userAPI.changePassword(passwordData.currentPassword, passwordData.newPassword)
      toast.success('Password changed successfully!')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      setChangingPassword(false)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to change password')
    } finally {
      setChangingPassword(false)
    }
  }

  const handleTwoFactorToggle = async (enabled) => {
    const previousValue = twoFactorEnabled
    setTwoFactorEnabled(enabled)
    setUpdatingTwoFactor(true)
    try {
      const response = await userAPI.updateTwoFactor(enabled)
      if (typeof response.data?.twoFactorEnabled === 'boolean') {
        setTwoFactorEnabled(response.data.twoFactorEnabled)
      }
      toast.success(
        enabled ? 'Two-factor authentication enabled' : 'Two-factor authentication disabled'
      )
    } catch (error) {
      setTwoFactorEnabled(previousValue)
      toast.error(error.response?.data?.error || 'Failed to update two-factor settings')
    } finally {
      setUpdatingTwoFactor(false)
    }
  }

  // Get user initials for avatar
  const getInitials = () => {
    if (profile.name) {
      return profile.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    if (profile.email) {
      return profile.email[0].toUpperCase()
    }
    return 'U'
  }

  // Profile picture upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }
      if (file.size > 20 * 1024 * 1024) {
        toast.error('Image size must be less than 20MB')
        return
      }
      const previousImageUrl = profile.profileImageUrl
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImagePreview(reader.result)
      }
      reader.readAsDataURL(file)

      try {
        const response = await userAPI.uploadProfileImage(file)
        const imageUrl = response.data?.url || response.data?.profileImageUrl
        if (imageUrl) {
          setProfile(prev => ({ ...prev, profileImageUrl: imageUrl }))
          setProfileImagePreview(getImageUrl(imageUrl))
        }
        toast.success('Profile photo updated successfully!')
      } catch (error) {
        setProfileImagePreview(previousImageUrl ? getImageUrl(previousImageUrl) : null)
        toast.error(error.response?.data?.error || 'Failed to upload profile image')
      }
    }
  }

  // Calculate profile completion
  const getProfileCompletion = () => {
    let completed = 0
    let total = 7
    if (profile.name) completed++
    if (profile.email) completed++
    if (profile.phone) completed++
    if (profile.address) completed++
    if (profile.city) completed++
    if (profile.country) completed++
    if (accountInfo.emailVerified) completed++
    return Math.round((completed / total) * 100)
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Save notifications
  const handleNotificationsSave = async () => {
    try {
      await userAPI.updateNotifications(notifications)
      toast.success('Notification preferences saved!')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save notification preferences')
    }
  }

  // Address management
  const handleAddAddress = async () => {
    if (!newAddress.street || !newAddress.city || !newAddress.country) {
      toast.error('Please fill in all required fields')
      return
    }
    
    try {
      const saved = await userAPI.addAddress(newAddress)
      setAddresses(prev => [...prev, saved.data])
      setNewAddress({ label: '', street: '', city: '', country: '', isDefault: false })
      setEditingAddress(null)
      toast.success('Address added successfully!')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add address')
    }
  }

  const handleDeleteAddress = async (id) => {
    try {
      await userAPI.deleteAddress(id)
      setAddresses(prev => prev.filter(addr => addr.id !== id))
      toast.success('Address deleted!')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete address')
    }
  }

  const handleSetDefaultAddress = async (id) => {
    try {
      const address = addresses.find(addr => addr.id === id)
      await userAPI.updateAddress(id, { ...address, isDefault: true })
      const updated = addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === id
      }))
      setAddresses(updated)
      toast.success('Default address updated!')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update default address')
    }
  }

  // Save preferences
  const handlePreferencesSave = async () => {
    try {
      await userAPI.updatePreferences(preferences)
      toast.success('Preferences saved!')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save preferences')
    }
  }

  // Account management
  const handleDownloadData = () => {
    const userData = {
      profile,
      accountInfo,
      preferences,
      addresses,
      notifications,
      exportDate: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `esoko-data-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Data downloaded successfully!')
  }

  const handleDeactivateAccount = async () => {
    try {
      await userAPI.deactivateAccount()
      toast.success('Account deactivated successfully.')
      logout()
      navigate('/login')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to deactivate account')
    } finally {
      setShowDeactivateConfirm(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      await userAPI.deleteAccount()
      toast.success('Account deleted successfully.')
      logout()
      navigate('/login')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete account')
    } finally {
      setShowDeleteConfirm(false)
    }
  }

  // Show loading while checking authentication
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <ProfileHeader
        profile={profile}
        accountInfo={accountInfo}
        profileImagePreview={profileImagePreview}
        getInitials={getInitials}
        formatDate={formatDate}
        onImageUpload={handleImageUpload}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Profile Completion & Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="card p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Profile Completion</span>
              <span className="text-lg font-bold text-orange-500">{getProfileCompletion()}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${getProfileCompletion()}%` }}
              ></div>
            </div>
          </div>
          <div className="card p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Shield className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Account Status</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {accountInfo.emailVerified ? 'Verified' : 'Unverified'}
              </p>
            </div>
          </div>
          <div className="card p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Calendar className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Member Since</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {accountInfo.createdAt ? new Date(accountInfo.createdAt).getFullYear() : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Profile Information Tab */}
        {activeTab === 'profile' && (
          <div className="card p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-xl">
                <User className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Personal Information
              </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Update your personal details and contact information
                </p>
              </div>
            </div>

            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-orange-500" />
                    Email Address
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  required
                    placeholder="your.email@example.com"
                />
              </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-orange-500" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="Your full name"
                />
              </div>

              <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-orange-500" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="+250 788 123 456"
                />
              </div>

              <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-500" />
                  Address
                </label>
                <input
                  type="text"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="Street address"
                />
              </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={profile.city}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="City"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={profile.country}
                    onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="Country"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="submit"
                disabled={saving}
                  className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
              </button>
              </div>
            </form>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="card p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl">
                <Bell className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Notification Preferences</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage how you receive updates and notifications</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-orange-500" />
                  Email Notifications
                </h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Order Updates</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Receive emails about your order status</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.emailOrderUpdates}
                      onChange={(e) => setNotifications({ ...notifications, emailOrderUpdates: e.target.checked })}
                      className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Promotions & Offers</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Get notified about special deals and discounts</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.emailPromotions}
                      onChange={(e) => setNotifications({ ...notifications, emailPromotions: e.target.checked })}
                      className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Newsletters</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Weekly updates and fashion tips</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.emailNewsletters}
                      onChange={(e) => setNotifications({ ...notifications, emailNewsletters: e.target.checked })}
                      className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                    />
                  </label>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-orange-500" />
                  SMS Notifications
                </h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Order Updates via SMS</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Receive text messages about order status</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.smsOrderUpdates}
                      onChange={(e) => setNotifications({ ...notifications, smsOrderUpdates: e.target.checked })}
                      className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Promotions via SMS</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Get promotional offers via text</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.smsPromotions}
                      onChange={(e) => setNotifications({ ...notifications, smsPromotions: e.target.checked })}
                      className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                    />
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleNotificationsSave}
                  className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Privacy & Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Change Password Section */}
            <div className="card p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl">
                  <Lock className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Change Password</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Update your password to keep your account secure</p>
                </div>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all pr-12"
                      required
                      placeholder="Enter your current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all pr-12"
                      minLength={6}
                      required
                      placeholder="Enter your new password (min. 6 characters)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {passwordData.newPassword.length > 0 && passwordData.newPassword.length < 6 && (
                    <p className="mt-1 text-xs text-red-500">Password must be at least 6 characters</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all pr-12"
                      minLength={6}
                      required
                      placeholder="Confirm your new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {passwordData.confirmPassword.length > 0 && 
                   passwordData.newPassword !== passwordData.confirmPassword && (
                    <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
                  )}
                  {passwordData.confirmPassword.length > 0 && 
                   passwordData.newPassword === passwordData.confirmPassword && 
                   passwordData.newPassword.length >= 6 && (
                    <p className="mt-1 text-xs text-green-500 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Passwords match
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="submit"
                    disabled={changingPassword || passwordData.newPassword !== passwordData.confirmPassword || passwordData.newPassword.length < 6}
                    className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                  >
                    {changingPassword ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Changing...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Change Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Two-Factor Authentication */}
            <div className="card p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl">
                    <Shield className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security to your account</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={twoFactorEnabled}
                    onChange={(e) => handleTwoFactorToggle(e.target.checked)}
                    disabled={updatingTwoFactor}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500 peer-disabled:opacity-60"></div>
                </label>
              </div>
              {twoFactorEnabled && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <AlertCircle className="w-4 h-4 inline mr-2" />
                    We'll send a verification code to your email each time you log in.
                  </p>
                </div>
              )}
            </div>

            {/* Active Sessions */}
            <div className="card p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-xl">
                  <Monitor className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Active Sessions</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Manage devices where you're logged in</p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Monitor className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Current Device</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Browser • {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full">Active</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <div className="card p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 rounded-xl">
                  <MapPin className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Saved Addresses</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Manage your delivery addresses</p>
                </div>
              </div>
              <button
                onClick={() => setEditingAddress('new')}
                className="w-full sm:w-auto px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Address
              </button>
            </div>

            {editingAddress === 'new' && (
              <div className="mb-6 p-4 sm:p-6 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-orange-200 dark:border-orange-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New Address</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Label (e.g., Home, Work)</label>
                    <input
                      type="text"
                      value={newAddress.label}
                      onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                      placeholder="Home"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Street Address *</label>
                    <input
                      type="text"
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                      placeholder="Street address"
                      required
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">City *</label>
                      <input
                        type="text"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                        placeholder="City"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Country *</label>
                      <input
                        type="text"
                        value={newAddress.country}
                        onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                        placeholder="Country"
                        required
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newAddress.isDefault}
                      onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                      className="w-4 h-4 text-orange-500 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Set as default address</span>
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={handleAddAddress}
                      className="w-full sm:w-auto px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      Save Address
                    </button>
                    <button
                      onClick={() => {
                        setEditingAddress(null)
                        setNewAddress({ label: '', street: '', city: '', country: '', isDefault: false })
                      }}
                      className="w-full sm:w-auto px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {addresses.length === 0 ? (
                <div className="text-center py-12">
                  <MapPin className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No saved addresses yet</p>
                  <button
                    onClick={() => setEditingAddress('new')}
                    className="w-full sm:w-auto px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Add Your First Address
                  </button>
                </div>
              ) : (
                addresses.map((address) => (
                  <div
                    key={address.id}
                    className={`p-4 border-2 rounded-lg ${
                      address.isDefault
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {address.label === 'Home' && <Home className="w-4 h-4 text-gray-500" />}
                          {address.label === 'Work' && <Briefcase className="w-4 h-4 text-gray-500" />}
                          <span className="font-semibold text-gray-900 dark:text-white">{address.label || 'Address'}</span>
                          {address.isDefault && (
                            <span className="px-2 py-1 text-xs font-medium bg-orange-500 text-white rounded-full">Default</span>
                          )}
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">{address.street}</p>
                        <p className="text-gray-700 dark:text-gray-300">
                          {address.city}, {address.country}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {!address.isDefault && (
                          <button
                            onClick={() => handleSetDefaultAddress(address.id)}
                            className="px-3 py-1 text-sm text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded transition-colors"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteAddress(address.id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="card p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl">
                <Settings className="w-6 h-6 text-indigo-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Preferences</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Customize your experience</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Languages className="w-4 h-4 text-orange-500" />
                  Language
                </label>
                <select
                  value={preferences.language}
                  onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="rw">Kinyarwanda</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-orange-500" />
                  Currency
                </label>
                <select
                  value={preferences.currency}
                  onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="RWF">RWF (Rwandan Franc)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-orange-500" />
                  Theme
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => {
                      setPreferences({ ...preferences, theme: 'light' })
                      setThemeMode('light')
                    }}
                    className={`p-3 sm:p-4 rounded-lg border-2 transition-all flex flex-col items-center ${
                      preferences.theme === 'light'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Sun className="w-6 h-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Light</span>
                  </button>
                  <button
                    onClick={() => {
                      setPreferences({ ...preferences, theme: 'dark' })
                      setThemeMode('dark')
                    }}
                    className={`p-3 sm:p-4 rounded-lg border-2 transition-all flex flex-col items-center ${
                      preferences.theme === 'dark'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Moon className="w-6 h-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark</span>
                  </button>
                  <button
                    onClick={() => {
                      setPreferences({ ...preferences, theme: 'system' })
                      setThemeMode('system')
                    }}
                    className={`p-3 sm:p-4 rounded-lg border-2 transition-all flex flex-col items-center ${
                      preferences.theme === 'system'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Monitor className="w-6 h-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">System</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Date Format</label>
                <select
                  value={preferences.dateFormat}
                  onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Timezone</label>
                <select
                  value={preferences.timezone}
                  onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Africa/Kigali">Africa/Kigali (CAT)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handlePreferencesSave}
                  className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Account Management Tab */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            <div className="card p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-xl">
                  <FileText className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Data & Privacy</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Manage your data and privacy settings</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Download Your Data</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Get a copy of all your account data in JSON format</p>
                    </div>
                    <button
                      onClick={handleDownloadData}
                      className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Danger Zone</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Irreversible and destructive actions</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 border-2 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Deactivate Account</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Temporarily disable your account. You can reactivate it later.</p>
                    </div>
                    <button
                      onClick={() => setShowDeactivateConfirm(true)}
                      className="w-full sm:w-auto px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                    >
                      Deactivate
                    </button>
                  </div>
                </div>

                <div className="p-4 border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Delete Account</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Permanently delete your account and all associated data. This action cannot be undone.</p>
                    </div>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full sm:w-auto px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modals */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl max-w-md w-full p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Delete Account</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleDeleteAccount}
                  className="w-full sm:flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
                >
                  Delete Account
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full sm:flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showDeactivateConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl max-w-md w-full p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-yellow-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Deactivate Account</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your account will be temporarily disabled. You can reactivate it anytime by logging in again.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleDeactivateAccount}
                  className="w-full sm:flex-1 px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-semibold"
                >
                  Deactivate
                </button>
                <button
                  onClick={() => setShowDeactivateConfirm(false)}
                  className="w-full sm:flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}

export default Profile


