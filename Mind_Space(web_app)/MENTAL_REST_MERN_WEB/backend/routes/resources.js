const express = require('express');
const Prompt = require('../models/Prompt');
const User = require('../models/User');
const aiService = require('../services/aiService');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validatePrompt, validateGoal } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/resources/prompts
// @desc    Get journal prompts
// @access  Public
router.get('/prompts', optionalAuth, async (req, res) => {
  try {
    const { 
      category, 
      difficulty, 
      limit = 10, 
      random = false,
      popular = false 
    } = req.query;

    let prompts;

    if (random) {
      // Get random prompt
      const randomPrompts = await Prompt.getRandomPrompt(category, difficulty);
      prompts = randomPrompts;
    } else if (popular) {
      // Get popular prompts
      prompts = await Prompt.getPopularPrompts(parseInt(limit));
    } else {
      // Get prompts with filters
      const query = { isActive: true };
      if (category) query.category = category;
      if (difficulty) query.difficulty = difficulty;

      prompts = await Prompt.find(query)
        .sort({ usageCount: -1, createdAt: -1 })
        .limit(parseInt(limit));
    }

    res.json({
      prompts,
      filters: { category, difficulty, limit, random, popular }
    });
  } catch (error) {
    console.error('Get prompts error:', error);
    res.status(500).json({
      message: 'Failed to fetch prompts',
      code: 'FETCH_PROMPTS_ERROR'
    });
  }
});

// @route   GET /api/resources/prompts/:id
// @desc    Get specific prompt
// @access  Public
router.get('/prompts/:id', optionalAuth, async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.id);

    if (!prompt || !prompt.isActive) {
      return res.status(404).json({
        message: 'Prompt not found',
        code: 'PROMPT_NOT_FOUND'
      });
    }

    res.json({ prompt });
  } catch (error) {
    console.error('Get prompt error:', error);
    res.status(500).json({
      message: 'Failed to fetch prompt',
      code: 'FETCH_PROMPT_ERROR'
    });
  }
});

// @route   POST /api/resources/prompts
// @desc    Create new prompt (admin only)
// @access  Private (Admin)
router.post('/prompts', authenticateToken, validatePrompt, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Admin access required',
        code: 'ADMIN_REQUIRED'
      });
    }

    const prompt = new Prompt({
      ...req.body,
      createdBy: req.user._id,
      isSystemPrompt: false
    });

    await prompt.save();

    res.status(201).json({
      message: 'Prompt created successfully',
      prompt
    });
  } catch (error) {
    console.error('Create prompt error:', error);
    res.status(500).json({
      message: 'Failed to create prompt',
      code: 'CREATE_PROMPT_ERROR'
    });
  }
});

// @route   POST /api/resources/generate-prompts
// @desc    Generate AI prompts
// @access  Private
router.post('/generate-prompts', authenticateToken, async (req, res) => {
  try {
    const { category = 'general', userMood = 'neutral' } = req.body;

    // Generate prompts using AI
    const generatedPrompts = await aiService.generateJournalPrompts(category, userMood);

    res.json({
      message: 'Prompts generated successfully',
      prompts: generatedPrompts.prompts,
      metadata: {
        category,
        difficulty: generatedPrompts.difficulty,
        estimatedTime: generatedPrompts.estimatedTime,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Generate prompts error:', error);
    res.status(500).json({
      message: 'Failed to generate prompts',
      code: 'GENERATE_PROMPTS_ERROR'
    });
  }
});

// @route   GET /api/resources/goals
// @desc    Get user's wellness goals
// @access  Private
router.get('/goals', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('wellnessGoals');
    
    res.json({
      goals: user.wellnessGoals,
      totalGoals: user.wellnessGoals.length,
      completedGoals: user.wellnessGoals.filter(goal => goal.isCompleted).length
    });
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({
      message: 'Failed to fetch goals',
      code: 'FETCH_GOALS_ERROR'
    });
  }
});

// @route   POST /api/resources/goals
// @desc    Create new wellness goal
// @access  Private
router.post('/goals', authenticateToken, validateGoal, async (req, res) => {
  try {
    const { title, description, targetValue, unit, deadline } = req.body;

    const goal = {
      title,
      description,
      targetValue,
      unit,
      deadline: deadline ? new Date(deadline) : null,
      createdAt: new Date()
    };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { wellnessGoals: goal } },
      { new: true }
    );

    const newGoal = user.wellnessGoals[user.wellnessGoals.length - 1];

    res.status(201).json({
      message: 'Goal created successfully',
      goal: newGoal
    });
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({
      message: 'Failed to create goal',
      code: 'CREATE_GOAL_ERROR'
    });
  }
});

// @route   PUT /api/resources/goals/:goalId
// @desc    Update wellness goal
// @access  Private
router.put('/goals/:goalId', authenticateToken, validateGoal, async (req, res) => {
  try {
    const { goalId } = req.params;
    const { title, description, targetValue, unit, deadline, currentValue, isCompleted } = req.body;

    const updateData = {};
    if (title !== undefined) updateData['wellnessGoals.$.title'] = title;
    if (description !== undefined) updateData['wellnessGoals.$.description'] = description;
    if (targetValue !== undefined) updateData['wellnessGoals.$.targetValue'] = targetValue;
    if (unit !== undefined) updateData['wellnessGoals.$.unit'] = unit;
    if (deadline !== undefined) updateData['wellnessGoals.$.deadline'] = deadline ? new Date(deadline) : null;
    if (currentValue !== undefined) updateData['wellnessGoals.$.currentValue'] = currentValue;
    if (isCompleted !== undefined) updateData['wellnessGoals.$.isCompleted'] = isCompleted;

    const user = await User.findOneAndUpdate(
      { 
        _id: req.user._id,
        'wellnessGoals._id': goalId
      },
      { $set: updateData },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        message: 'Goal not found',
        code: 'GOAL_NOT_FOUND'
      });
    }

    const updatedGoal = user.wellnessGoals.find(goal => goal._id.toString() === goalId);

    res.json({
      message: 'Goal updated successfully',
      goal: updatedGoal
    });
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({
      message: 'Failed to update goal',
      code: 'UPDATE_GOAL_ERROR'
    });
  }
});

// @route   DELETE /api/resources/goals/:goalId
// @desc    Delete wellness goal
// @access  Private
router.delete('/goals/:goalId', authenticateToken, async (req, res) => {
  try {
    const { goalId } = req.params;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { wellnessGoals: { _id: goalId } } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      message: 'Goal deleted successfully'
    });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({
      message: 'Failed to delete goal',
      code: 'DELETE_GOAL_ERROR'
    });
  }
});

// @route   GET /api/resources/exercises
// @desc    Get mindfulness exercises
// @access  Public
router.get('/exercises', optionalAuth, async (req, res) => {
  try {
    const { category, duration } = req.query;

    // Static mindfulness exercises (in a real app, these would be in the database)
    const exercises = [
      {
        id: 'breathing-5min',
        title: '5-Minute Breathing Exercise',
        description: 'A simple breathing exercise to help you relax and center yourself.',
        category: 'breathing',
        duration: 5,
        instructions: [
          'Find a comfortable seated position',
          'Close your eyes and take a deep breath in',
          'Hold for 4 seconds, then exhale slowly for 6 seconds',
          'Repeat this cycle for 5 minutes',
          'Focus on the sensation of your breath'
        ],
        benefits: ['Reduces stress', 'Improves focus', 'Calms the mind']
      },
      {
        id: 'body-scan-10min',
        title: '10-Minute Body Scan',
        description: 'A guided meditation to help you connect with your body and release tension.',
        category: 'meditation',
        duration: 10,
        instructions: [
          'Lie down comfortably or sit in a relaxed position',
          'Start by focusing on your toes',
          'Slowly move your attention up through your body',
          'Notice any sensations without judgment',
          'Spend 1-2 minutes on each body part'
        ],
        benefits: ['Reduces physical tension', 'Improves body awareness', 'Promotes relaxation']
      },
      {
        id: 'gratitude-3min',
        title: '3-Minute Gratitude Practice',
        description: 'A quick gratitude exercise to shift your mindset to positivity.',
        category: 'gratitude',
        duration: 3,
        instructions: [
          'Think of three things you\'re grateful for today',
          'They can be big or small',
          'For each item, take a moment to really feel the gratitude',
          'Notice how this makes you feel'
        ],
        benefits: ['Increases happiness', 'Reduces negative emotions', 'Improves overall well-being']
      },
      {
        id: 'mindful-walking-15min',
        title: '15-Minute Mindful Walking',
        description: 'Turn your walk into a mindfulness practice.',
        category: 'movement',
        duration: 15,
        instructions: [
          'Walk at a comfortable pace',
          'Focus on the sensation of your feet touching the ground',
          'Notice your breathing as you walk',
          'Observe your surroundings without judgment',
          'If your mind wanders, gently return to your walking'
        ],
        benefits: ['Combines exercise with mindfulness', 'Reduces anxiety', 'Improves mood']
      }
    ];

    let filteredExercises = exercises;

    if (category) {
      filteredExercises = filteredExercises.filter(exercise => 
        exercise.category === category
      );
    }

    if (duration) {
      const durationNum = parseInt(duration);
      filteredExercises = filteredExercises.filter(exercise => 
        exercise.duration <= durationNum
      );
    }

    res.json({
      exercises: filteredExercises,
      totalExercises: filteredExercises.length,
      categories: [...new Set(exercises.map(e => e.category))]
    });
  } catch (error) {
    console.error('Get exercises error:', error);
    res.status(500).json({
      message: 'Failed to fetch exercises',
      code: 'FETCH_EXERCISES_ERROR'
    });
  }
});

// @route   GET /api/resources/categories
// @desc    Get resource categories
// @access  Public
router.get('/categories', (req, res) => {
  try {
    const categories = {
      prompts: [
        'gratitude', 'reflection', 'mindfulness', 'goal-setting', 
        'self-care', 'relationships', 'work', 'creativity', 'general'
      ],
      exercises: [
        'breathing', 'meditation', 'gratitude', 'movement', 'visualization'
      ],
      difficulties: ['beginner', 'intermediate', 'advanced']
    };

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      message: 'Failed to fetch categories',
      code: 'FETCH_CATEGORIES_ERROR'
    });
  }
});

module.exports = router;
