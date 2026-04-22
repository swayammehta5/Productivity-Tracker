import React, { useState } from 'react';

const TaskRow = ({ task, onToggleStatus }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold theme-text-primary">{task.title}</p>
          <p className="text-xs theme-text-secondary">
            {task.status} | {task.priority} priority {task.deadline ? `| Due ${task.deadline}` : ''}
          </p>
        </div>
        <button
          type="button"
          className="btn-outline px-2 py-1 text-xs"
          onClick={() => onToggleStatus(task)}
        >
          Mark {task.status === 'Completed' ? 'Pending' : 'Completed'}
        </button>
      </div>
      {task.description && (
        <div className="mt-2">
          <button
            type="button"
            className="text-xs text-blue-500 hover:text-blue-600"
            onClick={() => setExpanded((prev) => !prev)}
          >
            {expanded ? 'Hide description' : 'Show description'}
          </button>
          {expanded && <p className="mt-1 text-sm theme-text-secondary">{task.description}</p>}
        </div>
      )}
    </div>
  );
};

const DayDetailsModal = ({
  isOpen,
  onClose,
  details,
  viewMode,
  selectedDate,
  canToggleHabit,
  onToggleHabit,
  onToggleTask,
  onEdit
}) => {
  if (!isOpen || !details) return null;

  const habit = details.habit;
  const completionRate = details.summary?.completionRate ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="app-card max-h-[85vh] w-full max-w-2xl overflow-y-auto p-5">
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            <h3 className="text-xl font-semibold theme-heading">Day Details</h3>
            <p className="text-sm theme-text-secondary">{selectedDate}</p>
          </div>
          <button type="button" onClick={onClose} className="btn-outline px-3 py-1">
            Close
          </button>
        </div>

        {viewMode === 'habits' ? (
          <div className="space-y-3">
            <p className="text-lg font-semibold theme-text-primary">{habit?.name || 'No habit selected'}</p>
            <p className="theme-text-secondary">Status: {habit?.status || 'No Data'}</p>
            <p className="theme-text-secondary">Completion time: {habit?.time || 'N/A'}</p>
            <p className="theme-text-secondary">Streak (till date): {habit?.streak ?? 0}</p>
            <p className="theme-text-secondary">Notes: {habit?.notes || 'No notes'}</p>
            <div>
              <p className="mb-1 text-sm theme-text-secondary">Progress</p>
              <div className="h-2 rounded bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-2 rounded bg-blue-500"
                  style={{ width: `${habit?.progress ?? 0}%` }}
                />
              </div>
              <p className="mt-1 text-xs theme-text-secondary">{habit?.progress ?? 0}%</p>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                className="btn-primary px-3 py-2"
                onClick={onToggleHabit}
                disabled={!canToggleHabit}
                title={canToggleHabit ? '' : 'Habit can only be marked for today'}
              >
                Mark {habit?.completed ? 'Missed' : 'Completed'}
              </button>
              <button type="button" className="btn-outline px-3 py-2" onClick={() => onEdit('habit')}>
                Edit
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <p className="text-sm theme-text-secondary">
                Tasks completion rate: <span className="font-semibold theme-text-primary">{completionRate}%</span>
              </p>
              <div className="mt-2 h-2 rounded bg-gray-200 dark:bg-gray-700">
                <div className="h-2 rounded bg-green-500" style={{ width: `${completionRate}%` }} />
              </div>
            </div>
            {details.tasks.length === 0 ? (
              <p className="theme-text-secondary">No tasks for this day.</p>
            ) : (
              details.tasks.map((task) => (
                <TaskRow key={task.id} task={task} onToggleStatus={onToggleTask} />
              ))
            )}
            <button type="button" className="btn-outline px-3 py-2" onClick={() => onEdit('task')}>
              Edit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DayDetailsModal;
