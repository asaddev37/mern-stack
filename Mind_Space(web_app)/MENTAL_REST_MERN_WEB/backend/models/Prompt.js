const mongoose = require('mongoose');

const promptSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  content: {
    type: String,
    required: true,
    maxlength: 500
  },
  category: {
    type: String,
    required: true,
    enum: ['gratitude', 'reflection', 'mindfulness', 'goal-setting', 'self-care', 'relationships', 'work', 'creativity', 'general']
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  estimatedTime: {
    type: Number, // in minutes
    default: 5
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 30
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null for system prompts
  },
  isSystemPrompt: {
    type: Boolean,
    default: true
  },
  language: {
    type: String,
    default: 'en'
  },
  targetAudience: {
    type: String,
    enum: ['all', 'beginners', 'experienced', 'students', 'professionals', 'parents'],
    default: 'all'
  }
}, {
  timestamps: true
});

// Indexes
promptSchema.index({ category: 1, isActive: 1 });
promptSchema.index({ difficulty: 1 });
promptSchema.index({ usageCount: -1 });
promptSchema.index({ createdAt: -1 });

// Pre-save middleware to increment usage count
promptSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  return this.save();
};

// Static method to get random prompt by category
promptSchema.statics.getRandomPrompt = function(category = null, difficulty = null) {
  const query = { isActive: true };
  
  if (category) {
    query.category = category;
  }
  
  if (difficulty) {
    query.difficulty = difficulty;
  }
  
  return this.aggregate([
    { $match: query },
    { $sample: { size: 1 } }
  ]);
};

// Static method to get popular prompts
promptSchema.statics.getPopularPrompts = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ usageCount: -1 })
    .limit(limit)
    .select('title content category difficulty estimatedTime tags usageCount');
};

// Virtual for formatted content with placeholders
promptSchema.virtual('formattedContent').get(function() {
  return this.content
    .replace(/\{date\}/g, new Date().toLocaleDateString())
    .replace(/\{time\}/g, new Date().toLocaleTimeString())
    .replace(/\{day\}/g, new Date().toLocaleDateString('en-US', { weekday: 'long' }));
});

module.exports = mongoose.model('Prompt', promptSchema);
