import { motion } from 'framer-motion'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { useCurrency } from '../../contexts/CurrencyContext'

ChartJS.register(ArcElement, Tooltip, Legend)

export function CategoryBreakdown({ data = [] }) {
  const { formatCurrency } = useCurrency()
  
  // Debug logging - remove in production
  console.log('Dashboard CategoryBreakdown Debug:', {
    data,
    dataType: typeof data,
    isArray: Array.isArray(data),
    firstItem: data[0]
  })

  // Process data for chart - API returns {type, category, amount} format
  const expenseData = (Array.isArray(data) ? data : []).filter(item => {
    try {
      return item && 
             typeof item === 'object' && 
             item.type === 'expense' &&
             item.category &&
             typeof item.amount === 'number'
    } catch (error) {
      console.warn('Error filtering dashboard category breakdown item:', error, item)
      return false
    }
  })
  
  const chartData = {
    labels: expenseData.map(item => item.category || 'Unknown'),
    datasets: [
      {
        data: expenseData.map(item => item.amount || 0),
        backgroundColor: [
          '#667eea',
          '#764ba2',
          '#f093fb',
          '#f5576c',
          '#4facfe',
          '#00f2fe',
          '#43e97b',
          '#38f9d7',
          '#fa709a',
          '#fee140'
        ],
        borderColor: '#fff',
        borderWidth: 3,
        hoverBorderWidth: 4,
        hoverBorderColor: '#fff'
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 11,
            weight: '500'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 12,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => (a || 0) + (b || 0), 0)
            const value = context.parsed || 0
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0'
            return `${context.label}: ${formatCurrency(value)} (${percentage}%)`
          }
        }
      }
    },
    cutout: '60%'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Expense Categories</h3>
          <p className="text-sm text-gray-600">Spending breakdown by category</p>
        </div>
      </div>
      
      <div className="h-64 flex items-center justify-center">
        {expenseData.length > 0 ? (
          <Doughnut data={chartData} options={options} />
        ) : (
          <div className="text-center text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-sm">No expense data available</p>
          </div>
        )}
      </div>
      
      {/* Category list */}
      {expenseData.length > 0 && (
        <div className="mt-6 space-y-2">
          {expenseData.slice(0, 5).map((item, index) => {
            const total = expenseData.reduce((sum, cat) => sum + (cat.amount || 0), 0)
            const amount = item.amount || 0
            const percentage = total > 0 ? ((amount / total) * 100).toFixed(1) : '0.0'
            const category = item.category || 'Unknown'
            
            return (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: chartData.datasets[0].backgroundColor[index] || '#667eea' }}
                  ></div>
                  <span className="text-sm text-gray-700 capitalize">
                    {category}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(amount)}
                  </p>
                  <p className="text-xs text-gray-500">{percentage}%</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
