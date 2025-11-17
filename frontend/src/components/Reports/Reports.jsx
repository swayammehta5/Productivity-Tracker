import React, { useState, useEffect, useCallback } from 'react';
import { reportsAPI } from '../../services/api';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const Reports = () => {
  const [weeklyData, setWeeklyData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('weekly');

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      if (period === 'weekly') {
        const res = await reportsAPI.getWeekly();
        if (res.data) {
          setWeeklyData(res.data);
        }
      } else {
        const res = await reportsAPI.getMonthly();
        if (res.data) {
          setMonthlyData(res.data);
        }
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
      // Set default data structure on error
      if (period === 'weekly') {
        setWeeklyData({
          habits: { total: 0, completionRate: 0, averageStreak: 0, dailyCompletions: [] },
          tasks: { total: 0, completed: 0, completionRate: 0 },
          consistencyScore: 0
        });
      } else {
        setMonthlyData({
          habits: { total: 0, completionRate: 0, averageStreak: 0, longestStreak: 0 },
          tasks: { total: 0, completed: 0, completionRate: 0, weeklyBreakdown: [] }
        });
      }
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading reports...</div>
      </div>
    );
  }

  const data = period === 'weekly' ? weeklyData : monthlyData;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          📊 Productivity Reports
        </h1>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setPeriod('weekly')}
            className={`px-4 py-2 rounded-lg font-medium ${
              period === 'weekly'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-4 py-2 rounded-lg font-medium ${
              period === 'monthly'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {data && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Consistency Score</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {data.consistencyScore?.toFixed(1) || 0}%
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Habit Completion Rate</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {data.habits?.completionRate?.toFixed(1) || 0}%
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Task Completion Rate</p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {data.tasks?.completionRate?.toFixed(1) || 0}%
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average Streak</p>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {data.habits?.averageStreak || 0}
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Daily Habit Completions */}
            {data.habits?.dailyCompletions && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Daily Habit Completions
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.habits.dailyCompletions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="completed" stroke="#3B82F6" name="Completed" />
                    <Line type="monotone" dataKey="total" stroke="#10B981" name="Total" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Task Completion */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Task Statistics
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { name: 'Completed', value: data.tasks?.completed || 0 },
                  { name: 'Pending', value: (data.tasks?.total || 0) - (data.tasks?.completed || 0) }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mood Insights */}
          {data.moods && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Mood Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average Energy Level</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {data.moods.averageEnergy?.toFixed(1) || 0}/10
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Mood Distribution</p>
                  <div className="space-y-2">
                    {Object.entries(data.moods.moodDistribution || {}).map(([mood, count]) => (
                      <div key={mood} className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300">{mood}</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Reports;

