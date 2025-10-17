import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const ResourcesPage = () => {
  const [user, setUser] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetDate: '',
    category: 'wellness'
  });
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGuide, setSelectedGuide] = useState<any>(null);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [favoriteGuides, setFavoriteGuides] = useState<number[]>([]);
  const [completedGuides, setCompletedGuides] = useState<number[]>([]);
  const [dailyCompletedGuides, setDailyCompletedGuides] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [communityTips, setCommunityTips] = useState<any[]>([]);
  const [showAddTipForm, setShowAddTipForm] = useState(false);
  const [newTip, setNewTip] = useState({ tip: '', category: 'general' });
  const [likedTips, setLikedTips] = useState<number[]>([]);
  const [tipCategory, setTipCategory] = useState<string>('all');

  const mindfulnessGuides = [
    {
      id: 1,
      title: "5-Minute Breathing Exercise",
      description: "A quick breathing technique to reduce stress and anxiety",
      duration: "5 minutes",
      category: "Breathing",
      difficulty: "Beginner",
      emoji: "🫁",
      steps: [
        "Find a comfortable seated position",
        "Close your eyes and relax your shoulders",
        "Inhale slowly through your nose for 4 counts",
        "Hold your breath for 4 counts",
        "Exhale slowly through your mouth for 6 counts",
        "Repeat for 5 minutes"
      ],
      benefits: ["Reduces stress", "Improves focus", "Calms the mind"],
      tips: "Try this exercise whenever you feel overwhelmed or need to center yourself."
    },
    {
      id: 2,
      title: "Body Scan Meditation",
      description: "A mindfulness practice to connect with your body",
      duration: "10 minutes",
      category: "Meditation",
      difficulty: "Beginner",
      emoji: "🧘",
      steps: [
        "Lie down comfortably on your back",
        "Close your eyes and take deep breaths",
        "Start by focusing on your toes",
        "Slowly move your attention up through your body",
        "Notice any tension and breathe into it",
        "End by focusing on your entire body"
      ],
      benefits: ["Reduces tension", "Improves sleep", "Increases body awareness"],
      tips: "Perfect for bedtime or when you need to relax deeply."
    },
    {
      id: 3,
      title: "Gratitude Journaling",
      description: "Write down things you're grateful for to boost positivity",
      duration: "10 minutes",
      category: "Journaling",
      difficulty: "Beginner",
      emoji: "📝",
      steps: [
        "Set aside time each morning or evening",
        "Write down 3 things you're grateful for",
        "Be specific about why you're grateful",
        "Reflect on how these things make you feel",
        "Consider sharing your gratitude with others"
      ],
      benefits: ["Increases happiness", "Improves relationships", "Reduces depression"],
      tips: "Make this a daily habit for maximum benefits."
    },
    {
      id: 4,
      title: "Mindful Walking",
      description: "Practice mindfulness while walking in nature",
      duration: "15 minutes",
      category: "Movement",
      difficulty: "Beginner",
      emoji: "🚶",
      steps: [
        "Choose a quiet outdoor location",
        "Walk at a comfortable pace",
        "Focus on the sensation of your feet touching the ground",
        "Notice the sounds, smells, and sights around you",
        "If your mind wanders, gently return to the present moment"
      ],
      benefits: ["Reduces anxiety", "Improves mood", "Connects with nature"],
      tips: "Great for combining exercise with mindfulness practice."
    },
    {
      id: 5,
      title: "Loving-Kindness Meditation",
      description: "Cultivate compassion and love for yourself and others",
      duration: "12 minutes",
      category: "Meditation",
      difficulty: "Intermediate",
      emoji: "💝",
      steps: [
        "Sit comfortably and close your eyes",
        "Start by sending love to yourself",
        "Think of someone you love and send them love",
        "Think of a neutral person and send them love",
        "Think of someone you have difficulty with and send them love",
        "Send love to all beings everywhere"
      ],
      benefits: ["Increases compassion", "Reduces anger", "Improves relationships"],
      tips: "This practice can transform your relationships and inner peace."
    },
    {
      id: 6,
      title: "Progressive Muscle Relaxation",
      description: "Systematically tense and relax muscle groups to reduce stress",
      duration: "20 minutes",
      category: "Relaxation",
      difficulty: "Beginner",
      emoji: "💆",
      steps: [
        "Lie down in a comfortable position",
        "Start with your toes - tense for 5 seconds, then relax",
        "Move up to your calves, thighs, and so on",
        "Tense each muscle group for 5 seconds",
        "Notice the difference between tension and relaxation",
        "End with a full body relaxation"
      ],
      benefits: ["Reduces muscle tension", "Improves sleep", "Lowers stress"],
      tips: "Excellent for physical stress and tension relief."
    },
    {
      id: 7,
      title: "Mindful Eating",
      description: "Practice awareness and gratitude while eating",
      duration: "15 minutes",
      category: "Mindfulness",
      difficulty: "Beginner",
      emoji: "🍎",
      steps: [
        "Choose a small piece of food (like a raisin or apple slice)",
        "Look at it carefully - notice its color, texture, shape",
        "Smell it and notice any aromas",
        "Place it in your mouth without chewing",
        "Notice the taste and texture",
        "Chew slowly and mindfully",
        "Swallow and notice the aftertaste"
      ],
      benefits: ["Improves digestion", "Reduces overeating", "Increases gratitude"],
      tips: "Try this with one meal per day to develop mindful eating habits."
    },
    {
      id: 8,
      title: "RAIN Technique",
      description: "A powerful method for working with difficult emotions",
      duration: "10 minutes",
      category: "Emotional Wellness",
      difficulty: "Intermediate",
      emoji: "🌧️",
      steps: [
        "Recognize what you're feeling",
        "Allow the feeling to be there without judgment",
        "Investigate the feeling with curiosity",
        "Nurture yourself with self-compassion",
        "Notice what happens when you apply RAIN"
      ],
      benefits: ["Emotional regulation", "Self-compassion", "Reduces reactivity"],
      tips: "Use this technique whenever you feel overwhelmed by emotions."
    }
  ];

  // Default community tips (will be enhanced with user-generated content)
  const defaultCommunityTips = [
    {
      id: 1,
      tip: "Start your day with 3 deep breaths before getting out of bed",
      category: "Morning Routine",
      likes: 24,
      author: "Wellness Team",
      isDefault: true
    },
    {
      id: 2,
      tip: "Keep a small notebook by your bed to write down thoughts before sleep",
      category: "Sleep Hygiene",
      likes: 18,
      author: "Wellness Team",
      isDefault: true
    },
    {
      id: 3,
      tip: "Take a 2-minute break every hour to stretch and breathe",
      category: "Work Wellness",
      likes: 31,
      author: "Wellness Team",
      isDefault: true
    },
    {
      id: 4,
      tip: "Practice the 5-4-3-2-1 grounding technique when feeling anxious",
      category: "Anxiety Relief",
      likes: 27,
      author: "Wellness Team",
      isDefault: true
    },
    {
      id: 5,
      tip: "Set a daily intention each morning to guide your day",
      category: "Mindfulness",
      likes: 22,
      author: "Wellness Team",
      isDefault: true
    }
  ];

  const goalCategories = [
    { value: 'wellness', label: 'Wellness', color: 'bg-green-100 text-green-800' },
    { value: 'mindfulness', label: 'Mindfulness', color: 'bg-blue-100 text-blue-800' },
    { value: 'productivity', label: 'Productivity', color: 'bg-purple-100 text-purple-800' },
    { value: 'relationships', label: 'Relationships', color: 'bg-pink-100 text-pink-800' },
    { value: 'learning', label: 'Learning', color: 'bg-yellow-100 text-yellow-800' }
  ];

  const tipCategories = [
    { value: 'all', label: 'All Tips' },
    { value: 'Morning Routine', label: 'Morning Routine' },
    { value: 'Sleep Hygiene', label: 'Sleep Hygiene' },
    { value: 'Work Wellness', label: 'Work Wellness' },
    { value: 'Anxiety Relief', label: 'Anxiety Relief' },
    { value: 'Mindfulness', label: 'Mindfulness' },
    { value: 'Physical Wellness', label: 'Physical Wellness' },
    { value: 'Emotional Wellness', label: 'Emotional Wellness' },
    { value: 'Social Connection', label: 'Social Connection' },
    { value: 'Stress Management', label: 'Stress Management' }
  ];

  useEffect(() => {
    fetchUserData();
    fetchGoals();
    loadUserPreferences();
  }, []);

  const loadUserPreferences = () => {
    const savedFavorites = localStorage.getItem('favoriteGuides');
    const savedCompleted = localStorage.getItem('completedGuides');
    const today = new Date().toDateString();
    const savedDailyData = localStorage.getItem('dailyCompletedGuides');
    
    if (savedFavorites) setFavoriteGuides(JSON.parse(savedFavorites));
    if (savedCompleted) setCompletedGuides(JSON.parse(savedCompleted));
    
    // Check if we have daily data for today
    if (savedDailyData) {
      const dailyData = JSON.parse(savedDailyData);
      if (dailyData.date === today) {
        setDailyCompletedGuides(dailyData.completedGuides || []);
      } else {
        // Reset for new day
        setDailyCompletedGuides([]);
        localStorage.setItem('dailyCompletedGuides', JSON.stringify({
          date: today,
          completedGuides: []
        }));
      }
    } else {
      // Initialize for first time
      localStorage.setItem('dailyCompletedGuides', JSON.stringify({
        date: today,
        completedGuides: []
      }));
    }

    // Load community tips and user preferences
    loadCommunityTips();
    loadLikedTips();
  };

  const loadCommunityTips = () => {
    const savedTips = localStorage.getItem('communityTips');
    if (savedTips) {
      setCommunityTips(JSON.parse(savedTips));
    } else {
      // Initialize with default tips
      setCommunityTips(defaultCommunityTips);
      localStorage.setItem('communityTips', JSON.stringify(defaultCommunityTips));
    }
  };

  const loadLikedTips = () => {
    const savedLikes = localStorage.getItem('likedTips');
    if (savedLikes) {
      setLikedTips(JSON.parse(savedLikes));
    }
  };

  const addCommunityTip = () => {
    if (newTip.tip.trim() && newTip.category) {
      const tipId = Date.now(); // Simple ID generation
      const newTipData = {
        id: tipId,
        tip: newTip.tip.trim(),
        category: newTip.category,
        likes: 0,
        author: user?.name || 'Anonymous',
        isDefault: false,
        createdAt: new Date().toISOString()
      };

      const updatedTips = [newTipData, ...communityTips];
      setCommunityTips(updatedTips);
      localStorage.setItem('communityTips', JSON.stringify(updatedTips));
      
      // Reset form
      setNewTip({ tip: '', category: 'general' });
      setShowAddTipForm(false);
    }
  };

  const toggleLikeTip = (tipId: number) => {
    const isLiked = likedTips.includes(tipId);
    let newLikedTips;
    let updatedTips;

    if (isLiked) {
      // Unlike
      newLikedTips = likedTips.filter(id => id !== tipId);
      updatedTips = communityTips.map(tip => 
        tip.id === tipId ? { ...tip, likes: Math.max(0, tip.likes - 1) } : tip
      );
    } else {
      // Like
      newLikedTips = [...likedTips, tipId];
      updatedTips = communityTips.map(tip => 
        tip.id === tipId ? { ...tip, likes: tip.likes + 1 } : tip
      );
    }

    setLikedTips(newLikedTips);
    setCommunityTips(updatedTips);
    localStorage.setItem('likedTips', JSON.stringify(newLikedTips));
    localStorage.setItem('communityTips', JSON.stringify(updatedTips));
  };

  const getFilteredCommunityTips = () => {
    if (tipCategory === 'all') {
      return communityTips;
    }
    return communityTips.filter(tip => tip.category === tipCategory);
  };

  const toggleFavorite = (guideId: number) => {
    const newFavorites = favoriteGuides.includes(guideId)
      ? favoriteGuides.filter(id => id !== guideId)
      : [...favoriteGuides, guideId];
    setFavoriteGuides(newFavorites);
    localStorage.setItem('favoriteGuides', JSON.stringify(newFavorites));
  };

  const markAsCompleted = (guideId: number) => {
    // Add to overall completed guides (permanent)
    if (!completedGuides.includes(guideId)) {
      const newCompleted = [...completedGuides, guideId];
      setCompletedGuides(newCompleted);
      localStorage.setItem('completedGuides', JSON.stringify(newCompleted));
    }
    
    // Add to daily completed guides (resets each day)
    if (!dailyCompletedGuides.includes(guideId)) {
      const newDailyCompleted = [...dailyCompletedGuides, guideId];
      setDailyCompletedGuides(newDailyCompleted);
      
      const today = new Date().toDateString();
      localStorage.setItem('dailyCompletedGuides', JSON.stringify({
        date: today,
        completedGuides: newDailyCompleted
      }));
    }
  };

  const openGuideModal = (guide: any) => {
    setSelectedGuide(guide);
    setShowGuideModal(true);
  };

  const closeGuideModal = () => {
    setShowGuideModal(false);
    setSelectedGuide(null);
  };

  const getFilteredGuides = () => {
    if (selectedCategory === 'all') return mindfulnessGuides;
    return mindfulnessGuides.filter(guide => guide.category === selectedCategory);
  };

  const getCategories = () => {
    const categories = ['all', ...new Set(mindfulnessGuides.map(guide => guide.category))];
    return categories;
  };

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userData = response.data.user || response.data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  };

  const fetchGoals = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/resources/goals`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const formattedGoals = response.data.goals.map((goal: any, index: number) => ({
        id: goal._id || index,
        title: goal.title,
        description: goal.description,
        targetDate: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '',
        category: goal.category || 'wellness',
        isCompleted: goal.isCompleted || false,
        createdAt: goal.createdAt
      }));

      setGoals(formattedGoals);
    } catch (error) {
      console.error('Failed to fetch goals:', error);
      setError('Failed to load goals');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddGoal = async () => {
    if (!newGoal.title.trim()) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const goalData = {
        title: newGoal.title,
        description: newGoal.description,
        deadline: newGoal.targetDate ? new Date(newGoal.targetDate).toISOString() : null,
        category: newGoal.category
      };

      await axios.post(`${API_BASE_URL}/resources/goals`, goalData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Refresh goals list
      await fetchGoals();
      
      setNewGoal({ title: '', description: '', targetDate: '', category: 'wellness' });
      setIsAddingGoal(false);
    } catch (error) {
      console.error('Failed to add goal:', error);
      setError('Failed to add goal. Please try again.');
    }
  };

  const handleDeleteGoal = (goalId: number) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      const updatedGoals = goals.filter(goal => goal.id !== goalId);
      setGoals(updatedGoals);
      localStorage.setItem('wellnessGoals', JSON.stringify(updatedGoals));
    }
  };

  const handleUpdateProgress = (goalId: number, progress: number) => {
    const updatedGoals = goals.map(goal => 
      goal.id === goalId ? { ...goal, progress: Math.min(100, Math.max(0, progress)) } : goal
    );
    setGoals(updatedGoals);
    localStorage.setItem('wellnessGoals', JSON.stringify(updatedGoals));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-gray-900">
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  MindSpace
                </h1>
                <p className="text-sm text-gray-500 font-medium">Your Wellness Resources</p>
              </div>
            </div>
            
            <nav className="hidden lg:flex space-x-8">
              <a href="/dashboard" className="text-gray-600 hover:text-indigo-600 transition-all duration-300 font-medium hover:scale-105">Dashboard</a>
              <a href="/journal" className="text-gray-600 hover:text-indigo-600 transition-all duration-300 font-medium hover:scale-105">Journal</a>
              <a href="/insights" className="text-gray-600 hover:text-indigo-600 transition-all duration-300 font-medium hover:scale-105">Insights</a>
              <a href="/resources" className="text-indigo-600 font-semibold bg-indigo-50 px-4 py-2 rounded-xl">Resources</a>
              <a href="/profile" className="text-gray-600 hover:text-indigo-600 transition-all duration-300 font-medium hover:scale-105">Profile</a>
            </nav>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-700">Welcome back,</p>
                <p className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{user?.name || 'User'}</p>
              </div>
              <button 
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  window.location.href = '/';
                }}
                className="px-4 py-2 text-gray-600 hover:text-red-600 transition-all duration-300 font-medium hover:bg-red-50 rounded-xl"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Your <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Wellness</span> Hub
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover mindfulness guides, set personal goals, and access curated resources for your mental wellness journey
            </p>
          </div>
        </div>
      </section>

      {/* Loading State */}
      {isLoading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading your wellness resources...</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!isLoading && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">

          {/* Resources Dashboard */}
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-100 text-sm font-medium">Active Goals</p>
                    <p className="text-3xl font-bold">{goals.filter(g => !g.isCompleted).length}</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm font-medium">Completed Goals</p>
                    <p className="text-3xl font-bold">{goals.filter(g => g.isCompleted).length}</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl p-6 text-white shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-pink-100 text-sm font-medium">Resources</p>
                    <p className="text-3xl font-bold">{mindfulnessGuides.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Daily Progress Card */}
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm font-medium">Today's Practice</p>
                    <p className="text-3xl font-bold">{dailyCompletedGuides.length}</p>
                    <p className="text-emerald-200 text-xs mt-1">
                      {dailyCompletedGuides.length === 0 ? 'Start your mindfulness journey!' :
                       dailyCompletedGuides.length === 1 ? 'Great start! Keep going!' :
                       dailyCompletedGuides.length < 3 ? 'You\'re building a great habit!' :
                       'Amazing dedication! 🎉'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                {dailyCompletedGuides.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-emerald-100">Progress</span>
                      <span className="text-emerald-200">
                        {dailyCompletedGuides.length}/{mindfulnessGuides.length}
                      </span>
                    </div>
                    <div className="mt-2 w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-white h-2 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${(dailyCompletedGuides.length / mindfulnessGuides.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Mindfulness Guides */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
                <div className="mb-4 lg:mb-0">
                  <h3 className="text-2xl font-bold text-gray-800">🧘 Enhanced Mindfulness Guides</h3>
                  <p className="text-gray-600 mt-2">Interactive step-by-step practices for mental wellness</p>
                  {dailyCompletedGuides.length > 0 && (
                    <div className="mt-3 flex items-center space-x-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span className="text-sm text-emerald-600 font-medium">
                        {dailyCompletedGuides.length} completed today
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-500">
                    {getFilteredGuides().length} guides available
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Filter:</span>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      {getCategories().map(category => (
                        <option key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getFilteredGuides().map((guide) => (
                  <div key={guide.id} className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                    {/* Header with emoji and actions */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{guide.emoji}</span>
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-gray-800 mb-1">{guide.title}</h4>
                          <div className="flex items-center space-x-2 text-sm">
                            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                              {guide.category}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              guide.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                              guide.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {guide.difficulty}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleFavorite(guide.id)}
                          className={`p-2 rounded-full transition-all duration-200 ${
                            favoriteGuides.includes(guide.id)
                              ? 'bg-red-100 text-red-500 hover:bg-red-200'
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-red-500'
                          }`}
                          title={favoriteGuides.includes(guide.id) ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <svg className="w-4 h-4" fill={favoriteGuides.includes(guide.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                        {dailyCompletedGuides.includes(guide.id) && (
                          <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center" title="Completed today">
                            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                        {completedGuides.includes(guide.id) && !dailyCompletedGuides.includes(guide.id) && (
                          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center" title="Completed before">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">{guide.description}</p>
                    
                    <div className="flex items-center space-x-4 text-sm mb-4">
                      <span className="flex items-center text-gray-500">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {guide.duration}
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <h5 className="font-semibold text-gray-700 mb-3 flex items-center">
                        <span className="mr-2">📋</span>
                        Steps:
                      </h5>
                      <ol className="text-sm text-gray-600 space-y-2">
                        {guide.steps.slice(0, 2).map((step, index) => (
                          <li key={index} className="flex items-start">
                            <span className="font-bold text-indigo-600 mr-3 mt-0.5">{index + 1}.</span>
                            <span className="leading-relaxed">{step}</span>
                          </li>
                        ))}
                        {guide.steps.length > 2 && (
                          <li className="text-indigo-600 font-medium">
                            +{guide.steps.length - 2} more steps...
                          </li>
                        )}
                      </ol>
                    </div>
                    
                    <div className="mb-4">
                      <h5 className="font-semibold text-gray-700 mb-3 flex items-center">
                        <span className="mr-2">✨</span>
                        Benefits:
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {guide.benefits.slice(0, 2).map((benefit, index) => (
                          <span key={index} className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                            {benefit}
                          </span>
                        ))}
                        {guide.benefits.length > 2 && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                            +{guide.benefits.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => openGuideModal(guide)}
                      className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-3 px-4 rounded-xl hover:from-indigo-600 hover:to-purple-700 transform hover:-translate-y-0.5 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <div className="flex items-center justify-center">
                        <span className="mr-2">🚀</span>
                        Start Practice
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

            {/* Wellness Goals */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">🎯 Wellness Goals</h3>
                  <p className="text-gray-600 mt-2">Set and track your personal wellness objectives</p>
                </div>
                <button
                  onClick={() => setIsAddingGoal(!isAddingGoal)}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-2xl hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  <span className="mr-2">+</span>
                  Add Goal
                </button>
              </div>

              {/* Add Goal Form */}
              {isAddingGoal && (
                <div className="mb-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">✨ Create New Goal</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Goal Title</label>
                      <input
                        type="text"
                        placeholder="e.g., Practice meditation daily"
                        value={newGoal.title}
                        onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        placeholder="Describe your goal and why it's important to you..."
                        value={newGoal.description}
                        onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <select
                          value={newGoal.category}
                          onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300"
                        >
                          {goalCategories.map((category) => (
                            <option key={category.value} value={category.value}>
                              {category.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Target Date</label>
                        <input
                          type="date"
                          value={newGoal.targetDate}
                          onChange={(e) => setNewGoal({...newGoal, targetDate: e.target.value})}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-3 pt-2">
                      <button
                        onClick={handleAddGoal}
                        className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-2xl hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                      >
                        <span className="mr-2">💾</span>
                        Save Goal
                      </button>
                      <button
                        onClick={() => setIsAddingGoal(false)}
                        className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-2xl hover:bg-gray-600 transition-all duration-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Goals List */}
              <div className="space-y-4">
                {goals.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-700 mb-2">No goals set yet</h4>
                    <p className="text-gray-500 mb-4">Start your wellness journey by setting your first goal!</p>
                    <button
                      onClick={() => setIsAddingGoal(true)}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
                    >
                      <span className="mr-2">🎯</span>
                      Set Your First Goal
                    </button>
                  </div>
                ) : (
                  goals.map((goal) => {
                    const category = goalCategories.find(c => c.value === goal.category);
                    return (
                      <div key={goal.id} className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:scale-105 transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-gray-800 mb-2">{goal.title}</h4>
                            {goal.description && (
                              <p className="text-gray-600 text-sm mb-3 leading-relaxed">{goal.description}</p>
                            )}
                            <div className="flex items-center space-x-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${category?.color}`}>
                                {category?.label}
                              </span>
                              {goal.targetDate && (
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                  📅 {new Date(goal.targetDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="text-red-500 hover:text-red-700 transition-colors hover:bg-red-50 p-2 rounded-lg"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Progress</span>
                            <span className="text-sm font-bold text-gray-800">{goal.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-1000 ease-out shadow-sm"
                              style={{ width: `${goal.progress}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {[0, 25, 50, 75, 100].map((value) => (
                            <button
                              key={value}
                              onClick={() => handleUpdateProgress(goal.id, value)}
                              className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-300 ${
                                goal.progress === value
                                  ? 'bg-indigo-500 text-white shadow-md'
                                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300 hover:scale-105'
                              }`}
                            >
                              {value}%
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Enhanced Community Tips */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
                <div className="mb-4 lg:mb-0">
                  <h3 className="text-2xl font-bold text-gray-800">💬 Community Tips</h3>
                  <p className="text-gray-600 mt-2">Share wisdom and learn from our wellness community</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-500">
                    {getFilteredCommunityTips().length} tips shared
                  </div>
                  <button
                    onClick={() => setShowAddTipForm(!showAddTipForm)}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold py-2 px-4 rounded-xl hover:from-purple-600 hover:to-pink-700 transform hover:-translate-y-0.5 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Share a Tip
                    </div>
                  </button>
                </div>
              </div>

              {/* Add Tip Form */}
              {showAddTipForm && (
                <div className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Share Your Wellness Tip</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Your Tip</label>
                      <textarea
                        value={newTip.tip}
                        onChange={(e) => setNewTip({ ...newTip, tip: e.target.value })}
                        placeholder="Share a helpful wellness tip that has worked for you..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        rows={3}
                        maxLength={500}
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {newTip.tip.length}/500 characters
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        value={newTip.category}
                        onChange={(e) => setNewTip({ ...newTip, category: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        {tipCategories.filter(cat => cat.value !== 'all').map(category => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={addCommunityTip}
                        disabled={!newTip.tip.trim()}
                        className="bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold py-2 px-6 rounded-xl hover:from-purple-600 hover:to-pink-700 transform hover:-translate-y-0.5 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        Share Tip
                      </button>
                      <button
                        onClick={() => {
                          setShowAddTipForm(false);
                          setNewTip({ tip: '', category: 'general' });
                        }}
                        className="bg-gray-200 text-gray-700 font-semibold py-2 px-6 rounded-xl hover:bg-gray-300 transition-all duration-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Category Filter */}
              <div className="mb-6">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Filter by category:</span>
                  <select
                    value={tipCategory}
                    onChange={(e) => setTipCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  >
                    {tipCategories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="space-y-4">
                {getFilteredCommunityTips().map((tip) => (
                  <div key={tip.id} className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:scale-105 transition-all duration-300">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="text-gray-700 text-sm leading-relaxed">{tip.tip}</p>
                        {!tip.isDefault && (
                          <div className="mt-2 flex items-center space-x-2">
                            <span className="text-xs text-gray-500">by {tip.author}</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">
                              {new Date(tip.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                      {!tip.isDefault && (
                        <div className="ml-4 flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full" title="User-generated tip"></div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        {tip.category}
                      </span>
                      <button
                        onClick={() => toggleLikeTip(tip.id)}
                        className={`flex items-center space-x-2 transition-all duration-200 ${
                          likedTips.includes(tip.id) 
                            ? 'text-red-500 hover:text-red-600' 
                            : 'text-gray-500 hover:text-red-500'
                        }`}
                      >
                        <svg 
                          className={`w-4 h-4 ${likedTips.includes(tip.id) ? 'fill-current' : ''}`} 
                          fill={likedTips.includes(tip.id) ? 'currentColor' : 'none'} 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span className="text-xs font-medium">{tip.likes}</span>
                      </button>
                    </div>
                  </div>
                ))}
                
                {getFilteredCommunityTips().length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-600 mb-2">No tips in this category yet</h3>
                    <p className="text-gray-500 mb-4">Be the first to share a tip in this category!</p>
                    <button
                      onClick={() => setShowAddTipForm(true)}
                      className="bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold py-2 px-4 rounded-xl hover:from-purple-600 hover:to-pink-700 transform hover:-translate-y-0.5 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      Share Your First Tip
                    </button>
                  </div>
                )}
              </div>
            </div>
        </main>
      )}

      {/* Interactive Guide Modal */}
      {showGuideModal && selectedGuide && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-4xl">{selectedGuide.emoji}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{selectedGuide.title}</h2>
                    <div className="flex items-center space-x-3 mt-2">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                        {selectedGuide.category}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedGuide.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                        selectedGuide.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {selectedGuide.difficulty}
                      </span>
                      <span className="flex items-center text-gray-500 text-sm">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {selectedGuide.duration}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={closeGuideModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">About This Practice</h3>
                <p className="text-gray-600 leading-relaxed">{selectedGuide.description}</p>
              </div>

              {/* Tips */}
              {selectedGuide.tips && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                    <span className="mr-2">💡</span>
                    Pro Tip
                  </h4>
                  <p className="text-blue-700">{selectedGuide.tips}</p>
                </div>
              )}

              {/* Steps */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="mr-2">📋</span>
                  Step-by-Step Guide
                </h3>
                <div className="space-y-4">
                  {selectedGuide.steps.map((step: string, index: number) => (
                    <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-2xl">
                      <div className="w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 leading-relaxed pt-1">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="mr-2">✨</span>
                  Benefits
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedGuide.benefits.map((benefit: string, index: number) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-emerald-700 font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    markAsCompleted(selectedGuide.id);
                    closeGuideModal();
                  }}
                  disabled={dailyCompletedGuides.includes(selectedGuide.id)}
                  className={`flex-1 font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl ${
                    dailyCompletedGuides.includes(selectedGuide.id)
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transform hover:-translate-y-0.5'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {dailyCompletedGuides.includes(selectedGuide.id) ? 'Completed Today!' : 'Mark as Completed'}
                  </div>
                </button>
                <button
                  onClick={() => toggleFavorite(selectedGuide.id)}
                  className={`flex-1 font-semibold py-3 px-6 rounded-xl transition-all duration-300 ${
                    favoriteGuides.includes(selectedGuide.id)
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill={favoriteGuides.includes(selectedGuide.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {favoriteGuides.includes(selectedGuide.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcesPage;
