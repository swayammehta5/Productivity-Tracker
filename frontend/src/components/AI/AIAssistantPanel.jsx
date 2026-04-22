import React, { useEffect, useMemo, useState } from 'react';
import { aiAPI } from '../../services/api';

const TABS = [
  { id: 'habit', label: 'Habit Coach' },
  { id: 'task', label: 'Task Prioritizer' },
  { id: 'weekly', label: 'Weekly Insights' }
];

const Spinner = () => (
  <div className="flex items-center gap-2 text-sm theme-text-secondary">
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
    AI is thinking...
  </div>
);

const AIAssistantPanel = ({ initialTab = 'habit', embedded = false, onClose }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const loadTabData = async (tab) => {
    setLoading(true);
    setError('');

    try {
      let response;
      if (tab === 'habit') {
        response = await aiAPI.getHabitCoach();
      } else if (tab === 'task') {
        response = await aiAPI.getTaskPrioritization();
      } else {
        response = await aiAPI.getWeeklyInsights();
      }
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch AI insights.');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab]);

  const heading = useMemo(() => TABS.find((tab) => tab.id === activeTab)?.label || 'AI Assistant', [activeTab]);

  return (
    <div className={`${embedded ? 'app-card p-5' : 'app-card max-h-[80vh] w-full max-w-3xl overflow-y-auto p-5 shadow-2xl'}`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl theme-heading">AI Assistant</h2>
          <p className="text-sm theme-text-secondary">Data-driven suggestions from your real habits and tasks.</p>
        </div>
        {!embedded && (
          <button type="button" className="btn-outline px-3 py-2 text-sm" onClick={onClose}>
            Close
          </button>
        )}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`rounded px-3 py-2 text-sm ${activeTab === tab.id ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="app-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold theme-text-primary">{heading}</h3>
          <button type="button" className="btn-outline px-3 py-1 text-xs" onClick={() => loadTabData(activeTab)}>
            Try Again
          </button>
        </div>

        {loading && <Spinner />}
        {!loading && error && <p className="theme-error text-sm">{error}</p>}

        {!loading && !error && data && (
          <div className="space-y-4">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-900/20">
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">Insight</p>
              <p className="mt-1 text-sm theme-text-secondary">{data.insight || 'No insight available.'}</p>
            </div>

            <div>
              <p className="text-sm font-semibold theme-text-primary">Suggestions</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm theme-text-secondary">
                {(data.suggestions || []).map((suggestion, index) => (
                  <li key={`${suggestion}-${index}`}>{suggestion}</li>
                ))}
                {!(data.suggestions || []).length && <li>No suggestions available.</li>}
              </ul>
            </div>

            {Array.isArray(data.priorityOrder) && (
              <div>
                <p className="text-sm font-semibold theme-text-primary">Priority Order</p>
                <div className="mt-2 space-y-2">
                  {data.priorityOrder.map((task, index) => (
                    <div key={task.id} className="rounded border border-gray-200 p-3 text-sm dark:border-gray-700">
                      <p className="font-semibold theme-text-primary">{index + 1}. {task.title}</p>
                      <p className="theme-text-secondary">
                        {task.priority} | {task.status} {task.deadline ? `| Due ${new Date(task.deadline).toLocaleDateString()}` : ''}
                      </p>
                    </div>
                  ))}
                  {!data.priorityOrder.length && <p className="text-sm theme-text-secondary">No pending tasks.</p>}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistantPanel;
