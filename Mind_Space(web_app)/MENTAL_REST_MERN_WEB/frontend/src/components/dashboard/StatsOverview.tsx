import React from 'react';
import { 
  BookOpenIcon, 
  FireIcon, 
  TrendingUpIcon,
  HeartIcon,
  CalendarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface StatsOverviewProps {
  stats: {
    totalEntries: number;
    currentStreak: number;
    longestStreak: number;
    favoriteCount: number;
    weeklyEntries: number;
    monthlyEntries: number;
  } | null;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Entries',
      value: stats?.totalEntries || 0,
      icon: BookOpenIcon,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-100 to-blue-200',
      textColor: 'text-blue-800',
      change: '+2 this week',
      changeType: 'positive'
    },
    {
      title: 'Current Streak',
      value: `${stats?.currentStreak || 0} days`,
      icon: FireIcon,
      color: 'from-orange-500 to-red-500',
      bgColor: 'from-orange-100 to-red-200',
      textColor: 'text-orange-800',
      change: 'Keep it up! 🔥',
      changeType: 'positive'
    },
    {
      title: 'Longest Streak',
      value: `${stats?.longestStreak || 0} days`,
      icon: TrendingUpIcon,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'from-green-100 to-emerald-200',
      textColor: 'text-green-800',
      change: 'Personal best! 🏆',
      changeType: 'positive'
    },
    {
      title: 'Favorites',
      value: stats?.favoriteCount || 0,
      icon: HeartIcon,
      color: 'from-pink-500 to-rose-600',
      bgColor: 'from-pink-100 to-rose-200',
      textColor: 'text-pink-800',
      change: 'Special moments 💖',
      changeType: 'neutral'
    },
    {
      title: 'This Week',
      value: stats?.weeklyEntries || 0,
      icon: CalendarIcon,
      color: 'from-purple-500 to-indigo-600',
      bgColor: 'from-purple-100 to-indigo-200',
      textColor: 'text-purple-800',
      change: 'Great consistency!',
      changeType: 'positive'
    },
    {
      title: 'This Month',
      value: stats?.monthlyEntries || 0,
      icon: ChartBarIcon,
      color: 'from-indigo-500 to-blue-600',
      bgColor: 'from-indigo-100 to-blue-200',
      textColor: 'text-indigo-800',
      change: 'Monthly progress 📈',
      changeType: 'positive'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className={`bg-gradient-to-br ${stat.bgColor} rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer group`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${stat.textColor} group-hover:scale-105 transition-transform duration-300`}>
                {stat.value}
              </p>
            </div>
          </div>
          
          <div>
            <h3 className={`font-semibold ${stat.textColor} mb-1`}>
              {stat.title}
            </h3>
            <p className={`text-sm ${
              stat.changeType === 'positive' ? 'text-green-600' : 
              stat.changeType === 'negative' ? 'text-red-600' : 
              'text-gray-600'
            }`}>
              {stat.change}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsOverview;
