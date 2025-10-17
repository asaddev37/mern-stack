import React from 'react';
import { AnimationProps } from '../../../types/components';

interface HeroCTAProps extends AnimationProps {}

const HeroCTA: React.FC<HeroCTAProps> = ({ isVisible = false }) => {
  return (
    <div className={`mb-12 transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto leading-relaxed">
        Track your mood, journal your thoughts, and discover personalized insights 
        to nurture your mental well-being with AI-powered guidance.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 relative overflow-hidden group">
          <span className="relative z-10">Start Your Journey</span>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
        <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transform hover:-translate-y-1 hover:scale-105 transition-all duration-300">
          Learn More
        </button>
      </div>
    </div>
  );
};

export default HeroCTA;
