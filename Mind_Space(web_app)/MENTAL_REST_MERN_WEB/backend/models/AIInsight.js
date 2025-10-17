const mongoose = require('mongoose');

const aiInsightSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['summary', 'dashboard', 'chat'],
    default: 'summary'
  },
  period: {
    type: String,
    default: '7' // days
  },
  summary: {
    type: String,
    required: true
  },
  highlight: {
    type: String,
    required: true
  },
  moodStats: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  }
}, {
  timestamps: true
});

// Index for efficient queries
aiInsightSchema.index({ user: 1, type: 1, isActive: 1, expiresAt: 1 });

// Static method to get or create insight
aiInsightSchema.statics.getOrCreateInsight = async function(userId, type = 'summary', period = '7', moodStats = {}) {
  // First, try to find an active, non-expired insight
  const existingInsight = await this.findOne({
    user: userId,
    type: type,
    isActive: true,
    expiresAt: { $gt: new Date() }
  }).sort({ createdAt: -1 });

  if (existingInsight) {
    return existingInsight;
  }

  // If no valid insight exists, return null (will trigger AI generation)
  return null;
};

// Static method to save new insight
aiInsightSchema.statics.saveInsight = async function(userId, type, period, summary, highlight, moodStats = {}) {
  // Deactivate old insights of the same type
  await this.updateMany(
    { user: userId, type: type, isActive: true },
    { isActive: false }
  );

  // Create new insight
  const insight = new this({
    user: userId,
    type: type,
    period: period,
    summary: summary,
    highlight: highlight,
    moodStats: moodStats
  });

  return await insight.save();
};

module.exports = mongoose.model('AIInsight', aiInsightSchema);
