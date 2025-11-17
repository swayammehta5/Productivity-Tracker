import React, { useState, useEffect } from 'react';
import { habitsAPI, tasksAPI } from '../../services/api';

const CalendarView = () => {
  const [habits, setHabits] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [viewMode, setViewMode] = useState('habits'); // 'habits' or 'tasks'
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [habitsRes, tasksRes] = await Promise.all([
        habitsAPI.getAll(),
        tasksAPI.getAll({ sortBy: 'dueDate' })
      ]);
      setHabits(habitsRes.data);
      setTasks(tasksRes.data);
      if (habitsRes.data.length > 0) {
        setSelectedHabit(habitsRes.data[0]);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const isHabitCompleted = (date) => {
    if (!selectedHabit) return false;
    
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    return selectedHabit.completions.some(c => {
      const completionDate = new Date(c.date);
      completionDate.setHours(0, 0, 0, 0);
      return c.completed && completionDate.getTime() === checkDate.getTime();
    });
  };

  const getTasksForDate = (date) => {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === checkDate.getTime();
    });
  };

  const handleToggleDay = async (date) => {
    if (!selectedHabit) return;

    try {
      const isCompleted = isHabitCompleted(date);
      if (isCompleted) {
        await habitsAPI.uncomplete(selectedHabit._id, date.toISOString());
      } else {
        await habitsAPI.complete(selectedHabit._id, date.toISOString());
      }
      loadData();
    } catch (error) {
      console.error('Failed to toggle habit:', error);
    }
  };

  const changeMonth = (direction) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      date.setHours(0, 0, 0, 0);
      const isToday = date.getTime() === today.getTime();
      const isPast = date < today;
      const isFuture = date > today;

      if (viewMode === 'habits') {
        const isCompleted = isHabitCompleted(date);
        days.push(
          <button
            key={day}
            onClick={() => !isFuture && handleToggleDay(date)}
            disabled={isFuture}
            className={`aspect-square flex items-center justify-center rounded-lg font-medium transition-all ${
              isToday ? 'ring-2 ring-blue-500' : ''
            } ${
              isCompleted
                ? 'bg-green-500 text-white hover:bg-green-600'
                : isPast
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                : isFuture
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {day}
          </button>
        );
      } else {
        const dayTasks = getTasksForDate(date);
        const completedTasks = dayTasks.filter(t => t.status === 'Completed').length;
        const pendingTasks = dayTasks.filter(t => t.status === 'Pending').length;
        const hasHighPriority = dayTasks.some(t => t.priority === 'High' && t.status === 'Pending');

        days.push(
          <div
            key={day}
            className={`aspect-square flex flex-col items-center justify-center rounded-lg font-medium transition-all p-1 ${
              isToday ? 'ring-2 ring-purple-500' : ''
            } ${
              hasHighPriority
                ? 'bg-red-100 dark:bg-red-900/30 border-2 border-red-500'
                : pendingTasks > 0
                ? 'bg-yellow-100 dark:bg-yellow-900/30'
                : completedTasks > 0
                ? 'bg-green-100 dark:bg-green-900/30'
                : 'bg-gray-100 dark:bg-gray-800'
            }`}
          >
            <span className="text-sm font-semibold">{day}</span>
            {dayTasks.length > 0 && (
              <div className="flex gap-1 mt-1">
                {pendingTasks > 0 && (
                  <span className="text-xs bg-yellow-500 text-white rounded-full px-1">
                    {pendingTasks}
                  </span>
                )}
                {completedTasks > 0 && (
                  <span className="text-xs bg-green-500 text-white rounded-full px-1">
                    {completedTasks}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      }
    }

    return days;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Calendar View
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your habits and tasks over time
        </p>
      </div>

      {/* View Mode Toggle */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            View Mode
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('habits')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                viewMode === 'habits'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Habits
            </button>
            <button
              onClick={() => setViewMode('tasks')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                viewMode === 'tasks'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Tasks
            </button>
          </div>
        </div>

        {viewMode === 'habits' && habits.length > 0 && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Habit
            </label>
            <select
              value={selectedHabit?._id || ''}
              onChange={(e) => setSelectedHabit(habits.find(h => h._id === e.target.value))}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            >
              {habits.map(habit => (
                <option key={habit._id} value={habit._id}>
                  {habit.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {viewMode === 'habits' && habits.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow">
          <div className="text-6xl mb-4">📅</div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            No habits to display
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Create a habit first to see the calendar view
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            
            <button
              onClick={() => changeMonth(1)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-semibold text-gray-600 dark:text-gray-400 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {renderCalendar()}
          </div>

          <div className="mt-6 flex items-center justify-center space-x-6 text-sm flex-wrap gap-4">
            {viewMode === 'habits' ? (
              <>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded" />
                  <span className="text-gray-600 dark:text-gray-400">Completed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                  <span className="text-gray-600 dark:text-gray-400">Incomplete</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded" />
                  <span className="text-gray-600 dark:text-gray-400">Future</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-100 dark:bg-red-900/30 border-2 border-red-500 rounded" />
                  <span className="text-gray-600 dark:text-gray-400">High Priority</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900/30 rounded" />
                  <span className="text-gray-600 dark:text-gray-400">Pending Tasks</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-100 dark:bg-green-900/30 rounded" />
                  <span className="text-gray-600 dark:text-gray-400">Completed Tasks</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
