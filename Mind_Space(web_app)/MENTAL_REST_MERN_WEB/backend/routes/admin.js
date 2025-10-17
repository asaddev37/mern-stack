const express = require('express');
const User = require('../models/User');
const Journal = require('../models/Journal');
const Prompt = require('../models/Prompt');
const Insight = require('../models/Insight');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply admin authentication to all routes
router.use(authenticateToken, requireAdmin);

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard overview
// @access  Private (Admin)
router.get('/dashboard', async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;

    let startDate = new Date();
    switch (period) {
      case 'daily':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'weekly':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'yearly':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    // Get comprehensive statistics
    const [
      totalUsers,
      activeUsers,
      newUsers,
      totalEntries,
      totalPrompts,
      moodDistribution,
      userGrowth,
      entryGrowth,
      popularPrompts,
      systemHealth
    ] = await Promise.all([
      // Total users
      User.countDocuments({ isActive: true }),
      
      // Active users (users who have written in the period)
      User.countDocuments({
        isActive: true,
        'streak.lastEntryDate': { $gte: startDate }
      }),
      
      // New users in period
      User.countDocuments({
        createdAt: { $gte: startDate }
      }),
      
      // Total entries in period
      Journal.countDocuments({
        createdAt: { $gte: startDate }
      }),
      
      // Total prompts
      Prompt.countDocuments({ isActive: true }),
      
      // Mood distribution
      Journal.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$mood',
            count: { $sum: 1 },
            avgIntensity: { $avg: '$moodIntensity' }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]),
      
      // User growth over time
      User.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
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
        {
          $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
        }
      ]),
      
      // Entry growth over time
      Journal.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
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
        {
          $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
        }
      ]),
      
      // Popular prompts
      Prompt.find({ isActive: true })
        .sort({ usageCount: -1 })
        .limit(10)
        .select('title category usageCount createdAt'),
      
      // System health metrics
      getSystemHealthMetrics()
    ]);

    // Calculate engagement metrics
    const avgEntriesPerUser = activeUsers > 0 ? Math.round(totalEntries / activeUsers) : 0;
    const userRetentionRate = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;

    res.json({
      period,
      overview: {
        totalUsers,
        activeUsers,
        newUsers,
        totalEntries,
        totalPrompts,
        avgEntriesPerUser,
        userRetentionRate
      },
      analytics: {
        moodDistribution,
        userGrowth,
        entryGrowth,
        popularPrompts
      },
      systemHealth,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({
      message: 'Failed to fetch admin dashboard',
      code: 'FETCH_DASHBOARD_ERROR'
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get user management data
// @access  Private (Admin)
router.get('/users', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      isActive, 
      role,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Apply filters
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (role) {
      query.role = role;
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const users = await User.find(query)
      .select('-password')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    // Get additional stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const entryCount = await Journal.countDocuments({ user: user._id });
        const lastEntry = await Journal.findOne({ user: user._id })
          .sort({ createdAt: -1 })
          .select('createdAt');

        return {
          ...user.toObject(),
          stats: {
            entryCount,
            lastEntryDate: lastEntry?.createdAt || null,
            currentStreak: user.streak.current,
            longestStreak: user.streak.longest
          }
        };
      })
    );

    res.json({
      users: usersWithStats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      filters: { search, isActive, role, sortBy, sortOrder }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      message: 'Failed to fetch users',
      code: 'FETCH_USERS_ERROR'
    });
  }
});

// @route   PUT /api/admin/users/:userId/status
// @desc    Update user status (activate/deactivate)
// @access  Private (Admin)
router.put('/users/:userId/status', async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        message: 'isActive must be a boolean value',
        code: 'INVALID_STATUS'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      message: 'Failed to update user status',
      code: 'UPDATE_USER_STATUS_ERROR'
    });
  }
});

// @route   GET /api/admin/content
// @desc    Get content moderation data
// @access  Private (Admin)
router.get('/content', async (req, res) => {
  try {
    const { 
      type = 'all',
      page = 1, 
      limit = 20,
      status = 'all'
    } = req.query;

    let query = {};

    // Filter by type
    if (type === 'journals') {
      query = { user: { $exists: true } };
    } else if (type === 'prompts') {
      query = { isSystemPrompt: false };
    }

    // Filter by status
    if (status === 'shared') {
      query.isPrivate = false;
    } else if (status === 'private') {
      query.isPrivate = true;
    }

    let content;
    let total;

    if (type === 'journals') {
      content = await Journal.find(query)
        .populate('user', 'name email')
        .populate('prompt', 'title category')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      total = await Journal.countDocuments(query);
    } else if (type === 'prompts') {
      content = await Prompt.find(query)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      total = await Prompt.countDocuments(query);
    } else {
      // Get both journals and prompts
      const [journals, prompts] = await Promise.all([
        Journal.find({ user: { $exists: true } })
          .populate('user', 'name email')
          .populate('prompt', 'title category')
          .sort({ createdAt: -1 })
          .limit(limit * 1)
          .skip((page - 1) * limit),
        
        Prompt.find({ isSystemPrompt: false })
          .populate('createdBy', 'name email')
          .sort({ createdAt: -1 })
          .limit(limit * 1)
          .skip((page - 1) * limit)
      ]);

      content = [...journals, ...prompts].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );

      total = await Journal.countDocuments({ user: { $exists: true } }) +
              await Prompt.countDocuments({ isSystemPrompt: false });
    }

    res.json({
      content,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalContent: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      filters: { type, status }
    });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({
      message: 'Failed to fetch content',
      code: 'FETCH_CONTENT_ERROR'
    });
  }
});

// @route   DELETE /api/admin/content/:contentId
// @desc    Delete content (moderation)
// @access  Private (Admin)
router.delete('/content/:contentId', async (req, res) => {
  try {
    const { contentId } = req.params;
    const { type } = req.query; // 'journal' or 'prompt'

    let deletedContent;

    if (type === 'journal') {
      deletedContent = await Journal.findByIdAndDelete(contentId);
    } else if (type === 'prompt') {
      deletedContent = await Prompt.findByIdAndDelete(contentId);
    } else {
      return res.status(400).json({
        message: 'Content type must be specified (journal or prompt)',
        code: 'CONTENT_TYPE_REQUIRED'
      });
    }

    if (!deletedContent) {
      return res.status(404).json({
        message: 'Content not found',
        code: 'CONTENT_NOT_FOUND'
      });
    }

    res.json({
      message: 'Content deleted successfully',
      deletedContent: {
        id: deletedContent._id,
        type,
        deletedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({
      message: 'Failed to delete content',
      code: 'DELETE_CONTENT_ERROR'
    });
  }
});

// @route   GET /api/admin/analytics
// @desc    Get detailed analytics
// @access  Private (Admin)
router.get('/analytics', async (req, res) => {
  try {
    const { period = 'monthly', metric } = req.query;

    let startDate = new Date();
    switch (period) {
      case 'daily':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'weekly':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'yearly':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    let analytics = {};

    switch (metric) {
      case 'user-engagement':
        analytics = await getUserEngagementAnalytics(startDate);
        break;
      case 'content-analysis':
        analytics = await getContentAnalysisAnalytics(startDate);
        break;
      case 'mood-trends':
        analytics = await getMoodTrendsAnalytics(startDate);
        break;
      case 'system-performance':
        analytics = await getSystemPerformanceAnalytics();
        break;
      default:
        // Return all analytics
        analytics = {
          userEngagement: await getUserEngagementAnalytics(startDate),
          contentAnalysis: await getContentAnalysisAnalytics(startDate),
          moodTrends: await getMoodTrendsAnalytics(startDate),
          systemPerformance: await getSystemPerformanceAnalytics()
        };
    }

    res.json({
      period,
      metric: metric || 'all',
      analytics,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      message: 'Failed to fetch analytics',
      code: 'FETCH_ANALYTICS_ERROR'
    });
  }
});

// @route   GET /api/admin/export
// @desc    Export data for analysis
// @access  Private (Admin)
router.get('/export', async (req, res) => {
  try {
    const { type, format = 'json', period = 'monthly' } = req.query;

    let startDate = new Date();
    switch (period) {
      case 'daily':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'weekly':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'yearly':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    let exportData;

    switch (type) {
      case 'users':
        exportData = await User.find({ createdAt: { $gte: startDate } })
          .select('-password -googleId')
          .lean();
        break;
      case 'journals':
        exportData = await Journal.find({ createdAt: { $gte: startDate } })
          .populate('user', 'name email')
          .populate('prompt', 'title category')
          .select('-aiAnalysis.keywords')
          .lean();
        break;
      case 'analytics':
        exportData = {
          userStats: await getUserEngagementAnalytics(startDate),
          contentStats: await getContentAnalysisAnalytics(startDate),
          moodStats: await getMoodTrendsAnalytics(startDate)
        };
        break;
      default:
        return res.status(400).json({
          message: 'Export type must be specified (users, journals, or analytics)',
          code: 'EXPORT_TYPE_REQUIRED'
        });
    }

    // Set appropriate headers for download
    const filename = `mindspace-${type}-${period}-${new Date().toISOString().split('T')[0]}.${format}`;
    
    res.setHeader('Content-Type', format === 'json' ? 'application/json' : 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    if (format === 'json') {
      res.json({
        type,
        period,
        exportedAt: new Date(),
        data: exportData
      });
    } else {
      // Convert to CSV (simplified implementation)
      res.send(convertToCSV(exportData));
    }
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({
      message: 'Failed to export data',
      code: 'EXPORT_ERROR'
    });
  }
});

// Helper functions for analytics
async function getUserEngagementAnalytics(startDate) {
  const [
    totalUsers,
    activeUsers,
    newUsers,
    userGrowth,
    retentionRate
  ] = await Promise.all([
    User.countDocuments({ isActive: true }),
    User.countDocuments({
      isActive: true,
      'streak.lastEntryDate': { $gte: startDate }
    }),
    User.countDocuments({ createdAt: { $gte: startDate } }),
    User.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
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
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]),
    // Calculate retention rate (users who wrote in both periods)
    User.aggregate([
      {
        $match: {
          isActive: true,
          'streak.lastEntryDate': { $gte: startDate }
        }
      },
      {
        $lookup: {
          from: 'journals',
          localField: '_id',
          foreignField: 'user',
          as: 'entries'
        }
      },
      {
        $project: {
          hasRecentEntries: { $gt: [{ $size: '$entries' }, 0] }
        }
      }
    ])
  ]);

  return {
    totalUsers,
    activeUsers,
    newUsers,
    userGrowth,
    retentionRate: activeUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0
  };
}

async function getContentAnalysisAnalytics(startDate) {
  const [
    totalEntries,
    sharedEntries,
    totalPrompts,
    userPrompts,
    entryGrowth,
    popularCategories
  ] = await Promise.all([
    Journal.countDocuments({ createdAt: { $gte: startDate } }),
    Journal.countDocuments({
      createdAt: { $gte: startDate },
      isPrivate: false
    }),
    Prompt.countDocuments({ isActive: true }),
    Prompt.countDocuments({ isSystemPrompt: false }),
    Journal.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
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
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]),
    Journal.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          prompt: { $exists: true, $ne: null }
        }
      },
      {
        $lookup: {
          from: 'prompts',
          localField: 'prompt',
          foreignField: '_id',
          as: 'promptData'
        }
      },
      {
        $unwind: '$promptData'
      },
      {
        $group: {
          _id: '$promptData.category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ])
  ]);

  return {
    totalEntries,
    sharedEntries,
    totalPrompts,
    userPrompts,
    entryGrowth,
    popularCategories,
    sharingRate: totalEntries > 0 ? Math.round((sharedEntries / totalEntries) * 100) : 0
  };
}

async function getMoodTrendsAnalytics(startDate) {
  const [
    moodDistribution,
    moodIntensity,
    moodTrends
  ] = await Promise.all([
    Journal.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: '$mood',
          count: { $sum: 1 },
          avgIntensity: { $avg: '$moodIntensity' }
        }
      },
      { $sort: { count: -1 } }
    ]),
    Journal.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: null,
          avgIntensity: { $avg: '$moodIntensity' },
          minIntensity: { $min: '$moodIntensity' },
          maxIntensity: { $max: '$moodIntensity' }
        }
      }
    ]),
    Journal.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
            mood: '$mood'
          },
          count: { $sum: 1 },
          avgIntensity: { $avg: '$moodIntensity' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ])
  ]);

  return {
    moodDistribution,
    moodIntensity: moodIntensity[0] || {},
    moodTrends
  };
}

async function getSystemPerformanceAnalytics() {
  // This would include database performance, API response times, etc.
  // For now, return basic metrics
  return {
    databaseConnections: 'healthy',
    apiResponseTime: '< 200ms',
    errorRate: '< 1%',
    uptime: '99.9%'
  };
}

async function getSystemHealthMetrics() {
  return {
    database: 'connected',
    aiService: 'available',
    storage: 'normal',
    performance: 'good'
  };
}

function convertToCSV(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return '';
  }

  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(item => 
    Object.values(item).map(value => 
      typeof value === 'string' && value.includes(',') ? `"${value}"` : value
    ).join(',')
  );

  return [headers, ...rows].join('\n');
}

module.exports = router;
