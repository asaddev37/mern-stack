const express = require('express');
const Journal = require('../models/Journal');
const User = require('../models/User');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/community/leaderboard
// @desc    Get community leaderboard (anonymized)
// @access  Public
router.get('/leaderboard', optionalAuth, async (req, res) => {
  try {
    const { period = 'monthly', limit = 10 } = req.query;

    let startDate = new Date();
    switch (period) {
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

    // Get users with their writing streaks and entry counts
    const leaderboard = await User.aggregate([
      {
        $match: {
          isActive: true,
          'preferences.privacy.shareAnonymously': true
        }
      },
      {
        $lookup: {
          from: 'journals',
          localField: '_id',
          foreignField: 'user',
          as: 'entries',
          pipeline: [
            {
              $match: {
                createdAt: { $gte: startDate }
              }
            }
          ]
        }
      },
      {
        $project: {
          _id: 0,
          userId: { $toString: '$_id' },
          streak: '$streak.current',
          entryCount: { $size: '$entries' },
          longestStreak: '$streak.longest',
          // Anonymize by using hash of user ID
          displayName: {
            $concat: [
              'User_',
              { $substr: [{ $toString: '$_id' }, -6, 6] }
            ]
          }
        }
      },
      {
        $sort: { 
          streak: -1, 
          entryCount: -1,
          longestStreak: -1
        }
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    // Add current user's position if authenticated
    let userPosition = null;
    if (req.user) {
      const userStats = await User.aggregate([
        {
          $match: { _id: req.user._id }
        },
        {
          $lookup: {
            from: 'journals',
            localField: '_id',
            foreignField: 'user',
            as: 'entries',
            pipeline: [
              {
                $match: {
                  createdAt: { $gte: startDate }
                }
              }
            ]
          }
        },
        {
          $project: {
            streak: '$streak.current',
            entryCount: { $size: '$entries' },
            longestStreak: '$streak.longest'
          }
        }
      ]);

      if (userStats.length > 0) {
        const userStat = userStats[0];
        
        // Count users with better stats
        const betterUsers = await User.countDocuments({
          isActive: true,
          'preferences.privacy.shareAnonymously': true,
          $or: [
            { 'streak.current': { $gt: userStat.streak } },
            { 
              'streak.current': userStat.streak,
              'streak.longest': { $gt: userStat.longestStreak }
            }
          ]
        });

        userPosition = {
          position: betterUsers + 1,
          streak: userStat.streak,
          entryCount: userStat.entryCount,
          longestStreak: userStat.longestStreak
        };
      }
    }

    res.json({
      leaderboard,
      period,
      userPosition,
      totalParticipants: await User.countDocuments({
        isActive: true,
        'preferences.privacy.shareAnonymously': true
      })
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      message: 'Failed to fetch leaderboard',
      code: 'FETCH_LEADERBOARD_ERROR'
    });
  }
});

// @route   GET /api/community/shared-content
// @desc    Get shared community content (anonymized)
// @access  Public
router.get('/shared-content', optionalAuth, async (req, res) => {
  try {
    const { 
      type = 'all', 
      category, 
      page = 1, 
      limit = 10 
    } = req.query;

    const query = {
      isPrivate: false,
      user: { $exists: true }
    };

    // Add type filter if specified
    if (type === 'prompts') {
      query.prompt = { $exists: true, $ne: null };
    } else if (type === 'entries') {
      query.content = { $exists: true, $ne: '' };
    }

    // Add category filter if specified
    if (category) {
      query.tags = { $in: [new RegExp(category, 'i')] };
    }

    const sharedContent = await Journal.find(query)
      .populate('prompt', 'title content category')
      .select('content mood tags prompt createdAt wordCount')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Anonymize the content
    const anonymizedContent = sharedContent.map(entry => ({
      id: entry._id,
      content: entry.content.substring(0, 200) + (entry.content.length > 200 ? '...' : ''),
      mood: entry.mood,
      moodEmoji: entry.moodEmoji,
      tags: entry.tags,
      prompt: entry.prompt,
      wordCount: entry.wordCount,
      createdAt: entry.createdAt,
      // Remove any identifying information
      user: undefined
    }));

    const total = await Journal.countDocuments(query);

    res.json({
      content: anonymizedContent,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalContent: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      filters: { type, category }
    });
  } catch (error) {
    console.error('Get shared content error:', error);
    res.status(500).json({
      message: 'Failed to fetch shared content',
      code: 'FETCH_SHARED_CONTENT_ERROR'
    });
  }
});

// @route   GET /api/community/stats
// @desc    Get community statistics (anonymized)
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;

    let startDate = new Date();
    switch (period) {
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

    // Get community statistics
    const [
      totalUsers,
      activeUsers,
      totalEntries,
      moodStats,
      popularTags
    ] = await Promise.all([
      // Total users
      User.countDocuments({ isActive: true }),
      
      // Active users (users who have written in the period)
      User.countDocuments({
        isActive: true,
        'streak.lastEntryDate': { $gte: startDate }
      }),
      
      // Total entries in period
      Journal.countDocuments({
        createdAt: { $gte: startDate }
      }),
      
      // Mood statistics
      Journal.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$mood',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]),
      
      // Popular tags
      Journal.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            tags: { $exists: true, $ne: [] }
          }
        },
        {
          $unwind: '$tags'
        },
        {
          $group: {
            _id: '$tags',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 10
        }
      ])
    ]);

    // Calculate average entries per user
    const avgEntriesPerUser = activeUsers > 0 ? Math.round(totalEntries / activeUsers) : 0;

    res.json({
      period,
      statistics: {
        totalUsers,
        activeUsers,
        totalEntries,
        avgEntriesPerUser,
        moodDistribution: moodStats,
        popularTags
      },
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Get community stats error:', error);
    res.status(500).json({
      message: 'Failed to fetch community statistics',
      code: 'FETCH_COMMUNITY_STATS_ERROR'
    });
  }
});

// @route   POST /api/community/share-entry
// @desc    Share a journal entry with the community
// @access  Private
router.post('/share-entry', authenticateToken, async (req, res) => {
  try {
    const { entryId } = req.body;

    if (!entryId) {
      return res.status(400).json({
        message: 'Entry ID is required',
        code: 'ENTRY_ID_REQUIRED'
      });
    }

    // Check if user has opted in to anonymous sharing
    if (!req.user.preferences.privacy.shareAnonymously) {
      return res.status(403).json({
        message: 'Anonymous sharing is not enabled in your privacy settings',
        code: 'SHARING_NOT_ENABLED'
      });
    }

    // Find and update the entry
    const entry = await Journal.findOneAndUpdate(
      {
        _id: entryId,
        user: req.user._id
      },
      { isPrivate: false },
      { new: true }
    );

    if (!entry) {
      return res.status(404).json({
        message: 'Journal entry not found',
        code: 'ENTRY_NOT_FOUND'
      });
    }

    res.json({
      message: 'Entry shared with community successfully',
      entry: {
        id: entry._id,
        isPrivate: entry.isPrivate,
        sharedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Share entry error:', error);
    res.status(500).json({
      message: 'Failed to share entry',
      code: 'SHARE_ENTRY_ERROR'
    });
  }
});

// @route   POST /api/community/unshare-entry
// @desc    Remove a journal entry from community sharing
// @access  Private
router.post('/unshare-entry', authenticateToken, async (req, res) => {
  try {
    const { entryId } = req.body;

    if (!entryId) {
      return res.status(400).json({
        message: 'Entry ID is required',
        code: 'ENTRY_ID_REQUIRED'
      });
    }

    // Find and update the entry
    const entry = await Journal.findOneAndUpdate(
      {
        _id: entryId,
        user: req.user._id
      },
      { isPrivate: true },
      { new: true }
    );

    if (!entry) {
      return res.status(404).json({
        message: 'Journal entry not found',
        code: 'ENTRY_NOT_FOUND'
      });
    }

    res.json({
      message: 'Entry removed from community sharing',
      entry: {
        id: entry._id,
        isPrivate: entry.isPrivate,
        unsharedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Unshare entry error:', error);
    res.status(500).json({
      message: 'Failed to unshare entry',
      code: 'UNSHARE_ENTRY_ERROR'
    });
  }
});

// @route   GET /api/community/trending
// @desc    Get trending topics and moods
// @access  Public
router.get('/trending', async (req, res) => {
  try {
    const { period = 'weekly' } = req.query;

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
    }

    // Get trending moods
    const trendingMoods = await Journal.aggregate([
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
      },
      {
        $limit: 5
      }
    ]);

    // Get trending tags
    const trendingTags = await Journal.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          tags: { $exists: true, $ne: [] }
        }
      },
      {
        $unwind: '$tags'
      },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Get trending prompts
    const trendingPrompts = await Journal.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          prompt: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: '$prompt',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'prompts',
          localField: '_id',
          foreignField: '_id',
          as: 'promptData'
        }
      },
      {
        $unwind: '$promptData'
      },
      {
        $project: {
          _id: 0,
          promptId: '$_id',
          title: '$promptData.title',
          category: '$promptData.category',
          usageCount: '$count'
        }
      },
      {
        $sort: { usageCount: -1 }
      },
      {
        $limit: 5
      }
    ]);

    res.json({
      period,
      trending: {
        moods: trendingMoods,
        tags: trendingTags,
        prompts: trendingPrompts
      },
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Get trending error:', error);
    res.status(500).json({
      message: 'Failed to fetch trending data',
      code: 'FETCH_TRENDING_ERROR'
    });
  }
});

module.exports = router;
