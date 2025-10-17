const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  name: {
    type: String,
    required: [true, 'Budget name is required'],
    trim: true,
    maxlength: [100, 'Budget name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [300, 'Description cannot exceed 300 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Budget amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  spent: {
    type: Number,
    default: 0,
    min: [0, 'Spent amount cannot be negative']
  },
  period: {
    type: String,
    required: [true, 'Budget period is required'],
    enum: ['weekly', 'monthly', 'yearly'],
    default: 'monthly'
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    default: Date.now
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  alerts: {
    enabled: {
      type: Boolean,
      default: true
    },
    threshold: {
      type: Number,
      default: 80, // Alert when 80% of budget is used
      min: 0,
      max: 100
    },
    lastAlertSent: Date
  },
  color: {
    type: String,
    default: '#667eea',
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format']
  },
  icon: {
    type: String,
    default: '💰'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
budgetSchema.index({ userId: 1, isActive: 1 });
budgetSchema.index({ userId: 1, category: 1 });
budgetSchema.index({ userId: 1, startDate: 1, endDate: 1 });

// Update timestamp on save
budgetSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for remaining amount
budgetSchema.virtual('remaining').get(function() {
  return Math.max(0, this.amount - (this.spent || 0));
});

// Virtual for percentage used
budgetSchema.virtual('percentageUsed').get(function() {
  const spent = this.spent || 0;
  return this.amount > 0 ? Math.round((spent / this.amount) * 100) : 0;
});

// Virtual for status
budgetSchema.virtual('status').get(function() {
  const percentage = this.percentageUsed;
  if (percentage >= 100) return 'exceeded';
  if (percentage >= (this.alerts?.threshold || 80)) return 'warning';
  if (percentage >= 50) return 'moderate';
  return 'good';
});

// Static method to get active budgets
budgetSchema.statics.getActiveBudgets = function(userId) {
  const now = new Date();
  return this.find({
    userId,
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now }
  }).sort({ createdAt: -1 });
};

// Method to update spent amount
budgetSchema.methods.updateSpent = async function(amount) {
  this.spent = Math.max(0, (this.spent || 0) + amount);
  await this.save();
  return this;
};

// Method to recalculate spent amount from transactions
budgetSchema.methods.recalculateSpent = async function() {
  const Transaction = mongoose.model('Transaction');
  const totalSpent = await Transaction.aggregate([
    {
      $match: {
        userId: this.userId,
        type: 'expense',
        category: this.category,
        isDeleted: false,
        date: { $gte: this.startDate, $lte: this.endDate }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);

  this.spent = totalSpent.length > 0 ? totalSpent[0].total : 0;
  await this.save();
  return this;
};

module.exports = mongoose.model('Budget', budgetSchema);
