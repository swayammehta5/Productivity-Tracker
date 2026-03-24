import React from 'react';
import { Link } from 'react-router-dom';

const HabitCard = ({ habit, onToggle }) => {
  return (
    <div className="group bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl shadow-soft-lg border border-white/20 dark:border-white/10 overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-glass-light dark:hover:shadow-glass-dark animate-scale-in">
      {/* Color Header */}
      <div className="h-2 bg-gradient-to-r from-orange-400 to-amber-400 dark:from-purple-400 dark:to-pink-400" style={{ background: `linear-gradient(90deg, ${habit.color}, ${habit.color}dd)` }} />
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-orange-600 dark:group-hover:text-purple-400 transition-colors duration-300">
              {habit.name}
            </h3>
            {habit.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {habit.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 flex-wrap gap-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                {habit.currentStreak}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                {habit.longestStreak}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Best</div>
            </div>
          </div>
        </div>

        <button
          onClick={onToggle}
          className={`group relative w-full py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg overflow-hidden ${
            habit.completedToday
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-green-500/25'
              : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/25'
          }`}
        >
          <div className="relative flex items-center justify-center space-x-2">
            <span className="text-lg">{habit.completedToday ? '✓' : '🎯'}</span>
            <span>{habit.completedToday ? 'Completed' : 'Mark as Done'}</span>
          </div>
          {/* Hover effect overlay */}
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        </button>

        <Link
          to={`/habits`}
          className="block mt-4 text-center text-sm text-orange-600 dark:text-purple-400 hover:text-orange-700 dark:hover:text-purple-300 font-medium transition-colors duration-300 group-hover:underline"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
};

export default HabitCard;
