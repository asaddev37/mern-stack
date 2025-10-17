import React, { useState } from 'react';
import { 
  SparklesIcon,
  LightBulbIcon,
  ChartBarIcon,
  HeartIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface AIInsightsPanelProps {
  insights: {
    moodTrend: string;
    weeklyInsight: string;
    recommendations: string[];
  } | null;
}

const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ insights }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateInsights = async () => {
    setIsGenerating(true);
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
    // Here you would call the actual AI service
  };

  const getMoodTrendColor = (trend: string) => {
    switch (trend) {
      case 'positive': return 'from-green-400 to-emerald-500';
      case 'negative': return 'from-red-400 to-red-500';
      case 'stable': return 'from-blue-400 to-blue-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getMoodTrendIcon = (trend: string) => {
    switch (trend) {
      case 'positive': return '😊';
      case 'negative': return '😔';
      case 'stable': return '😌';
      default: return '😐';
    }
  };

  const getMoodTrendText = (trend: string) => {
    switch (trend) {
      case 'positive': return 'Positive Trend';
      case 'negative': return 'Needs Attention';
      case 'stable': return 'Stable Mood';
      default: return 'Analyzing...';
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
          AI Insights
        </h2>
        <button
          onClick={handleGenerateInsights}
          disabled={isGenerating}
          className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <ArrowPathIcon className="w-5 h-5 animate-spin" />
          ) : (
            <SparklesIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mood Trend Analysis */}
      <div className="mb-6">
        <div className={`p-6 bg-gradient-to-r ${getMoodTrendColor(insights?.moodTrend || 'stable')} rounded-2xl text-white shadow-lg`}>
          <div className="flex items-center space-x-3 mb-3">
            <div className="text-3xl">{getMoodTrendIcon(insights?.moodTrend || 'stable')}</div>
            <div>
              <h3 className="font-bold text-lg">{getMoodTrendText(insights?.moodTrend || 'stable')}</h3>
              <p className="text-sm opacity-90">AI Analysis</p>
            </div>
          </div>
          <p className="text-sm opacity-90">
            {insights?.weeklyInsight || "Your mood patterns show a stable trend this week. Keep up the great work!"}
          </p>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <LightBulbIcon className="w-5 h-5 mr-2 text-yellow-500" />
          Personalized Recommendations
        </h3>
        <div className="space-y-3">
          {(insights?.recommendations || [
            "Try a 5-minute meditation session",
            "Write about three things you're grateful for",
            "Take a short walk in nature"
          ]).map((recommendation, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-200"
            >
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                {index + 1}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">{recommendation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Status */}
      <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
            <ChartBarIcon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800">AI Analysis Status</h4>
            <p className="text-sm text-gray-600">Powered by advanced sentiment analysis</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-600 font-medium">Active</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 space-y-3">
        <button className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-2">
          <SparklesIcon className="w-5 h-5" />
          <span>Generate New Insights</span>
        </button>
        
        <button className="w-full py-3 px-4 border-2 border-purple-200 text-purple-600 font-semibold rounded-xl hover:bg-purple-50 transition-all duration-200 flex items-center justify-center space-x-2">
          <HeartIcon className="w-5 h-5" />
          <span>View Detailed Analysis</span>
        </button>
      </div>

      {/* AI Disclaimer */}
      <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
        <div className="flex items-start space-x-2">
          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-800">
            AI insights are for informational purposes only and should not replace professional mental health advice.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIInsightsPanel;
