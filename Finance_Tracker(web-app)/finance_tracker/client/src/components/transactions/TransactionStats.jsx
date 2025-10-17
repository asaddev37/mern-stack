import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Minus } from 'lucide-react'
import { useCurrency } from '../../contexts/CurrencyContext'

export function TransactionStats({ stats, isLoading }) {
  const { formatCurrency } = useCurrency()
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card animate-pulse">
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const formatAmount = (amount) => {
    return formatCurrency(amount)
  }

  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const getChangeIcon = (change) => {
    if (change > 0) return <TrendingUp className="w-4 h-4" />
    if (change < 0) return <TrendingDown className="w-4 h-4" />
    return <Minus className="w-4 h-4" />
  }

  const getChangeColor = (change) => {
    if (change > 0) return 'text-emerald-600 bg-emerald-50 border-emerald-200'
    if (change < 0) return 'text-red-600 bg-red-50 border-red-200'
    return 'text-gray-600 bg-gray-50 border-gray-200'
  }

  const getCardGradient = (gradient) => {
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

  const getIconGradient = (gradient) => {
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

  const statCards = [
    {
      title: 'Total Income',
      value: formatAmount(stats?.income?.total || 0),
      change: stats?.income?.change || 0,
      icon: TrendingUp,
      gradient: 'gradient-success',
      emoji: '💰'
    },
    {
      title: 'Total Expenses',
      value: formatAmount(stats?.expense?.total || 0),
      change: stats?.expense?.change || 0,
      icon: TrendingDown,
      gradient: 'gradient-danger',
      emoji: '💸'
    },
    {
      title: 'Net Balance',
      value: formatAmount(stats?.net || 0),
      change: stats?.netChange || 0,
      icon: DollarSign,
      gradient: 'gradient-primary',
      emoji: '📊'
    },
    {
      title: 'Transaction Count',
      value: (stats?.income?.count || 0) + (stats?.expense?.count || 0),
      change: stats?.transactionChange || 0,
      icon: CreditCard,
      gradient: 'gradient-warning',
      emoji: '📋'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            delay: index * 0.1,
            type: "spring",
            stiffness: 100,
            damping: 15
          }}
          whileHover={{ 
            scale: 1.02, 
            y: -2,
            transition: { duration: 0.2, type: "spring", stiffness: 300 }
          }}
          whileTap={{ scale: 0.98 }}
          className={`relative p-4 bg-gradient-to-br ${getCardGradient(stat.gradient)} border border-gray-200/50 rounded-xl group cursor-pointer overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300`}
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/20 to-transparent rounded-full -translate-y-8 translate-x-8"></div>
          
          {/* Hover effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-1.5">
                <span className="text-lg">{stat.emoji}</span>
                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{stat.title}</p>
              </div>
              
              <motion.div 
                whileHover={{ rotate: 8, scale: 1.05 }}
                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getIconGradient(stat.gradient)} flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300`}
              >
                <stat.icon className="w-5 h-5 text-white" />
              </motion.div>
            </div>
            
            <div className="space-y-2">
              <motion.p 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
                className="text-2xl font-bold text-gray-900"
              >
                {stat.value}
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border ${getChangeColor(stat.change)} backdrop-blur-sm`}
              >
                {getChangeIcon(stat.change)}
                <span className="ml-1">{formatPercentage(stat.change)}</span>
              </motion.div>
            </div>
          </div>

          {/* Animated progress bar */}
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
            className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${getIconGradient(stat.gradient)} rounded-full`}
          ></motion.div>

          {/* Shine effect */}
          <div className="absolute inset-0 -top-1 -left-1 w-4 h-4 bg-white/30 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300"></div>
        </motion.div>
      ))}
    </div>
  )
}
