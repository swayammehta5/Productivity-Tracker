import React, { useEffect, useState } from 'react';
import { aiAPI } from '../../services/api';

const AITaskPrioritizer = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const prioritizeTasks = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await aiAPI.getTaskPrioritization();
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to prioritize tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    prioritizeTasks();
  }, []);

  if (loading) {
    return (
      <div className="app-page pb-24">
        <div className="app-card p-6 theme-text-secondary">Prioritizing tasks...</div>
      </div>
    );
  }

  const rankedTasks = data?.rankedTasks || [];

  return (
    <div className="app-page pb-24 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl theme-heading">AI Task Prioritizer</h1>
          <p className="theme-text-secondary">
            Ranks pending tasks by urgency, due date, and priority.
          </p>
        </div>
        <button onClick={prioritizeTasks} className="btn-primary">
          Prioritize My Tasks
        </button>
      </div>

      {error && <div className="app-card p-4 theme-error">{error}</div>}

      <div className="app-card p-6">
        <h2 className="text-xl theme-heading">Ranked Task List</h2>
        <div className="mt-4 space-y-3">
          {rankedTasks.map((task, index) => (
            <div key={task.id} className="app-surface p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-semibold">{index + 1}. {task.title}</p>
                  <p className="mt-1 text-sm theme-text-secondary">{task.reasoning}</p>
                </div>
                <span className="app-badge">Score {task.score}</span>
              </div>
            </div>
          ))}

          {!rankedTasks.length && (
            <div className="app-surface p-4">
              <p className="theme-text-secondary">You have no pending tasks to prioritize right now.</p>
            </div>
          )}
        </div>
      </div>

      <div className="app-card p-6">
        <h2 className="text-xl theme-heading">Reasoning</h2>
        <div className="app-surface mt-4 p-4">
          <p className="theme-text-secondary">{data?.explanation || 'No explanation available.'}</p>
        </div>
      </div>
    </div>
  );
};

export default AITaskPrioritizer;
