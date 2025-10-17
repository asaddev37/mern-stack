import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Settings, Key, Globe, Moon, Sun, Camera, Trash2, Download, Upload, ChevronDown, FileText, FileSpreadsheet, FileJson } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useCurrency } from '../contexts/CurrencyContext'
import { useQuery } from '@tanstack/react-query'
import { transactionsAPI, budgetsAPI } from '../services/api'
import toast from 'react-hot-toast'
import { getAvatarUrl } from '../utils/avatarUtils'
import { ProfilePicturePreview } from '../components/ui/ProfilePicturePreview'

export function Profile() {
  const { user, updateProfile, changePassword, uploadAvatar, removeAvatar } = useAuth()
  const { updateCurrency, formatCurrency } = useCurrency()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [showExportDropdown, setShowExportDropdown] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportDropdown && !event.target.closest('.export-dropdown')) {
        setShowExportDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showExportDropdown])

  // Debug user state changes
  useEffect(() => {
    console.log('User state changed:', user)
    if (user?.avatar) {
      console.log('Avatar URL:', getAvatarUrl(user.avatar))
    }
  }, [user])

  // Fetch user statistics
  const { data: userStats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: async () => {
      try {
        // Try to fetch both APIs with individual error handling
        let transactions = []
        let budgets = []
        
        try {
          // Fetch all transactions using pagination
          let allTransactions = []
          let page = 1
          let hasMore = true
          
          while (hasMore) {
            const transactionsRes = await transactionsAPI.getTransactions({ 
              limit: 100, 
              page: page 
            })
            
            const pageTransactions = transactionsRes.data?.transactions || []
            allTransactions = [...allTransactions, ...pageTransactions]
            
            // Check if we got less than the limit, meaning we're on the last page
            hasMore = pageTransactions.length === 100
            page++
            
            // Safety check to prevent infinite loop
            if (page > 10) {
              break
            }
          }
          
          transactions = allTransactions
        } catch (transError) {
          // Try without parameters as fallback
          try {
            const fallbackRes = await transactionsAPI.getTransactions()
            transactions = fallbackRes.data?.transactions || []
          } catch (fallbackError) {
            transactions = []
          }
        }
        
        try {
          const budgetsRes = await budgetsAPI.getBudgets()
          budgets = budgetsRes.data?.budgets || []
        } catch (budgetError) {
          // Continue with empty budgets array
        }
        
        const totalIncome = transactions
          .filter(t => t && t.type === 'income')
          .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0)
        
        const totalExpenses = transactions
          .filter(t => t && t.type === 'expense')
          .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0)
        
        return {
          totalTransactions: transactions.length,
          totalIncome,
          totalExpenses,
          totalBudgets: budgets.length,
          activeBudgets: budgets.filter(b => b && b.isActive).length,
          memberSince: user?.createdAt
        }
      } catch (error) {
        // Return default stats instead of throwing
        return {
          totalTransactions: 0,
          totalIncome: 0,
          totalExpenses: 0,
          totalBudgets: 0,
          activeBudgets: 0,
          memberSince: user?.createdAt
        }
      }
    },
    enabled: !!user,
    retry: 2,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    preferences: {
      currency: user?.preferences?.currency || 'USD',
      theme: user?.preferences?.theme || 'light',
      language: user?.preferences?.language || 'en'
    }
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Update profile data when user changes
  useEffect(() => {
    if (user) {
      console.log('User state updated in Profile:', user)
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        preferences: {
          currency: user.preferences?.currency || 'USD',
          theme: user.preferences?.theme || 'light',
          language: user.preferences?.language || 'en'
        }
      })
    }
  }, [user])

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await updateProfile(profileData)
      if (result.success) {
        toast.success('Profile updated successfully!')
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPasswordLoading(true)

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match')
      setPasswordLoading(false)
      return
    }

    try {
      const result = await changePassword(passwordData.currentPassword, passwordData.newPassword)
      if (result.success) {
        toast.success('Password changed successfully!')
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to change password')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    console.log('Selected file:', file.name, file.type, file.size)

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, GIF, or WebP)')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    setAvatarLoading(true)
    try {
      console.log('Starting avatar upload...')
      const result = await uploadAvatar(file)
      console.log('Upload result:', result)
      if (result.success) {
        toast.success('Profile picture updated successfully!')
        console.log('New avatar path:', result.avatar)
        console.log('New avatar URL:', result.avatarUrl)
        console.log('Current user state after upload:', user)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload profile picture')
    } finally {
      setAvatarLoading(false)
    }
  }

  const handleAvatarRemove = async () => {
    setAvatarLoading(true)
    try {
      const result = await removeAvatar()
      if (result.success) {
        toast.success('Profile picture removed successfully!')
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to remove profile picture')
    } finally {
      setAvatarLoading(false)
    }
  }

  const handleProfilePictureClick = () => {
    if (user?.avatar) {
      setShowProfileModal(true)
    }
  }

  const handlePreferencesUpdate = async () => {
    setLoading(true)
    try {
      const result = await updateProfile({ preferences: profileData.preferences })
      if (result.success) {
        // Update currency context when preferences are saved
        updateCurrency(profileData.preferences.currency)
        toast.success('Preferences updated successfully!')
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to update preferences')
    } finally {
      setLoading(false)
    }
  }

  const handleDataExport = async (format = 'json') => {
    try {
      setLoading(true)
      toast.loading('Fetching your data...', { id: 'export-loading' })
      
      // Fetch all transactions using pagination
      let allTransactions = []
      let page = 1
      let hasMore = true
      
      while (hasMore) {
        const transactionsRes = await transactionsAPI.getTransactions({ 
          limit: 100, 
          page: page 
        })
        
        const pageTransactions = transactionsRes.data?.transactions || []
        allTransactions = [...allTransactions, ...pageTransactions]
        
        // Check if we got less than the limit, meaning we're on the last page
        hasMore = pageTransactions.length === 100
        page++
        
        // Safety check to prevent infinite loop
        if (page > 50) {
          console.warn('Reached maximum page limit (50), stopping pagination')
          break
        }
      }
      
      toast.dismiss('export-loading')
      
      const transactions = allTransactions
      const budgetsRes = await budgetsAPI.getBudgets()
      const budgets = budgetsRes.data?.budgets || []
      
      const exportData = {
        user: {
          name: user.name,
          email: user.email,
          memberSince: user.createdAt,
          preferences: user.preferences || {}
        },
        transactions,
        budgets,
        summary: {
          totalTransactions: transactions.length,
          totalIncome: transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0),
          totalExpenses: transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0),
          totalBudgets: budgets.length,
          activeBudgets: budgets.filter(b => b.isActive).length
        },
        exportDate: new Date().toISOString(),
        exportVersion: '1.0'
      }
      
      if (format === 'json') {
        exportToJSON(exportData)
      } else if (format === 'csv') {
        exportToCSV(exportData)
      } else if (format === 'excel') {
        exportToExcel(exportData)
      }
      
      toast.success(`Data exported successfully! (${transactions.length} transactions, ${budgets.length} budgets)`)
    } catch (error) {
      console.error('Export error:', error)
      toast.dismiss('export-loading')
      if (error.response?.status === 400) {
        toast.error('Invalid request parameters. Please try again.')
      } else if (error.response?.status === 401) {
        toast.error('Authentication required. Please log in again.')
      } else if (error.response?.status >= 500) {
        toast.error('Server error. Please try again later.')
      } else {
        toast.error('Failed to export data. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const exportToJSON = (exportData) => {
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `finance-tracker-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const exportToCSV = (exportData) => {
    const { transactions, budgets, user, summary } = exportData
    
    // Create transactions CSV
    const transactionHeaders = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Payment Method', 'Status']
    const transactionRows = transactions.map(t => [
      new Date(t.date).toLocaleDateString(),
      t.type,
      t.category,
      `"${t.description || ''}"`,
      t.amount,
      t.paymentMethod || '',
      t.status || 'completed'
    ])
    
    const transactionCSV = [
      'TRANSACTIONS',
      transactionHeaders.join(','),
      ...transactionRows.map(row => row.join(','))
    ].join('\n')
    
    // Create budgets CSV
    const budgetHeaders = ['Name', 'Category', 'Amount', 'Spent', 'Remaining', 'Status', 'Is Active']
    const budgetRows = budgets.map(b => [
      `"${b.name}"`,
      b.category,
      b.amount,
      b.spent || 0,
      (b.amount - (b.spent || 0)),
      b.status || 'active',
      b.isActive
    ])
    
    const budgetCSV = [
      '\n\nBUDGETS',
      budgetHeaders.join(','),
      ...budgetRows.map(row => row.join(','))
    ].join('\n')
    
    // Create summary CSV
    const summaryCSV = [
      '\n\nSUMMARY',
      'Metric,Value',
      `Total Transactions,${summary.totalTransactions}`,
      `Total Income,${summary.totalIncome}`,
      `Total Expenses,${summary.totalExpenses}`,
      `Net Income,${summary.totalIncome - summary.totalExpenses}`,
      `Total Budgets,${summary.totalBudgets}`,
      `Active Budgets,${summary.activeBudgets}`,
      `Export Date,${new Date().toISOString()}`
    ].join('\n')
    
    const fullCSV = transactionCSV + budgetCSV + summaryCSV
    
    const blob = new Blob([fullCSV], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `finance-tracker-export-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const exportToExcel = (exportData) => {
    const { transactions, budgets, summary } = exportData
    
    // Create Excel-compatible format (tab-separated)
    const transactionHeaders = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Payment Method', 'Status']
    const transactionRows = transactions.map(t => [
      new Date(t.date).toLocaleDateString(),
      t.type,
      t.category,
      t.description || '',
      t.amount,
      t.paymentMethod || '',
      t.status || 'completed'
    ])
    
    const transactionExcel = [
      'TRANSACTIONS',
      transactionHeaders.join('\t'),
      ...transactionRows.map(row => row.join('\t'))
    ].join('\n')
    
    const budgetHeaders = ['Name', 'Category', 'Amount', 'Spent', 'Remaining', 'Status', 'Is Active']
    const budgetRows = budgets.map(b => [
      b.name,
      b.category,
      b.amount,
      b.spent || 0,
      (b.amount - (b.spent || 0)),
      b.status || 'active',
      b.isActive
    ])
    
    const budgetExcel = [
      '\n\nBUDGETS',
      budgetHeaders.join('\t'),
      ...budgetRows.map(row => row.join('\t'))
    ].join('\n')
    
    const summaryExcel = [
      '\n\nSUMMARY',
      'Metric\tValue',
      `Total Transactions\t${summary.totalTransactions}`,
      `Total Income\t${summary.totalIncome}`,
      `Total Expenses\t${summary.totalExpenses}`,
      `Net Income\t${summary.totalIncome - summary.totalExpenses}`,
      `Total Budgets\t${summary.totalBudgets}`,
      `Active Budgets\t${summary.activeBudgets}`,
      `Export Date\t${new Date().toISOString()}`
    ].join('\n')
    
    const fullExcel = transactionExcel + budgetExcel + summaryExcel
    
    const blob = new Blob([fullExcel], { type: 'application/vnd.ms-excel' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `finance-tracker-export-${new Date().toISOString().split('T')[0]}.xls`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'stats', name: 'Statistics', icon: Globe },
    { id: 'settings', name: 'Settings', icon: Settings },
    { id: 'security', name: 'Security', icon: Key }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-700 border border-primary-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
              
              {/* Profile Picture Section */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Profile Picture
                </label>
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    {user?.avatar ? (
                      <button
                        onClick={handleProfilePictureClick}
                        className="w-24 h-24 rounded-full border-4 border-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer focus:outline-none focus:ring-4 focus:ring-primary-500 focus:ring-offset-2"
                        title="Click to view full profile picture"
                      >
                        <img
                          src={getAvatarUrl(user.avatar)}
                          alt="Profile"
                          className="w-full h-full rounded-full object-cover"
                          onError={(e) => {
                            console.error('Avatar image failed to load:', e.target.src)
                            console.error('This might be due to CORS policy. Check server CORS configuration.')
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'flex'
                          }}
                          onLoad={() => {
                            console.log('Avatar image loaded successfully:', getAvatarUrl(user.avatar))
                          }}
                        />
                      </button>
                    ) : null}
                    <div 
                      className={`w-24 h-24 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold ${user?.avatar ? 'hidden' : ''}`}
                    >
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <label
                      className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white hover:bg-primary-700 transition-colors cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        disabled={avatarLoading}
                      />
                    </label>
                    {avatarLoading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      {user?.avatar 
                        ? 'Click the camera icon to change your profile picture'
                        : 'Upload a profile picture to personalize your account'
                      }
                    </p>
                    <div className="flex space-x-2">
                      <label className="text-sm text-primary-600 hover:text-primary-700 font-medium cursor-pointer">
                        Upload Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                          disabled={avatarLoading}
                        />
                      </label>
                      {user?.avatar && (
                        <button
                          type="button"
                          onClick={handleAvatarRemove}
                          disabled={avatarLoading}
                          className="text-sm text-gray-500 hover:text-gray-700 font-medium disabled:opacity-50"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Supported formats: JPEG, PNG, GIF, WebP (Max 5MB)
                    </p>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="input-field pl-10"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="input-field pl-10"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Account Statistics</h2>
                <button
                  onClick={() => refetchStats()}
                  className="btn-outline text-sm"
                  disabled={statsLoading}
                >
                  {statsLoading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
              
              {statsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  <span className="ml-3 text-gray-600">Loading statistics...</span>
                </div>
              ) : statsError ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Statistics</h3>
                  <p className="text-gray-600 mb-4">Unable to fetch your account statistics</p>
                  <button
                    onClick={() => refetchStats()}
                    className="btn-primary"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600">Total Transactions</p>
                        <p className="text-2xl font-bold text-blue-900">{userStats?.totalTransactions || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-600">Total Income</p>
                        <p className="text-2xl font-bold text-green-900">
                          {formatCurrency(userStats?.totalIncome || 0)}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                        <Download className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-red-600">Total Expenses</p>
                        <p className="text-2xl font-bold text-red-900">
                          {formatCurrency(userStats?.totalExpenses || 0)}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                        <Upload className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-600">Total Budgets</p>
                        <p className="text-2xl font-bold text-purple-900">{userStats?.totalBudgets || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                        <Settings className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-orange-600">Active Budgets</p>
                        <p className="text-2xl font-bold text-orange-900">{userStats?.activeBudgets || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                        <Key className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-indigo-600">Member Since</p>
                        <p className="text-lg font-bold text-indigo-900">
                          {userStats?.memberSince ? new Date(userStats.memberSince).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center">
                        <Globe className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Preferences</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={profileData.preferences.currency}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      preferences: { ...profileData.preferences, currency: e.target.value }
                    })}
                    className="input-field"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="INR">INR - Indian Rupee</option>
                    <option value="PKR">PKR - Pakistani Rupee</option>
                    <option value="AED">AED - UAE Dirham</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    value={profileData.preferences.language}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      preferences: { ...profileData.preferences, language: e.target.value }
                    })}
                    className="input-field"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="ar">Arabic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Theme
                  </label>
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setProfileData({
                        ...profileData,
                        preferences: { ...profileData.preferences, theme: 'light' }
                      })}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl border transition-colors ${
                        profileData.preferences.theme === 'light'
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Sun className="w-4 h-4" />
                      <span>Light</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setProfileData({
                        ...profileData,
                        preferences: { ...profileData.preferences, theme: 'dark' }
                      })}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl border transition-colors ${
                        profileData.preferences.theme === 'dark'
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Moon className="w-4 h-4" />
                      <span>Dark</span>
                    </button>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={handlePreferencesUpdate}
                    disabled={loading}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </div>

              {/* Data Export Section */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-gray-900">Export Data</h4>
                      <p className="text-sm text-gray-600">Download your financial data in multiple formats</p>
                    </div>
                    <div className="relative export-dropdown">
                      <button
                        type="button"
                        onClick={() => setShowExportDropdown(!showExportDropdown)}
                        className="btn-outline flex items-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Export</span>
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      
                      {showExportDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-strong border border-gray-200 py-2 z-50"
                        >
                          <button
                            onClick={() => {
                              handleDataExport('json')
                              setShowExportDropdown(false)
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <FileJson className="w-4 h-4 mr-3" />
                            Export as JSON
                          </button>
                          <button
                            onClick={() => {
                              handleDataExport('csv')
                              setShowExportDropdown(false)
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <FileText className="w-4 h-4 mr-3" />
                            Export as CSV
                          </button>
                          <button
                            onClick={() => {
                              handleDataExport('excel')
                              setShowExportDropdown(false)
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <FileSpreadsheet className="w-4 h-4 mr-3" />
                            Export as Excel
                          </button>
                        </motion.div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-gray-900">Delete Account</h4>
                      <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toast.error('Account deletion not implemented yet')}
                      className="btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>
              
              {/* Account Security Info */}
              <div className="mb-8 p-4 bg-blue-50 rounded-xl">
                <h3 className="font-medium text-blue-900 mb-2">Account Security</h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <div className="flex items-center justify-between">
                    <span>Email Verified:</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user?.isEmailVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user?.isEmailVerified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Last Login:</span>
                    <span>{user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Account Created:</span>
                    <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="input-field"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="input-field"
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="input-field"
                    placeholder="Confirm new password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {passwordLoading ? 'Changing...' : 'Change Password'}
                </button>
              </form>

              {/* Additional Security Actions */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-gray-900">Logout from all devices</h4>
                      <p className="text-sm text-gray-600">Sign out from all devices and invalidate all sessions</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toast.success('Logout from all devices feature coming soon!')}
                      className="btn-outline"
                    >
                      Logout All
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toast.info('2FA feature coming soon!')}
                      className="btn-outline"
                    >
                      Enable 2FA
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Profile Picture Preview */}
      <ProfilePicturePreview
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
      />
    </div>
  )
}
