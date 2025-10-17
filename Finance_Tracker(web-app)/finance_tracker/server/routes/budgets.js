const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/budgets
// @desc    Get user budgets
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { active } = req.query;
    let query = { userId: req.user._id };
    
    if (active === 'true') {
      const now = new Date();
      query = {
        ...query,
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now }
      };
    }

    const budgets = await Budget.find(query).sort({ createdAt: -1 });
    
    // Ensure virtual properties are included
    const budgetsWithVirtuals = budgets.map(budget => {
      const budgetObj = budget.toObject();
      budgetObj.percentageUsed = budget.percentageUsed;
      budgetObj.remaining = budget.remaining;
      budgetObj.status = budget.status;
      return budgetObj;
    });
    
    res.json({ budgets: budgetsWithVirtuals });
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({
      message: 'Server error while fetching budgets'
    });
  }
});

// @route   POST /api/budgets
// @desc    Create a new budget
// @access  Private
router.post('/', auth, [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Budget name must be between 1 and 100 characters'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('period').isIn(['weekly', 'monthly', 'yearly']).withMessage('Invalid period'),
  body('startDate').isISO8601().withMessage('Invalid start date format'),
  body('endDate').isISO8601().withMessage('Invalid end date format'),
  body('color').optional().matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).withMessage('Invalid color format'),
  body('icon').optional().isString().withMessage('Icon must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { startDate, endDate } = req.body;
    
    // Validate date range
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        message: 'End date must be after start date'
      });
    }

    // Check for overlapping budgets in the same category
    const overlappingBudget = await Budget.findOne({
      userId: req.user._id,
      category: req.body.category,
      isActive: true,
      $or: [
        {
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(startDate) }
        }
      ]
    });

    if (overlappingBudget) {
      return res.status(400).json({
        message: 'A budget already exists for this category in the specified date range'
      });
    }

    const budgetData = {
      ...req.body,
      userId: req.user._id
    };

    const budget = new Budget(budgetData);
    await budget.save();

    res.status(201).json({
      message: 'Budget created successfully',
      budget
    });
  } catch (error) {
    console.error('Create budget error:', error);
    res.status(500).json({
      message: 'Server error while creating budget'
    });
  }
});

// @route   GET /api/budgets/:id
// @desc    Get a specific budget
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!budget) {
      return res.status(404).json({
        message: 'Budget not found'
      });
    }

    res.json({ budget });
  } catch (error) {
    console.error('Get budget error:', error);
    res.status(500).json({
      message: 'Server error while fetching budget'
    });
  }
});

// @route   PUT /api/budgets/:id
// @desc    Update a budget
// @access  Private
router.put('/:id', auth, [
  body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Budget name must be between 1 and 100 characters'),
  body('amount').optional().isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('color').optional().matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).withMessage('Invalid color format'),
  body('icon').optional().isString().withMessage('Icon must be a string'),
  body('alerts.enabled').optional().isBoolean().withMessage('Alerts enabled must be boolean'),
  body('alerts.threshold').optional().isInt({ min: 0, max: 100 }).withMessage('Alert threshold must be between 0 and 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const budget = await Budget.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!budget) {
      return res.status(404).json({
        message: 'Budget not found'
      });
    }

    // Update budget
    Object.assign(budget, req.body);
    await budget.save();

    res.json({
      message: 'Budget updated successfully',
      budget
    });
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({
      message: 'Server error while updating budget'
    });
  }
});

// @route   DELETE /api/budgets/:id
// @desc    Delete a budget
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!budget) {
      return res.status(404).json({
        message: 'Budget not found'
      });
    }

    await Budget.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Budget deleted successfully'
    });
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({
      message: 'Server error while deleting budget'
    });
  }
});

// @route   GET /api/budgets/stats/overview
// @desc    Get budget overview statistics
// @access  Private
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const activeBudgets = await Budget.getActiveBudgets(req.user._id);
    
    const totalBudget = activeBudgets.reduce((sum, budget) => sum + budget.amount, 0);
    const totalSpent = activeBudgets.reduce((sum, budget) => sum + budget.spent, 0);
    const totalRemaining = totalBudget - totalSpent;
    
    const budgetStats = activeBudgets.map(budget => ({
      id: budget._id,
      name: budget.name,
      category: budget.category,
      amount: budget.amount,
      spent: budget.spent,
      remaining: budget.remaining,
      percentageUsed: budget.percentageUsed,
      status: budget.status,
      color: budget.color,
      icon: budget.icon
    }));

    res.json({
      totalBudgets: activeBudgets.length,
      totalBudget,
      totalSpent,
      totalRemaining,
      overallPercentageUsed: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0,
      budgets: budgetStats
    });
  } catch (error) {
    console.error('Get budget stats error:', error);
    res.status(500).json({
      message: 'Server error while fetching budget statistics'
    });
  }
});

// @route   POST /api/budgets/:id/reset
// @desc    Reset budget spent amount
// @access  Private
router.post('/:id/reset', auth, async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!budget) {
      return res.status(404).json({
        message: 'Budget not found'
      });
    }

    budget.spent = 0;
    await budget.save();

    res.json({
      message: 'Budget reset successfully',
      budget
    });
  } catch (error) {
    console.error('Reset budget error:', error);
    res.status(500).json({
      message: 'Server error while resetting budget'
    });
  }
});

// @route   POST /api/budgets/:id/recalculate
// @desc    Recalculate budget spent amount from transactions
// @access  Private
router.post('/:id/recalculate', auth, async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!budget) {
      return res.status(404).json({
        message: 'Budget not found'
      });
    }

    await budget.recalculateSpent();

    res.json({
      message: 'Budget recalculated successfully',
      budget
    });
  } catch (error) {
    console.error('Recalculate budget error:', error);
    res.status(500).json({
      message: 'Server error while recalculating budget'
    });
  }
});

// @route   POST /api/budgets/recalculate-all
// @desc    Recalculate all budgets for the user
// @access  Private
router.post('/recalculate-all', auth, async (req, res) => {
  try {
    const budgets = await Budget.find({
      userId: req.user._id,
      isActive: true
    });

    for (const budget of budgets) {
      await budget.recalculateSpent();
    }

    res.json({
      message: 'All budgets recalculated successfully',
      count: budgets.length
    });
  } catch (error) {
    console.error('Recalculate all budgets error:', error);
    res.status(500).json({
      message: 'Server error while recalculating budgets'
    });
  }
});

module.exports = router;
