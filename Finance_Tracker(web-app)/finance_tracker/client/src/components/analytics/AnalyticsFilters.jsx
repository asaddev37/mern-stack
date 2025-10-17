import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Filter, 
  Download, 
  RefreshCw,
  ChevronDown,
  X
} from 'lucide-react'

const dateRanges = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 3 months' },
  { value: '1y', label: 'Last year' },
  { value: 'custom', label: 'Custom range' }
]

const chartTypes = [
  { value: 'line', label: 'Line Chart' },
  { value: 'bar', label: 'Bar Chart' },
  { value: 'pie', label: 'Pie Chart' },
  { value: 'doughnut', label: 'Doughnut Chart' }
]

export function AnalyticsFilters({ 
  filters, 
  onFiltersChange, 
  onExport,
  onRefresh,
  isLoading = false 
}) {
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showChartOptions, setShowChartOptions] = useState(false)

  const handleDateRangeChange = (range) => {
    if (range === 'custom') {
      setShowDatePicker(true)
    } else {
      onFiltersChange({ ...filters, dateRange: range })
    }
  }

  const handleCustomDateChange = (startDate, endDate) => {
    onFiltersChange({ 
      ...filters, 
      dateRange: 'custom',
      startDate,
      endDate
    })
    setShowDatePicker(false)
  }

  const handleCategoryFilter = (category) => {
    const currentCategories = filters.categories || []
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category]
    
    onFiltersChange({ ...filters, categories: newCategories })
  }

  const clearFilters = () => {
    onFiltersChange({
      dateRange: '30d',
      categories: [],
      chartType: 'line',
      groupBy: 'month'
    })
  }

  const hasActiveFilters = filters.categories?.length > 0 || 
                          filters.dateRange !== '30d' ||
                          filters.chartType !== 'line'

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Date Range Filter */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
            >
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {dateRanges.find(r => r.value === filters.dateRange)?.label || 'Select Range'}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {showDatePicker && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-10"
              >
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Quick Ranges</h4>
                  {dateRanges.slice(0, -1).map((range) => (
                    <button
                      key={range.value}
                      onClick={() => handleDateRangeChange(range.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        filters.dateRange === range.value
                          ? 'bg-primary-100 text-primary-700'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                  
                  <div className="border-t border-gray-200 pt-3">
                    <h4 className="font-semibold text-gray-900 mb-2">Custom Range</h4>
                    <div className="space-y-2">
                      <input
                        type="date"
                        value={filters.startDate || ''}
                        onChange={(e) => onFiltersChange({ ...filters, startDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none"
                        placeholder="Start Date"
                      />
                      <input
                        type="date"
                        value={filters.endDate || ''}
                        onChange={(e) => onFiltersChange({ ...filters, endDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none"
                        placeholder="End Date"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Category Filter */}
          <div className="relative">
            <button
              onClick={() => setShowChartOptions(!showChartOptions)}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {filters.categories?.length > 0 
                  ? `${filters.categories.length} Categories`
                  : 'All Categories'
                }
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {showChartOptions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-10"
              >
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Chart Options</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chart Type</label>
                    <select
                      value={filters.chartType || 'line'}
                      onChange={(e) => onFiltersChange({ ...filters, chartType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none"
                    >
                      {chartTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Group By</label>
                    <select
                      value={filters.groupBy || 'month'}
                      onChange={(e) => onFiltersChange({ ...filters, groupBy: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none"
                    >
                      <option value="day">Day</option>
                      <option value="week">Week</option>
                      <option value="month">Month</option>
                      <option value="year">Year</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Clear Filters</span>
            </button>
          )}

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium text-gray-700">Refresh</span>
          </button>

          <button
            onClick={onExport}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Export</span>
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {filters.categories?.map((category) => (
              <span
                key={category}
                className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-sm"
              >
                <span>{category}</span>
                <button
                  onClick={() => handleCategoryFilter(category)}
                  className="hover:text-primary-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Click outside to close dropdowns */}
      {(showDatePicker || showChartOptions) && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setShowDatePicker(false)
            setShowChartOptions(false)
          }}
        />
      )}
    </motion.div>
  )
}
