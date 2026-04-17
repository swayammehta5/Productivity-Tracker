import React, { useEffect, useState } from 'react';
import { aiAPI } from '../../services/api';

const AIHabitCoach = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadInsights = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await aiAPI.getHabitCoach();
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load AI habit coach insights.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  if (loading) {
    return (
      <div className="app-page pb-24">
        <div className="app-card p-6 theme-text-secondary">Loading AI habit coach...</div>
      </div>
    );
  }

  const habits = data?.habits || [];
  const recommendations = data?.recommendations || [];

  return (
    <div className="app-page pb-24 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl theme-heading">AI Habit Coach</h1>
          <p className="theme-text-secondary">
            Personalized coaching based on your streaks, misses, and consistency patterns.
          </p>
        </div>
        <button onClick={loadInsights} className="btn-primary">
          Ask AI for Advice
        </button>
      </div>

      {error && <div className="app-card p-4 theme-error">{error}</div>}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {habits.map((habit) => (
          <div key={habit.id} className="app-card p-5 space-y-4">
            <div>
              <h2 className="text-lg theme-heading">{habit.name}</h2>
              <p className="mt-1 theme-text-secondary">
                {habit.completionRate}% completion in the last 4 weeks
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="app-surface p-3">
                <p className="theme-text-secondary">Current streak</p>
                <p className="mt-1 font-semibold">{habit.currentStreak}</p>
              </div>
              <div className="app-surface p-3">
                <p className="theme-text-secondary">Longest streak</p>
                <p className="mt-1 font-semibold">{habit.longestStreak}</p>
              </div>
              <div className="app-surface p-3">
                <p className="theme-text-secondary">Most missed day</p>
                <p className="mt-1 font-semibold">{habit.weakestDay || 'Not enough data'}</p>
              </div>
              <div className="app-surface p-3">
                <p className="theme-text-secondary">Best day</p>
                <p className="mt-1 font-semibold">{habit.strongestDay || 'Not enough data'}</p>
              </div>
            </div>
          </div>
        ))}

        {!habits.length && (
          <div className="app-card p-6 md:col-span-2 lg:col-span-3">
            <p className="theme-text-secondary">
              No habits yet. Add a few habits to unlock personalized coaching.
            </p>
          </div>
        )}
      </div>

      <div className="app-card p-6">
        <h2 className="text-xl theme-heading">Recommendations</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5">
          {recommendations.map((tip, index) => (
            <li key={index} className="theme-text-secondary">
              {tip}
            </li>
          ))}
          {!recommendations.length && (
            <li className="theme-text-secondary">No recommendations available yet.</li>
          )}
        </ul>
      </div>

      <div className="app-card p-6">
        <h2 className="text-xl theme-heading">AI Advice</h2>
        <div className="app-surface mt-4 p-4">
          <pre className="whitespace-pre-wrap text-sm theme-text-secondary">
            {data?.advice || 'No advice available yet.'}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default AIHabitCoach;
