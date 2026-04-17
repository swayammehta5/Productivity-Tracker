import React, { useEffect, useState } from 'react';
import { aiAPI } from '../../services/api';

const AIWeeklyInsights = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchInsights = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await aiAPI.getWeeklyInsights();
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load weekly insights.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="app-page pb-24">
        <div className="app-card p-6 theme-text-secondary">Generating weekly insights...</div>
      </div>
    );
  }

  return (
    <div className="app-page pb-24 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl theme-heading">AI Weekly Insights</h1>
          <p className="theme-text-secondary">
            A weekly review based on your reports, habits, and task outcomes.
          </p>
        </div>
        <button onClick={fetchInsights} className="btn-primary">
          Refresh Weekly Insights
        </button>
      </div>

      {error && <div className="app-card p-4 theme-error">{error}</div>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="app-card p-5">
          <p className="text-sm theme-text-secondary">Productivity Score</p>
          <p className="mt-2 text-3xl font-bold theme-accent">{data?.productivityScore || 0}%</p>
        </div>
        <div className="app-card p-5">
          <p className="text-sm theme-text-secondary">Most Consistent Habit</p>
          <p className="mt-2 font-semibold">{data?.mostConsistentHabit?.name || 'N/A'}</p>
        </div>
        <div className="app-card p-5">
          <p className="text-sm theme-text-secondary">Most Missed Habit</p>
          <p className="mt-2 font-semibold">{data?.mostMissedHabit?.name || 'N/A'}</p>
        </div>
        <div className="app-card p-5">
          <p className="text-sm theme-text-secondary">Task Completion</p>
          <p className="mt-2 font-semibold">{data?.taskSummary?.completionRate || 0}%</p>
        </div>
      </div>

      <div className="app-card p-6">
        <h2 className="text-xl theme-heading">AI Weekly Narrative</h2>
        <div className="app-surface mt-4 p-4">
          <p className="whitespace-pre-wrap theme-text-secondary">
            {data?.insightText || 'No insight available yet.'}
          </p>
        </div>
      </div>

      <div className="app-card p-6">
        <h2 className="text-xl theme-heading">Improvement Suggestions</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5">
          {(data?.suggestions || []).map((suggestion, index) => (
            <li key={index} className="theme-text-secondary">
              {suggestion}
            </li>
          ))}
          {!(data?.suggestions || []).length && (
            <li className="theme-text-secondary">No suggestions available yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default AIWeeklyInsights;
