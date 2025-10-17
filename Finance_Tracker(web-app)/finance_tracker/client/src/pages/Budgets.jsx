import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Filter, Search, Target, RefreshCw } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { budgetsAPI } from '../services/api'
import toast from 'react-hot-toast'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { BudgetForm } from '../components/budgets/BudgetForm'
import { BudgetCard } from '../components/budgets/BudgetCard'
import { BudgetStats } from '../components/budgets/BudgetStats'

export function Budgets() {
  const [showBudgetForm, setShowBudgetForm] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)
  const [filters, setFilters] = useState({
    active: 'true',
    category: '',
    search: ''
  })

  // Fetch budget stats
  const { data: statsData, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['budget-stats'],
    queryFn: () => budgetsAPI.getBudgetStats(),
    retry: 1,
    refetchOnWindowFocus: false,
  })

  // Fetch budgets with filters
  const { data: budgetsData, isLoading, error } = useQuery({
    queryKey: ['budgets', filters],
    queryFn: () => budgetsAPI.getBudgets(filters),
    retry: 1,
    refetchOnWindowFocus: false,
  })

  const budgets = budgetsData?.data?.budgets || []
  const stats = statsData?.data
  const queryClient = useQueryClient()

  const recalculateAllMutation = useMutation({
    mutationFn: budgetsAPI.recalculateAllBudgets,
    onSuccess: () => {
      queryClient.invalidateQueries(['budgets'])
      queryClient.invalidateQueries(['budget-stats'])
      queryClient.invalidateQueries(['budget-overview'])
      queryClient.invalidateQueries(['dashboard'])
      toast.success('All budgets recalculated successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to recalculate budgets')
    }
  })

  const handleAddBudget = () => {
    setEditingBudget(null)
    setShowBudgetForm(true)
  }

  const handleEditBudget = (budget) => {
    setEditingBudget(budget)
    setShowBudgetForm(true)
  }

  const handleCloseForm = () => {
    setShowBudgetForm(false)
    setEditingBudget(null)
  }

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters)
  }

  const handleClearFilters = () => {
    setFilters({
      active: 'true',
      category: '',
      search: ''
    })
  }

  const handleRecalculateAll = () => {
    recalculateAllMutation.mutate()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Budgets</h1>
          <p className="text-gray-600">Track your spending limits and achieve your financial goals</p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <button
            onClick={handleRecalculateAll}
            disabled={recalculateAllMutation.isLoading}
            className="btn-outline flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${recalculateAllMutation.isLoading ? 'animate-spin' : ''}`} />
            <span>Recalculate All</span>
          </button>
          <button
            onClick={handleAddBudget}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Budget</span>
          </button>
        </div>
      </div>


      {/* Budget Stats */}
      <BudgetStats stats={stats} isLoading={statsLoading} />

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <select
              value={filters.active}
              onChange={(e) => setFilters({ ...filters, active: e.target.value })}
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none"
            >
              <option value="">All Budgets</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
            
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none"
            >
              <option value="">All Categories</option>
              <option value="food_dining">Food & Dining</option>
              <option value="transportation">Transportation</option>
              <option value="shopping">Shopping</option>
              <option value="entertainment">Entertainment</option>
              <option value="bills_utilities">Bills & Utilities</option>
              <option value="healthcare">Healthcare</option>
              <option value="education">Education</option>
              <option value="travel">Travel</option>
              <option value="groceries">Groceries</option>
              <option value="gas">Gas</option>
              <option value="insurance">Insurance</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search budgets..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10 pr-4 py-2 w-full sm:w-64 rounded-xl border border-gray-200 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Budgets List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : budgets.length > 0 ? (
          budgets.map((budget, index) => (
            <BudgetCard
              key={budget._id}
              budget={budget}
              onEdit={handleEditBudget}
            />
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card text-center py-12"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No budgets found</h3>
            <p className="text-gray-600 mb-4">
              {Object.values(filters).some(f => f && f !== 'true') 
                ? 'Try adjusting your filters to see more budgets'
                : 'Create your first budget to start tracking your spending'
              }
            </p>
            <button
              onClick={handleAddBudget}
              className="btn-primary"
            >
              Create Budget
            </button>
          </motion.div>
        )}
      </div>

      {/* Budget Form Modal */}
      <BudgetForm
        isOpen={showBudgetForm}
        onClose={handleCloseForm}
        budget={editingBudget}
      />
    </div>
  )
}
