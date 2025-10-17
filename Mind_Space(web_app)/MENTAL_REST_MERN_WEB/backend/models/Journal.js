const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    trim: true,
    maxlength: 100
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  mood: {
    type: String,
    required: true,
    enum: ['very-happy', 'happy', 'neutral', 'sad', 'very-sad', 'anxious', 'stressed', 'calm', 'excited', 'grateful', 'frustrated', 'peaceful']
  },
  moodIntensity: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 30
  }],
  isPrivate: {
    type: Boolean,
    default: true
  },
  prompt: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prompt',
    default: null
  },
  aiAnalysis: {
    sentiment: {
      type: String,
      enum: ['positive', 'negative', 'neutral'],
      default: null
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: null
    },
    keywords: [String],
    summary: String,
    suggestions: [String],
    analyzedAt: Date
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: null
    }
  },
  weather: {
    temperature: Number,
    condition: String,
    humidity: Number
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  wordCount: {
    type: Number,
    default: 0
  },
  readingTime: {
    type: Number, // in minutes
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
journalSchema.index({ user: 1, createdAt: -1 });
journalSchema.index({ mood: 1 });
journalSchema.index({ tags: 1 });
journalSchema.index({ 'aiAnalysis.sentiment': 1 });
journalSchema.index({ createdAt: -1 });

// Pre-save middleware to calculate word count and reading time
journalSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    this.wordCount = this.content.trim().split(/\s+/).length;
    this.readingTime = Math.ceil(this.wordCount / 200); // Average reading speed: 200 words per minute
  }
  next();
});

// Virtual for formatted date
journalSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for mood emoji
journalSchema.virtual('moodEmoji').get(function() {
  const moodEmojis = {
    'very-happy': '😄',
    'happy': '😊',
    'neutral': '😐',
    'sad': '😢',
    'very-sad': '😭',
    'anxious': '😰',
    'stressed': '😓',
    'calm': '😌',
    'excited': '🤩',
    'grateful': '🙏',
    'frustrated': '😤',
    'peaceful': '☮️'
  };
  return moodEmojis[this.mood] || '😐';
});

// Static method to get mood statistics
journalSchema.statics.getMoodStats = function(userId, startDate, endDate) {
  const matchStage = {
    user: new mongoose.Types.ObjectId(userId)
  };
  
  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$mood',
        count: { $sum: 1 },
        avgIntensity: { $avg: '$moodIntensity' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// Static method to get writing streaks
journalSchema.statics.getWritingStreaks = function(userId) {
  return this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } }
  ]);
};

module.exports = mongoose.model('Journal', journalSchema);
