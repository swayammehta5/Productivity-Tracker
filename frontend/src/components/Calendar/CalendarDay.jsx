import React from 'react';
import TooltipSummary from './TooltipSummary';

const CalendarDay = ({ day, isToday, colorClass, onClick, summary, viewMode }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative aspect-square rounded-lg p-1 font-medium transition-all hover:scale-[1.02] hover:shadow ${isToday ? 'ring-2 ring-blue-500' : ''} ${colorClass}`}
    >
      <TooltipSummary summary={summary} viewMode={viewMode} />
      <div className="flex h-full flex-col items-center justify-center">
        <span className="text-sm font-semibold">{day}</span>
        {viewMode === 'tasks' && summary.totalTasks > 0 && (
          <div className="mt-1 flex gap-1">
            {summary.pendingTasks > 0 && (
              <span className="rounded-full bg-yellow-500 px-1 text-xs text-white">{summary.pendingTasks}</span>
            )}
            {summary.completedTasks > 0 && (
              <span className="rounded-full bg-green-500 px-1 text-xs text-white">{summary.completedTasks}</span>
            )}
          </div>
        )}
      </div>
    </button>
  );
};

export default CalendarDay;
