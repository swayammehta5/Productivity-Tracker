import React, { useState, useEffect } from 'react';
import { gamificationAPI } from '../../services/api';

const GamificationDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await gamificationAPI.getStats();
      if (res.data) {
        setStats(res.data);
      } else {
        // Initialize with default stats if no data
        setStats({
          xp: 0,
          level: 1,
          xpForNextLevel: 100,
          badges: [],
          availableBadges: [],
          stats: {
            totalHabitsCompleted: 0,
            totalTasksCompleted: 0,
            longestStreak: 0,
            currentStreak: 0
          }
        });
      }
    } catch (error) {
      console.error('Failed to load gamification stats:', error);
      // Set default stats on error
      setStats({
        xp: 0,
        level: 1,
        xpForNextLevel: 100,
        badges: [],
        availableBadges: [],
        stats: {
          totalHabitsCompleted: 0,
          totalTasksCompleted: 0,
          longestStreak: 0,
          currentStreak: 0
        }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          🎮 Gamification Dashboard
        </h1>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <p className="text-gray-600 dark:text-gray-400">No gamification data available. Complete some habits or tasks to start earning XP!</p>
        </div>
      </div>
    );
  }

  // Calculate XP progress
  const xpForCurrentLevel = (stats.level - 1) * 100;
  const xpInCurrentLevel = Math.max(0, stats.xp - xpForCurrentLevel);
  const xpNeededForNextLevel = 100; // 100 XP per level
  const xpPercentage = Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForNextLevel) * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        🎮 Gamification Dashboard
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Level & XP */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Your Progress
          </h2>
          <div className="text-center mb-4">
            <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {stats.level}
            </div>
            <p className="text-gray-600 dark:text-gray-400">Level</p>
          </div>
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>XP: {stats.xp}</span>
              <span>Next Level: {stats.level * 100} XP</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mb-2">
              {xpInCurrentLevel} / {xpNeededForNextLevel} XP to next level
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all"
                style={{ width: `${Math.min(xpPercentage, 100)}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Habits Completed</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.stats.totalHabitsCompleted}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tasks Completed</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats.stats.totalTasksCompleted}
              </p>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Badges
          </h2>
          {stats.badges.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {stats.badges.map((badge, index) => (
                <div
                  key={index}
                  className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"
                >
                  <div className="text-4xl mb-2">{badge.icon}</div>
                  <div className="text-xs font-semibold text-gray-900 dark:text-white">
                    {badge.name}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              No badges earned yet. Keep completing habits and tasks!
            </p>
          )}
        </div>

        {/* Available Badges */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Available Badges
          </h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {stats.availableBadges.map((badge, index) => {
              const earned = stats.badges.some(b => b.id === badge.id);
              return (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-2 ${
                    earned
                      ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                      : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{badge.icon}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {badge.name}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {badge.description}
                      </div>
                    </div>
                    {earned && (
                      <div className="text-yellow-500">✓</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamificationDashboard;

