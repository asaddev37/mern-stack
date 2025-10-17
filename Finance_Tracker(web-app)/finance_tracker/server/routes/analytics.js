const express = require('express');
const { query, validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics data
// @access  Private
router.get('/dashboard', auth, [
  query('period').optional().isIn(['week', 'month', 'quarter', 'year']).withMessage('Invalid period'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { dateRange: period = '30d', startDate, endDate } = req.query;
    
    // Calculate date range based on period
    let dateRange = {};
    const now = new Date();
    
    if (startDate && endDate) {
      dateRange = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      switch (period) {
        case '7d':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateRange = { $gte: weekAgo, $lte: now };
          break;
        case '30d':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          dateRange = { $gte: monthAgo, $lte: now };
          break;
        case '90d':
          const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          dateRange = { $gte: quarterAgo, $lte: now };
          break;
        case '1y':
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          dateRange = { $gte: yearAgo, $lte: now };
          break;
        default:
          // Default to last 30 days
          const defaultAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          dateRange = { $gte: defaultAgo, $lte: now };
      }
    }

    const matchStage = {
      userId: req.user._id,
      isDeleted: false,
      date: dateRange
    };

    // Get transaction summary
    const transactionStats = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          average: { $avg: '$amount' }
        }
      }
    ]);

    // Get category breakdown
    const categoryBreakdown = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { type: '$type', category: '$category' },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 10 }
    ]);

    // Get monthly trends
    const monthlyTrends = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get budget performance
    const budgetStats = await Budget.aggregate([
      {
        $match: {
          userId: req.user._id,
          isActive: true,
          startDate: { $lte: now },
          endDate: { $gte: now }
        }
      },
      {
        $group: {
          _id: null,
          totalBudget: { $sum: '$amount' },
          totalSpent: { $sum: '$spent' },
          averageUsage: { $avg: { $multiply: [{ $divide: ['$spent', '$amount'] }, 100] } }
        }
      }
    ]);

    const incomeStats = transactionStats.find(s => s._id === 'income') || { total: 0, count: 0, average: 0 };
    const expenseStats = transactionStats.find(s => s._id === 'expense') || { total: 0, count: 0, average: 0 };
    const budgetData = budgetStats[0] || { totalBudget: 0, totalSpent: 0, averageUsage: 0 };

    // Format data for frontend
    const formattedCategoryBreakdown = categoryBreakdown.map(item => ({
      type: item._id.type,
      category: item._id.category,
      amount: item.total,
      count: item.count
    }));

    // Format monthly data for charts
    const monthlyData = [];
    const monthlyMap = new Map();
    
    monthlyTrends.forEach(trend => {
      const key = `${trend._id.year}-${trend._id.month}`;
      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, {
          month: new Date(trend._id.year, trend._id.month - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          income: 0,
          expenses: 0
        });
      }
      const monthData = monthlyMap.get(key);
      if (trend._id.type === 'income') {
        monthData.income = trend.total;
      } else {
        monthData.expenses = trend.total;
      }
    });
    
    monthlyData.push(...Array.from(monthlyMap.values()));

    // Get weekly data for spending trends
    const weeklyData = [];
    const weeklyMap = new Map();
    
    const weeklyTrends = await Transaction.aggregate([
      { $match: { ...matchStage, type: 'expense' } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            week: { $week: '$date' }
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.week': 1 } },
      { $limit: 12 }
    ]);

    weeklyTrends.forEach(trend => {
      const weekStart = new Date(trend._id.year, 0, 1);
      const weekNumber = trend._id.week;
      const weekDate = new Date(weekStart.getTime() + (weekNumber - 1) * 7 * 24 * 60 * 60 * 1000);
      
      weeklyData.push({
        week: `Week ${weekNumber}`,
        amount: trend.total
      });
    });

    // Get budget analysis
    const budgetAnalysis = await Budget.find({
      userId: req.user._id,
      isActive: true
    }).select('name category amount spent');

    const formattedBudgetAnalysis = budgetAnalysis.map(budget => ({
      name: budget.name,
      category: budget.category,
      amount: budget.amount,
      spent: budget.spent || 0,
      percentageUsed: budget.amount > 0 ? Math.round(((budget.spent || 0) / budget.amount) * 100) : 0
    }));

    res.json({
      totalIncome: incomeStats.total,
      totalExpenses: expenseStats.total,
      netIncome: incomeStats.total - expenseStats.total,
      categoryBreakdown: formattedCategoryBreakdown,
      monthlyData: monthlyData,
      weeklyData: weeklyData,
      budgetAnalysis: formattedBudgetAnalysis,
      insights: {
        topIncomeCategory: categoryBreakdown.find(c => c._id.type === 'income')?._id.category || 'N/A',
        topExpenseCategory: categoryBreakdown.find(c => c._id.type === 'expense')?._id.category || 'N/A',
        averageTransactionSize: (incomeStats.average + expenseStats.average) / 2 || 0,
        transactionCount: incomeStats.count + expenseStats.count
      }
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({
      message: 'Server error while fetching dashboard analytics'
    });
  }
});

// @route   GET /api/analytics/trends
// @desc    Get spending/income trends
// @access  Private
router.get('/trends', auth, [
  query('type').optional().isIn(['income', 'expense']).withMessage('Invalid type'),
  query('period').optional().isIn(['daily', 'weekly', 'monthly']).withMessage('Invalid period'),
  query('months').optional().isInt({ min: 1, max: 12 }).withMessage('Months must be between 1 and 12')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { type, period = 'monthly', months = 6 } = req.query;
    const monthsAgo = new Date();
    monthsAgo.setMonth(monthsAgo.getMonth() - parseInt(months));

    const matchStage = {
      userId: req.user._id,
      isDeleted: false,
      date: { $gte: monthsAgo },
      ...(type && { type })
    };

    let groupStage;
    switch (period) {
      case 'daily':
        groupStage = {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        };
        break;
      case 'weekly':
        groupStage = {
          _id: {
            year: { $year: '$date' },
            week: { $week: '$date' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        };
        break;
      case 'monthly':
      default:
        groupStage = {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        };
    }

    const trends = await Transaction.aggregate([
      { $match: matchStage },
      { $group: groupStage },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
    ]);

    res.json({
      period,
      type: type || 'all',
      trends
    });
  } catch (error) {
    console.error('Trends analytics error:', error);
    res.status(500).json({
      message: 'Server error while fetching trends'
    });
  }
});

// @route   GET /api/analytics/categories
// @desc    Get category-wise analytics
// @access  Private
router.get('/categories', auth, [
  query('type').optional().isIn(['income', 'expense']).withMessage('Invalid type'),
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { type, limit = 10 } = req.query;
    const matchStage = {
      userId: req.user._id,
      isDeleted: false,
      ...(type && { type })
    };

    const categoryStats = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { type: '$type', category: '$category' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          average: { $avg: '$amount' },
          lastTransaction: { $max: '$date' }
        }
      },
      { $sort: { total: -1 } },
      { $limit: parseInt(limit) }
    ]);

    // Calculate percentages
    const totalAmount = categoryStats.reduce((sum, cat) => sum + cat.total, 0);
    const categoryStatsWithPercentage = categoryStats.map(cat => ({
      ...cat,
      percentage: totalAmount > 0 ? Math.round((cat.total / totalAmount) * 100) : 0
    }));

    res.json({
      categories: categoryStatsWithPercentage,
      totalAmount,
      totalTransactions: categoryStats.reduce((sum, cat) => sum + cat.count, 0)
    });
  } catch (error) {
    console.error('Category analytics error:', error);
    res.status(500).json({
      message: 'Server error while fetching category analytics'
    });
  }
});

module.exports = router;
