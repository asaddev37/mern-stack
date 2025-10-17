import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Menu, 
  Bell, 
  Search, 
  User, 
  LogOut, 
  Settings,
  Moon,
  Sun,
  X,
  ChevronDown
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { getAvatarUrl } from '../../utils/avatarUtils'
import { ProfilePicturePreview } from '../ui/ProfilePicturePreview'
import toast from 'react-hot-toast'

export function Header({ onMenuClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Budget limit reached for Food & Dining', time: '2 hours ago', type: 'warning' },
    { id: 2, message: 'New transaction added: $150.00', time: '4 hours ago', type: 'info' },
    { id: 3, message: 'Monthly report is ready', time: '1 day ago', type: 'success' }
  ])
  const [showNotifications, setShowNotifications] = useState(false)

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu')) {
        setShowUserMenu(false)
      }
      if (showNotifications && !event.target.closest('.notifications-menu')) {
        setShowNotifications(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showUserMenu, showNotifications])

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    setShowUserMenu(false)
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    toast.success(`Switched to ${isDarkMode ? 'light' : 'dark'} mode`)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/transactions?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setShowSearch(false)
    }
  }

  const handleProfileClick = () => {
    navigate('/profile')
    setShowUserMenu(false)
  }

  const handleSettingsClick = () => {
    navigate('/profile?tab=settings')
    setShowUserMenu(false)
  }

  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }

  const handleProfilePictureClick = (e) => {
    e.stopPropagation()
    if (user?.avatar) {
      console.log('User avatar path:', user.avatar)
      console.log('Full avatar URL:', getAvatarUrl(user.avatar))
      setShowProfileModal(true)
    }
  }

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-white/90 backdrop-blur-lg border-b border-white/20 shadow-soft sticky top-0 z-40"
    >
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-all duration-200"
            >
              <Menu className="w-6 h-6" />
            </motion.button>
            
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="hidden lg:block ml-4"
            >
              <h2 className="text-2xl font-bold gradient-text">
                Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
              </h2>
              <p className="text-gray-600 text-sm">
                Here's what's happening with your finances today.
              </p>
            </motion.div>
          </div>

          {/* Right side */}
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center space-x-3"
          >
            {/* Search */}
            <div className="relative">
              {showSearch ? (
                <motion.form
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 300, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  onSubmit={handleSearch}
                  className="flex items-center"
                >
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search transactions..."
                      className="pl-10 pr-10 py-2 w-64 rounded-xl border border-gray-200 bg-white/80 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition-all duration-300"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowSearch(false)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.form>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSearch(true)}
                  className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-all duration-200"
                >
                  <Search className="w-5 h-5" />
                </motion.button>
              )}
            </div>

            {/* Notifications */}
            <div className="relative notifications-menu">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-all duration-200"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full"
                  />
                )}
              </motion.button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-strong border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto"
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                    </div>
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                            </div>
                            <button
                              onClick={() => clearNotification(notification.id)}
                              className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center text-gray-500">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No notifications</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-all duration-200"
            >
              <motion.div
                animate={{ rotate: isDarkMode ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </motion.div>
            </motion.button>

            {/* User Menu */}
            <div className="relative user-menu">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200"
              >
                {user?.avatar ? (
                  <button
                    onClick={handleProfilePictureClick}
                    className="w-8 h-8 rounded-full border-2 border-white shadow-sm hover:shadow-md transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    title="Click to view full profile picture"
                  >
                    <img
                      src={getAvatarUrl(user.avatar)}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        console.error('Header avatar failed to load:', e.target.src)
                        console.error('This might be due to CORS policy. Check server CORS configuration.')
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                  </button>
                ) : null}
                <div 
                  className={`w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center ${user?.avatar ? 'hidden' : ''}`}
                >
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: showUserMenu ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-strong border border-gray-200 py-2 z-50"
                  >
                    <motion.button 
                      whileHover={{ backgroundColor: '#f9fafb' }}
                      onClick={handleProfileClick}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 transition-colors"
                    >
                      <User className="w-4 h-4 mr-3" />
                      Profile
                    </motion.button>
                    <motion.button 
                      whileHover={{ backgroundColor: '#f9fafb' }}
                      onClick={handleSettingsClick}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 transition-colors"
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Settings
                    </motion.button>
                    <hr className="my-2" />
                    <motion.button
                      whileHover={{ backgroundColor: '#fef2f2' }}
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-danger-600 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign out
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Profile Picture Preview */}
      <ProfilePicturePreview
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
      />
    </motion.header>
  )
}
