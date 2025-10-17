import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Plus, CreditCard, PieChart, TrendingUp, Download, Upload, ArrowRight, Sparkles } from 'lucide-react'

const quickActions = [
  {
    title: 'Add Income',
    description: 'Record new income',
    icon: TrendingUp,
    gradient: 'from-emerald-500 to-green-600',
    bgGradient: 'from-emerald-50 to-green-50',
    borderColor: 'border-emerald-200',
    hoverBg: 'hover:from-emerald-100 hover:to-green-100',
    href: '/transactions?type=income',
    emoji: '💰'
  },
  {
    title: 'Add Expense',
    description: 'Record new expense',
    icon: CreditCard,
    gradient: 'from-red-500 to-rose-600',
    bgGradient: 'from-red-50 to-rose-50',
    borderColor: 'border-red-200',
    hoverBg: 'hover:from-red-100 hover:to-rose-100',
    href: '/transactions?type=expense',
    emoji: '💸'
  },
  {
    title: 'Create Budget',
    description: 'Set spending limits',
    icon: PieChart,
    gradient: 'from-amber-500 to-orange-600',
    bgGradient: 'from-amber-50 to-orange-50',
    borderColor: 'border-amber-200',
    hoverBg: 'hover:from-amber-100 hover:to-orange-100',
    href: '/budgets',
    emoji: '📊'
  },
  {
    title: 'View Analytics',
    description: 'Insights & reports',
    icon: Download,
    gradient: 'from-blue-500 to-indigo-600',
    bgGradient: 'from-blue-50 to-indigo-50',
    borderColor: 'border-blue-200',
    hoverBg: 'hover:from-blue-100 hover:to-indigo-100',
    href: '/analytics',
    emoji: '📈'
  }
]

export function QuickActions() {
  const navigate = useNavigate()

  const handleActionClick = (action) => {
    if (action.href) {
      navigate(action.href)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-100/50 to-emerald-100/50 rounded-full translate-y-12 -translate-x-12"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
            </div>
            <p className="text-sm text-gray-600">Jump into your most common tasks</p>
          </div>
          <motion.div 
            whileHover={{ rotate: 90, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
          >
            <Plus className="w-6 h-6 text-white" />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.title}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ 
                delay: index * 0.1,
                type: "spring",
                stiffness: 100,
                damping: 15
              }}
              whileHover={{ 
                scale: 1.05, 
                y: -8,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleActionClick(action)}
              className={`relative p-6 bg-gradient-to-br ${action.bgGradient} border ${action.borderColor} rounded-2xl text-left group cursor-pointer overflow-hidden transition-all duration-300 ${action.hoverBg} shadow-sm hover:shadow-xl`}
            >
              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <motion.div 
                    whileHover={{ rotate: 12, scale: 1.1 }}
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                  >
                    <action.icon className="w-7 h-7 text-white" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    className="opacity-0 group-hover:opacity-100 transition-all duration-300"
                  >
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </motion.div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{action.emoji}</span>
                    <h4 className="font-bold text-gray-900 text-base">
                      {action.title}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {action.description}
                  </p>
                </div>
              </div>

              {/* Shine effect */}
              <div className="absolute inset-0 -top-2 -left-2 w-8 h-8 bg-white/30 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300"></div>
            </motion.button>
          ))}
        </div>

        {/* Bottom decoration */}
        <motion.div 
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex items-center justify-center space-x-2 text-sm text-gray-500"
        >
          <Sparkles className="w-4 h-4" />
          <span>Click any action to get started</span>
          <Sparkles className="w-4 h-4" />
        </motion.div>
      </div>
    </motion.div>
  )
}
