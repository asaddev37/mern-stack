# 💰 Finance Tracker - Personal Finance Management

A stunning, modern personal finance management application built with the MERN stack. Track your income, expenses, budgets, and get detailed analytics with a beautiful, user-friendly interface.

![Finance Tracker](https://img.shields.io/badge/Finance-Tracker-blue)
![MERN Stack](https://img.shields.io/badge/MERN-Stack-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![React](https://img.shields.io/badge/React-18-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)

## ✨ Features

### 🎯 Core Functionality
- **User Authentication** - Secure login/register with JWT
- **Transaction Management** - Add, edit, delete income and expenses
- **Budget Tracking** - Create and monitor spending limits
- **Financial Analytics** - Beautiful charts and insights
- **Real-time Dashboard** - Live financial overview
- **Profile Management** - Customize preferences and settings

### 🎨 Beautiful UI/UX
- **Modern Design** - Clean, gradient-based interface
- **Responsive Layout** - Works perfectly on all devices
- **Smooth Animations** - Framer Motion powered transitions
- **Interactive Charts** - Chart.js for data visualization
- **Dark/Light Theme** - User preference themes
- **Glass Morphism** - Modern glass effects and shadows

### 📊 Analytics & Insights
- **Income vs Expense Trends** - Monthly/yearly comparisons
- **Category Breakdown** - Spending analysis by category
- **Budget Performance** - Track spending against limits
- **Financial Health Score** - Overall financial status
- **Export Reports** - Download financial data

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd finance_tracker
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   - Copy `server/config.env` and update with your MongoDB connection string
   - Your MongoDB connection string is already configured:
     ```
     MONGODB_URI=mongodb+srv://awais:awais125@cluster1.r38qfpg.mongodb.net/finance_tracker?retryWrites=true&w=majority
     ```

4. **Start the application**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

That's it! The application will start both frontend and backend servers automatically. 🎉

## 🏗️ Project Structure

```
finance_tracker/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   └── styles/        # CSS and styling
├── server/                # Node.js Backend
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   └── config.env        # Environment variables
└── package.json          # Root package.json
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations
- **Chart.js** - Beautiful charts and graphs
- **React Query** - Data fetching and caching
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Joi** - Data validation
- **Helmet** - Security middleware

### Database
- **MongoDB Atlas** - Cloud database service
- **Collections**: Users, Transactions, Budgets

## 📱 Screenshots

### Dashboard
- Real-time financial overview
- Beautiful statistics cards
- Interactive charts
- Recent transactions
- Budget progress

### Transactions
- Add income/expenses
- Category management
- Search and filter
- Payment method tracking

### Budgets
- Create spending limits
- Visual progress bars
- Budget alerts
- Category-wise tracking

### Analytics
- Income vs expense trends
- Category breakdown charts
- Monthly/yearly reports
- Financial insights

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start both frontend and backend
npm run server       # Start only backend server
npm run client       # Start only frontend client

# Installation
npm run install-all  # Install all dependencies

# Production
npm run build        # Build for production
npm start           # Start production server
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Transactions
- `GET /api/transactions` - Get user transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Budgets
- `GET /api/budgets` - Get user budgets
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### Analytics
- `GET /api/analytics/dashboard` - Dashboard data
- `GET /api/analytics/trends` - Financial trends
- `GET /api/analytics/categories` - Category analytics

## 🎨 Design System

### Color Palette
- **Primary**: Gradient from #667eea to #764ba2
- **Success**: Gradient from #4facfe to #00f2fe
- **Warning**: Gradient from #43e97b to #38f9d7
- **Danger**: Gradient from #fa709a to #fee140

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700, 800

### Components
- **Cards**: Rounded corners, subtle shadows, gradient borders
- **Buttons**: Gradient backgrounds with hover effects
- **Forms**: Clean inputs with focus states
- **Charts**: Modern styling with gradient fills

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt with salt rounds
- **Input Validation** - Joi schema validation
- **Rate Limiting** - Prevent API abuse
- **CORS Protection** - Cross-origin security
- **Helmet Security** - HTTP security headers

## 📊 Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  preferences: {
    currency: String,
    theme: String,
    language: String
  },
  createdAt: Date
}
```

### Transaction Model
```javascript
{
  userId: ObjectId,
  type: 'income' | 'expense',
  amount: Number,
  category: String,
  description: String,
  date: Date,
  paymentMethod: String,
  tags: [String]
}
```

### Budget Model
```javascript
{
  userId: ObjectId,
  name: String,
  category: String,
  amount: Number,
  spent: Number,
  period: 'weekly' | 'monthly' | 'yearly',
  startDate: Date,
  endDate: Date,
  isActive: Boolean
}
```

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `client/dist` folder
3. Set environment variables

### Backend (Railway/Heroku)
1. Set environment variables
2. Deploy the `server` folder
3. Configure MongoDB Atlas connection

### Database
- MongoDB Atlas is already configured
- Connection string is provided in the project

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

## 🎉 Acknowledgments

- **Icons**: Lucide React
- **Charts**: Chart.js
- **Animations**: Framer Motion
- **Styling**: Tailwind CSS
- **Database**: MongoDB Atlas

---

**Built with ❤️ using the MERN stack**

*Start tracking your finances today with this beautiful, feature-rich application!*
