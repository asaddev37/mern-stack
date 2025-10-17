import React from 'react';
import { useGlobalTheme } from '../../contexts/GlobalThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  showLabel = true, 
  size = 'md' 
}) => {
  const { theme, toggleTheme } = useGlobalTheme();

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  };

  const iconSize = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        ${sizeClasses[size]}
        ${className}
        relative overflow-hidden rounded-full
        bg-gradient-to-r from-gray-600 to-gray-700
        hover:from-gray-700 hover:to-gray-800
        dark:from-yellow-500 dark:to-orange-500
        dark:hover:from-yellow-600 dark:hover:to-orange-600
        text-white shadow-lg hover:shadow-xl
        transform hover:scale-105 active:scale-95
        transition-all duration-300 ease-in-out
        flex items-center justify-center
        group
      `}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {/* Icon with smooth rotation */}
      <div className={`${iconSize[size]} transition-transform duration-500 ${theme === 'dark' ? 'rotate-180' : 'rotate-0'}`}>
        {theme === 'light' ? (
          // Moon icon for light mode
          <svg fill="currentColor" viewBox="0 0 20 20" className="w-full h-full">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        ) : (
          // Sun icon for dark mode
          <svg fill="currentColor" viewBox="0 0 20 20" className="w-full h-full">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        )}
      </div>

      {/* Tooltip */}
      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
        {theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
      </div>

      {/* Label (optional) */}
      {showLabel && (
        <span className="ml-2 text-sm font-medium hidden sm:inline">
          {theme === 'light' ? 'Dark' : 'Light'}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;
