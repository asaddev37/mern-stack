import React from 'react';
import { AnimationProps } from '../../../types/components';
import { STATS } from '../../../constants';

interface HeroStatsProps extends AnimationProps {}

const HeroStats: React.FC<HeroStatsProps> = ({ isVisible = false }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto transition-all duration-1000 delay-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      {STATS.map((stat, index) => (
        <div key={stat.label} className="text-center group cursor-pointer">
          <div className={`text-3xl font-bold text-${stat.color} mb-2 group-hover:scale-110 transition-transform duration-300`}>
            {stat.value}
          </div>
          <div className={`text-gray-600 group-hover:text-${stat.color} transition-colors duration-300`}>
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
};

export default HeroStats;
