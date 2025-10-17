import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const InsightsPage = () => {
  const [user, setUser] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isStreamingSummary, setIsStreamingSummary] = useState<boolean>(false);
  const [aiHighlight, setAiHighlight] = useState<string>('');
  const [aiWellnessTips, setAiWellnessTips] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isChatStreaming, setIsChatStreaming] = useState<boolean>(false);
  const [isGeneratingTips, setIsGeneratingTips] = useState(false);
  const [tipsHistory, setTipsHistory] = useState<any[]>([]);
  const [currentTipCategory, setCurrentTipCategory] = useState<string>('general');
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const moodOptions = [
    { value: 'happy', emoji: '😊', label: 'Happy', color: '#FCD34D' },
    { value: 'sad', emoji: '😢', label: 'Sad', color: '#60A5FA' },
    { value: 'angry', emoji: '😠', label: 'Angry', color: '#F87171' },
    { value: 'anxious', emoji: '😰', label: 'Anxious', color: '#A78BFA' },
    { value: 'calm', emoji: '😌', label: 'Calm', color: '#34D399' },
    { value: 'excited', emoji: '🤩', label: 'Excited', color: '#F472B6' },
    { value: 'grateful', emoji: '🙏', label: 'Grateful', color: '#FB923C' },
    { value: 'stressed', emoji: '😓', label: 'Stressed', color: '#9CA3AF' },
    { value: 'peaceful', emoji: '🧘', label: 'Peaceful', color: '#10B981' },
    { value: 'motivated', emoji: '💪', label: 'Motivated', color: '#3B82F6' }
  ];


  const wellnessTips = [
    {
      title: "Deep Breathing Exercise",
      description: "Try the 4-7-8 breathing technique: Inhale for 4 counts, hold for 7, exhale for 8.",
      category: "Stress Relief"
    },
    {
      title: "Gratitude Practice",
      description: "Write down three things you're grateful for each morning to start your day positively.",
      category: "Mindfulness"
    },
    {
      title: "Mindful Walking",
      description: "Take a 10-minute walk while focusing on your surroundings and breathing.",
      category: "Physical Wellness"
    },
    {
      title: "Digital Detox",
      description: "Take a 30-minute break from screens before bedtime to improve sleep quality.",
      category: "Sleep Hygiene"
    }
  ];

  useEffect(() => {
    fetchUserData();
    fetchInsightsData();
    generateAISummary();
  }, [selectedPeriod]);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        setIsStreamingSummary(true);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        const resp = await fetch(`${API_BASE_URL}/insights/dashboard-summary/stream?period=7`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (resp.ok && resp.body) {
          const reader = resp.body.getReader();
          const decoder = new TextDecoder('utf-8');
          let partial = '';
          let finalSummary = '';
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
                  if (data.summary) finalSummary = data.summary;
                } catch {}
              }
            }
          }
          if (finalSummary) setAiSummary(finalSummary);
        }
      } catch {}
      finally {
        setIsStreamingSummary(false);
      }
    })();
  }, [selectedPeriod]);

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

  const fetchInsightsData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      // Fetch journal entries for the selected period
      const entriesResponse = await axios.get(`${API_BASE_URL}/journals?limit=100&sortBy=createdAt&sortOrder=desc`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Fetch AI insights (optional). If it fails, ignore.
      let insightsResponse: any = { data: {} };
      try {
        insightsResponse = await axios.get(`${API_BASE_URL}/insights`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      } catch {}

      const formattedEntries = entriesResponse.data.entries.map((entry: any) => ({
        id: entry._id,
        content: entry.content,
        mood: entry.mood,
        tags: entry.tags || [],
        date: new Date(entry.createdAt).toISOString().split('T')[0],
        createdAt: entry.createdAt
      }));

      setEntries(formattedEntries);

      // Set AI insights
      if (insightsResponse.data?.insights && insightsResponse.data.insights.length > 0) {
        setAiInsights(insightsResponse.data.insights);
      } else {
        // Fallback insights if none available
        setAiInsights([
          {
            title: "Getting Started",
            content: "Start journaling regularly to get personalized insights about your mental wellness journey.",
            type: "info"
          }
        ]);
      }

    } catch (error) {
      console.error('Failed to fetch insights data:', error);
      setError('Failed to load insights data');
    } finally {
      setIsLoading(false);
    }
  };

  const generateAISummary = async () => {
    try {
      setIsStreamingSummary(true);
      setAiSummary('');
      setAiHighlight('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const streamUrl = `${API_BASE_URL}/insights/summary/stream?period=7&refresh=true`;
      console.log('Fetching AI summary from:', streamUrl);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      let accumulated = '';
      let completedPayload: any = null;
      try {
        const resp = await fetch(streamUrl, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        console.log('Response status:', resp.status, resp.statusText);
        if (!resp.ok || !resp.body) {
          console.error('Streaming not available, status:', resp.status);
          throw new Error('Streaming not available');
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let partial = '';
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
                if (data.text) {
                  accumulated += data.text;
                } else if (data.summary || data.highlight) {
                  completedPayload = data;
                }
              } catch (_) {
                // ignore JSON parse errors on partials
              }
            }
          }
        }
      } catch (e) {
        console.error('AI Summary streaming failed:', e);
        // streaming failed; will fallback to non-streaming
      }

      let payload = completedPayload;
      if (!payload) {
        try {
          const summary = JSON.parse(accumulated);
          payload = summary;
        } catch (_) {
          payload = {
            summary: 'Keep up your wellness journey — small steps matter. 🌟',
            highlight: 'Your progress matters, one day at a time. 💙'
          };
        }
      }
      
      setAiSummary(payload.summary || 'Keep up your wellness journey — small steps matter. 🌟');
      setAiHighlight(payload.highlight || 'Your progress matters, one day at a time. 💙');
      
    } catch (error) {
      console.error('Failed to generate AI summary:', error);
      console.error('Error details:', error.message, error.stack);
      setAiSummary('Keep up your wellness journey — small steps matter. 🌟');
      setAiHighlight('Your progress matters, one day at a time. 💙');
    } finally {
      setIsStreamingSummary(false);
    }
  };

  const tipCategories = [
    { value: 'general', label: 'General Wellness', emoji: '🌟' },
    { value: 'stress', label: 'Stress Relief', emoji: '🧘' },
    { value: 'motivation', label: 'Motivation', emoji: '💪' },
    { value: 'mindfulness', label: 'Mindfulness', emoji: '🧠' },
    { value: 'social', label: 'Social Connection', emoji: '🤝' },
    { value: 'physical', label: 'Physical Health', emoji: '🏃' },
    { value: 'sleep', label: 'Sleep & Rest', emoji: '😴' },
    { value: 'gratitude', label: 'Gratitude', emoji: '🙏' }
  ];

  const generateAIWellnessTips = async (category: string = 'general', forceNew: boolean = true) => {
    try {
      setIsGeneratingTips(true);
      
      // Clear existing tips immediately to show loading state
      setAiWellnessTips(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      // Add timestamp and random seed to ensure fresh tips every time
      const timestamp = Date.now();
      const randomSeed = Math.random().toString(36).substring(7);
      
      console.log(`Generating fresh AI tips for category: ${category}, timestamp: ${timestamp}`);
      
      // Try streaming first
      const streamUrl = `${API_BASE_URL}/insights/wellness-tips/stream?period=7&category=${category}&timestamp=${timestamp}&seed=${randomSeed}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      let accumulated = '';
      let completedPayload: any = null;
      try {
        const resp = await fetch(streamUrl, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!resp.ok || !resp.body) throw new Error('Streaming not available');

        const reader = resp.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let partial = '';
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          partial += chunk;

          // Parse SSE lines
          const lines = partial.split('\n');
          // keep last partial line
          partial = lines.pop() || '';
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.replace('data: ', '').trim();
              try {
                const data = JSON.parse(dataStr);
                if (data.text) {
                  accumulated += data.text;
                } else if (data.tips || data.focus || data.encouragement) {
                  completedPayload = data;
                }
              } catch (_) {
                // ignore JSON parse errors on partials
              }
            }
          }
        }
      } catch (e) {
        // streaming failed; will fallback to non-streaming
      }

      let payload = completedPayload;
      if (!payload) {
        // Attempt to parse accumulated JSON
        try {
          const tips = JSON.parse(accumulated);
          payload = tips;
        } catch (_) {
          // Fallback to non-streaming endpoint
      const response = await axios.get(`${API_BASE_URL}/insights/wellness-tips?period=7&category=${category}&timestamp=${timestamp}&seed=${randomSeed}`, {
        headers: { Authorization: `Bearer ${token}` },
            timeout: 60000
      });
          payload = response.data;
        }
      }
      
      const newTips = {
        ...payload,
        category: category,
        generatedAt: new Date().toISOString(),
        id: `tips_${timestamp}_${randomSeed}`,
        isAIGenerated: true
      };
      
      console.log('Fresh AI tips received:', newTips);
      setAiWellnessTips(newTips);
      
      // Add to history for variety tracking
      setTipsHistory(prev => [newTips, ...prev.slice(0, 4)]); // Keep last 5 tips
      
    } catch (error) {
      console.error('Failed to generate AI wellness tips:', error);
      
      // Only show fallback if it's the first time or if AI completely fails
      if (!aiWellnessTips || error.code === 'ECONNABORTED') {
        console.log('Showing fallback tips due to AI timeout or first load');
        const fallbackTips = getFallbackTips(category);
        setAiWellnessTips({
          ...fallbackTips,
          category: category,
          generatedAt: new Date().toISOString(),
          id: `fallback_${Date.now()}`,
          isAIGenerated: false
        });
      } else {
        // If user clicked for fresh tips but AI failed, show error message
        console.log('AI generation failed, keeping existing tips');
        setAiWellnessTips(prev => prev ? {
          ...prev,
          error: 'AI is taking longer than expected. Please try again in a moment.'
        } : null);
      }
    } finally {
      setIsGeneratingTips(false);
    }
  };

  const getFallbackTips = (category: string) => {
    const fallbackData = {
      general: {
        tips: [
          'Take a 5-minute break to breathe deeply and center yourself',
          'Write down three things you\'re grateful for today',
          'Go for a short walk outside and notice your surroundings',
          'Listen to calming music or nature sounds',
          'Practice mindfulness meditation for 10 minutes'
        ],
        focus: 'general wellness',
        encouragement: 'Remember to be kind to yourself. Small steps lead to big changes.'
      },
      stress: {
        tips: [
          'Try the 4-7-8 breathing technique: inhale 4, hold 7, exhale 8',
          'Progressive muscle relaxation - tense and release each muscle group',
          'Take a warm bath or shower to relax your body',
          'Write down your worries and then let them go',
          'Practice grounding techniques: name 5 things you can see, hear, touch'
        ],
        focus: 'stress management',
        encouragement: 'You\'re stronger than your stress. Take it one breath at a time.'
      },
      motivation: {
        tips: [
          'Set one small, achievable goal for today',
          'Create a vision board or write down your dreams',
          'Celebrate your recent accomplishments, no matter how small',
          'Surround yourself with positive, inspiring content',
          'Break down big tasks into smaller, manageable steps'
        ],
        focus: 'motivation and goal-setting',
        encouragement: 'You have the power to create positive change. Start with one small step!'
      },
      mindfulness: {
        tips: [
          'Practice mindful eating - savor each bite without distractions',
          'Do a body scan meditation to check in with yourself',
          'Practice mindful walking - focus on each step and breath',
          'Try the RAIN technique: Recognize, Allow, Investigate, Nurture',
          'Spend 5 minutes observing your thoughts without judgment'
        ],
        focus: 'mindfulness and present-moment awareness',
        encouragement: 'The present moment is where life happens. Embrace it with curiosity.'
      },
      social: {
        tips: [
          'Reach out to a friend or family member you haven\'t talked to recently',
          'Join a community group or club that interests you',
          'Practice active listening in your conversations today',
          'Share something positive or funny with someone you care about',
          'Volunteer for a cause that matters to you'
        ],
        focus: 'social connection and community',
        encouragement: 'Connection is the foundation of well-being. Reach out and let others in.'
      },
      physical: {
        tips: [
          'Take a 10-minute walk or do some gentle stretching',
          'Drink a glass of water and stay hydrated throughout the day',
          'Try some light yoga or tai chi movements',
          'Get some fresh air and natural sunlight',
          'Practice good posture and take breaks from sitting'
        ],
        focus: 'physical wellness and movement',
        encouragement: 'Your body is your home. Treat it with love and care.'
      },
      sleep: {
        tips: [
          'Create a relaxing bedtime routine and stick to it',
          'Avoid screens 1 hour before bedtime',
          'Keep your bedroom cool, dark, and quiet',
          'Try relaxation techniques like deep breathing before sleep',
          'Write down any worries in a journal to clear your mind'
        ],
        focus: 'sleep hygiene and rest',
        encouragement: 'Quality sleep is essential for your well-being. Prioritize your rest.'
      },
      gratitude: {
        tips: [
          'Write down three specific things you\'re grateful for today',
          'Send a thank you message to someone who made a difference',
          'Notice and appreciate the small moments of joy',
          'Keep a gratitude jar and add one thing daily',
          'Practice gratitude meditation or reflection'
        ],
        focus: 'gratitude and appreciation',
        encouragement: 'Gratitude transforms what we have into enough. Count your blessings.'
      }
    };
    
    return fallbackData[category as keyof typeof fallbackData] || fallbackData.general;
  };

  const getMoodData = () => {
    const now = new Date();
    const periodDays = selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 90;
    const startDate = new Date(now.getTime() - (periodDays * 24 * 60 * 60 * 1000));
    
    const filteredEntries = entries.filter(entry => 
      new Date(entry.date) >= startDate
    );

    const moodCounts = moodOptions.reduce((acc, mood) => {
      acc[mood.value] = filteredEntries.filter(entry => entry.mood === mood.value).length;
      return acc;
    }, {} as Record<string, number>);

    return { filteredEntries, moodCounts };
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const { filteredEntries } = getMoodData();
      const exportData = {
        user: user?.name || 'User',
        period: selectedPeriod,
        exportDate: new Date().toISOString(),
        entries: filteredEntries,
        insights: aiInsights
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `mindspace-insights-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const sendChat = async () => {
    const text = chatInput.trim();
    if (!text) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    const newHistory = [...chatMessages, { role: 'user' as const, content: text }];
    setChatMessages(newHistory);
    setChatInput('');
    setIsChatStreaming(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      const resp = await fetch(`${API_BASE_URL}/insights/chat/stream`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({
          message: text,
          history: newHistory,
          context: { page: 'Insights' }
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (resp.ok && resp.body) {
        const reader = resp.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let partial = '';
        let assistant = '';
        // Insert a placeholder assistant bubble so users see incoming message
        setChatMessages(prev => [...prev, { role: 'assistant', content: '' }]);
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
                if (typeof data.text === 'string') {
                  assistant += data.text;
                  // Update last assistant bubble with streaming text
                  setChatMessages(prev => {
                    if (prev.length === 0) return [{ role: 'assistant', content: assistant }];
                    const updated = [...prev];
                    // Find last assistant index
                    let idx = updated.length - 1;
                    while (idx >= 0 && updated[idx].role !== 'assistant') idx--;
                    if (idx >= 0) {
                      updated[idx] = { role: 'assistant', content: assistant };
                    } else {
                      updated.push({ role: 'assistant', content: assistant });
                    }
                    return updated;
                  });
                }
              } catch {}
            }
          }
        }
        // No need to set the message again - streaming already updated it
      } else {
        // Non-OK response
        try {
          const err = await resp.json();
          setChatMessages(prev => [...prev, { role: 'assistant', content: err?.message || 'Sorry, I could not respond.' }]);
        } catch {
          setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I could not respond.' }]);
        }
      }
    } catch (e) {
      // Append an error bubble
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I had trouble responding. Please try again.' }]);
    } finally {
      setIsChatStreaming(false);
    }
  };

  const { filteredEntries, moodCounts } = getMoodData();
  const totalEntries = filteredEntries.length;
  const mostCommonMood = Object.entries(moodCounts).reduce((a, b) => moodCounts[a[0]] > moodCounts[b[0]] ? a : b, ['happy', 0]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-gray-900">
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  MindSpace
                </h1>
                <p className="text-sm text-gray-500 font-medium">Your Wellness Analytics</p>
              </div>
            </div>
            
            <nav className="hidden lg:flex space-x-8">
              <a href="/dashboard" className="text-gray-600 hover:text-indigo-600 transition-all duration-300 font-medium hover:scale-105">Dashboard</a>
              <a href="/journal" className="text-gray-600 hover:text-indigo-600 transition-all duration-300 font-medium hover:scale-105">Journal</a>
              <a href="/insights" className="text-indigo-600 font-semibold bg-indigo-50 px-4 py-2 rounded-xl">Insights</a>
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
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Your <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Wellness</span> Analytics
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover patterns in your emotions, track your mental wellness journey, and get personalized AI insights
            </p>
          </div>
          
          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">📊 Time Period:</span>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
              >
                <option value="week">Last 7 days</option>
                <option value="month">Last 30 days</option>
                <option value="quarter">Last 90 days</option>
              </select>
            </div>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isExporting ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Exporting...
                </div>
              ) : (
                <div className="flex items-center">
                  <span className="mr-2">📥</span>
                  Export Data
                </div>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* AI Explanation Section */}
      <section className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              How <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">AI</span> Powers Your Wellness Journey
            </h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our AI analyzes your journal entries and mood patterns to provide personalized insights and recommendations
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Sentiment Analysis</h4>
              <p className="text-gray-600 text-sm">AI analyzes the emotional tone of your journal entries to understand your mental state</p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Pattern Recognition</h4>
              <p className="text-gray-600 text-sm">Identifies trends in your mood and behavior patterns over time</p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Personalized Tips</h4>
              <p className="text-gray-600 text-sm">Generates custom wellness recommendations based on your specific needs</p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Smart Prompts</h4>
              <p className="text-gray-600 text-sm">Creates guided journal prompts tailored to your current emotional state</p>
            </div>
          </div>
        </div>
      </section>

      {/* Loading State */}
      {isLoading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Analyzing your wellness data...</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!isLoading && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">

          {/* Analytics Dashboard */}
          <div className="space-y-8">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-100 text-sm font-medium">Total Entries</p>
                    <p className="text-3xl font-bold">{totalEntries}</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm font-medium">Most Common Mood</p>
                    <p className="text-2xl font-bold flex items-center">
                      <span className="mr-2">{moodOptions.find(m => m.value === mostCommonMood[0])?.emoji}</span>
                      {moodOptions.find(m => m.value === mostCommonMood[0])?.label}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl p-6 text-white shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-pink-100 text-sm font-medium">Writing Streak</p>
                    <p className="text-3xl font-bold">🔥 7 days</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Mood Distribution Chart */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-gray-800">📊 Mood Distribution</h3>
                <div className="text-sm text-gray-500">
                  {selectedPeriod === 'week' ? 'Last 7 days' : selectedPeriod === 'month' ? 'Last 30 days' : 'Last 90 days'}
                </div>
              </div>
              
              {totalEntries === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">No data available</h4>
                  <p className="text-gray-500 mb-4">Start journaling to see your mood insights</p>
                  <a href="/journal" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300">
                    <span className="mr-2">✍️</span>
                    Start Writing
                  </a>
                </div>
              ) : (
                <div className="space-y-6">
                  {moodOptions.map((mood) => {
                    const count = moodCounts[mood.value] || 0;
                    const percentage = totalEntries > 0 ? (count / totalEntries) * 100 : 0;
                    return (
                      <div key={mood.value} className="group">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <span className="text-xl">{mood.emoji}</span>
                            </div>
                            <div>
                              <span className="text-sm font-semibold text-gray-700">{mood.label}</span>
                              <p className="text-xs text-gray-500">{count} entries</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-bold text-gray-800">{percentage.toFixed(1)}%</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-3 rounded-full transition-all duration-1000 ease-out shadow-sm"
                            style={{
                              width: `${percentage}%`,
                              background: `linear-gradient(90deg, ${mood.color}, ${mood.color}dd)`
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* AI Insights */}
            <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-8 text-white shadow-xl">
              <div className="flex items-center mb-8">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">🤖 AI-Powered Insight (Real-time)</h3>
                  <p className="text-indigo-100">Gemini-generated summary of your recent wellness data</p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                {isStreamingSummary && !aiSummary ? (
                  <div className="text-indigo-100">Generating real-time summary...</div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-white leading-relaxed text-lg">{aiSummary || 'Start journaling to get a real-time summary of your wellness journey.'}</p>
                    {aiHighlight && (
                      <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl p-4 border border-emerald-400/30">
                        <p className="text-emerald-100 text-sm font-medium">💡 {aiHighlight}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* AI Chat (Gemini) */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mr-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h6m-9 8h12a2 2 0 002-2V6a2 2 0 00-2-2H9l-2 2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">🤖 Chat with Gemini</h3>
                    <p className="text-gray-600">Ask for tips, quotes, or wellness info</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="max-h-80 overflow-y-auto space-y-3 bg-white/60 border border-gray-200 rounded-2xl p-4">
                  {chatMessages.length === 0 && (
                    <div className="text-gray-500 text-sm">Try: "Give me a quick stress relief tip" or "Share an uplifting quote"</div>
                  )}
                  {chatMessages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'} px-4 py-2 rounded-2xl max-w-[80%] whitespace-pre-wrap`}>
                        {m.content}
                        </div>
                      </div>
                    ))}
                  {isChatStreaming && (
                    <div className="text-gray-500 text-sm">Gemini is typing...</div>
                  )}
                  </div>

                <div className="flex items-center space-x-3">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') sendChat(); }}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
                    placeholder="Ask anything about wellness..."
                  />
                      <button
                    onClick={sendChat}
                    disabled={!chatInput.trim() || isChatStreaming}
                    className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-2xl shadow-lg disabled:opacity-50"
                  >
                    Send
                      </button>
                    </div>
                  </div>
            </div>
          </div>

        </main>
      )}
    </div>
  );
};

export default InsightsPage;
