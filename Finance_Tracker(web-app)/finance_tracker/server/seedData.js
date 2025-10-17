const mongoose = require('mongoose');
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Budget = require('./models/Budget');
require('dotenv').config({ path: './config.env' });

// Sample data
const sampleUser = {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  preferences: {
    currency: 'USD',
    theme: 'light',
    language: 'en'
  }
};

const sampleTransactions = [
  {
    type: 'income',
    amount: 5000,
    category: 'salary',
    description: 'Monthly salary',
    paymentMethod: 'bank_transfer',
    tags: ['work', 'salary']
  },
  {
    type: 'expense',
    amount: 1200,
    category: 'rent',
    description: 'Monthly rent payment',
    paymentMethod: 'bank_transfer',
    tags: ['housing', 'monthly']
  },
  {
    type: 'expense',
    amount: 300,
    category: 'groceries',
    description: 'Weekly grocery shopping',
    paymentMethod: 'card',
    tags: ['food', 'weekly']
  },
  {
    type: 'expense',
    amount: 150,
    category: 'transportation',
    description: 'Gas and public transport',
    paymentMethod: 'card',
    tags: ['transport', 'monthly']
  },
  {
    type: 'income',
    amount: 500,
    category: 'freelance',
    description: 'Freelance project payment',
    paymentMethod: 'digital_wallet',
    tags: ['work', 'freelance']
  }
];

const sampleBudgets = [
  {
    name: 'Monthly Groceries',
    category: 'groceries',
    amount: 2000,
    period: 'monthly',
    color: '#4facfe',
    icon: '🛒',
    description: 'Monthly grocery budget'
  },
  {
    name: 'Transportation',
    category: 'transportation',
    amount: 500,
    period: 'monthly',
    color: '#43e97b',
    icon: '🚗',
    description: 'Gas and public transport budget'
  },
  {
    name: 'Entertainment',
    category: 'entertainment',
    amount: 800,
    period: 'monthly',
    color: '#f093fb',
    icon: '🎬',
    description: 'Movies, dining out, and fun activities'
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Transaction.deleteMany({});
    await Budget.deleteMany({});
    console.log('Cleared existing data');

    // Create sample user
    const user = new User(sampleUser);
    await user.save();
    console.log('Created sample user:', user.email);

    // Create sample transactions
    const transactions = sampleTransactions.map(tx => ({
      ...tx,
      userId: user._id,
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
    }));

    await Transaction.insertMany(transactions);
    console.log('Created sample transactions');

    // Create sample budgets
    const budgets = sampleBudgets.map(budget => {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      return {
        ...budget,
        userId: user._id,
        startDate,
        endDate,
        spent: 0, // Start with 0 spent amount
        isActive: true,
        alerts: {
          enabled: true,
          threshold: 80
        }
      };
    });

    await Budget.insertMany(budgets);
    console.log('Created sample budgets');

    console.log('Database seeded successfully!');
    console.log('You can now login with:');
    console.log('Email: john@example.com');
    console.log('Password: password123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeder
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
