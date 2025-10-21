# MindSpace - Mental Wellness Journal

A comprehensive MERN stack application designed to promote mental wellness through journaling, mood tracking, and AI-powered insights.

## 🌟 Features

### Core Functionality
- **Personal Journaling**: Create, edit, and manage daily journal entries
- **Mood Tracking**: Log moods with intensity levels and visual trends
- **AI-Powered Insights**: Sentiment analysis using Google Gemini AI
- **Guided Prompts**: Pre-built and AI-generated journal prompts
- **Wellness Goals**: Set and track personal wellness objectives
- **Community Features**: Anonymous sharing and leaderboards
- **Admin Dashboard**: Content moderation and analytics

### Technical Features
- **Secure Authentication**: JWT-based auth with Google OAuth support
- **Responsive Design**: Mobile-first UI with Tailwind CSS
- **Real-time Analytics**: Interactive charts and mood trends
- **Privacy-Focused**: User data protection and anonymization
- **AI Integration**: Google Gemini API for sentiment analysis

## 🏗️ Project Structure

```
mindspace/
├── backend/                 # Node.js/Express backend
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── middleware/         # Authentication & validation
│   ├── services/           # AI service integration
│   ├── config/             # Passport configuration
│   ├── scripts/            # Database seeding
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
├── frontend/               # React TypeScript frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
└── package.json            # Root package.json for scripts
```

---

### API Endpoints
- **Authentication Routes**
  - POST /api/auth/register
  - POST /api/auth/login
  - GET /api/auth/profile
  - PUT /api/auth/profile
- **Journal Routes**
  - GET /api/journals
  - POST /api/journals
  - PUT /api/journals/:id
  - DELETE /api/journals/:id
  - GET /api/journals/stats
- **Insights Routes**
  - POST /api/insights/generate
  - POST /api/insights/chat
  - POST /api/insights/chat/stream
  - GET /api/insights/history
- **Resources Routes**
  - GET /api/resources
  - POST /api/resources (admin)
  - PUT /api/resources/:id (admin)
- **Admin Routes**
  - GET /api/admin/users
  - GET /api/admin/analytics
  - POST /api/admin/resources

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher
- MongoDB Atlas account (or local MongoDB)
- Google Cloud account (for Gemini API)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mindspace
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   # Backend environment
   cd backend
   cp env.example .env
   # Edit .env with your MongoDB connection string and other variables
   ```

4. **Set up Gemini AI (for AI features)**
   ```bash
   # Get Gemini API key from Google AI Studio
   # Go to: https://aistudio.google.com/app/apikey
   
   # Add API key to backend/.env
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-1.5-flash-latest
   ```

5. **Seed the database**
   ```bash
   npm run seed
   ```

6. **Start the development servers**
   ```bash
   npm run dev
   ```

This will start:
- Backend server on `http://localhost:5000`
- Frontend development server on `http://localhost:3000`

## 🔧 Environment Variables

### Backend (.env)
```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mindspace

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Server Configuration
PORT=5000
NODE_ENV=development

# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash-latest

# Frontend URL
CLIENT_URL=http://localhost:3000
```

## 📱 Usage

### For Users
1. **Register/Login**: Create an account or use Google OAuth
2. **Start Journaling**: Write daily entries with mood tracking
3. **View Insights**: Get AI-powered sentiment analysis and trends
4. **Set Goals**: Create and track wellness objectives
5. **Explore Community**: View anonymized shared content

### For Admins
1. **Access Dashboard**: Use admin credentials to access moderation tools
2. **Monitor Analytics**: View user engagement and content statistics
3. **Moderate Content**: Review and manage shared community content
4. **Export Data**: Generate reports for analysis

## 🛠️ Development

### Backend Development
```bash
cd backend
npm run dev          # Start with nodemon
npm run seed         # Seed database with sample data
npm test            # Run backend tests
```

### Frontend Development
```bash
cd frontend
npm start           # Start development server
npm run build       # Build for production
npm test           # Run frontend tests
```

### Available Scripts
- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both frontend and backend for production
- `npm run seed` - Seed the database with sample data
- `npm run install:all` - Install dependencies for both frontend and backend

## 🧠 AI Integration

The application uses Google Gemini AI for:
- **Sentiment Analysis**: Analyze journal entries for emotional tone
- **Wellness Tips**: Generate personalized recommendations
- **Prompt Generation**: Create contextual journal prompts
- **Real-time Chat**: AI-powered mental health support

### Gemini AI Setup
1. Get API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Add API key to `backend/.env` file
3. Set model to `gemini-1.5-flash-latest`
4. Ensure Generative Language API is enabled in Google Cloud Console

## 🎨 UI/UX Design

### Design Philosophy
- **Calming Aesthetics**: Soft blues and greens for mental wellness
- **Accessibility**: High contrast, keyboard navigation, screen reader support
- **Responsive**: Mobile-first design with seamless desktop experience
- **Intuitive**: Clean, minimal interface focused on user well-being

### Color Palette
- Primary: Soft blues (#E6F0FA, #0069CD)
- Secondary: Calming greens (#D4F1F4, #218B9D)
- Wellness: Mood-specific colors for emotional states

## 🔒 Security & Privacy

- **Data Encryption**: Passwords hashed with bcrypt
- **JWT Authentication**: Secure token-based authentication
- **Privacy Controls**: User-controlled data sharing settings
- **Anonymization**: Community features use anonymized data
- **Rate Limiting**: API protection against abuse

## 📊 Database Schema

### Collections
- **Users**: User profiles, preferences, and wellness goals
- **Journals**: Journal entries with mood data and AI analysis
- **Prompts**: Guided journal prompts and templates
- **Insights**: AI-generated insights and recommendations

## 🚀 Deployment

### Vercel Deployment
1. **Backend**: Deploy to Vercel with environment variables
2. **Frontend**: Build and deploy React app
3. **Database**: Use MongoDB Atlas (free tier)
4. **AI**: Google Gemini API (cloud-based)

### Environment Setup
- Set production environment variables
- Configure CORS for production domains
- Set up MongoDB Atlas connection
- Configure Gemini API key

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the troubleshooting guide

## 🔮 Future Enhancements

- Mobile app (React Native/Flutter)
- Advanced AI features
- Wearable device integration
- Group therapy features
- Professional therapist dashboard
- Multi-language support

---
screeshots:
mind space intro:
<img width="960" height="424" alt="image" src="https://github.com/user-attachments/assets/17f0ca27-05ec-4827-803b-1f3e7f934020" />
login page:
<img width="952" height="424" alt="image" src="https://github.com/user-attachments/assets/5a5bcb89-a082-48a0-a587-83de59fee5ee" />
signup page:
<img width="956" height="418" alt="image" src="https://github.com/user-attachments/assets/ed876aa8-d172-44f6-8a84-0f661842121e" />
Dashboard section :
dashboard overview:
<img width="960" height="424" alt="image" src="https://github.com/user-attachments/assets/ebe6d842-2340-4fad-816f-ae7e86ff364b" />
quick actions:
<img width="957" height="422" alt="image" src="https://github.com/user-attachments/assets/08007098-d8c7-4875-bc17-cd792fae4791" />

journals section ;
journals entry:
<img width="960" height="419" alt="image" src="https://github.com/user-attachments/assets/47141acd-c791-4f77-b58e-cf48951391d6" />
recent entries:
<img width="960" height="424" alt="image" src="https://github.com/user-attachments/assets/16eee84b-2f0a-4e35-92a2-54eda73aa043" />

insights section ;
insights overview:
<img width="960" height="422" alt="image" src="https://github.com/user-attachments/assets/f478a78b-b952-4fa5-b179-5c1ac558fa9a" />
statistics:
<img width="959" height="419" alt="image" src="https://github.com/user-attachments/assets/2c8cbb0d-4245-427d-bf23-8dbd067bab15" />
mood distribution:
<img width="960" height="428" alt="image" src="https://github.com/user-attachments/assets/77c04502-d24d-416d-ab01-f0baa761cc50" />













**Built with ❤️ for mental wellness and self-care**
