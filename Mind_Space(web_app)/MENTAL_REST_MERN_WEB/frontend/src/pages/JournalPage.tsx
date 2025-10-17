import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Cache clearing will be handled by page refresh

const API_BASE_URL = 'http://localhost:5000/api';

const JournalPage = () => {
  const [user, setUser] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [currentEntry, setCurrentEntry] = useState({
    id: null,
    content: '',
    mood: '',
    tags: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const guidedPrompts = [
    "What are three things you're grateful for today?",
    "Describe a moment that made you smile today.",
    "What challenge did you overcome recently?",
    "How are you feeling right now, and why?",
    "What would you like to let go of today?",
    "What's one thing you learned about yourself this week?",
    "Describe your ideal day in detail.",
    "What's something you're looking forward to?",
    "How did you take care of yourself today?",
    "What's a small win you had today?"
  ];

  const moodOptions = [
    { value: 'happy', emoji: '😊', label: 'Happy' },
    { value: 'sad', emoji: '😢', label: 'Sad' },
    { value: 'angry', emoji: '😠', label: 'Angry' },
    { value: 'anxious', emoji: '😰', label: 'Anxious' },
    { value: 'calm', emoji: '😌', label: 'Calm' },
    { value: 'excited', emoji: '🤩', label: 'Excited' },
    { value: 'grateful', emoji: '🙏', label: 'Grateful' },
    { value: 'stressed', emoji: '😓', label: 'Stressed' },
    { value: 'peaceful', emoji: '🧘', label: 'Peaceful' },
    { value: 'motivated', emoji: '💪', label: 'Motivated' },
    { value: 'confused', emoji: '😕', label: 'Confused' },
    { value: 'hopeful', emoji: '🌟', label: 'Hopeful' }
  ];

  useEffect(() => {
    fetchUserData();
    fetchJournalEntries();
  }, []);

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

  const fetchJournalEntries = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/journals?limit=50&sortBy=createdAt&sortOrder=desc`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const formattedEntries = response.data.entries.map((entry: any) => ({
        id: entry._id,
        content: entry.content,
        mood: entry.mood,
        tags: entry.tags || [],
        date: new Date(entry.createdAt).toISOString().split('T')[0],
        title: entry.title || 'Untitled Entry',
        isFavorite: entry.isFavorite || false
      }));

      setEntries(formattedEntries);
    } catch (error) {
      console.error('Failed to fetch journal entries:', error);
      setMessage({ type: 'error', text: 'Failed to load journal entries' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentEntry(prev => ({
      ...prev,
      [name]: value
    }));
    setMessage(null);
  };

  const handlePromptClick = (prompt: string) => {
    setCurrentEntry(prev => ({
      ...prev,
      content: prev.content + (prev.content ? '\n\n' : '') + prompt + '\n'
    }));
  };

  const handleSave = async () => {
    if (!currentEntry.content.trim()) {
      setMessage({ type: 'error', text: 'Please write something before saving.' });
      return;
    }

    setIsSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const entryData = {
        content: currentEntry.content,
        mood: currentEntry.mood,
        tags: currentEntry.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        title: currentEntry.content.substring(0, 50) + (currentEntry.content.length > 50 ? '...' : '')
      };

      let response;
      if (isEditing && currentEntry.id) {
        // Update existing entry
        response = await axios.put(`${API_BASE_URL}/journals/${currentEntry.id}`, entryData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Create new entry
        response = await axios.post(`${API_BASE_URL}/journals`, entryData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      // Refresh the entries list
      await fetchJournalEntries();
      
      // Cache will be refreshed when user navigates to Dashboard/Profile
      
      setCurrentEntry({
        id: null,
        content: '',
        mood: '',
        tags: '',
        date: new Date().toISOString().split('T')[0]
      });
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Entry saved successfully!' });
    } catch (error) {
      console.error('Failed to save entry:', error);
      setMessage({ type: 'error', text: 'Failed to save entry. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (entry: any) => {
    setCurrentEntry({
      id: entry.id,
      content: entry.content,
      mood: entry.mood,
      tags: entry.tags.join(', '),
      date: entry.date
    });
    setIsEditing(true);
    setMessage(null);
  };

  const handleDelete = (entryId: number) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      const updatedEntries = entries.filter(entry => entry.id !== entryId);
      setEntries(updatedEntries);
      localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
      setMessage({ type: 'success', text: 'Entry deleted successfully!' });
    }
  };

  const handleToggleFavorite = async (entryId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const entry = entries.find(e => e.id === entryId);
      if (!entry) return;

      // Use the dedicated favorite endpoint
      const response = await axios.post(`${API_BASE_URL}/journals/${entryId}/favorite`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state with the new favorite status
      setEntries(entries.map(e => 
        e.id === entryId ? { ...e, isFavorite: response.data.isFavorite } : e
      ));

      setMessage({ 
        type: 'success', 
        text: response.data.isFavorite ? 'Added to favorites! ⭐' : 'Removed from favorites!' 
      });
    } catch (error) {
      console.error('Failed to update favorite status:', error);
      setMessage({ type: 'error', text: 'Failed to update favorite status' });
    }
  };

  const handleNewEntry = () => {
    setCurrentEntry({
      id: null,
      content: '',
      mood: '',
      tags: '',
      date: new Date().toISOString().split('T')[0]
    });
    setIsEditing(false);
    setMessage(null);
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  MindSpace
                </h1>
                <p className="text-sm text-gray-500 font-medium">Your Personal Journal</p>
              </div>
            </div>
            
            <nav className="hidden lg:flex space-x-8">
              <a href="/dashboard" className="text-gray-600 hover:text-indigo-600 transition-all duration-300 font-medium hover:scale-105">Dashboard</a>
              <a href="/journal" className="text-indigo-600 font-semibold bg-indigo-50 px-4 py-2 rounded-xl">Journal</a>
              <a href="/insights" className="text-gray-600 hover:text-indigo-600 transition-all duration-300 font-medium hover:scale-105">Insights</a>
              <a href="/resources" className="text-gray-600 hover:text-indigo-600 transition-all duration-300 font-medium hover:scale-105">Resources</a>
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
              Express Your <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Thoughts</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Capture your daily experiences, emotions, and reflections in your personal digital journal
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
              <p className="text-gray-600 font-medium">Loading your journal...</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!isLoading && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Journal Editor */}
          <div className="xl:col-span-2 space-y-8">
            {/* Journal Editor */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    {isEditing ? '✏️ Edit Entry' : '✨ New Journal Entry'}
                  </h2>
                  <p className="text-gray-600">
                    {isEditing ? 'Refine your thoughts' : 'Start your journey of self-discovery'}
                  </p>
                </div>
                <button
                  onClick={handleNewEntry}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  + New Entry
                </button>
              </div>

              {/* Date and Mood Selector */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    📅 Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={currentEntry.date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    😊 How are you feeling?
                  </label>
                  <select
                    name="mood"
                    value={currentEntry.mood}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                  >
                    <option value="">Choose your mood...</option>
                    {moodOptions.map((mood) => (
                      <option key={mood.value} value={mood.value}>
                        {mood.emoji} {mood.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Guided Prompts */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">💡 Need inspiration? Try these prompts:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {guidedPrompts.slice(0, 6).map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handlePromptClick(prompt)}
                      className="text-left p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl hover:from-indigo-100 hover:to-purple-100 transition-all duration-300 hover:shadow-md hover:scale-105"
                    >
                      <p className="text-sm text-gray-700 font-medium">{prompt}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Editor */}
              <div className="mb-8">
                <label className="block text-lg font-semibold text-gray-700 mb-4">
                  ✍️ What's on your mind?
                </label>
                <div className="relative">
                  <textarea
                    name="content"
                    value={currentEntry.content}
                    onChange={handleInputChange}
                    rows={12}
                    placeholder="Start writing about your day, thoughts, feelings, or anything that's on your mind... Let your thoughts flow freely."
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 resize-none bg-white/50 backdrop-blur-sm text-gray-800 placeholder-gray-400"
                  />
                  <div className="absolute bottom-4 right-4 text-sm text-gray-500 bg-white/80 px-3 py-1 rounded-full">
                    {currentEntry.content.length} characters
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="mb-8">
                <label className="block text-lg font-semibold text-gray-700 mb-4">
                  🏷️ Tags (comma-separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={currentEntry.tags}
                  onChange={handleInputChange}
                  placeholder="work, family, gratitude, stress, achievement, reflection..."
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                />
              </div>

              {/* Save Button */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handleSave}
                  disabled={isSaving || !currentEntry.content.trim()}
                  className="px-10 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
                >
                  {isSaving ? (
                    <div className="flex items-center">
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      <span className="text-lg">Saving your thoughts...</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{isEditing ? '✏️' : '💾'}</span>
                      <span className="text-lg">{isEditing ? 'Update Entry' : 'Save Entry'}</span>
                    </div>
                  )}
                </button>
                
                {isEditing && (
                  <button
                    onClick={handleNewEntry}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {/* Message */}
              {message && (
                <div className={`mt-4 p-4 rounded-xl ${
                  message.type === 'success' 
                    ? 'bg-green-100 border border-green-400 text-green-700' 
                    : 'bg-red-100 border border-red-400 text-red-700'
                }`}>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {message.type === 'success' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      )}
                    </svg>
                    {message.text}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Motivational Sidebar */}
          <div className="space-y-8">
            {/* Writing Streak & Stats */}
            <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-6 text-white shadow-xl">
              <h3 className="text-xl font-bold mb-4">📊 Your Progress</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-90">Writing Streak</span>
                  <span className="text-2xl font-bold">🔥 7 days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-90">Total Entries</span>
                  <span className="text-2xl font-bold">{entries.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-90">This Month</span>
                  <span className="text-2xl font-bold">{entries.filter(entry => {
                    const entryDate = new Date(entry.date);
                    const now = new Date();
                    return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
                  }).length}</span>
                </div>
              </div>
            </div>

            {/* Daily Motivation */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20">
              <h3 className="text-xl font-bold text-gray-800 mb-4">💫 Daily Inspiration</h3>
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-4 border border-yellow-200">
                <p className="text-gray-700 font-medium italic">
                  "The act of writing is the act of discovering what you believe."
                </p>
                <p className="text-sm text-gray-500 mt-2">- David Hare</p>
              </div>
            </div>

            {/* Recent Entries */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20">
              <h3 className="text-xl font-bold text-gray-800 mb-6">📝 Recent Entries</h3>
              {entries.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium">No entries yet</p>
                  <p className="text-gray-400 text-sm">Start your journaling journey!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {entries.slice(0, 5).map((entry) => {
                    const moodOption = moodOptions.find(m => m.value === entry.mood);
                    return (
                      <div key={entry.id} className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-2xl p-4 hover:shadow-lg hover:scale-105 transition-all duration-300">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            {moodOption && (
                              <>
                                <div className="w-8 h-8 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                                  <span className="text-lg">{moodOption.emoji}</span>
                                </div>
                                <span className="text-sm font-semibold text-gray-700">{moodOption.label}</span>
                              </>
                            )}
                            {entry.isFavorite && (
                              <div className="flex items-center space-x-1">
                                <span className="text-yellow-500 text-sm">⭐</span>
                                <span className="text-xs text-yellow-600 font-medium">Favorite</span>
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{entry.date}</span>
                        </div>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
                          {entry.content.substring(0, 120)}...
                        </p>
                        {entry.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {entry.tags.slice(0, 3).map((tag: string, index: number) => (
                              <span key={index} className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">
                                #{tag}
                              </span>
                            ))}
                            {entry.tags.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                +{entry.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleToggleFavorite(entry.id)}
                            className={`text-sm font-medium transition-all duration-200 px-2 py-1 rounded-lg ${
                              entry.isFavorite 
                                ? 'text-yellow-600 hover:text-yellow-700 bg-yellow-50 hover:bg-yellow-100' 
                                : 'text-gray-500 hover:text-yellow-600 hover:bg-yellow-50'
                            }`}
                            title={entry.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            {entry.isFavorite ? '⭐ Favorited' : '☆ Add to Favorites'}
                          </button>
                          <button
                            onClick={() => handleEdit(entry)}
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors hover:bg-indigo-50 px-2 py-1 rounded-lg"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors hover:bg-red-50 px-2 py-1 rounded-lg"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
        </main>
      )}
    </div>
  );
};

export default JournalPage;
