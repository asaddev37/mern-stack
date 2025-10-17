import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Edit, 
  Trash2, 
  MoreVertical, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw
} from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCurrency } from '../../contexts/CurrencyContext'
import { budgetsAPI } from '../../services/api'
import toast from 'react-hot-toast'

export function BudgetCard({ budget, onEdit }) {
  const [showMenu, setShowMenu] = useState(false)
  const queryClient = useQueryClient()
  const { formatCurrency } = useCurrency()

  const deleteMutation = useMutation({
    mutationFn: budgetsAPI.deleteBudget,
    onSuccess: () => {
      queryClient.invalidateQueries(['budgets'])
      queryClient.invalidateQueries(['budget-overview'])
      queryClient.invalidateQueries(['dashboard'])
      toast.success('Budget deleted successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete budget')
    }
  })

  const resetMutation = useMutation({
    mutationFn: budgetsAPI.resetBudget,
    onSuccess: () => {
      queryClient.invalidateQueries(['budgets'])
      queryClient.invalidateQueries(['budget-overview'])
      queryClient.invalidateQueries(['dashboard'])
      toast.success('Budget reset successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to reset budget')
    }
  })

  const recalculateMutation = useMutation({
    mutationFn: budgetsAPI.recalculateBudget,
    onSuccess: () => {
      queryClient.invalidateQueries(['budgets'])
      queryClient.invalidateQueries(['budget-overview'])
      queryClient.invalidateQueries(['dashboard'])
      toast.success('Budget recalculated successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to recalculate budget')
    }
  })

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      await deleteMutation.mutateAsync(budget._id)
    }
  }

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset this budget? This will set the spent amount to 0.')) {
      await resetMutation.mutateAsync(budget._id)
    }
  }

  const handleRecalculate = async () => {
    await recalculateMutation.mutateAsync(budget._id)
  }

  const getBudgetStatus = () => {
    const spent = budget.spent || 0
    const amount = budget.amount || 0
    const percentage = amount > 0 ? Math.round((spent / amount) * 100) : 0
    
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

  const formatAmount = (amount) => {
    return formatCurrency(amount)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const statusInfo = getBudgetStatus()
  const StatusIcon = statusInfo.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="card-hover relative group"
    >
      {/* Main Content */}
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl"
              style={{ backgroundColor: budget.color }}
            >
              {budget.icon}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">
                {budget.name}
              </h3>
              <p className="text-sm text-gray-600 capitalize">
                {budget.category.replace(/_/g, ' ')}
              </p>
            </div>
          </div>

          {/* Action Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>

            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10"
              >
                <button
                  onClick={() => {
                    onEdit(budget)
                    setShowMenu(false)
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Edit className="w-4 h-4 mr-3" />
                  Edit Budget
                </button>
                <button
                  onClick={() => {
                    handleRecalculate()
                    setShowMenu(false)
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-3" />
                  Recalculate
                </button>
                <button
                  onClick={() => {
                    handleReset()
                    setShowMenu(false)
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-warning-600 hover:bg-warning-50 transition-colors"
                >
                  <TrendingUp className="w-4 h-4 mr-3" />
                  Reset Budget
                </button>
                <button
                  onClick={() => {
                    handleDelete()
                    setShowMenu(false)
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-danger-600 hover:bg-danger-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-3" />
                  Delete Budget
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Amount and Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-8 h-8 rounded-lg ${statusInfo.bgColor} flex items-center justify-center`}>
                <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {formatAmount(budget.spent || 0)} of {formatAmount(budget.amount || 0)}
                </p>
                <p className="text-xs text-gray-500">
                  {(() => {
                    const spent = budget.spent || 0
                    const amount = budget.amount || 0
                    const remaining = amount - spent
                    return remaining > 0 ? `${formatAmount(remaining)} remaining` : 'Over budget'
                  })()}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">
                {(() => {
                  const spent = budget.spent || 0
                  const amount = budget.amount || 0
                  return amount > 0 ? Math.round((spent / amount) * 100) : 0
                })()}%
              </p>
              <p className={`text-xs font-medium ${statusInfo.color}`}>
                {getStatusText(statusInfo.status)}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ 
                width: `${(() => {
                  const spent = budget.spent || 0
                  const amount = budget.amount || 0
                  const percentage = amount > 0 ? (spent / amount) * 100 : 0
                  return Math.min(percentage, 100)
                })()}%` 
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-3 rounded-full ${
                (() => {
                  const spent = budget.spent || 0
                  const amount = budget.amount || 0
                  const percentage = amount > 0 ? (spent / amount) * 100 : 0
                  if (percentage >= 100) return 'bg-gradient-danger'
                  if (percentage >= 80) return 'bg-gradient-warning'
                  return 'bg-gradient-success'
                })()
              }`}
            />
          </div>
        </div>

        {/* Budget Details */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <span className="capitalize">{budget.period}</span>
            <span>•</span>
            <span>{formatDate(budget.startDate)} - {formatDate(budget.endDate)}</span>
          </div>
          
          {budget.alerts?.enabled && (
            <div className="flex items-center space-x-1">
              <AlertTriangle className="w-3 h-3" />
              <span>Alerts at {budget.alerts.threshold}%</span>
            </div>
          )}
        </div>

        {/* Description */}
        {budget.description && (
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            {budget.description}
          </p>
        )}
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowMenu(false)}
        />
      )}
    </motion.div>
  )
}
