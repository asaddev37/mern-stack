import React from 'react';
import { MousePosition } from '../../../types/components';

interface HeroBackgroundProps {
  mousePosition: MousePosition;
}

const HeroBackground: React.FC<HeroBackgroundProps> = ({ mousePosition }) => {
  return (
    <>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-20"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-indigo-600/10 to-purple-600/10"></div>
      
      {/* Floating Elements with enhanced animations */}
      <div 
        className="absolute top-20 left-10 w-20 h-20 bg-blue-200/30 rounded-full blur-xl animate-pulse"
        style={{
          transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`,
          transition: 'transform 0.3s ease-out'
        }}
      ></div>
      <div 
        className="absolute top-40 right-20 w-32 h-32 bg-purple-200/30 rounded-full blur-xl animate-pulse delay-1000"
        style={{
          transform: `translate(${mousePosition.x * -0.008}px, ${mousePosition.y * -0.008}px)`,
          transition: 'transform 0.3s ease-out'
        }}
      ></div>
      <div 
        className="absolute bottom-20 left-1/4 w-24 h-24 bg-indigo-200/30 rounded-full blur-xl animate-pulse delay-2000"
        style={{
          transform: `translate(${mousePosition.x * 0.005}px, ${mousePosition.y * 0.005}px)`,
          transition: 'transform 0.3s ease-out'
        }}
      ></div>
      
      {/* Additional floating particles */}
      <div className="absolute top-1/3 right-1/3 w-4 h-4 bg-blue-300/40 rounded-full animate-bounce delay-300"></div>
      <div className="absolute top-2/3 left-1/3 w-3 h-3 bg-purple-300/40 rounded-full animate-bounce delay-700"></div>
      <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-indigo-300/40 rounded-full animate-bounce delay-1000"></div>
    </>
  );
};

export default HeroBackground;
