const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// User registration validation
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  handleValidationErrors
];

// User login validation
const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Journal entry validation
const validateJournalEntry = [
  body('content')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Journal content must be between 10 and 5000 characters'),
  
  body('mood')
    .isIn(['very-happy', 'happy', 'neutral', 'sad', 'very-sad', 'anxious', 'stressed', 'calm', 'excited', 'grateful', 'frustrated', 'peaceful'])
    .withMessage('Please select a valid mood'),
  
  body('moodIntensity')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Mood intensity must be between 1 and 10'),
  
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Maximum 10 tags allowed'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each tag must be between 1 and 30 characters'),
  
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Title must be less than 100 characters'),
  
  handleValidationErrors
];

// Goal validation
const validateGoal = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Goal title must be between 3 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Goal description must be less than 500 characters'),
  
  body('targetValue')
    .optional()
    .isNumeric()
    .withMessage('Target value must be a number'),
  
  body('unit')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Unit must be less than 20 characters'),
  
  body('deadline')
    .optional()
    .isISO8601()
    .withMessage('Deadline must be a valid date'),
  
  handleValidationErrors
];

// Prompt validation
const validatePrompt = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Prompt title must be between 3 and 100 characters'),
  
  body('content')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Prompt content must be between 10 and 500 characters'),
  
  body('category')
    .isIn(['gratitude', 'reflection', 'mindfulness', 'goal-setting', 'self-care', 'relationships', 'work', 'creativity', 'general'])
    .withMessage('Please select a valid category'),
  
  body('difficulty')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Difficulty must be beginner, intermediate, or advanced'),
  
  body('estimatedTime')
    .optional()
    .isInt({ min: 1, max: 60 })
    .withMessage('Estimated time must be between 1 and 60 minutes'),
  
  body('tags')
    .optional()
    .isArray({ max: 5 })
    .withMessage('Maximum 5 tags allowed'),
  
  handleValidationErrors
];

// User preferences validation
const validateUserPreferences = [
  body('preferences.theme')
    .optional()
    .isIn(['light', 'dark'])
    .withMessage('Theme must be light or dark'),
  
  body('preferences.notifications.email')
    .optional()
    .isBoolean()
    .withMessage('Email notifications must be true or false'),
  
  body('preferences.notifications.push')
    .optional()
    .isBoolean()
    .withMessage('Push notifications must be true or false'),
  
  body('preferences.privacy.shareAnonymously')
    .optional()
    .isBoolean()
    .withMessage('Anonymous sharing must be true or false'),
  
  body('preferences.privacy.dataRetention')
    .optional()
    .isInt({ min: 30, max: 3650 })
    .withMessage('Data retention must be between 30 and 3650 days'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateJournalEntry,
  validateGoal,
  validatePrompt,
  validateUserPreferences
};
