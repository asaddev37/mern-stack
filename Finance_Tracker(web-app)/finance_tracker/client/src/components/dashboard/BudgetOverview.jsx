import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { PieChart, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { useCurrency } from '../../contexts/CurrencyContext'

export function BudgetOverview({ budgets = [] }) {
  const navigate = useNavigate()
  const { formatCurrency } = useCurrency()
  const getBudgetStatus = (budget) => {
    const percentage = budget.percentageUsed
    if (percentage >= 100) return { status: 'exceeded', color: 'text-danger-600', bgColor: 'bg-danger-50', icon: AlertTriangle }
    if (percentage >= 80) return { status: 'warning', color: 'text-warning-600', bgColor: 'bg-warning-50', icon: AlertTriangle }
    if (percentage >= 50) return { status: 'moderate', color: 'text-primary-600', bgColor: 'bg-primary-50', icon: Clock }
    return { status: 'good', color: 'text-success-600', bgColor: 'bg-success-50', icon: CheckCircle }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'exceeded': return 'Over budget'
      case 'warning': return 'Almost there'
      case 'moderate': return 'On track'
      case 'good': return 'Good progress'
      default: return 'Unknown'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Budget Overview</h3>
          <p className="text-sm text-gray-600">Track your spending limits</p>
        </div>
        <div className="w-8 h-8 bg-gradient-warning rounded-lg flex items-center justify-center">
          <PieChart className="w-4 h-4 text-white" />
        </div>
      </div>

      <div className="space-y-4">
        {budgets.length > 0 ? (
          budgets.slice(0, 4).map((budget, index) => {
            const statusInfo = getBudgetStatus(budget)
            const Icon = statusInfo.icon
            
            return (
              <motion.div
                key={budget.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg ${statusInfo.bgColor} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${statusInfo.color}`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {budget.name}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {budget.category}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(budget.spent)}
                    </p>
                    <p className="text-xs text-gray-500">
                      of {formatCurrency(budget.amount)}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(budget.percentageUsed, 100)}%` }}
                    transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                    className={`h-2 rounded-full ${
                      budget.percentageUsed >= 100 
                        ? 'bg-gradient-danger' 
                        : budget.percentageUsed >= 80 
                        ? 'bg-gradient-warning'
                        : 'bg-gradient-success'
                    }`}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${statusInfo.color}`}>
                    {getStatusText(statusInfo.status)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {budget.percentageUsed}%
                  </span>
                </div>
              </motion.div>
            )
          })
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💰</span>
            </div>
            <p className="text-gray-500 text-sm">No budgets set</p>
            <p className="text-gray-400 text-xs mt-1">Create your first budget to get started</p>
          </div>
        )}
      </div>

      {budgets.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button 
            onClick={() => navigate('/budgets')}
            className="w-full text-center text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
          >
            Manage budgets →
          </button>
        </div>
      )}
    </motion.div>
  )
}
