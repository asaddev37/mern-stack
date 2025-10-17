import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useCurrency } from '../contexts/CurrencyContext'
import { transactionsAPI, budgetsAPI, analyticsAPI } from '../services/api'
import { StatCard } from '../components/dashboard/StatCard'
import { RecentTransactions } from '../components/dashboard/RecentTransactions'
import { BudgetOverview } from '../components/dashboard/BudgetOverview'
import { IncomeExpenseChart } from '../components/dashboard/IncomeExpenseChart'
import { CategoryBreakdown } from '../components/dashboard/CategoryBreakdown'
import { QuickActions } from '../components/dashboard/QuickActions'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import ErrorBoundary from '../components/ui/ErrorBoundary'

export function Dashboard() {
  const navigate = useNavigate()
  const { formatCurrency } = useCurrency()
  const [selectedPeriod, setSelectedPeriod] = useState('30d')

  // Fetch dashboard data
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['dashboard', selectedPeriod],
    queryFn: () => analyticsAPI.getDashboardData({ dateRange: selectedPeriod }),
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  const { data: recentTransactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: () => transactionsAPI.getTransactions({ limit: 5 }),
  })

  const { data: budgetData, isLoading: budgetLoading } = useQuery({
    queryKey: ['budget-overview'],
    queryFn: () => budgetsAPI.getBudgetStats(),
  })

  if (dashboardLoading || transactionsLoading || budgetLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const summary = dashboardData?.data || {}
  const insights = summary.insights || {}

  // Debug logging - remove in production
  console.log('Dashboard Debug:', {
    dashboardData,
    summary,
    insights,
    monthlyData: summary.monthlyData,
    categoryBreakdown: summary.categoryBreakdown
  })

  // Calculate budget usage percentage
  const budgetUsage = summary.budgetAnalysis?.length > 0 
    ? Math.round(summary.budgetAnalysis.reduce((sum, budget) => sum + budget.percentageUsed, 0) / summary.budgetAnalysis.length)
    : 0

  const stats = [
    {
      title: 'Total Income',
      value: formatCurrency(summary.totalIncome || 0),
      change: '+12.5%',
      changeType: 'positive',
      icon: TrendingUp,
      gradient: 'gradient-success',
      color: 'text-success-600',
      emoji: '💰'
    },
    {
      title: 'Total Expenses',
      value: formatCurrency(summary.totalExpenses || 0),
      change: '+8.2%',
      changeType: 'negative',
      icon: TrendingDown,
      gradient: 'gradient-danger',
      color: 'text-danger-600',
      emoji: '💸'
    },
    {
      title: 'Net Balance',
      value: formatCurrency(summary.netIncome || 0),
      change: summary.netIncome >= 0 ? '+5.3%' : '-2.1%',
      changeType: summary.netIncome >= 0 ? 'positive' : 'negative',
      icon: DollarSign,
      gradient: 'gradient-primary',
      color: 'text-primary-600',
      emoji: '📊'
    },
    {
      title: 'Budget Used',
      value: `${budgetUsage}%`,
      change: 'On track',
      changeType: 'neutral',
      icon: PieChart,
      gradient: 'gradient-warning',
      color: 'text-warning-600',
      emoji: '🎯'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Overview
          </h1>
          <p className="text-gray-600">
            Track your financial health and spending patterns
          </p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none"
          >
            <option value="7d">This Week</option>
            <option value="30d">This Month</option>
            <option value="90d">This Quarter</option>
            <option value="1y">This Year</option>
          </select>
          
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <ErrorBoundary>
            <IncomeExpenseChart data={dashboardData?.data?.monthlyData} />
          </ErrorBoundary>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <ErrorBoundary>
            <CategoryBreakdown data={dashboardData?.data?.categoryBreakdown || []} />
          </ErrorBoundary>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2"
        >
          <ErrorBoundary>
            <RecentTransactions transactions={recentTransactions?.data?.transactions} />
          </ErrorBoundary>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <ErrorBoundary>
            <BudgetOverview budgets={budgetData?.data?.budgets} />
          </ErrorBoundary>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <ErrorBoundary>
          <QuickActions />
        </ErrorBoundary>
      </motion.div>
    </div>
  )
}
