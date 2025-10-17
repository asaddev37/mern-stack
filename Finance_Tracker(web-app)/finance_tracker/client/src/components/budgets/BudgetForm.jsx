import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, DollarSign, Tag, Palette, Target } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { budgetsAPI } from '../../services/api'
import toast from 'react-hot-toast'

const budgetCategories = [
  'Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Bills & Utilities',
  'Healthcare', 'Education', 'Travel', 'Groceries', 'Gas', 'Insurance', 'Other'
]

const budgetPeriods = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' }
]

const budgetColors = [
  '#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe',
  '#43e97b', '#38f9d7', '#fa709a', '#fee140', '#ff6b6b', '#4ecdc4'
]

const budgetIcons = [
  '🍔', '🚗', '🛍️', '🎬', '💡', '🏥', '📚', '✈️', '🛒', '⛽', '🛡️', '💰'
]

export function BudgetForm({ isOpen, onClose, budget = null }) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    amount: '',
    period: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    color: '#667eea',
    icon: '💰',
    description: '',
    alerts: {
      enabled: true,
      threshold: 80
    }
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: budgetsAPI.createBudget,
    onSuccess: () => {
      queryClient.invalidateQueries(['budgets'])
      queryClient.invalidateQueries(['budget-overview'])
      queryClient.invalidateQueries(['dashboard'])
      toast.success('Budget created successfully!')
      onClose()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create budget')
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => budgetsAPI.updateBudget(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['budgets'])
      queryClient.invalidateQueries(['budget-overview'])
      queryClient.invalidateQueries(['dashboard'])
      toast.success('Budget updated successfully!')
      onClose()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update budget')
    }
  })

  useEffect(() => {
    if (budget) {
      setFormData({
        name: budget.name || '',
        category: budget.category || '',
        amount: budget.amount?.toString() || '',
        period: budget.period || 'monthly',
        startDate: budget.startDate ? new Date(budget.startDate).toISOString().split('T')[0] : '',
        endDate: budget.endDate ? new Date(budget.endDate).toISOString().split('T')[0] : '',
        color: budget.color || '#667eea',
        icon: budget.icon || '💰',
        description: budget.description || '',
        alerts: {
          enabled: budget.alerts?.enabled ?? true,
          threshold: budget.alerts?.threshold || 80
        }
      })
    } else {
      // Set default end date based on period
      const startDate = new Date(formData.startDate)
      const endDate = new Date(startDate)
      
      switch (formData.period) {
        case 'weekly':
          endDate.setDate(startDate.getDate() + 7)
          break
        case 'monthly':
          endDate.setMonth(startDate.getMonth() + 1)
          break
        case 'yearly':
          endDate.setFullYear(startDate.getFullYear() + 1)
          break
      }
      
      setFormData(prev => ({
        ...prev,
        endDate: endDate.toISOString().split('T')[0]
      }))
    }
  }, [budget, formData.period, formData.startDate])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Budget name is required'
    }

    if (!formData.category) {
      newErrors.category = 'Category is required'
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required'
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required'
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)

    const submitData = {
      ...formData,
      amount: parseFloat(formData.amount)
    }

    try {
      if (budget) {
        await updateMutation.mutateAsync({ id: budget._id, data: submitData })
      } else {
        await createMutation.mutateAsync(submitData)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePeriodChange = (period) => {
    const startDate = new Date(formData.startDate)
    const endDate = new Date(startDate)
    
    switch (period) {
      case 'weekly':
        endDate.setDate(startDate.getDate() + 7)
        break
      case 'monthly':
        endDate.setMonth(startDate.getMonth() + 1)
        break
      case 'yearly':
        endDate.setFullYear(startDate.getFullYear() + 1)
        break
    }
    
    setFormData({
      ...formData,
      period,
      endDate: endDate.toISOString().split('T')[0]
    })
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-warning flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {budget ? 'Edit Budget' : 'Create New Budget'}
                </h2>
                <p className="text-sm text-gray-600">
                  {budget ? 'Update budget details' : 'Set your spending limits'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Name and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Name *
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`input-field pl-10 ${errors.name ? 'border-danger-500' : ''}`}
                    placeholder="e.g., Monthly Groceries"
                  />
                </div>
                {errors.name && <p className="text-danger-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={`input-field pl-10 ${errors.category ? 'border-danger-500' : ''}`}
                  >
                    <option value="">Select a category</option>
                    {budgetCategories.map((category) => (
                      <option key={category} value={category.toLowerCase().replace(/\s+/g, '_')}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.category && <p className="text-danger-500 text-sm mt-1">{errors.category}</p>}
              </div>
            </div>

            {/* Amount and Period */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Amount *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className={`input-field pl-10 ${errors.amount ? 'border-danger-500' : ''}`}
                    placeholder="0.00"
                  />
                </div>
                {errors.amount && <p className="text-danger-500 text-sm mt-1">{errors.amount}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Period *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={formData.period}
                    onChange={(e) => handlePeriodChange(e.target.value)}
                    className="input-field pl-10"
                  >
                    {budgetPeriods.map((period) => (
                      <option key={period.value} value={period.value}>
                        {period.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className={`input-field pl-10 ${errors.startDate ? 'border-danger-500' : ''}`}
                  />
                </div>
                {errors.startDate && <p className="text-danger-500 text-sm mt-1">{errors.startDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className={`input-field pl-10 ${errors.endDate ? 'border-danger-500' : ''}`}
                  />
                </div>
                {errors.endDate && <p className="text-danger-500 text-sm mt-1">{errors.endDate}</p>}
              </div>
            </div>

            {/* Color and Icon */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex space-x-2">
                  {budgetColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.color === color ? 'border-gray-400' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {budgetIcons.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-lg ${
                        formData.icon === icon ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field min-h-[80px] resize-none"
                placeholder="Add a description for this budget (optional)"
                rows={3}
              />
            </div>

            {/* Alerts */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Alerts
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.alerts.enabled}
                    onChange={(e) => setFormData({
                      ...formData,
                      alerts: { ...formData.alerts, enabled: e.target.checked }
                    })}
                    className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                  />
                  <span className="ml-2 text-sm text-gray-600">Enable budget alerts</span>
                </label>
                
                {formData.alerts.enabled && (
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Alert when budget reaches:
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="50"
                        max="100"
                        value={formData.alerts.threshold}
                        onChange={(e) => setFormData({
                          ...formData,
                          alerts: { ...formData.alerts, threshold: parseInt(e.target.value) }
                        })}
                        className="flex-1"
                      />
                      <span className="text-sm font-medium text-gray-700 w-12">
                        {formData.alerts.threshold}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="loading-spinner w-4 h-4"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  budget ? 'Update Budget' : 'Create Budget'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
