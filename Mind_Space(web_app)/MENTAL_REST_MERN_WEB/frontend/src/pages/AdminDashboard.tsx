import React, { useState, useEffect } from 'react';

const AdminDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [moderationQueue, setModerationQueue] = useState([
    {
      id: 1,
      type: 'journal_entry',
      content: 'Feeling really down today...',
      user: 'user123',
      reportedBy: 'user456',
      reason: 'inappropriate_content',
      status: 'pending',
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      type: 'community_tip',
      content: 'This tip helped me a lot!',
      user: 'user789',
      reportedBy: 'user101',
      reason: 'spam',
      status: 'pending',
      createdAt: '2024-01-15T09:15:00Z'
    }
  ]);

  const userStats = {
    totalUsers: 1247,
    activeUsers: 892,
    newUsersThisWeek: 45,
    retentionRate: 78.5
  };

  const trendData = {
    dailyActiveUsers: [120, 135, 142, 138, 155, 148, 162],
    journalEntries: [45, 52, 48, 61, 58, 67, 72],
    moodDistribution: {
      happy: 35,
      calm: 28,
      stressed: 15,
      anxious: 12,
      sad: 10
    }
  };

  const systemHealth = {
    serverStatus: 'healthy',
    databaseStatus: 'healthy',
    aiServiceStatus: 'healthy',
    responseTime: '245ms',
    uptime: '99.9%'
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      
      // Check if user is admin
      if (userData.role !== 'admin') {
        window.location.href = '/dashboard';
      }
    } else {
      window.location.href = '/login';
    }
  }, []);

  const handleModerationAction = (id: number, action: 'approve' | 'reject') => {
    setModerationQueue(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, status: action === 'approve' ? 'approved' : 'rejected' }
          : item
      )
    );
  };

  const handleExportAnalytics = async () => {
    setIsExporting(true);
    
    try {
      const analyticsData = {
        exportDate: new Date().toISOString(),
        period: selectedPeriod,
        userStats: userStats,
        trendData: trendData,
        systemHealth: systemHealth,
        moderationQueue: moderationQueue
      };

      const dataStr = JSON.stringify(analyticsData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `admin-analytics-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.json`;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                MindSpace Admin
              </h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="/dashboard" className="text-gray-600 hover:text-blue-600 transition-colors">Dashboard</a>
              <a href="/journal" className="text-gray-600 hover:text-blue-600 transition-colors">Journal</a>
              <a href="/insights" className="text-gray-600 hover:text-blue-600 transition-colors">Insights</a>
              <a href="/resources" className="text-gray-600 hover:text-blue-600 transition-colors">Resources</a>
              <a href="/profile" className="text-gray-600 hover:text-blue-600 transition-colors">Profile</a>
              <a href="/admin" className="text-red-600 font-medium">Admin</a>
            </nav>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Admin: {user?.name || 'User'}</span>
              <button 
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  window.location.href = '/';
                }}
                className="px-4 py-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h2>
            <p className="text-gray-600">Monitor system health, user activity, and moderate content</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
            >
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="quarter">Last 90 days</option>
            </select>
            <button
              onClick={handleExportAnalytics}
              disabled={isExporting}
              className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isExporting ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Exporting...
                </div>
              ) : (
                'Export Analytics'
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - User Stats & System Health */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Statistics */}
            <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="text-xl font-bold text-gray-800 mb-6">User Statistics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Users</span>
                  <span className="text-2xl font-bold text-blue-600">{userStats.totalUsers.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Active Users</span>
                  <span className="text-2xl font-bold text-green-600">{userStats.activeUsers.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">New This Week</span>
                  <span className="text-2xl font-bold text-purple-600">{userStats.newUsersThisWeek}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Retention Rate</span>
                  <span className="text-2xl font-bold text-orange-600">{userStats.retentionRate}%</span>
                </div>
              </div>
            </div>

            {/* System Health */}
            <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="text-xl font-bold text-gray-800 mb-6">System Health</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Server Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    systemHealth.serverStatus === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {systemHealth.serverStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Database Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    systemHealth.databaseStatus === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {systemHealth.databaseStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">AI Service Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    systemHealth.aiServiceStatus === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {systemHealth.aiServiceStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Response Time</span>
                  <span className="text-sm font-medium text-gray-700">{systemHealth.responseTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Uptime</span>
                  <span className="text-sm font-medium text-gray-700">{systemHealth.uptime}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Trends & Moderation */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trend Analytics */}
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Trend Analytics</h3>
              
              {/* Daily Active Users Chart */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-700 mb-4">Daily Active Users</h4>
                <div className="flex items-end space-x-2 h-32">
                  {trendData.dailyActiveUsers.map((value, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t"
                        style={{ height: `${(value / Math.max(...trendData.dailyActiveUsers)) * 100}%` }}
                      />
                      <span className="text-xs text-gray-500 mt-2">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mood Distribution */}
              <div>
                <h4 className="text-lg font-semibold text-gray-700 mb-4">Mood Distribution</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(trendData.moodDistribution).map(([mood, percentage]) => (
                    <div key={mood} className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-2xl">
                          {mood === 'happy' ? '😊' : mood === 'calm' ? '😌' : mood === 'stressed' ? '😓' : mood === 'anxious' ? '😰' : '😢'}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-gray-700 capitalize">{mood}</div>
                      <div className="text-lg font-bold text-blue-600">{percentage}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Moderation Queue */}
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Moderation Queue</h3>
              {moderationQueue.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No items in moderation queue</p>
              ) : (
                <div className="space-y-4">
                  {moderationQueue.filter(item => item.status === 'pending').map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {item.type.replace('_', ' ')}
                            </span>
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                              {item.reason.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-2">{item.content}</p>
                          <div className="text-sm text-gray-500">
                            User: {item.user} • Reported by: {item.reportedBy} • {new Date(item.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleModerationAction(item.id, 'approve')}
                          className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleModerationAction(item.id, 'reject')}
                          className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
