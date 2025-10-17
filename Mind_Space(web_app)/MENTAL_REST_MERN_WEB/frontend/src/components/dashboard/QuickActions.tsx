import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon,
  BookOpenIcon,
  SparklesIcon,
  HeartIcon,
  ChartBarIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Write New Entry',
      description: 'Start journaling your thoughts and feelings',
      icon: PlusIcon,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-100 to-blue-200',
      textColor: 'text-blue-800',
      action: () => navigate('/journal/new'),
      badge: 'Quick Start'
    },
    {
      title: 'View All Entries',
      description: 'Browse through your journal history',
      icon: BookOpenIcon,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'from-green-100 to-emerald-200',
      textColor: 'text-green-800',
      action: () => navigate('/journal'),
      badge: null
    },
    {
      title: 'AI Insights',
      description: 'Get personalized wellness recommendations',
      icon: SparklesIcon,
      color: 'from-purple-500 to-indigo-600',
      bgColor: 'from-purple-100 to-indigo-200',
      textColor: 'text-purple-800',
      action: () => navigate('/insights'),
      badge: 'New'
    },
    {
      title: 'Mood Tracker',
      description: 'Track your emotional patterns',
      icon: HeartIcon,
      color: 'from-pink-500 to-rose-600',
      bgColor: 'from-pink-100 to-rose-200',
      textColor: 'text-pink-800',
      action: () => navigate('/mood'),
      badge: null
    },
    {
      title: 'Analytics',
      description: 'View your wellness progress',
      icon: ChartBarIcon,
      color: 'from-orange-500 to-red-500',
      bgColor: 'from-orange-100 to-red-200',
      textColor: 'text-orange-800',
      action: () => navigate('/analytics'),
      badge: null
    },
    {
      title: 'Settings',
      description: 'Customize your experience',
      icon: CogIcon,
      color: 'from-gray-500 to-gray-600',
      bgColor: 'from-gray-100 to-gray-200',
      textColor: 'text-gray-800',
      action: () => navigate('/settings'),
      badge: null
    }
  ];

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Quick Actions
        </h2>
        <div className="text-sm text-gray-500">
          Jump into your wellness journey
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className={`group relative bg-gradient-to-br ${action.bgColor} rounded-2xl p-6 text-left shadow-lg hover:shadow-xl transform hover:-translate-y-2 hover:scale-105 transition-all duration-300 cursor-pointer border border-white/20`}
          >
            {/* Badge */}
            {action.badge && (
              <div className="absolute -top-2 -right-2 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                {action.badge}
              </div>
            )}

            {/* Icon */}
            <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
              <action.icon className="w-6 h-6 text-white" />
            </div>

            {/* Content */}
            <div>
              <h3 className={`font-bold text-lg ${action.textColor} mb-2 group-hover:scale-105 transition-transform duration-300`}>
                {action.title}
              </h3>
              <p className={`text-sm ${action.textColor} opacity-80 group-hover:opacity-100 transition-opacity duration-300`}>
                {action.description}
              </p>
            </div>

            {/* Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
          </button>
        ))}
      </div>

      {/* Motivational Quote */}
      <div className="mt-8 p-6 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl border border-indigo-200">
        <div className="text-center">
          <p className="text-indigo-800 font-medium italic text-lg">
            "The journey of a thousand miles begins with a single step."
          </p>
          <p className="text-indigo-600 text-sm mt-2">- Lao Tzu</p>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
