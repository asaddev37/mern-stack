const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  type: {
    type: String,
    required: [true, 'Transaction type is required'],
    enum: ['income', 'expense'],
    lowercase: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  subcategory: {
    type: String,
    trim: true,
    default: ''
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  recurring: {
    isRecurring: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      default: 'monthly'
    },
    endDate: Date,
    nextDueDate: Date
  },
  tags: [{
    type: String,
    trim: true
  }],
  location: {
    type: String,
    trim: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bank_transfer', 'digital_wallet', 'check', 'other'],
    default: 'cash'
  },
  receipt: {
    url: String,
    filename: String
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  isDeleted: {
    type: Boolean,
    default: false
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

// Indexes for better performance
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1, date: -1 });

// Update timestamp on save
transactionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for formatted amount
transactionSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(this.amount);
});

// Static method to get user's transactions
transactionSchema.statics.getUserTransactions = function(userId, filters = {}) {
  const query = { userId, isDeleted: false };
  
  // Type filter
  if (filters.type) query.type = filters.type;
  
  // Category filter
  if (filters.category) query.category = filters.category;
  
  // Search filter (search in description and category)
  if (filters.search) {
    query.$or = [
      { description: { $regex: filters.search, $options: 'i' } },
      { category: { $regex: filters.search, $options: 'i' } }
    ];
  }
  
  // Date range filter
  if (filters.startDate || filters.endDate) {
    query.date = {};
    if (filters.startDate) query.date.$gte = new Date(filters.startDate);
    if (filters.endDate) query.date.$lte = new Date(filters.endDate);
  }
  
  // Amount range filter
  if (filters.amountRange) {
    const range = filters.amountRange;
    if (range === '0-10') {
      query.amount = { $gte: 0, $lt: 10 };
    } else if (range === '10-50') {
      query.amount = { $gte: 10, $lt: 50 };
    } else if (range === '50-100') {
      query.amount = { $gte: 50, $lt: 100 };
    } else if (range === '100-500') {
      query.amount = { $gte: 100, $lt: 500 };
    } else if (range === '500+') {
      query.amount = { $gte: 500 };
    }
  }
  
  // Custom amount range filter
  if (filters.minAmount || filters.maxAmount) {
    query.amount = {};
    if (filters.minAmount) query.amount.$gte = parseFloat(filters.minAmount);
    if (filters.maxAmount) query.amount.$lte = parseFloat(filters.maxAmount);
  }
  
  // Payment method filter
  if (filters.paymentMethod) query.paymentMethod = filters.paymentMethod;
  
  // Status filter
  if (filters.status) query.status = filters.status;
  
  // Sort options
  let sortOptions = { date: -1 }; // Default sort by date descending
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case 'date_desc':
        sortOptions = { date: -1 };
        break;
      case 'date_asc':
        sortOptions = { date: 1 };
        break;
      case 'amount_desc':
        sortOptions = { amount: -1 };
        break;
      case 'amount_asc':
        sortOptions = { amount: 1 };
        break;
      case 'category':
        sortOptions = { category: 1 };
        break;
      default:
        sortOptions = { date: -1 };
    }
  }
  
  return this.find(query).sort(sortOptions);
};

module.exports = mongoose.model('Transaction', transactionSchema);
