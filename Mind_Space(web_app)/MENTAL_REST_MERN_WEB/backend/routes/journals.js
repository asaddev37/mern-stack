const express = require('express');
const Journal = require('../models/Journal');
const User = require('../models/User');
const Prompt = require('../models/Prompt');
const { authenticateToken } = require('../middleware/auth');
const { validateJournalEntry } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/journals
// @desc    Get user's journal entries
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      mood, 
      startDate, 
      endDate, 
      tags,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { user: req.user._id };

    // Apply filters
    if (mood) {
      query.mood = mood;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray };
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const entries = await Journal.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('prompt', 'title content category')
      .select('-aiAnalysis.keywords'); // Exclude sensitive AI data

    const total = await Journal.countDocuments(query);

    res.json({
      entries,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalEntries: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get journals error:', error);
    res.status(500).json({
      message: 'Failed to fetch journal entries',
      code: 'FETCH_JOURNALS_ERROR'
    });
  }
});

// @route   GET /api/journals/:id
// @desc    Get specific journal entry
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const entry = await Journal.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('prompt', 'title content category');

    if (!entry) {
      return res.status(404).json({
        message: 'Journal entry not found',
        code: 'ENTRY_NOT_FOUND'
      });
    }

    res.json({ entry });
  } catch (error) {
    console.error('Get journal entry error:', error);
    res.status(500).json({
      message: 'Failed to fetch journal entry',
      code: 'FETCH_ENTRY_ERROR'
    });
  }
});

// @route   POST /api/journals
// @desc    Create new journal entry
// @access  Private
router.post('/', authenticateToken, validateJournalEntry, async (req, res) => {
  try {
    const { title, content, mood, moodIntensity, tags, promptId, isPrivate } = req.body;

    // Create journal entry
    const entry = new Journal({
      user: req.user._id,
      title,
      content,
      mood,
      moodIntensity,
      tags: tags || [],
      isPrivate: isPrivate !== undefined ? isPrivate : true,
      prompt: promptId || null
    });

    await entry.save();

    // Update user's writing streak
    await req.user.updateStreak();

    // Increment prompt usage if applicable
    if (promptId) {
      await Prompt.findByIdAndUpdate(promptId, { $inc: { usageCount: 1 } });
    }

    // Populate the entry for response
    await entry.populate('prompt', 'title content category');

    res.status(201).json({
      message: 'Journal entry created successfully',
      entry
    });
  } catch (error) {
    console.error('Create journal entry error:', error);
    res.status(500).json({
      message: 'Failed to create journal entry',
      code: 'CREATE_ENTRY_ERROR'
    });
  }
});

// @route   PUT /api/journals/:id
// @desc    Update journal entry
// @access  Private
router.put('/:id', authenticateToken, validateJournalEntry, async (req, res) => {
  try {
    const { title, content, mood, moodIntensity, tags, isPrivate } = req.body;

    const entry = await Journal.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!entry) {
      return res.status(404).json({
        message: 'Journal entry not found',
        code: 'ENTRY_NOT_FOUND'
      });
    }

    // Update entry
    entry.title = title || entry.title;
    entry.content = content;
    entry.mood = mood;
    entry.moodIntensity = moodIntensity || entry.moodIntensity;
    entry.tags = tags || entry.tags;
    entry.isPrivate = isPrivate !== undefined ? isPrivate : entry.isPrivate;

    await entry.save();
    await entry.populate('prompt', 'title content category');

    res.json({
      message: 'Journal entry updated successfully',
      entry
    });
  } catch (error) {
    console.error('Update journal entry error:', error);
    res.status(500).json({
      message: 'Failed to update journal entry',
      code: 'UPDATE_ENTRY_ERROR'
    });
  }
});

// @route   DELETE /api/journals/:id
// @desc    Delete journal entry
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const entry = await Journal.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!entry) {
      return res.status(404).json({
        message: 'Journal entry not found',
        code: 'ENTRY_NOT_FOUND'
      });
    }

    res.json({
      message: 'Journal entry deleted successfully'
    });
  } catch (error) {
    console.error('Delete journal entry error:', error);
    res.status(500).json({
      message: 'Failed to delete journal entry',
      code: 'DELETE_ENTRY_ERROR'
    });
  }
});

// @route   POST /api/journals/:id/favorite
// @desc    Toggle favorite status of journal entry
// @access  Private
router.post('/:id/favorite', authenticateToken, async (req, res) => {
  try {
    const entry = await Journal.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!entry) {
      return res.status(404).json({
        message: 'Journal entry not found',
        code: 'ENTRY_NOT_FOUND'
      });
    }

    entry.isFavorite = !entry.isFavorite;
    await entry.save();

    res.json({
      message: `Entry ${entry.isFavorite ? 'added to' : 'removed from'} favorites`,
      isFavorite: entry.isFavorite
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({
      message: 'Failed to update favorite status',
      code: 'FAVORITE_ERROR'
    });
  }
});

// @route   GET /api/journals/stats/overview
// @desc    Get journal statistics overview
// @access  Private
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get mood statistics
    const moodStats = await Journal.getMoodStats(req.user._id, startDate, new Date());

    // Get total entries in period
    const totalEntries = await Journal.countDocuments({
      user: req.user._id,
      createdAt: { $gte: startDate }
    });

    // Get writing streaks
    const streaks = await Journal.getWritingStreaks(req.user._id);

    // Get favorite entries count
    const favoriteCount = await Journal.countDocuments({
      user: req.user._id,
      isFavorite: true
    });

    // Get average word count
    const avgWordCount = await Journal.aggregate([
      { $match: { user: req.user._id, createdAt: { $gte: startDate } } },
      { $group: { _id: null, avgWords: { $avg: '$wordCount' } } }
    ]);

    res.json({
      period: `${days} days`,
      totalEntries,
      favoriteCount,
      moodStats,
      writingStreaks: streaks.slice(0, 7), // Last 7 days
      averageWordCount: avgWordCount[0]?.avgWords || 0
    });
  } catch (error) {
    console.error('Get journal stats error:', error);
    res.status(500).json({
      message: 'Failed to fetch journal statistics',
      code: 'FETCH_STATS_ERROR'
    });
  }
});

// @route   GET /api/journals/search
// @desc    Search journal entries
// @access  Private
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        message: 'Search query must be at least 2 characters long',
        code: 'INVALID_SEARCH_QUERY'
      });
    }

    const query = {
      user: req.user._id,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    };

    const entries = await Journal.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('prompt', 'title content category')
      .select('-aiAnalysis.keywords');

    const total = await Journal.countDocuments(query);

    res.json({
      entries,
      query: q,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalResults: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Search journals error:', error);
    res.status(500).json({
      message: 'Failed to search journal entries',
      code: 'SEARCH_ERROR'
    });
  }
});

module.exports = router;
