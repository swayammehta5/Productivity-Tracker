import React, { useState, useEffect, useCallback } from 'react';
import { leaderboardAPI } from '../../services/api';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(0);
  const [userScore, setUserScore] = useState(null);
  const [sortBy, setSortBy] = useState('totalXP');
  const [loading, setLoading] = useState(true);

  const loadLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await leaderboardAPI.getLeaderboard({ sortBy, limit: 20 });
      if (res.data) {
        setLeaderboard(res.data.leaderboard || []);
        setUserRank(res.data.userRank || 0);
        setUserScore(res.data.userScore || null);
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      setLeaderboard([]);
      setUserRank(0);
      setUserScore(null);
    } finally {
      setLoading(false);
    }
  }, [sortBy]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        🏆 Leaderboard
      </h1>

      {/* Sort Options */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={() => setSortBy('totalXP')}
          className={`px-4 py-2 rounded-lg font-medium ${
            sortBy === 'totalXP'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Total XP
        </button>
        <button
          onClick={() => setSortBy('longestStreak')}
          className={`px-4 py-2 rounded-lg font-medium ${
            sortBy === 'longestStreak'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Longest Streak
        </button>
        <button
          onClick={() => setSortBy('level')}
          className={`px-4 py-2 rounded-lg font-medium ${
            sortBy === 'level'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Level
        </button>
      </div>

      {/* User Rank */}
      {userScore && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Your Rank: #{userRank}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total XP</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {userScore.totalXP}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Level</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {userScore.currentLevel}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Longest Streak</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {userScore.longestStreak}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Total XP
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Longest Streak
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Badges
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {leaderboard.map((entry, index) => (
              <tr key={entry.user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {index === 0 && <span className="text-2xl mr-2">🥇</span>}
                    {index === 1 && <span className="text-2xl mr-2">🥈</span>}
                    {index === 2 && <span className="text-2xl mr-2">🥉</span>}
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {entry.rank}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                        {entry.user.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {entry.user.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {entry.totalXP}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {entry.currentLevel}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {entry.longestStreak} days
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {entry.badges.length}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;

