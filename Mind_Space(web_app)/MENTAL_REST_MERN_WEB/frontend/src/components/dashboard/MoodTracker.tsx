import React, { useState } from 'react';
import { 
  FaceSmileIcon,
  FaceFrownIcon,
  HeartIcon,
  FireIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';

interface MoodTrackerProps {
  moodData: {
    today: string;
    thisWeek: string[];
    average: number;
  } | null;
}

const MoodTracker: React.FC<MoodTrackerProps> = ({ moodData }) => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const moods = [
    { id: 'very-happy', emoji: '😄', label: 'Very Happy', color: 'from-yellow-400 to-yellow-600' },
    { id: 'happy', emoji: '😊', label: 'Happy', color: 'from-green-400 to-green-600' },
    { id: 'neutral', emoji: '😐', label: 'Neutral', color: 'from-gray-400 to-gray-600' },
    { id: 'sad', emoji: '😢', label: 'Sad', color: 'from-blue-400 to-blue-600' },
    { id: 'very-sad', emoji: '😭', label: 'Very Sad', color: 'from-indigo-400 to-indigo-600' },
    { id: 'anxious', emoji: '😰', label: 'Anxious', color: 'from-red-400 to-red-600' },
    { id: 'stressed', emoji: '😓', label: 'Stressed', color: 'from-orange-400 to-orange-600' },
    { id: 'calm', emoji: '😌', label: 'Calm', color: 'from-teal-400 to-teal-600' },
    { id: 'excited', emoji: '🤩', label: 'Excited', color: 'from-pink-400 to-pink-600' },
    { id: 'grateful', emoji: '🙏', label: 'Grateful', color: 'from-purple-400 to-purple-600' },
    { id: 'frustrated', emoji: '😤', label: 'Frustrated', color: 'from-red-500 to-red-700' },
    { id: 'peaceful', emoji: '☮️', label: 'Peaceful', color: 'from-emerald-400 to-emerald-600' }
  ];

  const getMoodEmoji = (mood: string) => {
    const moodObj = moods.find(m => m.id === mood);
    return moodObj ? moodObj.emoji : '😐';
  };

  const getMoodColor = (mood: string) => {
    const moodObj = moods.find(m => m.id === mood);
    return moodObj ? moodObj.color : 'from-gray-400 to-gray-600';
  };

  const getMoodValue = (mood: string) => {
    const moodValues: Record<string, number> = {
      'very-sad': 1, 'sad': 2, 'neutral': 3, 'happy': 4, 'very-happy': 5,
      'anxious': 2, 'stressed': 2, 'calm': 4, 'excited': 4, 'grateful': 5,
      'frustrated': 2, 'peaceful': 4
    };
    return moodValues[mood] || 3;
  };

  const handleMoodSelect = (moodId: string) => {
    setSelectedMood(moodId);
    // Here you would typically save the mood to the backend
    console.log('Selected mood:', moodId);
  };

  const getMoodTrend = () => {
    if (!moodData?.thisWeek || moodData.thisWeek.length === 0) return 'stable';
    
    const values = moodData.thisWeek.map(mood => getMoodValue(mood));
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    if (avg >= 4) return 'positive';
    if (avg <= 2) return 'negative';
    return 'stable';
  };

  const getTrendIcon = () => {
    const trend = getMoodTrend();
    switch (trend) {
      case 'positive': return <SunIcon className="w-5 h-5 text-yellow-500" />;
      case 'negative': return <MoonIcon className="w-5 h-5 text-blue-500" />;
      default: return <HeartIcon className="w-5 h-5 text-green-500" />;
    }
  };

  const getTrendText = () => {
    const trend = getMoodTrend();
    switch (trend) {
      case 'positive': return 'Your mood has been positive this week! 🌟';
      case 'negative': return 'Consider some self-care activities 💙';
      default: return 'Your mood has been stable this week 📊';
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Mood Tracker
        </h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          {getTrendIcon()}
          <span>Weekly Trend</span>
        </div>
      </div>

      {/* Today's Mood */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">How are you feeling today?</h3>
        <div className="grid grid-cols-4 gap-3">
          {moods.slice(0, 8).map((mood) => (
            <button
              key={mood.id}
              onClick={() => handleMoodSelect(mood.id)}
              className={`group p-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                selectedMood === mood.id
                  ? `bg-gradient-to-r ${mood.color} text-white shadow-lg`
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <div className="text-2xl mb-2">{mood.emoji}</div>
              <div className="text-xs font-medium">{mood.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Weekly Mood Chart */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">This Week's Mood</h3>
        <div className="flex items-end justify-between space-x-2 h-32">
          {moodData?.thisWeek?.map((mood, index) => {
            const value = getMoodValue(mood);
            const height = (value / 5) * 100;
            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            
            return (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className="text-xs text-gray-500 mb-2">{days[index]}</div>
                <div
                  className={`w-full bg-gradient-to-t ${getMoodColor(mood)} rounded-t-lg transition-all duration-500 hover:scale-105 cursor-pointer`}
                  style={{ height: `${height}%` }}
                  title={`${mood}: ${getMoodEmoji(mood)}`}
                >
                  <div className="flex items-center justify-center h-full text-white text-lg">
                    {getMoodEmoji(mood)}
                  </div>
                </div>
              </div>
            );
          }) || (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <FaceSmileIcon className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Start tracking your mood!</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mood Insights */}
      <div className="space-y-4">
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <FireIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Mood Trend</h4>
              <p className="text-sm text-gray-600">{getTrendText()}</p>
            </div>
          </div>
        </div>

        {moodData?.average && (
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-800">Weekly Average</h4>
                <p className="text-sm text-gray-600">Your overall mood this week</p>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {moodData.average.toFixed(1)}/5
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodTracker;
