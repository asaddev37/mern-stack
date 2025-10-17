import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownRight, Minus, TrendingUp, TrendingDown } from 'lucide-react'

export function StatCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  gradient, 
  color,
  emoji
}) {
  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive':
        return <TrendingUp className="w-4 h-4" />
      case 'negative':
        return <TrendingDown className="w-4 h-4" />
      default:
        return <Minus className="w-4 h-4" />
    }
  }

  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200'
      case 'negative':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getCardGradient = () => {
    switch (gradient) {
      case 'gradient-success':
        return 'from-emerald-50 to-green-50'
      case 'gradient-danger':
        return 'from-red-50 to-rose-50'
      case 'gradient-warning':
        return 'from-amber-50 to-orange-50'
      case 'gradient-primary':
        return 'from-blue-50 to-indigo-50'
      default:
        return 'from-gray-50 to-slate-50'
    }
  }

  const getIconGradient = () => {
    switch (gradient) {
      case 'gradient-success':
        return 'from-emerald-500 to-green-600'
      case 'gradient-danger':
        return 'from-red-500 to-rose-600'
      case 'gradient-warning':
        return 'from-amber-500 to-orange-600'
      case 'gradient-primary':
        return 'from-blue-500 to-indigo-600'
      default:
        return 'from-gray-500 to-slate-600'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ 
        scale: 1.02, 
        y: -2,
        transition: { duration: 0.2, type: "spring", stiffness: 300 }
      }}
      whileTap={{ scale: 0.98 }}
      className={`relative p-4 bg-gradient-to-br ${getCardGradient()} border border-gray-200/50 rounded-xl group cursor-pointer overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300`}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/20 to-transparent rounded-full -translate-y-8 translate-x-8"></div>
      
      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1.5">
            {emoji && <span className="text-lg">{emoji}</span>}
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{title}</p>
          </div>
          
          <motion.div 
            whileHover={{ rotate: 8, scale: 1.05 }}
            className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getIconGradient()} flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300`}
          >
            <Icon className="w-5 h-5 text-white" />
          </motion.div>
        </div>
        
        <div className="space-y-2">
          <motion.p 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-bold text-gray-900"
          >
            {value}
          </motion.p>
          
          {change && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border ${getChangeColor()} backdrop-blur-sm`}
            >
              {getChangeIcon()}
              <span className="ml-1">{change}</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Animated progress bar */}
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
        className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${getIconGradient()} rounded-full`}
      ></motion.div>

      {/* Shine effect */}
      <div className="absolute inset-0 -top-1 -left-1 w-4 h-4 bg-white/30 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300"></div>
    </motion.div>
  )
}
