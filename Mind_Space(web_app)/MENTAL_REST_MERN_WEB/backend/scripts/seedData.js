const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Prompt = require('../models/Prompt');
const Journal = require('../models/Journal');

// Sample prompts data
const samplePrompts = [
  {
    title: 'Three Good Things',
    content: 'Write about three good things that happened today, no matter how small they might seem.',
    category: 'gratitude',
    difficulty: 'beginner',
    estimatedTime: 5,
    tags: ['gratitude', 'positive', 'daily'],
    isSystemPrompt: true
  },
  {
    title: 'Emotional Check-in',
    content: 'How are you feeling right now? What emotions are present? Take a moment to name and acknowledge them.',
    category: 'reflection',
    difficulty: 'beginner',
    estimatedTime: 3,
    tags: ['emotions', 'self-awareness', 'mindfulness'],
    isSystemPrompt: true
  },
  {
    title: 'Gratitude for Someone',
    content: 'Think of someone you\'re grateful for and write about why they mean so much to you.',
    category: 'gratitude',
    difficulty: 'intermediate',
    estimatedTime: 7,
    tags: ['gratitude', 'relationships', 'appreciation'],
    isSystemPrompt: true
  },
  {
    title: 'Today\'s Learning',
    content: 'What did you learn about yourself today? What insights did you gain?',
    category: 'reflection',
    difficulty: 'intermediate',
    estimatedTime: 8,
    tags: ['learning', 'growth', 'self-discovery'],
    isSystemPrompt: true
  },
  {
    title: 'Present Moment Awareness',
    content: 'Describe what you\'re experiencing right now using all your senses. What do you see, hear, feel, smell, or taste?',
    category: 'mindfulness',
    difficulty: 'beginner',
    estimatedTime: 5,
    tags: ['mindfulness', 'present-moment', 'senses'],
    isSystemPrompt: true
  },
  {
    title: 'Challenges and Growth',
    content: 'What challenge did you face today and how did you handle it? What did this teach you about yourself?',
    category: 'reflection',
    difficulty: 'advanced',
    estimatedTime: 10,
    tags: ['challenges', 'growth', 'resilience'],
    isSystemPrompt: true
  },
  {
    title: 'Self-Care Reflection',
    content: 'How did you take care of yourself today? What self-care activities did you engage in?',
    category: 'self-care',
    difficulty: 'beginner',
    estimatedTime: 5,
    tags: ['self-care', 'wellness', 'nurturing'],
    isSystemPrompt: true
  },
  {
    title: 'Future Self Letter',
    content: 'Write a letter to your future self. What advice would you give? What hopes do you have?',
    category: 'goal-setting',
    difficulty: 'advanced',
    estimatedTime: 15,
    tags: ['future', 'goals', 'aspirations'],
    isSystemPrompt: true
  },
  {
    title: 'Body Scan Reflection',
    content: 'Notice how your body feels right now. Are there any areas of tension or relaxation?',
    category: 'mindfulness',
    difficulty: 'beginner',
    estimatedTime: 5,
    tags: ['body-awareness', 'mindfulness', 'relaxation'],
    isSystemPrompt: true
  },
  {
    title: 'Relationship Gratitude',
    content: 'Write about a relationship that brings you joy. What makes this connection special?',
    category: 'relationships',
    difficulty: 'intermediate',
    estimatedTime: 8,
    tags: ['relationships', 'gratitude', 'connection'],
    isSystemPrompt: true
  }
];

// Sample journal entries
const sampleJournalEntries = [
  {
    title: 'A Good Day',
    content: 'Today was really nice. I had a great conversation with my friend over coffee, and we talked about our dreams and goals. It felt good to connect with someone who understands me. I also managed to finish a project I\'ve been working on for weeks, which gave me a sense of accomplishment.',
    mood: 'happy',
    moodIntensity: 8,
    tags: ['friendship', 'accomplishment', 'connection']
  },
  {
    title: 'Feeling Overwhelmed',
    content: 'Work has been really stressful lately. I have so many deadlines coming up and I feel like I can\'t keep up. I\'m trying to stay positive, but it\'s hard when everything feels like it\'s piling up. I need to find better ways to manage my time and stress.',
    mood: 'stressed',
    moodIntensity: 7,
    tags: ['work', 'stress', 'time-management']
  },
  {
    title: 'Grateful for Small Things',
    content: 'Today I\'m grateful for the warm sunshine, the delicious lunch I had, and the kind smile from a stranger on the bus. Sometimes it\'s the small moments that make the biggest difference in my day.',
    mood: 'grateful',
    moodIntensity: 6,
    tags: ['gratitude', 'small-moments', 'kindness']
  },
  {
    title: 'Peaceful Evening',
    content: 'I spent the evening reading a good book and drinking tea. It was so peaceful and relaxing. I feel calm and content right now. These quiet moments are so important for my mental health.',
    mood: 'peaceful',
    moodIntensity: 8,
    tags: ['reading', 'relaxation', 'self-care']
  },
  {
    title: 'Anxious Thoughts',
    content: 'I\'ve been having a lot of anxious thoughts today. I keep worrying about things that might happen in the future. I know I should focus on the present, but it\'s easier said than done. I\'m going to try some breathing exercises.',
    mood: 'anxious',
    moodIntensity: 6,
    tags: ['anxiety', 'worry', 'future']
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds timeout
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - remove in production)
    await User.deleteMany({});
    await Prompt.deleteMany({});
    await Journal.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@mindspace.com',
      password: 'admin123',
      role: 'admin',
      preferences: {
        theme: 'light',
        notifications: {
          email: true,
          push: true
        },
        privacy: {
          shareAnonymously: false,
          dataRetention: 365
        }
      }
    });
    await adminUser.save();
    console.log('👤 Created admin user');

    // Create test user
    const testUser = new User({
      name: 'Test User',
      email: 'test@mindspace.com',
      password: 'test123',
      role: 'user',
      preferences: {
        theme: 'light',
        notifications: {
          email: true,
          push: true
        },
        privacy: {
          shareAnonymously: true,
          dataRetention: 365
        }
      },
      wellnessGoals: [
        {
          title: 'Write in journal daily',
          description: 'Commit to writing at least one journal entry every day',
          targetValue: 30,
          currentValue: 5,
          unit: 'days',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        },
        {
          title: 'Practice gratitude',
          description: 'Write down three things I\'m grateful for each day',
          targetValue: 21,
          currentValue: 3,
          unit: 'days',
          deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000) // 21 days from now
        }
      ]
    });
    await testUser.save();
    console.log('👤 Created test user');

    // Create sample prompts
    for (const promptData of samplePrompts) {
      const prompt = new Prompt(promptData);
      await prompt.save();
    }
    console.log(`📝 Created ${samplePrompts.length} sample prompts`);

    // Create sample journal entries for test user
    for (let i = 0; i < sampleJournalEntries.length; i++) {
      const entryData = sampleJournalEntries[i];
      const entry = new Journal({
        ...entryData,
        user: testUser._id,
        createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)) // Spread entries over the last few days
      });
      await entry.save();
    }
    console.log(`📖 Created ${sampleJournalEntries.length} sample journal entries`);

    // Update user streak
    await testUser.updateStreak();
    console.log('📊 Updated user streak');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Created:');
    console.log(`- 1 Admin user (admin@mindspace.com / admin123)`);
    console.log(`- 1 Test user (test@mindspace.com / test123)`);
    console.log(`- ${samplePrompts.length} Sample prompts`);
    console.log(`- ${sampleJournalEntries.length} Sample journal entries`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
