import React from 'react';
import { tasksAPI } from '../../services/api';

const TaskCard = ({ task, onUpdate, onDelete }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700';
      case 'Medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700';
      case 'Low':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(date);
    taskDate.setHours(0, 0, 0, 0);
    
    if (taskDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (taskDate.getTime() < today.getTime()) {
      const daysDiff = Math.floor((today - taskDate) / (1000 * 60 * 60 * 24));
      return `${daysDiff} day${daysDiff > 1 ? 's' : ''} overdue`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const isOverdue = () => {
    if (!task.dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today && task.status === 'Pending';
  };

  const handleToggleComplete = async () => {
    try {
      const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
      await tasksAPI.update(task._id, { status: newStatus });
      onUpdate();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-xl ${
      task.status === 'Completed' ? 'opacity-75' : ''
    } ${isOverdue() ? 'border-l-4 border-red-500' : ''}`}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className={`text-lg font-semibold ${
                task.status === 'Completed' 
                  ? 'line-through text-gray-500 dark:text-gray-400' 
                  : 'text-gray-900 dark:text-white'
              }`}>
                {task.title}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
            </div>
            
            {task.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {task.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm">
              {task.dueDate && (
                <div className={`flex items-center gap-1 ${
                  isOverdue() ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  <span>📅</span>
                  <span>{formatDate(task.dueDate)}</span>
                </div>
              )}
              {task.category && (
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <span>🏷️</span>
                  <span>{task.category}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch gap-2 mt-4">
          <button
            onClick={handleToggleComplete}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition duration-200 ${
              task.status === 'Completed'
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
            }`}
          >
            {task.status === 'Completed' ? '✓ Completed' : 'Mark Complete'}
          </button>
          <button
            onClick={() => onDelete(task._id)}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition duration-200 w-full sm:w-auto"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;

