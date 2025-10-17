const express = require('express');
const Journal = require('../models/Journal');
const Insight = require('../models/Insight');
const User = require('../models/User');
const AIInsight = require('../models/AIInsight');
const aiService = require('../services/aiService');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/insights
// @desc    Get user insights
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      type, 
      category, 
      isRead, 
      page = 1, 
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { user: req.user._id };

    // Apply filters
    if (type) query.type = type;
    if (category) query.category = category;
    if (isRead !== undefined) query.isRead = isRead === 'true';

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const insights = await Insight.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Insight.countDocuments(query);

    res.json({
      insights,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalInsights: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({
      message: 'Failed to fetch insights',
      code: 'FETCH_INSIGHTS_ERROR'
    });
  }
});

// @route   GET /api/insights/dashboard
// @desc    Get insights dashboard data
// @access  Private
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get mood trends
    const moodStats = await Journal.getMoodStats(req.user._id, startDate, new Date());

    // Get recent insights
    const recentInsights = await Insight.find({
      user: req.user._id,
      createdAt: { $gte: startDate }
    })
    .sort({ createdAt: -1 })
    .limit(5);

    // Get unread insights count
    const unreadCount = await Insight.countDocuments({
      user: req.user._id,
      isRead: false
    });

    // Get high priority insights
    const highPriorityInsights = await Insight.find({
      user: req.user._id,
      priority: 'high',
      isRead: false
    }).limit(3);

    // Calculate mood trend
    const totalEntries = moodStats.reduce((sum, stat) => sum + stat.count, 0);
    const avgMood = totalEntries > 0 ? moodStats.reduce((sum, stat) => {
      const moodValues = {
        'very-sad': 1, 'sad': 2, 'neutral': 3, 'happy': 4, 'very-happy': 5,
        'anxious': 2, 'stressed': 2, 'calm': 4, 'excited': 4, 'grateful': 5,
        'frustrated': 2, 'peaceful': 4
      };
      return sum + (moodValues[stat._id] * stat.count);
    }, 0) / totalEntries : 3;

    res.json({
      period: `${days} days`,
      moodTrend: {
        average: avgMood,
        stats: moodStats,
        totalEntries
      },
      recentInsights,
      unreadCount,
      highPriorityInsights,
      summary: {
        moodStatus: avgMood >= 4 ? 'positive' : avgMood >= 3 ? 'stable' : 'needs-attention',
        insightsGenerated: recentInsights.length,
        hasHighPriority: highPriorityInsights.length > 0
      }
    });
  } catch (error) {
    console.error('Get insights dashboard error:', error);
    res.status(500).json({
      message: 'Failed to fetch insights dashboard',
      code: 'FETCH_DASHBOARD_ERROR'
    });
  }
});

// @route   POST /api/insights/generate
// @desc    Generate new insights
// @access  Private
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { type = 'mood-trend', period = 'weekly' } = req.body;
    let insight = null;

    switch (type) {
      case 'mood-trend':
        insight = await Insight.generateMoodTrendInsight(req.user._id, period);
        break;
      case 'writing-pattern':
        insight = await Insight.generateWritingPatternInsight(req.user._id);
        break;
      case 'ai-sentiment':
        insight = await generateAISentimentInsight(req.user._id, period);
        break;
      default:
        return res.status(400).json({
          message: 'Invalid insight type',
          code: 'INVALID_INSIGHT_TYPE'
        });
    }

    if (!insight) {
      return res.status(404).json({
        message: 'No data available to generate insights',
        code: 'NO_DATA_AVAILABLE'
      });
    }

    await insight.save();

    res.status(201).json({
      message: 'Insight generated successfully',
      insight
    });
  } catch (error) {
    console.error('Generate insight error:', error);
    res.status(500).json({
      message: 'Failed to generate insight',
      code: 'GENERATE_INSIGHT_ERROR'
    });
  }
});

// @route   PUT /api/insights/:id/read
// @desc    Mark insight as read
// @access  Private
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const insight = await Insight.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!insight) {
      return res.status(404).json({
        message: 'Insight not found',
        code: 'INSIGHT_NOT_FOUND'
      });
    }

    res.json({
      message: 'Insight marked as read',
      insight
    });
  } catch (error) {
    console.error('Mark insight as read error:', error);
    res.status(500).json({
      message: 'Failed to update insight',
      code: 'UPDATE_INSIGHT_ERROR'
    });
  }
});

// @route   POST /api/insights/:id/favorite
// @desc    Toggle favorite status of insight
// @access  Private
router.post('/:id/favorite', authenticateToken, async (req, res) => {
  try {
    const insight = await Insight.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!insight) {
      return res.status(404).json({
        message: 'Insight not found',
        code: 'INSIGHT_NOT_FOUND'
      });
    }

    insight.isFavorite = !insight.isFavorite;
    await insight.save();

    res.json({
      message: `Insight ${insight.isFavorite ? 'added to' : 'removed from'} favorites`,
      isFavorite: insight.isFavorite
    });
  } catch (error) {
    console.error('Toggle insight favorite error:', error);
    res.status(500).json({
      message: 'Failed to update favorite status',
      code: 'FAVORITE_ERROR'
    });
  }
});

// @route   GET /api/insights/wellness-tips
// @desc    Get AI-generated wellness tips
// @access  Private
router.get('/wellness-tips', authenticateToken, async (req, res) => {
  try {
    const { period = '7', category = 'general', timestamp, seed } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    console.log(`Generating wellness tips - Category: ${category}, Timestamp: ${timestamp}, Seed: ${seed}`);

    // Get recent mood data
    const moodStats = await Journal.getMoodStats(req.user._id, startDate, new Date());
    // Ensure plain JSON (avoid any circular/Doc refs)
    const plainMoodStats = JSON.parse(JSON.stringify(moodStats || []));
    
    // Get user preferences (default to empty object if missing)
    const userDoc = await User.findById(req.user._id).select('preferences');
    const basePreferences = (userDoc && userDoc.preferences) ? userDoc.preferences : {};

    // Add category context and uniqueness factors to user preferences
    const enhancedPreferences = {
      ...basePreferences,
      requestedCategory: category,
      timestamp: timestamp,
      seed: seed,
      requestId: `${timestamp}_${seed}`,
      userId: req.user._id.toString()
    };
    
    // Generate wellness tips using AI with category context
    const tips = await aiService.generateWellnessTips(plainMoodStats, enhancedPreferences, category);

    console.log(`Successfully generated tips for category: ${category}`);

    res.json({
      tips,
      basedOn: {
        period: `${days} days`,
        category: category,
        moodData: plainMoodStats,
        requestId: enhancedPreferences.requestId
      },
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Get wellness tips error:', error?.response?.data || error?.message || error);
    res.status(500).json({
      message: 'Failed to generate wellness tips',
      code: 'WELLNESS_TIPS_ERROR'
    });
  }
});

// @route   GET /api/insights/wellness-tips/stream
// @desc    Stream AI-generated wellness tips (SSE)
// @access  Private
router.get('/wellness-tips/stream', authenticateToken, async (req, res) => {
  try {
    const { period = '7', category = 'general', timestamp, seed } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders && res.flushHeaders();

    const sendEvent = (event, data) => {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // Initial event
    sendEvent('start', { message: 'Streaming started' });

    const moodStats = await Journal.getMoodStats(req.user._id, startDate, new Date());
    const user = await User.findById(req.user._id).select('preferences');

    const enhancedPreferences = {
      ...user.preferences,
      requestedCategory: category,
      timestamp: timestamp || Date.now(),
      seed: seed || Math.random().toString(36).substring(7),
      requestId: `${timestamp || Date.now()}_${seed || Math.random().toString(36).substring(7)}`,
      userId: req.user._id.toString()
    };

    // Build prompt and stream
    const { prompt, categoryContext } = aiService.buildWellnessTipsPrompt(moodStats, enhancedPreferences, category);

    let accumulated = '';
    await aiService.generateResponseStream(prompt, (delta) => {
      accumulated += delta;
      // Stream raw text deltas to client
      sendEvent('delta', { text: delta });
    });

    // Try finalize JSON
    let payload;
    try {
      const tips = JSON.parse(accumulated);
      payload = {
        tips: tips.tips || aiService.getDefaultTipsForCategory(category),
        focus: tips.focus || categoryContext,
        encouragement: tips.encouragement || aiService.getDefaultEncouragementForCategory(category),
        basedOn: {
          period: `${days} days`,
          category,
          moodData: moodStats,
          requestId: enhancedPreferences.requestId
        },
        generatedAt: new Date()
      };
    } catch (_) {
      const fallback = aiService.parseFallbackTips('', category);
      payload = {
        ...fallback,
        basedOn: {
          period: `${days} days`,
          category,
          moodData: moodStats,
          requestId: enhancedPreferences.requestId
        },
        generatedAt: new Date()
      };
    }

    sendEvent('complete', payload);
    res.end();
  } catch (error) {
    console.error('Stream wellness tips error:', error);
    // Send error event and end
    res.write(`event: error\n`);
    res.write(`data: ${JSON.stringify({ message: 'Failed to generate wellness tips' })}\n\n`);
    res.end();
  }
});

// @route   POST /api/insights/analyze-entry
// @desc    Analyze a specific journal entry with AI
// @access  Private
router.post('/analyze-entry', authenticateToken, async (req, res) => {
  try {
    const { entryId } = req.body;

    if (!entryId) {
      return res.status(400).json({
        message: 'Entry ID is required',
        code: 'ENTRY_ID_REQUIRED'
      });
    }

    // Get the journal entry
    const entry = await Journal.findOne({
      _id: entryId,
      user: req.user._id
    });

    if (!entry) {
      return res.status(404).json({
        message: 'Journal entry not found',
        code: 'ENTRY_NOT_FOUND'
      });
    }

    // Analyze with AI
    const analysis = await aiService.analyzeSentiment(entry.content);

    // Update the entry with AI analysis
    entry.aiAnalysis = {
      ...analysis,
      analyzedAt: new Date()
    };
    await entry.save();

    res.json({
      message: 'Entry analyzed successfully',
      analysis,
      entry: {
        id: entry._id,
        content: entry.content,
        mood: entry.mood,
        createdAt: entry.createdAt
      }
    });
  } catch (error) {
    console.error('Analyze entry error:', error);
    res.status(500).json({
      message: 'Failed to analyze entry',
      code: 'ANALYZE_ENTRY_ERROR'
    });
  }
});

// @route   GET /api/insights/ai-health
// @desc    Check AI service health
// @access  Private
router.get('/ai-health', authenticateToken, async (req, res) => {
  try {
    const health = await aiService.checkServerHealth();
    
    res.json({
      aiService: health,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('AI health check error:', error);
    res.status(500).json({
      message: 'Failed to check AI service health',
      code: 'AI_HEALTH_ERROR'
    });
  }
});

// @route   POST /api/insights/chat/stream
// @desc    Stream chat responses from Gemini (SSE)
// @access  Private
router.post('/chat/stream', authenticateToken, async (req, res) => {
  try {
    const { message, history = [], context = {} } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ message: 'Message is required', code: 'MESSAGE_REQUIRED' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders && res.flushHeaders();

    const sendEvent = (event, data) => {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    sendEvent('start', { message: 'Streaming started' });

    const runtimeContext = {
      userId: req.user._id.toString(),
      name: req.user.name,
      timestamp: Date.now(),
      ...context
    };

    const prompt = aiService.buildChatPrompt(message, runtimeContext, history);

    let accumulated = '';
    await aiService.generateResponseStream(prompt, (delta) => {
      accumulated += delta;
      if (accumulated.length > 12000) accumulated = accumulated.slice(-12000);
      sendEvent('delta', { text: delta });
    });

    // Stream is complete - no need to send final text as it's already streamed
    res.end();
  } catch (error) {
    console.error('Chat stream error:', error?.message || error);
    res.write(`event: error\n`);
    res.write(`data: ${JSON.stringify({ message: 'Failed to generate chat response' })}\n\n`);
    res.end();
  }
});

// @route   GET /api/insights/summary/stream
// @desc    Stream AI insights summary (SSE)
// @access  Private
router.get('/summary/stream', authenticateToken, async (req, res) => {
      try {
        const { period = '7', refresh = 'false' } = req.query;
        const days = parseInt(period);
        const forceRefresh = refresh === 'true';
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders && res.flushHeaders();

        const sendEvent = (event, data) => {
          res.write(`event: ${event}\n`);
          res.write(`data: ${JSON.stringify(data)}\n\n`);
        };

        sendEvent('start', { message: 'Generating insights summary...' });

        // Only use cached insight if not forcing refresh
        if (!forceRefresh) {
          const cachedInsight = await AIInsight.getOrCreateInsight(req.user._id, 'summary', period);
          
          if (cachedInsight) {
            console.log('Using cached AI insight:', cachedInsight.summary.substring(0, 50) + '...');
            const payload = {
              summary: cachedInsight.summary,
              highlight: cachedInsight.highlight
            };
            sendEvent('complete', payload);
            res.end();
            return;
          }
        } else {
          console.log('Force refresh requested - generating new AI insight');
        }

        // If no cached insight, generate new one
        const moodStats = await Journal.getMoodStats(req.user._id, startDate, new Date());
        const recentInsights = await Insight.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(5);
        const recentEntries = await Journal.find({ user: req.user._id, createdAt: { $gte: startDate } }).sort({ createdAt: -1 }).limit(10);

        console.log('User data for AI summary:', {
          userId: req.user._id,
          moodStats,
          recentInsights: recentInsights.length,
          recentEntries: recentEntries.length
        });

        const prompt = aiService.buildInsightsSummaryPrompt(moodStats, recentInsights, recentEntries);
        console.log('Generated prompt for insights summary:', prompt.substring(0, 200) + '...');

        let accumulated = '';
        await aiService.generateResponseStream(prompt, (delta) => {
          accumulated += delta;
          if (accumulated.length > 8000) accumulated = accumulated.slice(-8000);
          sendEvent('delta', { text: delta });
        });
        
        console.log('Accumulated response:', accumulated.substring(0, 200) + '...');

        let payload;
        try {
          // Clean the accumulated response - remove markdown code blocks
          let cleanResponse = accumulated.trim();
          
          // Remove ```json and ``` markers
          if (cleanResponse.startsWith('```json')) {
            cleanResponse = cleanResponse.replace(/^```json\s*/, '');
          }
          if (cleanResponse.startsWith('```')) {
            cleanResponse = cleanResponse.replace(/^```\s*/, '');
          }
          if (cleanResponse.endsWith('```')) {
            cleanResponse = cleanResponse.replace(/\s*```$/, '');
          }
          
          console.log('Cleaned response for parsing:', cleanResponse.substring(0, 200));
          
          // Try to extract JSON from the response
          let jsonText = cleanResponse;
          
          // If response contains incomplete JSON, try to extract what we can
          if (jsonText.includes('"summary"') && jsonText.includes('"highlight"')) {
            // Try to find the JSON object boundaries
            const jsonStart = jsonText.indexOf('{');
            const jsonEnd = jsonText.lastIndexOf('}');
            
            if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
              jsonText = jsonText.substring(jsonStart, jsonEnd + 1);
            }
          }
          
          const json = JSON.parse(jsonText);
          payload = {
            summary: json.summary || 'Keep up your wellness journey — small steps matter. 🌟',
            highlight: json.highlight || 'Your progress matters, one day at a time. 💙'
          };
          
          // Save successful AI response to database
          if (payload.summary && payload.highlight && 
              payload.summary !== 'Keep up your wellness journey — small steps matter. 🌟') {
            await AIInsight.saveInsight(
              req.user._id, 
              'summary', 
              period, 
              payload.summary, 
              payload.highlight, 
              moodStats
            );
            console.log('Saved AI insight to database');
          }
          
          console.log('Successfully parsed JSON payload:', payload);
        } catch (parseError) {
          console.error('JSON parse error:', parseError.message);
          console.error('Failed to parse response:', accumulated.substring(0, 300));
          
          // Try to extract summary and highlight manually from the response
          let extractedSummary = '';
          let extractedHighlight = '';
          
          // Look for summary in the response
          const summaryMatch = accumulated.match(/"summary":\s*"([^"]+)"/);
          if (summaryMatch) {
            extractedSummary = summaryMatch[1];
          }
          
          // Look for highlight in the response
          const highlightMatch = accumulated.match(/"highlight":\s*"([^"]+)"/);
          if (highlightMatch) {
            extractedHighlight = highlightMatch[1];
          }
          
          if (extractedSummary && extractedHighlight) {
            payload = {
              summary: extractedSummary,
              highlight: extractedHighlight
            };
            console.log('Extracted insights manually:', payload);
            
            // Save extracted insights to database
            await AIInsight.saveInsight(
              req.user._id, 
              'summary', 
              period, 
              payload.summary, 
              payload.highlight, 
              moodStats
            );
            console.log('Saved extracted AI insight to database');
          } else {
            // Try to get any cached insight as fallback
            const fallbackInsight = await AIInsight.findOne({
              user: req.user._id,
              type: 'summary',
              isActive: true
            }).sort({ createdAt: -1 });
            
            if (fallbackInsight) {
              payload = {
                summary: fallbackInsight.summary,
                highlight: fallbackInsight.highlight
              };
              console.log('Using fallback cached insight');
            } else {
              payload = {
                summary: 'Keep up your wellness journey — small steps matter. 🌟',
                highlight: 'Your progress matters, one day at a time. 💙'
              };
            }
          }
        }

        sendEvent('complete', payload);
        res.end();
      } catch (error) {
        console.error('Stream insights summary error:', error);
        res.write(`event: error\n`);
        res.write(`data: ${JSON.stringify({ message: 'Failed to generate insights summary' })}\n\n`);
        res.end();
      }
    });

// @route   GET /api/insights/dashboard-summary/stream
// @desc    Stream AI dashboard summary (SSE)
// @access  Private
router.get('/dashboard-summary/stream', authenticateToken, async (req, res) => {
  try {
    const { period = '7', refresh = 'false' } = req.query;
    const days = parseInt(period);
    const forceRefresh = refresh === 'true';
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders && res.flushHeaders();

    const sendEvent = (event, data) => {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    sendEvent('start', { message: 'Streaming started' });

    // Only use cached insight if not forcing refresh
    if (!forceRefresh) {
      const cachedInsight = await AIInsight.getOrCreateInsight(req.user._id, 'dashboard', period);
      
      if (cachedInsight) {
        console.log('Using cached dashboard insight:', cachedInsight.summary.substring(0, 50) + '...');
        const payload = {
          summary: cachedInsight.summary,
          highlight: cachedInsight.highlight
        };
        sendEvent('complete', payload);
        res.end();
        return;
      }
    } else {
      console.log('Force refresh requested - generating new dashboard AI insight');
    }

    // If no cached insight, use the summary insight as fallback
    const summaryInsight = await AIInsight.findOne({
      user: req.user._id,
      type: 'summary',
      isActive: true
    }).sort({ createdAt: -1 });

    if (summaryInsight) {
      console.log('Using summary insight for dashboard:', summaryInsight.summary.substring(0, 50) + '...');
      const payload = {
        summary: summaryInsight.summary,
        highlight: summaryInsight.highlight
      };
      sendEvent('complete', payload);
      res.end();
      return;
    }

    // If no cached insights at all, generate new one
    const moodStats = await Journal.getMoodStats(req.user._id, startDate, new Date());
    const recentInsights = await Insight.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(3);

    const prompt = aiService.buildDashboardSummaryPrompt(moodStats, recentInsights);

    let accumulated = '';
    await aiService.generateResponseStream(prompt, (delta) => {
      accumulated += delta;
      sendEvent('delta', { text: delta });
    });

    let payload;
    try {
      // Clean the accumulated response - remove markdown code blocks
      let cleanResponse = accumulated.trim();
      
      // Remove ```json and ``` markers
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/^```json\s*/, '');
      }
      if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/^```\s*/, '');
      }
      if (cleanResponse.endsWith('```')) {
        cleanResponse = cleanResponse.replace(/\s*```$/, '');
      }
      
      console.log('Dashboard - Cleaned response for parsing:', cleanResponse.substring(0, 200));
      
      // Try to extract JSON from the response
      let jsonText = cleanResponse;
      
      // If response contains incomplete JSON, try to extract what we can
      if (jsonText.includes('"summary"') && jsonText.includes('"highlight"')) {
        // Try to find the JSON object boundaries
        const jsonStart = jsonText.indexOf('{');
        const jsonEnd = jsonText.lastIndexOf('}');
        
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          jsonText = jsonText.substring(jsonStart, jsonEnd + 1);
        }
      }
      
      const json = JSON.parse(jsonText);
      payload = {
        summary: json.summary || 'Keep up your wellness journey — small steps matter.',
        highlight: json.highlight || 'Write a short reflection today.'
      };
      
      // Save successful AI response to database
      if (payload.summary && payload.highlight && 
          payload.summary !== 'Keep up your wellness journey — small steps matter.') {
        await AIInsight.saveInsight(
          req.user._id, 
          'dashboard', 
          period, 
          payload.summary, 
          payload.highlight, 
          moodStats
        );
        console.log('Saved dashboard AI insight to database');
      }
      
      console.log('Dashboard - Successfully parsed JSON payload:', payload);
    } catch (parseError) {
      console.error('Dashboard - JSON parse error:', parseError.message);
      console.error('Dashboard - Failed to parse response:', accumulated.substring(0, 300));
      
      // Try to extract summary and highlight manually from the response
      let extractedSummary = '';
      let extractedHighlight = '';
      
      // Look for summary in the response
      const summaryMatch = accumulated.match(/"summary":\s*"([^"]+)"/);
      if (summaryMatch) {
        extractedSummary = summaryMatch[1];
      }
      
      // Look for highlight in the response
      const highlightMatch = accumulated.match(/"highlight":\s*"([^"]+)"/);
      if (highlightMatch) {
        extractedHighlight = highlightMatch[1];
      }
      
      if (extractedSummary && extractedHighlight) {
        payload = {
          summary: extractedSummary,
          highlight: extractedHighlight
        };
        console.log('Dashboard - Extracted insights manually:', payload);
        
        // Save extracted insights to database
        await AIInsight.saveInsight(
          req.user._id, 
          'dashboard', 
          period, 
          payload.summary, 
          payload.highlight, 
          moodStats
        );
        console.log('Saved extracted dashboard AI insight to database');
      } else {
        // Try to get any cached insight as fallback
        const fallbackInsight = await AIInsight.findOne({
          user: req.user._id,
          type: 'dashboard',
          isActive: true
        }).sort({ createdAt: -1 });
        
        if (fallbackInsight) {
          payload = {
            summary: fallbackInsight.summary,
            highlight: fallbackInsight.highlight
          };
          console.log('Dashboard - Using fallback cached insight');
        } else {
          payload = {
            summary: 'Keep up your wellness journey — small steps matter.',
            highlight: 'Write a short reflection today.'
          };
        }
      }
    }

    sendEvent('complete', payload);
    res.end();
  } catch (error) {
    console.error('Stream dashboard summary error:', error);
    res.write(`event: error\n`);
    res.write(`data: ${JSON.stringify({ message: 'Failed to generate dashboard summary' })}\n\n`);
    res.end();
  }
});

// @route   GET /api/insights/encouragement/stream
// @desc    Stream AI encouragement text (SSE)
// @access  Private
router.get('/encouragement/stream', authenticateToken, async (req, res) => {
  try {
    const { category = 'general' } = req.query;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders && res.flushHeaders();

    const sendEvent = (event, data) => {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    sendEvent('start', { message: 'Streaming started' });

    const categoryMap = {
      general: 'general wellness and self-care',
      stress: 'stress management and relaxation',
      motivation: 'motivation and goal-setting',
      mindfulness: 'mindfulness and present-moment awareness',
      social: 'social connection and community',
      physical: 'physical wellness and movement',
      sleep: 'sleep hygiene and rest',
      gratitude: 'gratitude and appreciation'
    };
    const categoryContext = categoryMap[category] || categoryMap.general;

    const timestamp = Date.now();
    const seed = Math.random().toString(36).substring(7);
    const prompt = aiService.buildEncouragementPrompt(categoryContext, {
      timestamp,
      seed,
      userId: req.user._id.toString()
    });

    let accumulated = '';
    await aiService.generateResponseStream(prompt, (delta) => {
      // Limit accumulated length to prevent oversized buffers
      accumulated += delta;
      if (accumulated.length > 8000) accumulated = accumulated.slice(-8000);
      sendEvent('delta', { text: delta });
    });

    let payload;
    try {
      const json = JSON.parse(accumulated);
      payload = {
        encouragement: json.encouragement || 'You are doing great — keep going!'
      };
    } catch (_) {
      payload = { encouragement: 'You are doing great — keep going!' };
    }

    sendEvent('complete', payload);
    res.end();
  } catch (error) {
    console.error('Stream encouragement error:', error);
    res.write(`event: error\n`);
    res.write(`data: ${JSON.stringify({ message: 'Failed to generate encouragement' })}\n\n`);
    res.end();
  }
});
// Helper function to generate AI sentiment insight
async function generateAISentimentInsight(userId, period) {
  try {
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
    }

    const entries = await Journal.find({
      user: userId,
      createdAt: { $gte: startDate, $lte: endDate },
      content: { $exists: true, $ne: '' }
    }).sort({ createdAt: -1 }).limit(10);

    if (entries.length === 0) {
      return null;
    }

    // Analyze entries with AI
    const analyses = await aiService.batchAnalyzeSentiment(entries);
    
    // Calculate overall sentiment
    const sentiments = analyses.map(a => a.analysis.sentiment);
    const positiveCount = sentiments.filter(s => s === 'positive').length;
    const negativeCount = sentiments.filter(s => s === 'negative').length;
    const neutralCount = sentiments.filter(s => s === 'neutral').length;
    
    const total = sentiments.length;
    const overallSentiment = positiveCount > negativeCount ? 'positive' : 
                           negativeCount > positiveCount ? 'negative' : 'neutral';
    
    const confidence = Math.max(positiveCount, negativeCount, neutralCount) / total;

    let title, description, category;
    
    if (overallSentiment === 'positive') {
      title = 'Positive Sentiment Trend';
      description = `Your recent entries show a positive emotional pattern. You've been expressing positive sentiments in ${Math.round((positiveCount/total)*100)}% of your recent entries.`;
      category = 'positive';
    } else if (overallSentiment === 'negative') {
      title = 'Supportive Sentiment Analysis';
      description = `Your recent entries show some challenging emotions. Consider reaching out for support or trying some wellness activities.`;
      category = 'concern';
    } else {
      title = 'Balanced Emotional State';
      description = `Your recent entries show a balanced emotional state with mixed sentiments. This is normal and healthy.`;
      category = 'neutral';
    }

    return new Insight({
      user: userId,
      type: 'sentiment-analysis',
      title,
      description,
      data: {
        overallSentiment,
        confidence,
        breakdown: {
          positive: positiveCount,
          negative: negativeCount,
          neutral: neutralCount,
          total
        },
        analyses: analyses.map(a => ({
          entryId: a.entryId,
          sentiment: a.analysis.sentiment,
          confidence: a.analysis.confidence
        }))
      },
      period: {
        startDate,
        endDate,
        type: period
      },
      category,
      generatedBy: 'ai'
    });
  } catch (error) {
    console.error('Generate AI sentiment insight error:', error);
    return null;
  }
}

module.exports = router;
