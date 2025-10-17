const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Only required if not using Google OAuth
    },
    minlength: 6
  },
  googleId: {
    type: String,
    sparse: true // Allows multiple null values
  },
  avatar: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    privacy: {
      shareAnonymously: {
        type: Boolean,
        default: false
      },
      dataRetention: {
        type: Number,
        default: 365 // days
      }
    }
  },
  wellnessGoals: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    targetValue: Number,
    currentValue: {
      type: Number,
      default: 0
    },
    unit: String,
    deadline: Date,
    isCompleted: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  streak: {
    current: {
      type: Number,
      default: 0
    },
    longest: {
      type: Number,
      default: 0
    },
    lastEntryDate: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ createdAt: -1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Hash the token and set expiry (1 hour from now)
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  
  return resetToken;
};

// Clear password reset token
userSchema.methods.clearPasswordResetToken = function() {
  this.resetPasswordToken = undefined;
  this.resetPasswordExpires = undefined;
};

// Update streak method
userSchema.methods.updateStreak = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastEntry = this.streak.lastEntryDate;
  if (lastEntry) {
    const lastEntryDate = new Date(lastEntry);
    lastEntryDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((today - lastEntryDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      // Consecutive day
      this.streak.current += 1;
    } else if (daysDiff > 1) {
      // Streak broken
      this.streak.current = 1;
    }
    // If daysDiff === 0, same day, don't update
  } else {
    // First entry
    this.streak.current = 1;
  }
  
  this.streak.lastEntryDate = today;
  
  if (this.streak.current > this.streak.longest) {
    this.streak.longest = this.streak.current;
  }
  
  return this.save();
};

// Virtual for user stats
userSchema.virtual('stats').get(function() {
  return {
    totalEntries: 0, // Will be calculated from Journal model
    currentStreak: this.streak.current,
    longestStreak: this.streak.longest,
    goalsCompleted: this.wellnessGoals.filter(goal => goal.isCompleted).length,
    totalGoals: this.wellnessGoals.length
  };
});

module.exports = mongoose.model('User', userSchema);
