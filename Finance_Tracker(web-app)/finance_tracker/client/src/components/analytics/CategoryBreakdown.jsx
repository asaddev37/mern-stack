import { Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'
import { motion } from 'framer-motion'
import { PieChart } from 'lucide-react'
import { useCurrency } from '../../contexts/CurrencyContext'

ChartJS.register(ArcElement, Tooltip, Legend)

const categoryColors = {
  'food_dining': '#ff6b6b',
  'transportation': '#4ecdc4',
  'shopping': '#45b7d1',
  'entertainment': '#f9ca24',
  'bills_utilities': '#6c5ce7',
  'healthcare': '#a29bfe',
  'education': '#fd79a8',
  'travel': '#00b894',
  'groceries': '#00cec9',
  'gas': '#fdcb6e',
  'insurance': '#e17055',
  'rent': '#74b9ff',
  'salary': '#00b894',
  'freelance': '#6c5ce7',
  'investment': '#a29bfe',
  'other': '#636e72'
}

const categoryLabels = {
  'food_dining': 'Food & Dining',
  'transportation': 'Transportation',
  'shopping': 'Shopping',
  'entertainment': 'Entertainment',
  'bills_utilities': 'Bills & Utilities',
  'healthcare': 'Healthcare',
  'education': 'Education',
  'travel': 'Travel',
  'groceries': 'Groceries',
  'gas': 'Gas',
  'insurance': 'Insurance',
  'rent': 'Rent',
  'salary': 'Salary',
  'freelance': 'Freelance',
  'investment': 'Investment',
  'other': 'Other'
}

export function CategoryBreakdown({ data, isLoading, type = 'expense' }) {
  const { formatCurrency } = useCurrency()
  
  // Debug logging - remove in production
  console.log('CategoryBreakdown Debug:', {
    data,
    type,
    categoryBreakdown: data?.categoryBreakdown,
    isLoading,
    dataType: typeof data,
    isArray: Array.isArray(data?.categoryBreakdown)
  })

  if (isLoading) {
    return (
      <div className="card animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    )
  }

  // Safety check for data structure
  if (!data || typeof data !== 'object') {
    console.warn('CategoryBreakdown: Invalid data structure', data)
    return (
      <div className="card text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <PieChart className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No data available</h3>
        <p className="text-gray-600">Unable to load category breakdown data</p>
      </div>
    )
  }

  if (!data.categoryBreakdown || !Array.isArray(data.categoryBreakdown) || data.categoryBreakdown.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <PieChart className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No {type} Data</h3>
        <p className="text-gray-600">Add some {type} transactions to see category breakdown</p>
      </div>
    )
  }

  // Ensure we have a valid array to work with
  const categoryBreakdownArray = Array.isArray(data.categoryBreakdown) 
    ? data.categoryBreakdown 
    : []

  const filteredData = categoryBreakdownArray.filter(item => {
    try {
      // More comprehensive validation
      if (!item || typeof item !== 'object') {
        console.warn('Invalid item in categoryBreakdown:', item)
        return false
      }
      
      if (!item.type || typeof item.type !== 'string') {
        console.warn('Invalid type in categoryBreakdown item:', item)
        return false
      }
      
      if (!item.category || typeof item.category !== 'string') {
        console.warn('Invalid category in categoryBreakdown item:', item)
        return false
      }
      
      if (typeof item.amount !== 'number' || item.amount < 0) {
        console.warn('Invalid amount in categoryBreakdown item:', item)
        return false
      }
      
      return type === 'expense' ? item.type === 'expense' : item.type === 'income'
    } catch (error) {
      console.warn('Error filtering category breakdown item:', error, item)
      return false
    }
  })

  if (filteredData.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <PieChart className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No {type} Data</h3>
        <p className="text-gray-600">Add some {type} transactions to see category breakdown</p>
      </div>
    )
  }

  const totalAmount = filteredData.reduce((sum, item) => sum + (item.amount || 0), 0)

  const chartData = {
    labels: filteredData.map(item => categoryLabels[item.category] || item.category || 'Unknown'),
    datasets: [
      {
        data: filteredData.map(item => item.amount || 0),
        backgroundColor: filteredData.map(item => categoryColors[item.category] || '#636e72'),
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverBorderColor: '#ffffff'
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
          padding: 20,
          font: {
            size: 12,
            weight: '500'
          },
          generateLabels: function(chart) {
            const data = chart.data
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const dataset = data.datasets[0]
                const value = dataset.data[i] || 0
                const percentage = totalAmount > 0 ? ((value / totalAmount) * 100).toFixed(1) : '0.0'
                
                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: dataset.backgroundColor[i] || '#636e72',
                  strokeStyle: dataset.borderColor,
                  lineWidth: dataset.borderWidth,
                  pointStyle: 'circle',
                  hidden: false,
                  index: i
                }
              })
            }
            return []
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
            const value = context.parsed || 0
            const percentage = totalAmount > 0 ? ((value / totalAmount) * 100).toFixed(1) : '0.0'
            return `${context.label}: ${formatCurrency(value)} (${percentage}%)`
          }
        }
      }
    },
    cutout: '60%'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {type === 'expense' ? 'Expense' : 'Income'} Categories
          </h3>
          <p className="text-gray-600">Spending breakdown by category</p>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-gray-600">Total {type === 'expense' ? 'Expenses' : 'Income'}</p>
          <p className={`text-lg font-bold ${type === 'expense' ? 'text-danger-600' : 'text-success-600'}`}>
            {formatCurrency(totalAmount)}
          </p>
        </div>
      </div>

      <div className="h-80">
        <Doughnut data={chartData} options={options} />
      </div>

      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-4">
          {filteredData.slice(0, 6).map((item, index) => {
            const amount = item.amount || 0
            const percentage = totalAmount > 0 ? ((amount / totalAmount) * 100).toFixed(1) : '0.0'
            return (
              <div key={item.category || index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: categoryColors[item.category] || '#636e72' }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">
                    {categoryLabels[item.category] || item.category || 'Unknown'}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">
                    {formatCurrency(amount)}
                  </p>
                  <p className="text-xs text-gray-500">{percentage}%</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
