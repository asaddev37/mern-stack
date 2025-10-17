import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, ArrowDownLeft, MoreHorizontal } from 'lucide-react'
import { format } from 'date-fns'
import { useCurrency } from '../../contexts/CurrencyContext'

export function RecentTransactions({ transactions = [] }) {
  const navigate = useNavigate()
  const { formatCurrencyWithSign } = useCurrency()
  const getTransactionIcon = (type) => {
    return type === 'income' ? (
      <ArrowUpRight className="w-4 h-4 text-success-600" />
    ) : (
      <ArrowDownLeft className="w-4 h-4 text-danger-600" />
    )
  }

  const getTransactionColor = (type) => {
    return type === 'income' 
      ? 'bg-success-50 text-success-700' 
      : 'bg-danger-50 text-danger-700'
  }

  const getTransactionSign = (type) => {
    return type === 'income' ? '+' : '-'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          <p className="text-sm text-gray-600">Your latest financial activity</p>
        </div>
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {transactions.length > 0 ? (
          transactions.map((transaction, index) => (
            <motion.div
              key={transaction._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-xl ${getTransactionColor(transaction.type)} flex items-center justify-center`}>
                  {getTransactionIcon(transaction.type)}
                </div>
                
                <div>
                  <p className="font-medium text-gray-900 capitalize">
                    {transaction.category}
                  </p>
                  <p className="text-sm text-gray-600">
                    {transaction.description || 'No description'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(transaction.date), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className={`font-semibold ${transaction.type === 'income' ? 'text-success-600' : 'text-danger-600'}`}>
                  {formatCurrencyWithSign(transaction.amount)}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {transaction.paymentMethod?.replace('_', ' ')}
                </p>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💳</span>
            </div>
            <p className="text-gray-500 text-sm">No recent transactions</p>
            <p className="text-gray-400 text-xs mt-1">Add your first transaction to get started</p>
          </div>
        )}
      </div>

      {transactions.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button 
            onClick={() => navigate('/transactions')}
            className="w-full text-center text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
          >
            View all transactions →
          </button>
        </div>
      )}
    </motion.div>
  )
}
