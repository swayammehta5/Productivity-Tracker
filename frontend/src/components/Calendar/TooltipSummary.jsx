import React from 'react';

const TooltipSummary = ({ viewMode, summary }) => {
  if (!summary) return null;

  if (viewMode === 'tasks') {
    return (
      <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-max -translate-x-1/2 rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
        {summary.completedTasks} tasks completed, {summary.pendingTasks} pending
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-max -translate-x-1/2 rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
      Habit: {summary.habitStatus || 'No Data'}
    </div>
  );
};

export default TooltipSummary;
