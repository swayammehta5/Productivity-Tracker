import React from 'react';

const StreakSummary = ({ stats, completedToday, totalToday }) => {
  const completionRate = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  const statCards = [
    { label: 'Total Habits', value: stats.totalHabits, icon: '🎯', color: 'blue' },
    { label: 'Completed Today', value: `${completedToday}/${totalToday}`, icon: '✅', color: 'green' },
    { label: 'Average Streak', value: stats.averageStreak, icon: '🔥', color: 'orange' },
    { label: 'Longest Streak', value: stats.longestStreak, icon: '🏆', color: 'yellow' }
  ];

  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-transform hover:scale-105"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">{stat.icon}</span>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${colorClasses[stat.color]}`}>
                {stat.label}
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Today's Progress
          </span>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {completionRate}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default StreakSummary;