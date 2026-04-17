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
        <div className="text-xl theme-text-secondary">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="app-page">
      <h1 className="text-3xl theme-heading mb-8">
        🏆 Leaderboard
      </h1>

      {/* Sort Options */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={() => setSortBy('totalXP')}
          className={`px-4 py-2 rounded-lg font-medium ${
            sortBy === 'totalXP'
              ? 'btn-primary text-white'
              : 'btn-outline'
          }`}
        >
          Total XP
        </button>
        <button
          onClick={() => setSortBy('longestStreak')}
          className={`px-4 py-2 rounded-lg font-medium ${
            sortBy === 'longestStreak'
              ? 'btn-primary text-white'
              : 'btn-outline'
          }`}
        >
          Longest Streak
        </button>
        <button
          onClick={() => setSortBy('level')}
          className={`px-4 py-2 rounded-lg font-medium ${
            sortBy === 'level'
              ? 'btn-primary text-white'
              : 'btn-outline'
          }`}
        >
          Level
        </button>
      </div>

      {/* User Rank */}
      {userScore && (
        <div className="app-card border-2 border-[var(--primary)] p-6 mb-6">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
            Your Rank: #{userRank}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-sm theme-text-secondary">Total XP</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {userScore.totalXP}
              </p>
            </div>
            <div>
              <p className="text-sm theme-text-secondary">Level</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {userScore.currentLevel}
              </p>
            </div>
            <div>
              <p className="text-sm theme-text-secondary">Longest Streak</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {userScore.longestStreak}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="app-card overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-[color-mix(in_srgb,var(--card)_72%,var(--primary)_28%)]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium theme-text-secondary uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium theme-text-secondary uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium theme-text-secondary uppercase tracking-wider">
                Total XP
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium theme-text-secondary uppercase tracking-wider">
                Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium theme-text-secondary uppercase tracking-wider">
                Longest Streak
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium theme-text-secondary uppercase tracking-wider">
                Badges
              </th>
            </tr>
          </thead>
          <tbody className="bg-[var(--card)] divide-y divide-[var(--border)]">
            {leaderboard.map((entry, index) => (
              <tr key={entry.user.id} className="hover:bg-[color-mix(in_srgb,var(--card)_75%,var(--primary)_25%)] transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {index === 0 && <span className="text-2xl mr-2">🥇</span>}
                    {index === 1 && <span className="text-2xl mr-2">🥈</span>}
                    {index === 2 && <span className="text-2xl mr-2">🥉</span>}
                    <span className="text-sm font-medium text-[var(--text-primary)]">
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
                      <div className="text-sm font-medium text-[var(--text-primary)]">
                        {entry.user.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-primary)]">
                  {entry.totalXP}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-primary)]">
                  {entry.currentLevel}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-primary)]">
                  {entry.longestStreak} days
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-primary)]">
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

