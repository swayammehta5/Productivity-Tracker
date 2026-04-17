import React, { useState, useEffect } from 'react';
import { habitsAPI, tasksAPI } from '../../services/api';

const CalendarView = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const viewMode = 'habits';
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
    return {
      daysInMonth: lastDay.getDate(),
      startingDayOfWeek: firstDay.getDay()
    };
  };

  const toUTCDateString = (value) => {
    const date = new Date(value);
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
      .toISOString()
      .split('T')[0];
  };

  const isHabitCompleted = (date) => {
    if (!selectedHabit) return false;
    const checkDateKey = toUTCDateString(date);

    return selectedHabit.completions.some(c => {
      return c.completed && toUTCDateString(c.date) === checkDateKey;
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
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Hard guard on client: do not allow toggles for non-today dates.
    if (selectedDate.getTime() !== today.getTime()) return;

    try {
      const isCompleted = isHabitCompleted(selectedDate);
      const completionDate = toUTCDateString(selectedDate);
      if (isCompleted) {
        await habitsAPI.uncomplete(selectedHabit._id, completionDate);
      } else {
        await habitsAPI.complete(selectedHabit._id, completionDate);
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

    // Empty slots
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      date.setHours(0, 0, 0, 0);

      const isToday = date.getTime() === today.getTime();
      const isDisabled = !isToday;

      if (viewMode === 'habits') {
        const isCompleted = isHabitCompleted(date);

        days.push(
          <button
            key={day}
            onClick={() => handleToggleDay(date)}
            disabled={isDisabled}
            className={`aspect-square flex items-center justify-center rounded-lg font-medium transition-all ${
              isToday ? 'ring-2 ring-blue-500' : ''
            } ${
              isCompleted
                ? 'bg-green-500 text-white hover:bg-green-600'
                : isDisabled
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 dark:bg-gray-700'
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
            className={`aspect-square flex flex-col items-center justify-center rounded-lg font-medium p-1 ${
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
    return <div className="text-center mt-20 theme-text-secondary">Loading...</div>;
  }

  return (
    <div className="app-page">
      <h1 className="text-3xl theme-heading mb-4">Calendar View</h1>

      <div className="app-card p-4 mb-4">
        <div className="flex justify-between items-center">
          <button className="btn-outline px-3 py-2" onClick={() => changeMonth(-1)}>⬅</button>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
          <button className="btn-outline px-3 py-2" onClick={() => changeMonth(1)}>➡</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2 app-card p-3">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(day => (
          <div key={day} className="text-center font-bold theme-text-secondary">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 app-card p-3">
        {renderCalendar()}
      </div>
    </div>
  );
};

export default CalendarView;