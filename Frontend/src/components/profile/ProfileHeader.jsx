import { Link } from 'react-router-dom'
import { ArrowLeft, Edit3, CheckCircle2, Mail, Phone, Calendar, Clock } from 'lucide-react'

const ProfileHeader = ({
  profile,
  accountInfo,
  profileImagePreview,
  getInitials,
  formatDate,
  onImageUpload,
}) => (
  <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 py-10 sm:py-16 lg:py-20">
    <div className="absolute inset-0 bg-black/10"></div>
    <div className="absolute inset-0">
      <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
    </div>
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Link
        to="/account"
        className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-4 sm:mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Account</span>
      </Link>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-xl border-4 border-white/30 overflow-hidden">
            {profileImagePreview ? (
              <img src={profileImagePreview} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              getInitials()
            )}
          </div>
          <label className="absolute bottom-0 right-0 sm:bottom-2 sm:right-2 p-2 bg-white rounded-full shadow-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <Edit3 className="w-4 h-4 text-emerald-600" />
            <input
              type="file"
              accept="image/*"
              onChange={onImageUpload}
              className="hidden"
            />
          </label>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white">
              {profile.name || 'My Profile'}
            </h1>
            {accountInfo.emailVerified && (
              <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-full">
                <CheckCircle2 className="w-4 h-4 text-green-300" />
                <span className="text-xs text-green-100 font-medium">Verified</span>
              </div>
            )}
          </div>
          <p className="text-white/90 text-sm sm:text-base mb-1 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            {profile.email}
          </p>
          {profile.phone && (
            <p className="text-white/90 text-sm sm:text-base flex items-center gap-2 mb-2">
              <Phone className="w-4 h-4" />
              {profile.phone}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs sm:text-sm text-white/80">
            {accountInfo.createdAt && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Member since {formatDate(accountInfo.createdAt)}
              </div>
            )}
            {accountInfo.lastLogin && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Last login {formatDate(accountInfo.lastLogin)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
)

export default ProfileHeader
