import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { useCurrency } from '../../contexts/CurrencyContext'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export function IncomeExpenseChart({ data, isLoading }) {
  const { formatCurrency } = useCurrency()
  
  if (isLoading) {
    return (
      <div className="card animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (!data || !data.monthlyData) {
    return (
      <div className="card text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
        <p className="text-gray-600">Add some transactions to see your income and expense trends</p>
      </div>
    )
  }

  const chartData = {
    labels: (data.monthlyData || []).map(item => item.month || 'Unknown'),
    datasets: [
      {
        label: 'Income',
        data: (data.monthlyData || []).map(item => item.income || 0),
        borderColor: '#43e97b',
        backgroundColor: 'rgba(67, 233, 123, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#43e97b',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      },
      {
        label: 'Expenses',
        data: (data.monthlyData || []).map(item => item.expenses || 0),
        borderColor: '#fa709a',
        backgroundColor: 'rgba(250, 112, 154, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#fa709a',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 14,
            weight: '500'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 12,
        displayColors: true,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`
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
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  }

  const totalIncome = (data.monthlyData || []).reduce((sum, item) => sum + (item.income || 0), 0)
  const totalExpenses = (data.monthlyData || []).reduce((sum, item) => sum + (item.expenses || 0), 0)
  const netIncome = totalIncome - totalExpenses

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Income vs Expenses</h3>
          <p className="text-gray-600">Monthly trend analysis</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Net Income</p>
            <p className={`text-lg font-bold ${netIncome >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
              {formatCurrency(netIncome)}
            </p>
          </div>
        </div>
      </div>

      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-success-600" />
            <span className="text-sm font-medium text-gray-600">Total Income</span>
          </div>
          <p className="text-lg font-bold text-success-600">
            {formatCurrency(totalIncome)}
          </p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <TrendingDown className="w-4 h-4 text-danger-600" />
            <span className="text-sm font-medium text-gray-600">Total Expenses</span>
          </div>
          <p className="text-lg font-bold text-danger-600">
            {formatCurrency(totalExpenses)}
          </p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className={`w-4 h-4 rounded-full ${netIncome >= 0 ? 'bg-success-600' : 'bg-danger-600'}`}></div>
            <span className="text-sm font-medium text-gray-600">Net Result</span>
          </div>
          <p className={`text-lg font-bold ${netIncome >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
            {formatCurrency(netIncome)}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
