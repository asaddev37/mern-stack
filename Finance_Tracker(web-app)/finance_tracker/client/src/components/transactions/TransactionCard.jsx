import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Edit, 
  Trash2, 
  MoreVertical, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Tag,
  CreditCard,
  MapPin
} from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCurrency } from '../../contexts/CurrencyContext'
import { transactionsAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export function TransactionCard({ transaction, onEdit }) {
  const [showMenu, setShowMenu] = useState(false)
  const queryClient = useQueryClient()
  const { formatCurrencyWithSign } = useCurrency()

  const deleteMutation = useMutation({
    mutationFn: transactionsAPI.deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries(['transactions'])
      queryClient.invalidateQueries(['dashboard'])
      toast.success('Transaction deleted successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete transaction')
    }
  })

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      await deleteMutation.mutateAsync(transaction._id)
    }
  }

  const getTransactionIcon = (type) => {
    return type === 'income' ? (
      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-success-600" />
    ) : (
      <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-danger-600" />
    )
  }

  const getTransactionColor = (type) => {
    return type === 'income' 
      ? 'bg-success-50 text-success-700 border-success-200' 
      : 'bg-danger-50 text-danger-700 border-danger-200'
  }

  const getPaymentMethodIcon = (method) => {
    const icons = {
      cash: '💵',
      card: '💳',
      bank_transfer: '🏦',
      digital_wallet: '📱',
      check: '📝',
      other: '🔧'
    }
    return icons[method] || '💳'
  }

  const formatAmount = (amount) => {
    return formatCurrencyWithSign(amount)
  }

  const formatDate = (date) => {
    return format(new Date(date), 'MMM dd, yyyy')
  }

  const formatTime = (date) => {
    return format(new Date(date), 'h:mm a')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01, y: -1 }}
      className="card-hover relative group"
    >
      {/* Main Content */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
          {/* Icon */}
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl border-2 flex items-center justify-center flex-shrink-0 ${getTransactionColor(transaction.type)}`}>
            {getTransactionIcon(transaction.type)}
          </div>
          
          {/* Transaction Details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-1">
              <h3 className="font-semibold text-sm sm:text-base text-gray-900 capitalize truncate">
                {transaction.category.replace(/_/g, ' ')}
              </h3>
              {transaction.tags && transaction.tags.length > 0 && (
                <div className="flex space-x-1">
                  {transaction.tags.slice(0, 2).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block bg-gray-100 text-gray-600 px-1.5 sm:px-2 py-0.5 rounded-full text-xs self-start sm:self-auto"
                    >
                      {tag}
                    </span>
                  ))}
                  {transaction.tags.length > 2 && (
                    <span className="text-xs text-gray-500">
                      +{transaction.tags.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>
            
            {transaction.description && (
              <p className="text-xs sm:text-sm text-gray-600 truncate mb-1">
                {transaction.description}
              </p>
            )}
            
            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{formatDate(transaction.date)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>{getPaymentMethodIcon(transaction.paymentMethod)}</span>
                <span className="capitalize truncate">{transaction.paymentMethod.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Amount and Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          <div className="text-right">
            <p className={`text-sm sm:text-lg font-bold ${
              transaction.type === 'income' 
                ? 'text-success-600' 
                : 'text-danger-600'
            }`}>
              {transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount)}
            </p>
            <p className="text-xs text-gray-500 hidden sm:block">
              {formatTime(transaction.date)}
            </p>
          </div>
          
          {/* Action Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 sm:p-1.5 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
            </button>

            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-0 mt-2 w-36 sm:w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10"
              >
                <button
                  onClick={() => {
                    onEdit(transaction)
                    setShowMenu(false)
                  }}
                  className="flex items-center w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3" />
                  <span className="hidden sm:inline">Edit Transaction</span>
                  <span className="sm:hidden">Edit</span>
                </button>
                <button
                  onClick={() => {
                    handleDelete()
                    setShowMenu(false)
                  }}
                  className="flex items-center w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-danger-600 hover:bg-danger-50 transition-colors"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3" />
                  <span className="hidden sm:inline">Delete Transaction</span>
                  <span className="sm:hidden">Delete</span>
                </button>
              </motion.div>
            )}
          </div>
        </div>
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