import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpenIcon,
  EyeIcon,
  HeartIcon,
  CalendarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

interface RecentEntriesProps {
  entries: Array<{
    id: number;
    title: string;
    mood: string;
    date: string;
    preview: string;
  }> | null;
}

const RecentEntries: React.FC<RecentEntriesProps> = ({ entries }) => {
  const navigate = useNavigate();

  const getMoodEmoji = (mood: string) => {
    const moodEmojis: Record<string, string> = {
      'happy': '😊',
      'sad': '😢',
      'excited': '🤩',
      'peaceful': '😌',
      'anxious': '😰',
      'grateful': '🙏',
      'calm': '😌',
      'stressed': '😓',
      'determined': '💪',
      'neutral': '😐',
      'very-happy': '😄',
      'very-sad': '😭',
      'frustrated': '😤'
    };
    return moodEmojis[mood] || '😐';
  };

  const getMoodColor = (mood: string) => {
    const moodColors: Record<string, string> = {
      'happy': 'from-yellow-400 to-orange-500',
      'sad': 'from-blue-400 to-blue-600',
      'excited': 'from-pink-400 to-purple-500',
      'peaceful': 'from-green-400 to-emerald-500',
      'anxious': 'from-red-400 to-red-600',
      'grateful': 'from-purple-400 to-indigo-500',
      'calm': 'from-teal-400 to-cyan-500',
      'stressed': 'from-orange-400 to-red-500',
      'determined': 'from-indigo-400 to-purple-500',
      'neutral': 'from-gray-400 to-gray-500',
      'very-happy': 'from-yellow-400 to-yellow-600',
      'very-sad': 'from-blue-500 to-blue-700',
      'frustrated': 'from-red-500 to-red-700'
    };
    return moodColors[mood] || 'from-gray-400 to-gray-500';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (!entries || entries.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/20">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpenIcon className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No entries yet</h3>
          <p className="text-gray-600 mb-6">Start your mental wellness journey by writing your first journal entry.</p>
          <button
            onClick={() => navigate('/journal/new')}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Write Your First Entry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Recent Entries
        </h2>
        <button
          onClick={() => navigate('/journal')}
          className="flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
        >
          View All
          <ArrowRightIcon className="w-4 h-4 ml-1" />
        </button>
      </div>

      <div className="space-y-4">
        {entries.map((entry, index) => (
          <div
            key={entry.id}
            className="group bg-gradient-to-r from-white to-gray-50 rounded-2xl p-6 shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-gray-100"
            onClick={() => navigate(`/journal/${entry.id}`)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-10 h-10 bg-gradient-to-r ${getMoodColor(entry.mood)} rounded-full flex items-center justify-center text-white font-bold shadow-md`}>
                    {getMoodEmoji(entry.mood)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
                      {entry.title}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      {formatDate(entry.date)}
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                  {entry.preview}
                </p>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
                  <EyeIcon className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200">
                  <HeartIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Write Button */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <button
          onClick={() => navigate('/journal/new')}
          className="w-full py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <BookOpenIcon className="w-5 h-5" />
          <span>Write New Entry</span>
        </button>
      </div>
    </div>
  );
};

export default RecentEntries;
