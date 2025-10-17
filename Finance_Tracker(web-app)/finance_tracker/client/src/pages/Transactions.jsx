import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Download, Upload, ChevronDown, FileText, FileSpreadsheet, FileJson } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { transactionsAPI } from '../services/api'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { TransactionForm } from '../components/transactions/TransactionForm'
import { TransactionCard } from '../components/transactions/TransactionCard'
import { TransactionFilters } from '../components/transactions/TransactionFilters'
import { TransactionStats } from '../components/transactions/TransactionStats'
import toast from 'react-hot-toast'

export function Transactions() {
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [transactionType, setTransactionType] = useState('expense')
  const [showExportDropdown, setShowExportDropdown] = useState(false)
  const [loading, setLoading] = useState(false)

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

  const [filters, setFilters] = useState({
    type: '',
    category: '',
    search: '',
    dateRange: '',
    startDate: '',
    endDate: '',
    amountRange: '',
    minAmount: '',
    maxAmount: '',
    paymentMethod: '',
    status: '',
    sortBy: ''
  })

  // Fetch transactions with filters
  const { data: transactionsData, isLoading, error } = useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => transactionsAPI.getTransactions(filters),
    retry: 1,
    refetchOnWindowFocus: false,
  })

  // Fetch transaction stats
  const { data: statsData, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['transaction-stats', filters],
    queryFn: () => transactionsAPI.getTransactionStats(filters),
    retry: 1,
    refetchOnWindowFocus: false,
  })

  const transactions = transactionsData?.data?.transactions || []
  const pagination = transactionsData?.data?.pagination
  const stats = statsData?.data

  const handleAddTransaction = (type = 'expense') => {
    setTransactionType(type)
    setEditingTransaction(null)
    setShowTransactionForm(true)
  }

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction)
    setTransactionType(transaction.type)
    setShowTransactionForm(true)
  }

  const handleCloseForm = () => {
    setShowTransactionForm(false)
    setEditingTransaction(null)
  }

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters)
  }

  const handleClearFilters = () => {
    setFilters({
      type: '',
      category: '',
      search: '',
      dateRange: '',
      startDate: '',
      endDate: '',
      amountRange: '',
      minAmount: '',
      maxAmount: '',
      paymentMethod: '',
      status: '',
      sortBy: ''
    })
  }

  const handleExportTransactions = async (format = 'csv') => {
    try {
      setLoading(true)
      toast.loading('Fetching transactions...', { id: 'export-loading' })
      
      // Fetch all transactions using pagination
      let allTransactions = []
      let page = 1
      let hasMore = true
      
      while (hasMore) {
        const response = await transactionsAPI.getTransactions({ 
          limit: 100, 
          page: page 
        })
        
        const pageTransactions = response.data?.transactions || []
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
      
      if (transactions.length === 0) {
        toast.error('No transactions to export')
        return
      }
      
      const exportData = {
        transactions,
        filters: filters,
        exportDate: new Date().toISOString(),
        totalCount: transactions.length
      }
      
      if (format === 'csv') {
        exportToCSV(transactions)
      } else if (format === 'json') {
        exportToJSON(exportData)
      } else if (format === 'excel') {
        exportToExcel(transactions)
      }
      
      toast.success(`${transactions.length} transactions exported successfully!`)
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
        toast.error('Failed to export transactions. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = (transactions) => {
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Payment Method', 'Status']
    const csvContent = [
      headers.join(','),
      ...transactions.map(transaction => [
        new Date(transaction.date).toLocaleDateString(),
        transaction.type,
        transaction.category,
        `"${transaction.description || ''}"`,
        transaction.amount,
        transaction.paymentMethod || '',
        transaction.status || 'completed'
      ].join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `transactions-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const exportToJSON = (exportData) => {
    const dataStr = JSON.stringify(exportData, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `transactions-${new Date().toISOString().split('T')[0]}.json`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const exportToExcel = (transactions) => {
    // For Excel export, we'll create a CSV with Excel-compatible formatting
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Payment Method', 'Status']
    const csvContent = [
      headers.join('\t'),
      ...transactions.map(transaction => [
        new Date(transaction.date).toLocaleDateString(),
        transaction.type,
        transaction.category,
        transaction.description || '',
        transaction.amount,
        transaction.paymentMethod || '',
        transaction.status || 'completed'
      ].join('\t'))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `transactions-${new Date().toISOString().split('T')[0]}.xls`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleImportTransactions = () => {
    // TODO: Implement import functionality
    console.log('Import transactions')
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Transactions</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage your income and expenses with full control</p>
        </div>
        
        {/* Mobile Action Buttons */}
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
          {/* Import/Export Row */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={handleImportTransactions}
              className="btn-outline flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
            >
              <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Import</span>
            </button>
            <div className="relative export-dropdown">
              <button
                onClick={() => setShowExportDropdown(!showExportDropdown)}
                className="btn-outline flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Export</span>
                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              
              {showExportDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-40 sm:w-48 bg-white rounded-xl shadow-strong border border-gray-200 py-2 z-50"
                >
                  <button
                    onClick={() => {
                      handleExportTransactions('csv')
                      setShowExportDropdown(false)
                    }}
                    className="flex items-center w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3" />
                    Export as CSV
                  </button>
                  <button
                    onClick={() => {
                      handleExportTransactions('excel')
                      setShowExportDropdown(false)
                    }}
                    className="flex items-center w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <FileSpreadsheet className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3" />
                    Export as Excel
                  </button>
                  <button
                    onClick={() => {
                      handleExportTransactions('json')
                      setShowExportDropdown(false)
                    }}
                    className="flex items-center w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <FileJson className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3" />
                    Export as JSON
                  </button>
                </motion.div>
              )}
            </div>
          </div>
          
          {/* Add Transaction Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => handleAddTransaction('income')}
              className="btn-success flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 flex-1 sm:flex-none"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Income</span>
            </button>
            <button
              onClick={() => handleAddTransaction('expense')}
              className="btn-danger flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 flex-1 sm:flex-none"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Expense</span>
            </button>
          </div>
        </div>
      </div>


      {/* Transaction Stats */}
      <TransactionStats stats={stats} isLoading={statsLoading} />

      {/* Filters */}
      <TransactionFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
      />

      {/* Transactions List */}
      <div className="space-y-3 sm:space-y-4">
        {isLoading ? (
          <div className="space-y-3 sm:space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg sm:rounded-xl"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-2 sm:h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-2 sm:h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                  <div className="h-5 sm:h-6 bg-gray-200 rounded w-16 sm:w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : transactions.length > 0 ? (
          <>
            {transactions.map((transaction, index) => (
              <TransactionCard
                key={transaction._id}
                transaction={transaction}
                onEdit={handleEditTransaction}
              />
            ))}
            
            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-center space-x-1 sm:space-x-2 mt-6 sm:mt-8">
                <button
                  disabled={pagination.current === 1}
                  className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                >
                  Previous
                </button>
                <span className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600">
                  Page {pagination.current} of {pagination.pages}
                </span>
                <button
                  disabled={pagination.current === pagination.pages}
                  className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card text-center py-8 sm:py-12"
          >
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <span className="text-xl sm:text-2xl">💳</span>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">No transactions found</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 px-4">
              {Object.values(filters).some(f => f) 
                ? 'Try adjusting your filters to see more transactions'
                : 'Start by adding your first transaction'
              }
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-3 px-4">
              <button
                onClick={() => handleAddTransaction('income')}
                className="btn-success text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
              >
                Add Income
              </button>
              <button
                onClick={() => handleAddTransaction('expense')}
                className="btn-danger text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
              >
                Add Expense
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Transaction Form Modal */}
      <TransactionForm
        isOpen={showTransactionForm}
        onClose={handleCloseForm}
        transaction={editingTransaction}
        type={transactionType}
      />
    </div>
  )
}
