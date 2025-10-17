import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react'
import { useCurrency } from '../../contexts/CurrencyContext'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

export function SpendingTrends({ data, isLoading }) {
  const { formatCurrency } = useCurrency()
  
  if (isLoading) {
    return (
      <div className="card animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (!data || !data.weeklyData || data.weeklyData.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Spending Data</h3>
        <p className="text-gray-600">Add some transactions to see your spending trends</p>
      </div>
    )
  }

  const chartData = {
    labels: (data.weeklyData || []).map(item => item.week || 'Unknown'),
    datasets: [
      {
        label: 'Weekly Spending',
        data: (data.weeklyData || []).map(item => item.amount || 0),
        backgroundColor: 'rgba(250, 112, 154, 0.8)',
        borderColor: '#fa709a',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 12,
        callbacks: {
          label: function(context) {
            return `Spending: ${formatCurrency(context.parsed.y)}`
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12
          },
          color: '#6b7280'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(107, 114, 128, 0.1)'
        },
        ticks: {
          font: {
            size: 12
          },
          color: '#6b7280',
          callback: function(value) {
            return formatCurrency(value, false) // false = don't show symbol, just number
          }
        }
      }
    }
  }

  const totalSpending = (data.weeklyData || []).reduce((sum, item) => sum + (item.amount || 0), 0)
  const averageSpending = (data.weeklyData || []).length > 0 ? totalSpending / (data.weeklyData || []).length : 0
  const maxSpending = (data.weeklyData || []).length > 0 ? Math.max(...(data.weeklyData || []).map(item => item.amount || 0)) : 0
  const minSpending = (data.weeklyData || []).length > 0 ? Math.min(...(data.weeklyData || []).map(item => item.amount || 0)) : 0

  // Calculate trend
  const weeklyData = data.weeklyData || []
  const firstHalf = weeklyData.slice(0, Math.floor(weeklyData.length / 2))
  const secondHalf = weeklyData.slice(Math.floor(weeklyData.length / 2))
  
  const firstHalfAvg = firstHalf.length > 0 ? firstHalf.reduce((sum, item) => sum + (item.amount || 0), 0) / firstHalf.length : 0
  const secondHalfAvg = secondHalf.length > 0 ? secondHalf.reduce((sum, item) => sum + (item.amount || 0), 0) / secondHalf.length : 0
  
  const trend = secondHalfAvg - firstHalfAvg
  const trendPercentage = firstHalfAvg > 0 ? ((trend / firstHalfAvg) * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Spending Trends</h3>
          <p className="text-gray-600">Weekly spending patterns</p>
        </div>
        
        <div className="flex items-center space-x-2">
          {trend >= 0 ? (
            <TrendingUp className="w-5 h-5 text-danger-600" />
          ) : (
            <TrendingDown className="w-5 h-5 text-success-600" />
          )}
          <span className={`text-sm font-medium ${trend >= 0 ? 'text-danger-600' : 'text-success-600'}`}>
            {trend >= 0 ? '+' : ''}{trendPercentage.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>

      <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Total Spending</p>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(totalSpending)}
          </p>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Average</p>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(averageSpending)}
          </p>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Highest</p>
          <p className="text-lg font-bold text-danger-600">
            {formatCurrency(maxSpending)}
          </p>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Lowest</p>
          <p className="text-lg font-bold text-success-600">
            {formatCurrency(minSpending)}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
