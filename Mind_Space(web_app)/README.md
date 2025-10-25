## 🎥 Experience MindSpace in Action

<div align="center">

### 🧘‍♀️ Watch the Complete Wellness Journey

[![MindSpace Demo Video](https://img.shields.io/badge/🎬_Watch_Full_Demo-Video_Walkthrough-4CAF50?style=for-the-badge&logo=video&logoColor=white)](https://drive.google.com/file/d/1eyaAAk8QodTftpFYFy3LkbiQdBaZxplz/view?usp=sharing)

*Click above to watch the complete demo and see how MindSpace supports mental wellness*

</div>          # Start development server
npm run build       # Build for production
npm test           # Run frontend tests
```

### Available Scripts
- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both frontend and backend for production
- `npm run seed` - Seed the database with sample data
- `npm run install:all` - Install dependencies for both frontend and backend

## 🌐 API Endpoints

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
Demo Video:
https://drive.google.com/file/d/1eyaAAk8QodTftpFYFy3LkbiQdBaZxplz/view?usp=sharing
---

<div align="center">
  **Built with ❤️ for mental wellness and self-care**
  
  <sub>Your journey to better mental health starts here</sub>
</div>

