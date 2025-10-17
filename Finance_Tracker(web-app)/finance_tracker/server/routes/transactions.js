const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/transactions
// @desc    Get user transactions with filters
// @access  Private
router.get('/', auth, [
  query('type').optional().isIn(['income', 'expense']).withMessage('Invalid transaction type'),
  query('category').optional().isString().withMessage('Category must be a string'),
  query('search').optional().isString().withMessage('Search must be a string'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
  query('amountRange').optional().isString().withMessage('Amount range must be a string'),
  query('minAmount').optional().isNumeric().withMessage('Min amount must be a number'),
  query('maxAmount').optional().isNumeric().withMessage('Max amount must be a number'),
  query('paymentMethod').optional().isString().withMessage('Payment method must be a string'),
  query('status').optional().isString().withMessage('Status must be a string'),
  query('sortBy').optional().isString().withMessage('Sort by must be a string'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { 
      type, 
      category, 
      search,
      startDate, 
      endDate, 
      amountRange,
      minAmount,
      maxAmount,
      paymentMethod,
      status,
      sortBy,
      limit = 20, 
      page = 1 
    } = req.query;
    
    const filters = { 
      type, 
      category, 
      search,
      startDate, 
      endDate, 
      amountRange,
      minAmount,
      maxAmount,
      paymentMethod,
      status,
      sortBy
    };
    
    // Remove undefined filters
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined || filters[key] === '') {
        delete filters[key];
      }
    });

    // Build query for counting (same logic as getUserTransactions)
    const countQuery = { userId: req.user._id, isDeleted: false };
    
    if (filters.type) countQuery.type = filters.type;
    if (filters.category) countQuery.category = filters.category;
    
    if (filters.search) {
      countQuery.$or = [
        { description: { $regex: filters.search, $options: 'i' } },
        { category: { $regex: filters.search, $options: 'i' } }
      ];
    }
    
    if (filters.startDate || filters.endDate) {
      countQuery.date = {};
      if (filters.startDate) countQuery.date.$gte = new Date(filters.startDate);
      if (filters.endDate) countQuery.date.$lte = new Date(filters.endDate);
    }
    
    if (filters.amountRange) {
      const range = filters.amountRange;
      if (range === '0-10') {
        countQuery.amount = { $gte: 0, $lt: 10 };
      } else if (range === '10-50') {
        countQuery.amount = { $gte: 10, $lt: 50 };
      } else if (range === '50-100') {
        countQuery.amount = { $gte: 50, $lt: 100 };
      } else if (range === '100-500') {
        countQuery.amount = { $gte: 100, $lt: 500 };
      } else if (range === '500+') {
        countQuery.amount = { $gte: 500 };
      }
    }
    
    if (filters.minAmount || filters.maxAmount) {
      countQuery.amount = {};
      if (filters.minAmount) countQuery.amount.$gte = parseFloat(filters.minAmount);
      if (filters.maxAmount) countQuery.amount.$lte = parseFloat(filters.maxAmount);
    }
    
    if (filters.paymentMethod) countQuery.paymentMethod = filters.paymentMethod;
    if (filters.status) countQuery.status = filters.status;

    const skip = (page - 1) * limit;
    const transactions = await Transaction.getUserTransactions(req.user._id, filters)
      .limit(parseInt(limit))
      .skip(skip)
      .populate('userId', 'name email');

    const total = await Transaction.countDocuments(countQuery);

    res.json({
      transactions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      message: 'Server error while fetching transactions'
    });
  }
});

// @route   POST /api/transactions
// @desc    Create a new transaction
// @access  Private
router.post('/', auth, [
  body('type').isIn(['income', 'expense']).withMessage('Type must be either income or expense'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('description').optional().trim().isLength({ max: 200 }).withMessage('Description cannot exceed 200 characters'),
  body('date').optional().isISO8601().withMessage('Invalid date format'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('paymentMethod').optional().isIn(['cash', 'card', 'bank_transfer', 'digital_wallet', 'check', 'other']).withMessage('Invalid payment method')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const transactionData = {
      ...req.body,
      userId: req.user._id
    };

    const transaction = new Transaction(transactionData);
    await transaction.save();

    // Update budget if it's an expense
    if (transaction.type === 'expense') {
      const budget = await Budget.findOne({
        userId: req.user._id,
        category: transaction.category,
        isActive: true,
        startDate: { $lte: transaction.date },
        endDate: { $gte: transaction.date }
      });

      if (budget) {
        budget.spent = (budget.spent || 0) + transaction.amount;
        await budget.save();
        console.log(`Updated budget ${budget.name}: spent ${budget.spent} of ${budget.amount}`);
      }
    }

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({
      message: 'Server error while creating transaction'
    });
  }
});

// @route   GET /api/transactions/:id
// @desc    Get a specific transaction
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isDeleted: false
    });

    if (!transaction) {
      return res.status(404).json({
        message: 'Transaction not found'
      });
    }

    res.json({ transaction });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      message: 'Server error while fetching transaction'
    });
  }
});

// @route   PUT /api/transactions/:id
// @desc    Update a transaction
// @access  Private
router.put('/:id', auth, [
  body('type').optional().isIn(['income', 'expense']).withMessage('Type must be either income or expense'),
  body('amount').optional().isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
  body('description').optional().trim().isLength({ max: 200 }).withMessage('Description cannot exceed 200 characters'),
  body('date').optional().isISO8601().withMessage('Invalid date format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isDeleted: false
    });

    if (!transaction) {
      return res.status(404).json({
        message: 'Transaction not found'
      });
    }

    // Store old values for budget update
    const oldAmount = transaction.amount;
    const oldType = transaction.type;
    const oldCategory = transaction.category;

    // Update transaction
    Object.assign(transaction, req.body);
    await transaction.save();

    // Update budgets if needed
    if (oldType === 'expense') {
      // Remove old expense from budget
      const oldBudget = await Budget.findOne({
        userId: req.user._id,
        category: oldCategory,
        isActive: true
      });
      if (oldBudget) {
        oldBudget.spent = Math.max(0, (oldBudget.spent || 0) - oldAmount);
        await oldBudget.save();
        console.log(`Removed from budget ${oldBudget.name}: spent ${oldBudget.spent} of ${oldBudget.amount}`);
      }
    }

    if (transaction.type === 'expense') {
      // Add new expense to budget
      const newBudget = await Budget.findOne({
        userId: req.user._id,
        category: transaction.category,
        isActive: true,
        startDate: { $lte: transaction.date },
        endDate: { $gte: transaction.date }
      });
      if (newBudget) {
        newBudget.spent = (newBudget.spent || 0) + transaction.amount;
        await newBudget.save();
        console.log(`Added to budget ${newBudget.name}: spent ${newBudget.spent} of ${newBudget.amount}`);
      }
    }

    res.json({
      message: 'Transaction updated successfully',
      transaction
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({
      message: 'Server error while updating transaction'
    });
  }
});

// @route   DELETE /api/transactions/:id
// @desc    Delete a transaction (soft delete)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isDeleted: false
    });

    if (!transaction) {
      return res.status(404).json({
        message: 'Transaction not found'
      });
    }

    // Soft delete
    transaction.isDeleted = true;
    await transaction.save();

    // Update budget if it was an expense
    if (transaction.type === 'expense') {
      const budget = await Budget.findOne({
        userId: req.user._id,
        category: transaction.category,
        isActive: true
      });
      if (budget) {
        budget.spent = Math.max(0, (budget.spent || 0) - transaction.amount);
        await budget.save();
        console.log(`Removed from budget ${budget.name}: spent ${budget.spent} of ${budget.amount}`);
      }
    }

    res.json({
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({
      message: 'Server error while deleting transaction'
    });
  }
});

// @route   GET /api/transactions/stats/summary
// @desc    Get transaction summary statistics
// @access  Private
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = {};
    
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const matchStage = {
      userId: req.user._id,
      isDeleted: false,
      ...(Object.keys(dateFilter).length > 0 && { date: dateFilter })
    };

    const stats = await Transaction.aggregate([
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

    const incomeStats = stats.find(s => s._id === 'income') || { total: 0, count: 0, average: 0 };
    const expenseStats = stats.find(s => s._id === 'expense') || { total: 0, count: 0, average: 0 };

    res.json({
      income: incomeStats,
      expense: expenseStats,
      net: incomeStats.total - expenseStats.total
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      message: 'Server error while fetching statistics'
    });
  }
});

module.exports = router;
