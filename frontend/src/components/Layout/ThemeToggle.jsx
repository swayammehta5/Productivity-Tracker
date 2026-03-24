import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const { updateUser } = useAuth();

  const handleToggle = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    toggleTheme();
    
    try {
      await authAPI.updateProfile({ theme: newTheme });
      updateUser({ theme: newTheme });
    } catch (error) {
      console.error('Failed to update theme:', error);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="group relative w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-purple-900 dark:to-pink-900 p-1 transition-all duration-300 transform hover:scale-110 hover:shadow-glass-light dark:hover:shadow-glass-dark active:scale-95"
      aria-label="Toggle theme"
    >
      <div className="w-full h-full rounded-lg bg-white dark:bg-black/50 backdrop-blur-sm flex items-center justify-center transition-all duration-300">
        {theme === 'light' ? (
          <div className="flex items-center justify-center">
            <svg className="w-6 h-6 text-amber-500 group-hover:text-amber-600 transition-all duration-300 group-hover:rotate-45" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <svg className="w-6 h-6 text-purple-400 group-hover:text-purple-300 transition-all duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          </div>
        )}
      </div>
      
      {/* Glow effect */}
      <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
        theme === 'light' 
          ? 'bg-gradient-to-r from-amber-400 to-orange-400' 
          : 'bg-gradient-to-r from-purple-400 to-pink-400'
      } blur-md`}></div>
    </button>
  );
};

export default ThemeToggle;