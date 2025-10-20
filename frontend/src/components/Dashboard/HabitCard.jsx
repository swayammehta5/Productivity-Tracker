import React from 'react';
import { Link } from 'react-router-dom';

const HabitCard = ({ habit, onToggle }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105">
      <div className="h-2" style={{ backgroundColor: habit.color }} />
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
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
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {habit.currentStreak}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {habit.longestStreak}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Best</div>
            </div>
          </div>
        </div>

        <button
          onClick={onToggle}
          className={`w-full py-3 rounded-lg font-medium transition duration-200 ${
            habit.completedToday
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
          }`}
        >
          {habit.completedToday ? '✓ Completed' : 'Mark as Done'}
        </button>

        <Link
          to={`/habits`}
          className="block mt-3 text-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default HabitCard;
