import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, Share2 } from 'lucide-react'
import { getAvatarUrl } from '../../utils/avatarUtils'
import toast from 'react-hot-toast'

export function ProfilePicturePreview({ isOpen, onClose, user }) {
  const avatarUrl = user?.avatar ? getAvatarUrl(user.avatar) : null
  
  // Debug logging
  console.log('ProfilePicturePreview - User:', user)
  console.log('ProfilePicturePreview - Avatar path:', user?.avatar)
  console.log('ProfilePicturePreview - Avatar URL:', avatarUrl)

  const handleDownload = async () => {
    if (!avatarUrl) {
      toast.error('No profile picture to download.')
      return
    }
    try {
      const response = await fetch(avatarUrl)
      const blob = await response.blob()
      const filename = `profile-picture-${user?.name?.replace(/\s/g, '-') || 'user'}.jpg`
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast.success('Profile picture downloaded!')
    } catch (error) {
      console.error('Download failed:', error)
      toast.error('Failed to download profile picture.')
    }
  }

  const handleShare = async () => {
    if (!avatarUrl) {
      toast.error('No profile picture to share.')
      return
    }
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${user?.name || 'User'}'s Profile Picture`,
          url: avatarUrl,
        })
        toast.success('Profile picture shared!')
      } catch (error) {
        console.error('Share failed:', error)
        toast.error('Failed to share profile picture.')
      }
    } else {
      navigator.clipboard.writeText(avatarUrl)
      toast.info('Profile picture URL copied to clipboard!')
    }
  }

  if (!isOpen || !user) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black bg-opacity-80 flex items-center justify-center"
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }}
          onClick={onClose}
        >
          {/* Centered Modal Container */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden w-[90vw] max-w-4xl h-[80vh] flex flex-col mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Close Button */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{user?.name || 'User'}</h3>
                  <p className="text-sm text-primary-100">Profile Picture</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
                title="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Image Container */}
            <div className="relative flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring", damping: 20, stiffness: 300 }}
                className="relative group max-w-full max-h-full w-full h-full flex items-center justify-center p-4"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={`${user?.name || 'User'}'s profile picture`}
                    className="max-w-full max-h-full w-auto h-auto object-contain rounded-2xl shadow-xl border-4 border-white"
                    onError={(e) => {
                      console.error('Profile picture failed to load in preview:', e.target.src)
                      e.target.style.display = 'none'
                      // Show fallback
                      const fallback = e.target.nextSibling
                      if (fallback) fallback.style.display = 'flex'
                    }}
                  />
                ) : null}
                
                {/* Fallback when no avatar or image fails to load */}
                <div 
                  className="w-32 h-32 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-xl border-4 border-white"
                  style={{ display: avatarUrl ? 'none' : 'flex' }}
                >
                  <span className="text-4xl font-bold text-white">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Footer with Download and Share Buttons */}
            <div className="flex items-center justify-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownload}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-md hover:shadow-lg"
              >
                <Download className="w-5 h-5" />
                <span className="font-medium">Download</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="flex items-center space-x-2 px-6 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-md hover:shadow-lg border border-gray-200"
              >
                <Share2 className="w-5 h-5" />
                <span className="font-medium">Share</span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
