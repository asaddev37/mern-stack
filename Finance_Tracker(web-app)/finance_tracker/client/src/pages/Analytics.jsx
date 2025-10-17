import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useCurrency } from '../contexts/CurrencyContext'
import { analyticsAPI } from '../services/api'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { IncomeExpenseChart } from '../components/analytics/IncomeExpenseChart'
import { CategoryBreakdown } from '../components/analytics/CategoryBreakdown'
import { SpendingTrends } from '../components/analytics/SpendingTrends'
import { FinancialInsights } from '../components/analytics/FinancialInsights'
import { AnalyticsFilters } from '../components/analytics/AnalyticsFilters'
import ErrorBoundary from '../components/ui/ErrorBoundary'
import toast from 'react-hot-toast'

export function Analytics() {
  const { formatCurrency } = useCurrency()
  const [filters, setFilters] = useState({
    dateRange: '30d',
    categories: [],
    chartType: 'line',
    groupBy: 'month'
  })

  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ['analytics', filters],
    queryFn: () => analyticsAPI.getDashboardData(filters),
    retry: 1,
    refetchOnWindowFocus: false,
  })

  const analytics = analyticsData?.data || {
    categoryBreakdown: [],
    monthlyData: [],
    weeklyData: [],
    budgetAnalysis: []
  }

  // Debug logging - remove in production
  console.log('Analytics Debug:', {
    isLoading,
    error,
    analyticsData,
    analytics,
    filters
  })

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters)
  }

  const handleExport = () => {
    // TODO: Implement export functionality
    toast.success('Export functionality coming soon!')
  }

  const handleRefresh = () => {
    // The query will automatically refetch when the component re-renders
    toast.success('Analytics refreshed!')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
          <p className="text-gray-600">Comprehensive financial insights and trends</p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="card bg-red-50 border border-red-200">
          <h3 className="text-red-800 font-semibold mb-2">Analytics Error:</h3>
          <p className="text-red-600 text-sm">{error.message}</p>
          <details className="mt-2">
            <summary className="text-red-600 text-sm cursor-pointer">Show Details</summary>
            <pre className="text-xs text-red-500 mt-2 overflow-auto">
              {JSON.stringify(error, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* Filters */}
      <AnalyticsFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onExport={handleExport}
        onRefresh={handleRefresh}
        isLoading={isLoading}
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="stat-card"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Total Income</p>
              <p className="text-2xl font-bold text-success-600 mb-1">
                {formatCurrency(analytics.totalIncome || 0)}
              </p>
              <p className="text-xs text-gray-500">All time</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-success flex items-center justify-center">
              <span className="text-white text-xl">💰</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="stat-card"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Total Expenses</p>
              <p className="text-2xl font-bold text-danger-600 mb-1">
                {formatCurrency(analytics.totalExpenses || 0)}
              </p>
              <p className="text-xs text-gray-500">All time</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-danger flex items-center justify-center">
              <span className="text-white text-xl">💸</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="stat-card"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Net Income</p>
              <p className={`text-2xl font-bold mb-1 ${
                (analytics.totalIncome - analytics.totalExpenses) >= 0 
                  ? 'text-success-600' 
                  : 'text-danger-600'
              }`}>
                {formatCurrency((analytics.totalIncome || 0) - (analytics.totalExpenses || 0))}
              </p>
              <p className="text-xs text-gray-500">All time</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
              <span className="text-white text-xl">📈</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="stat-card"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Savings Rate</p>
              <p className="text-2xl font-bold text-primary-600 mb-1">
                {analytics.totalIncome > 0 
                  ? (((analytics.totalIncome - analytics.totalExpenses) / analytics.totalIncome) * 100).toFixed(1)
                  : 0
                }%
              </p>
              <p className="text-xs text-gray-500">All time</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-warning flex items-center justify-center">
              <span className="text-white text-xl">🎯</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ErrorBoundary>
          <IncomeExpenseChart data={analytics} isLoading={isLoading} />
        </ErrorBoundary>
        <ErrorBoundary>
          <CategoryBreakdown data={analytics} isLoading={isLoading} type="expense" />
        </ErrorBoundary>
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ErrorBoundary>
          <SpendingTrends data={analytics} isLoading={isLoading} />
        </ErrorBoundary>
        <ErrorBoundary>
          <CategoryBreakdown data={analytics} isLoading={isLoading} type="income" />
        </ErrorBoundary>
      </div>

      {/* Financial Insights */}
      <FinancialInsights data={analytics} isLoading={isLoading} />
    </div>
  )
}