import { motion } from 'framer-motion'
import { 
  Lightbulb, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Calendar,
  PieChart
} from 'lucide-react'

export function FinancialInsights({ data, isLoading }) {
  if (isLoading) {
    return (
      <div className="card animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="card text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lightbulb className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Insights Available</h3>
        <p className="text-gray-600">Add more transactions to get personalized insights</p>
      </div>
    )
  }

  const insights = []

  // Spending vs Income Analysis
  if (data.totalIncome > 0 && data.totalExpenses > 0) {
    const savingsRate = ((data.totalIncome - data.totalExpenses) / data.totalIncome) * 100
    
    if (savingsRate > 20) {
      insights.push({
        type: 'success',
        icon: CheckCircle,
        title: 'Excellent Savings Rate',
        description: `You're saving ${savingsRate.toFixed(1)}% of your income. Keep up the great work!`,
        action: 'Consider investing your savings for long-term growth.'
      })
    } else if (savingsRate > 10) {
      insights.push({
        type: 'warning',
        icon: Target,
        title: 'Good Savings Rate',
        description: `You're saving ${savingsRate.toFixed(1)}% of your income.`,
        action: 'Try to increase your savings rate to 20% for better financial security.'
      })
    } else if (savingsRate > 0) {
      insights.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'Low Savings Rate',
        description: `You're only saving ${savingsRate.toFixed(1)}% of your income.`,
        action: 'Consider reducing expenses or increasing income to improve your savings.'
      })
    } else {
      insights.push({
        type: 'danger',
        icon: AlertTriangle,
        title: 'Spending More Than Income',
        description: 'You\'re spending more than you earn. This is unsustainable.',
        action: 'Immediately review your expenses and create a budget to get back on track.'
      })
    }
  }

  // Budget Analysis
  if (data.budgetAnalysis && data.budgetAnalysis.length > 0) {
    const overBudget = data.budgetAnalysis.filter(budget => budget.percentageUsed > 100)
    const nearBudget = data.budgetAnalysis.filter(budget => budget.percentageUsed > 80 && budget.percentageUsed <= 100)
    
    if (overBudget.length > 0) {
      insights.push({
        type: 'danger',
        icon: AlertTriangle,
        title: 'Over Budget Categories',
        description: `You've exceeded your budget in ${overBudget.length} categor${overBudget.length > 1 ? 'ies' : 'y'}.`,
        action: `Review spending in: ${overBudget.map(b => b.category).join(', ')}.`
      })
    }
    
    if (nearBudget.length > 0) {
      insights.push({
        type: 'warning',
        icon: Target,
        title: 'Approaching Budget Limits',
        description: `You're close to exceeding your budget in ${nearBudget.length} categor${nearBudget.length > 1 ? 'ies' : 'y'}.`,
        action: `Monitor spending in: ${nearBudget.map(b => b.category).join(', ')}.`
      })
    }
  }

  // Spending Pattern Analysis
  if (data.categoryBreakdown && data.categoryBreakdown.length > 0) {
    const topCategory = data.categoryBreakdown.reduce((max, category) => 
      category.amount > max.amount ? category : max
    )
    
    const topCategoryPercentage = (topCategory.amount / data.totalExpenses) * 100
    
    if (topCategoryPercentage > 40) {
      insights.push({
        type: 'warning',
        icon: PieChart,
        title: 'High Spending Concentration',
        description: `${topCategory.category} accounts for ${topCategoryPercentage.toFixed(1)}% of your expenses.`,
        action: 'Consider diversifying your spending or finding ways to reduce costs in this category.'
      })
    }
  }

  // Monthly Trend Analysis
  if (data.monthlyData && data.monthlyData.length >= 2) {
    const recentMonths = data.monthlyData.slice(-3)
    const avgRecent = recentMonths.reduce((sum, month) => sum + month.expenses, 0) / recentMonths.length
    const olderMonths = data.monthlyData.slice(0, -3)
    
    if (olderMonths.length > 0) {
      const avgOlder = olderMonths.reduce((sum, month) => sum + month.expenses, 0) / olderMonths.length
      const change = ((avgRecent - avgOlder) / avgOlder) * 100
      
      if (Math.abs(change) > 20) {
        insights.push({
          type: change > 0 ? 'warning' : 'success',
          icon: change > 0 ? TrendingUp : TrendingDown,
          title: change > 0 ? 'Spending Increasing' : 'Spending Decreasing',
          description: `Your spending has ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change).toFixed(1)}% recently.`,
          action: change > 0 ? 'Review recent expenses to identify the cause of increased spending.' : 'Great job! Continue monitoring your spending to maintain this trend.'
        })
      }
    }
  }

  // Income Stability Analysis
  if (data.monthlyData && data.monthlyData.length >= 3) {
    const incomeData = data.monthlyData.map(month => month.income)
    const avgIncome = incomeData.reduce((sum, income) => sum + income, 0) / incomeData.length
    const incomeVariance = incomeData.reduce((sum, income) => sum + Math.pow(income - avgIncome, 2), 0) / incomeData.length
    const incomeStability = (1 - (Math.sqrt(incomeVariance) / avgIncome)) * 100
    
    if (incomeStability < 80) {
      insights.push({
        type: 'warning',
        icon: DollarSign,
        title: 'Variable Income Pattern',
        description: 'Your income shows significant month-to-month variation.',
        action: 'Consider building an emergency fund to handle income fluctuations.'
      })
    }
  }

  // Add default insights if none generated
  if (insights.length === 0) {
    insights.push({
      type: 'info',
      icon: Lightbulb,
      title: 'Keep Tracking',
      description: 'Continue adding transactions to get personalized financial insights.',
      action: 'The more data you provide, the better insights we can offer.'
    })
  }

  const getInsightColor = (type) => {
    switch (type) {
      case 'success': return 'border-success-200 bg-success-50'
      case 'warning': return 'border-warning-200 bg-warning-50'
      case 'danger': return 'border-danger-200 bg-danger-50'
      default: return 'border-primary-200 bg-primary-50'
    }
  }

  const getIconColor = (type) => {
    switch (type) {
      case 'success': return 'text-success-600'
      case 'warning': return 'text-warning-600'
      case 'danger': return 'text-danger-600'
      default: return 'text-primary-600'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Financial Insights</h3>
          <p className="text-gray-600">Personalized recommendations</p>
        </div>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-xl border ${getInsightColor(insight.type)}`}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getInsightColor(insight.type)}`}>
                  <Icon className={`w-4 h-4 ${getIconColor(insight.type)}`} />
                </div>
                
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {insight.title}
                  </h4>
                  <p className="text-sm text-gray-700 mb-2">
                    {insight.description}
                  </p>
                  <p className="text-xs text-gray-600">
                    💡 {insight.action}
                  </p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
