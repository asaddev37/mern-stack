import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Streak service functions
const fetchStreakData = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const userResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const entriesResponse = await axios.get(`${API_BASE_URL}/journals?limit=1000&sortBy=createdAt&sortOrder=desc`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const userData = userResponse.data;
    const allEntries = entriesResponse.data.entries;

    return {
      currentStreak: userData.streak?.current || 0,
      longestStreak: userData.streak?.longest || 0,
      lastEntryDate: userData.streak?.lastEntryDate || null,
      totalEntries: entriesResponse.data.pagination?.totalEntries || allEntries.length,
      favoriteEntries: allEntries.filter((entry: any) => entry.isFavorite).length
    };
  } catch (error) {
    console.error('Failed to fetch streak data:', error);
    throw error;
  }
};

const API_BASE_URL = 'http://localhost:5000/api';

// ThemeToggle component removed - use Profile page appearance button instead

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [moodData, setMoodData] = useState({
    today: 'happy',
    streak: 0,
    totalEntries: 0,
    favorites: 0,
    bestStreak: 0
  });
  const [recentEntries, setRecentEntries] = useState<any[]>([]);
  const [aiInsight, setAiInsight] = useState('');
  const [isStreamingInsight, setIsStreamingInsight] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  useEffect(() => {
    fetchUserData();
    fetchDashboardData();
    loadProfilePicture();
  }, []);

  // Refresh data when component becomes visible (e.g., when navigating back from journal page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchDashboardData(true); // Preserve AI insights
      }
    };

    const handleFocus = () => {
      fetchDashboardData(true); // Preserve AI insights
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const loadProfilePicture = () => {
    const storedPicture = localStorage.getItem('profilePicture');
    if (storedPicture) {
      setProfilePicture(storedPicture);
    }
  };

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      // Try to get user data from localStorage first as fallback
      const localUser = localStorage.getItem('user');
      if (localUser) {
        setUser(JSON.parse(localUser));
      }

      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // The /auth/me endpoint returns { user, stats }, so we need to extract the user
      const userData = response.data.user || response.data;
      setUser(userData);
      // Update localStorage with fresh data
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('User data loaded:', userData);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      // If API fails but we have local data, keep using it
      const localUser = localStorage.getItem('user');
      if (!localUser) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
  };

  const fetchDashboardData = async (preserveAIInsight = false) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      // Fetch recent journal entries for display
      const entriesResponse = await axios.get(`${API_BASE_URL}/journals?limit=5&sortBy=createdAt&sortOrder=desc`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Only fetch AI insights if we don't have one or if not preserving
      if (!preserveAIInsight || !aiInsight) {
        // Stream AI dashboard summary first, fallback to stored insight
        setIsStreamingInsight(true);
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        const resp = await fetch(`${API_BASE_URL}/insights/dashboard-summary/stream?period=7&refresh=true`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (resp.ok && resp.body) {
          const reader = resp.body.getReader();
          const decoder = new TextDecoder('utf-8');
          let partial = '';
          let finalSummary = '';
          let finalHighlight = '';
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            partial += chunk;
            const lines = partial.split('\n');
            partial = lines.pop() || '';
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataStr = line.replace('data: ', '').trim();
                try {
                  const data = JSON.parse(dataStr);
                  if (data.summary) {
                    finalSummary = data.summary;
                  }
                  if (data.highlight) {
                    finalHighlight = data.highlight;
                  }
                } catch {}
              }
            }
          }
          if (finalSummary) {
            console.log('Dashboard: Setting AI insight:', finalSummary);
            setAiInsight(finalSummary);
            // Store highlight for potential future use
            if (finalHighlight) {
              localStorage.setItem('dashboardHighlight', finalHighlight);
            }
          }
        }
      } catch (error) {
        console.error('Dashboard AI insights error:', error);
        // Only set fallback if no AI response was received
        if (!aiInsight) {
          setAiInsight('Start journaling to get personalized insights about your mental wellness journey.');
        }
      }
      } // End of AI insights block

      // Get streak data using the centralized service
      const streakData = await fetchStreakData();

      // Process recent entries
      const entries = entriesResponse.data.entries.map((entry: any) => ({
        id: entry._id,
        date: new Date(entry.createdAt).toLocaleDateString(),
        mood: entry.mood,
        preview: entry.content.substring(0, 100) + '...',
        tags: entry.tags || []
      }));

      setRecentEntries(entries);

      // Set mood data using streak service data
      setMoodData({
        today: entries[0]?.mood || 'neutral',
        streak: streakData.currentStreak,
        totalEntries: streakData.totalEntries,
        favorites: streakData.favoriteEntries,
        bestStreak: streakData.longestStreak
      });

      setIsStreamingInsight(false);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const moodEmojis = {
    happy: '😊',
    sad: '😢',
    angry: '😠',
    anxious: '😰',
    calm: '😌',
    excited: '🤩',
    grateful: '🙏',
    stressed: '😓',
    peaceful: '🧘',
    motivated: '💪'
  };

  const moodColors = {
    happy: 'from-yellow-400 to-orange-400',
    sad: 'from-blue-400 to-indigo-400',
    angry: 'from-red-400 to-pink-400',
    anxious: 'from-purple-400 to-indigo-400',
    calm: 'from-green-400 to-teal-400',
    excited: 'from-pink-400 to-purple-400',
    grateful: 'from-orange-400 to-yellow-400',
    stressed: 'from-gray-400 to-slate-400',
    peaceful: 'from-emerald-400 to-green-400',
    motivated: 'from-blue-500 to-purple-500'
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  MindSpace
                </h1>
                <p className="text-sm font-medium text-gray-500">Your Wellness Dashboard</p>
              </div>
            </div>
            
            <nav className="hidden lg:flex space-x-8">
              <a href="/dashboard" className="font-semibold px-4 py-2 rounded-xl text-indigo-600 bg-indigo-50">Dashboard</a>
              <a href="/journal" className="text-gray-600 hover:text-indigo-600 transition-all duration-300 font-medium hover:scale-105">Journal</a>
              <a href="/insights" className="text-gray-600 hover:text-indigo-600 transition-all duration-300 font-medium hover:scale-105">Insights</a>
              <a href="/resources" className="text-gray-600 hover:text-indigo-600 transition-all duration-300 font-medium hover:scale-105">Resources</a>
              <a href="/profile" className="text-gray-600 hover:text-indigo-600 transition-all duration-300 font-medium hover:scale-105">Profile</a>
            </nav>
            
            <div className="flex items-center space-x-4">
              {/* Theme toggle removed - use Profile page appearance button instead */}
              
              <div className="hidden sm:flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                  {profilePicture ? (
                    <img 
                      src={profilePicture} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">Welcome back,</p>
                  <p className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{user?.name || 'User'}</p>
                </div>
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
              Welcome back, <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">{user?.name || (isLoading ? 'Loading...' : 'User')}</span>! 👋
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              How are you feeling today? Let's continue your mental wellness journey together.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg border border-white/20">
                <span className="text-sm font-medium text-gray-600">Today's Date</span>
                <p className="text-lg font-bold text-gray-800">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg border border-white/20">
                <span className="text-sm font-medium text-gray-600">Current Time</span>
                <p className="text-lg font-bold text-gray-800">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Mood Ring & Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Mood Ring */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">😊 Today's Mood</h3>
                <p className="text-gray-600">How are you feeling right now?</p>
              </div>
              <div className="flex flex-col items-center">
                <div className={`w-40 h-40 rounded-full bg-gradient-to-br ${moodColors[moodData.today as keyof typeof moodColors]} flex items-center justify-center mb-6 shadow-2xl hover:scale-105 transition-transform duration-300`}>
                  <span className="text-7xl">{moodEmojis[moodData.today as keyof typeof moodEmojis]}</span>
                </div>
                <p className="text-2xl font-bold text-gray-800 capitalize mb-3">{moodData.today}</p>
                <p className="text-sm text-gray-500 text-center leading-relaxed">
                  You're doing great! Keep up the positive energy and continue your wellness journey.
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">⚡ Quick Actions</h3>
                <p className="text-gray-600">Jump into your wellness activities</p>
              </div>
              <div className="space-y-4">
                <a 
                  href="/journal"
                  className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-2xl hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <span className="text-lg">Write Journal</span>
                </a>
                <a 
                  href="/insights"
                  className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-2xl hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="text-lg">View Insights</span>
                </a>
                <a 
                  href="/resources"
                  className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-2xl hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="text-lg">Explore Resources</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column - Recent Entries & Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="text-2xl">📝</span>
                </div>
                <div className="text-3xl font-bold mb-1">{moodData.totalEntries}</div>
                <div className="text-blue-100 font-medium">Total Entries</div>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="text-2xl">🔥</span>
                </div>
                <div className="text-3xl font-bold mb-1">{moodData.streak}</div>
                <div className="text-emerald-100 font-medium">Day Streak</div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <span className="text-2xl">⭐</span>
                </div>
                <div className="text-3xl font-bold mb-1">{moodData.favorites}</div>
                <div className="text-purple-100 font-medium">Favorites</div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <span className="text-2xl">🏆</span>
                </div>
                <div className="text-3xl font-bold mb-1">{moodData.bestStreak}</div>
                <div className="text-orange-100 font-medium">Best Streak</div>
              </div>
            </div>

            {/* Recent Entries */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">📖 Recent Entries</h3>
                  <p className="text-gray-600">Your latest journal entries and thoughts</p>
                </div>
                <a 
                  href="/journal"
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-2xl hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  View All
                </a>
              </div>
              <div className="space-y-6">
                {recentEntries.length > 0 ? (
                  recentEntries.map((entry: any) => (
                    <div key={entry.id} className="bg-gradient-to-r from-white to-gray-50 rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${moodColors[entry.mood as keyof typeof moodColors]} flex items-center justify-center shadow-lg`}>
                            <span className="text-2xl">{moodEmojis[entry.mood as keyof typeof moodEmojis]}</span>
                          </div>
                          <div>
                            <span className="text-lg font-bold text-gray-800 capitalize">{entry.mood}</span>
                            <p className="text-sm text-gray-500">{entry.date}</p>
                          </div>
                        </div>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      </div>
                      <p className="text-gray-700 mb-4 leading-relaxed">{entry.preview}</p>
                      <div className="flex flex-wrap gap-2">
                        {entry.tags.map((tag, index) => (
                          <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full font-medium">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-600 mb-2">No entries yet</h4>
                    <p className="text-gray-500 mb-6">Start your wellness journey by writing your first journal entry!</p>
                    <a 
                      href="/journal"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-2xl hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Write Your First Entry
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-8 text-white shadow-xl">
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">🤖 AI Insights</h3>
                  <p className="text-indigo-100">Personalized wellness recommendations</p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
                <p className="text-white leading-relaxed text-lg">{aiInsight}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-indigo-100">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium">Powered by AI • Updated 2 hours ago</span>
                </div>
                <a 
                  href="/insights"
                  className="px-4 py-2 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-all duration-300"
                >
                  View More
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;