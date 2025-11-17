import React, { useState, useEffect } from 'react';
import { moodAPI } from '../../services/api';

const MoodTracker = () => {
  const [mood, setMood] = useState('');
  const [energyLevel, setEnergyLevel] = useState(5);
  const [notes, setNotes] = useState('');
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  const moods = ['Very Happy', 'Happy', 'Neutral', 'Sad', 'Very Sad'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await moodAPI.create({ mood, energyLevel, notes });
      loadInsights();
      setMood('');
      setEnergyLevel(5);
      setNotes('');
      alert('Mood recorded successfully!');
    } catch (error) {
      console.error('Failed to record mood:', error);
      alert('Failed to record mood');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      const res = await moodAPI.getInsights();
      if (res.data) {
        setInsights(res.data);
      } else {
        setInsights({
          averageEnergy: 0,
          moodDistribution: {},
          totalEntries: 0
        });
      }
    } catch (error) {
      console.error('Failed to load insights:', error);
      setInsights({
        averageEnergy: 0,
        moodDistribution: {},
        totalEntries: 0
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        🌙 Mood & Productivity Journal
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mood Entry Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Record Your Mood
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                How are you feeling?
              </label>
              <div className="grid grid-cols-5 gap-2">
                {moods.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMood(m)}
                    className={`p-3 rounded-lg border-2 transition ${
                      mood === m
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">
                      {m === 'Very Happy' && '😄'}
                      {m === 'Happy' && '🙂'}
                      {m === 'Neutral' && '😐'}
                      {m === 'Sad' && '😢'}
                      {m === 'Very Sad' && '😔'}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{m}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Energy Level: {energyLevel}/10
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={energyLevel}
                onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                rows="3"
                placeholder="How did your day go?"
              />
            </div>

            <button
              type="submit"
              disabled={!mood || loading}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
            >
              {loading ? 'Recording...' : 'Record Mood'}
            </button>
          </form>
        </div>

        {/* Insights */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Insights
          </h2>
          {insights && insights.totalEntries > 0 ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average Energy Level</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {insights.averageEnergy?.toFixed(1) || 0}/10
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Mood Distribution</p>
                <div className="space-y-2">
                  {Object.keys(insights.moodDistribution || {}).length > 0 ? (
                    Object.entries(insights.moodDistribution).map(([mood, count]) => (
                      <div key={mood} className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300">{mood}</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{count} days</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No mood data yet</p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Entries</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {insights.totalEntries || 0}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">No insights available yet. Start tracking your mood!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MoodTracker;

