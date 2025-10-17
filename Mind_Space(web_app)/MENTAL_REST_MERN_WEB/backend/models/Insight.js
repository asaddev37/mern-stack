const mongoose = require('mongoose');

const insightSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['mood-trend', 'sentiment-analysis', 'writing-pattern', 'wellness-tip', 'achievement', 'streak-milestone']
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  data: {
    // Flexible data structure for different insight types
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  period: {
    startDate: Date,
    endDate: Date,
    type: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      default: 'weekly'
    }
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['positive', 'neutral', 'concern', 'achievement'],
    default: 'neutral'
  },
  actionable: {
    type: Boolean,
    default: false
  },
  actionItems: [{
    text: String,
    completed: {
      type: Boolean,
      default: false
    },
    dueDate: Date
  }],
  generatedBy: {
    type: String,
    enum: ['ai', 'system', 'manual'],
    default: 'system'
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.8
  }
}, {
  timestamps: true
});

// Indexes
insightSchema.index({ user: 1, createdAt: -1 });
insightSchema.index({ type: 1 });
insightSchema.index({ isRead: 1 });
insightSchema.index({ priority: 1 });
insightSchema.index({ category: 1 });

// Static method to generate mood trend insights
insightSchema.statics.generateMoodTrendInsight = async function(userId, period = 'weekly') {
  const Journal = mongoose.model('Journal');
  const endDate = new Date();
  const startDate = new Date();
  
  switch (period) {
    case 'daily':
      startDate.setDate(endDate.getDate() - 1);
      break;
    case 'weekly':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case 'monthly':
      startDate.setMonth(endDate.getMonth() - 1);
      break;
    case 'yearly':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
  }
  
  const moodStats = await Journal.getMoodStats(userId, startDate, endDate);
  
  if (moodStats.length === 0) {
    return null;
  }
  
  const totalEntries = moodStats.reduce((sum, stat) => sum + stat.count, 0);
  const avgMood = moodStats.reduce((sum, stat) => {
    const moodValues = {
      'very-sad': 1, 'sad': 2, 'neutral': 3, 'happy': 4, 'very-happy': 5,
      'anxious': 2, 'stressed': 2, 'calm': 4, 'excited': 4, 'grateful': 5,
      'frustrated': 2, 'peaceful': 4
    };
    return sum + (moodValues[stat._id] * stat.count);
  }, 0) / totalEntries;
  
  let title, description, category;
  
  if (avgMood >= 4) {
    title = 'Positive Mood Trend';
    description = `Your mood has been consistently positive over the past ${period}. Keep up the great work!`;
    category = 'positive';
  } else if (avgMood >= 3) {
    title = 'Stable Mood Pattern';
    description = `Your mood has been relatively stable over the past ${period}. Consider adding more positive activities to your routine.`;
    category = 'neutral';
  } else {
    title = 'Mood Support Needed';
    description = `Your mood has been lower than usual. Consider reaching out for support or trying some wellness activities.`;
    category = 'concern';
  }
  
  return new this({
    user: userId,
    type: 'mood-trend',
    title,
    description,
    data: {
      moodStats,
      averageMood: avgMood,
      totalEntries
    },
    period: {
      startDate,
      endDate,
      type: period
    },
    category,
    generatedBy: 'ai'
  });
};

// Static method to generate writing pattern insights
insightSchema.statics.generateWritingPatternInsight = async function(userId) {
  const Journal = mongoose.model('Journal');
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const entries = await Journal.find({
    user: userId,
    createdAt: { $gte: thirtyDaysAgo }
  }).sort({ createdAt: 1 });
  
  if (entries.length < 5) {
    return null;
  }
  
  const wordCounts = entries.map(entry => entry.wordCount);
  const avgWordCount = wordCounts.reduce((sum, count) => sum + count, 0) / wordCounts.length;
  
  const writingDays = new Set(entries.map(entry => 
    entry.createdAt.toISOString().split('T')[0]
  )).size;
  
  const consistency = (writingDays / 30) * 100;
  
  let title, description, category;
  
  if (consistency >= 70) {
    title = 'Excellent Writing Consistency';
    description = `You've been writing consistently ${Math.round(consistency)}% of the time over the past month. This is a great habit!`;
    category = 'achievement';
  } else if (consistency >= 40) {
    title = 'Good Writing Progress';
    description = `You've been writing ${Math.round(consistency)}% of the time. Try to increase your consistency for better mental wellness benefits.`;
    category = 'positive';
  } else {
    title = 'Building Writing Habits';
    description = `You've been writing ${Math.round(consistency)}% of the time. Consider setting a daily reminder to help build this healthy habit.`;
    category = 'neutral';
  }
  
  return new this({
    user: userId,
    type: 'writing-pattern',
    title,
    description,
    data: {
      totalEntries: entries.length,
      writingDays,
      consistency,
      averageWordCount: Math.round(avgWordCount),
      totalWords: wordCounts.reduce((sum, count) => sum + count, 0)
    },
    period: {
      startDate: thirtyDaysAgo,
      endDate: new Date(),
      type: 'monthly'
    },
    category,
    generatedBy: 'ai'
  });
};

module.exports = mongoose.model('Insight', insightSchema);
