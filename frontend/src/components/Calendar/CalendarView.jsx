import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { habitsAPI, tasksAPI, calendarAPI } from '../../services/api';
import CalendarDay from './CalendarDay';
import DayDetailsModal from './DayDetailsModal';

const CalendarView = () => {
  const navigate = useNavigate();
  const [habits, setHabits] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [viewMode, setViewMode] = useState('habits');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateDetails, setSelectedDateDetails] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dayDetailsCache = useRef({});

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

  const fetchDayDetails = async (date) => {
    const dateKey = toUTCDateString(date);
    const cacheKey = `${viewMode}-${dateKey}-${selectedHabit?._id || 'none'}`;

    if (dayDetailsCache.current[cacheKey]) {
      return dayDetailsCache.current[cacheKey];
    }

    const response = await calendarAPI.getDayDetails({
      date: dateKey,
      type: viewMode === 'habits' ? 'habit' : 'task',
      habitId: selectedHabit?._id
    });
    dayDetailsCache.current[cacheKey] = response.data;
    return response.data;
  };

  const handleDayClick = async (date) => {
    try {
      const details = await fetchDayDetails(date);
      setSelectedDate(toUTCDateString(date));
      setSelectedDateDetails(details);
      setIsDetailsOpen(true);
    } catch (error) {
      console.error('Failed to load day details:', error);
    }
  };

  const clearCache = () => {
    dayDetailsCache.current = {};
  };

  const handleToggleHabitFromModal = async () => {
    if (!selectedHabit || !selectedDateDetails?.habit) return;

    try {
      if (selectedDateDetails.habit.completed) {
        await habitsAPI.uncomplete(selectedHabit._id, selectedDate);
      } else {
        await habitsAPI.complete(selectedHabit._id, selectedDate);
      }
      clearCache();
      await loadData();
      const refreshed = await fetchDayDetails(new Date(selectedDate));
      setSelectedDateDetails(refreshed);
    } catch (error) {
      console.error('Failed to toggle habit from modal:', error);
    }
  };

  const handleToggleTaskStatusFromModal = async (task) => {
    try {
      await tasksAPI.update(task.id, {
        status: task.status === 'Completed' ? 'Pending' : 'Completed'
      });
      clearCache();
      await loadData();
      const refreshed = await fetchDayDetails(new Date(selectedDate));
      setSelectedDateDetails(refreshed);
    } catch (error) {
      console.error('Failed to toggle task status:', error);
    }
  };

  const handleEdit = (type) => {
    if (type === 'habit') {
      navigate('/habits');
    } else {
      navigate('/tasks');
    }
  };

  const changeMonth = (direction) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const getTaskSummaryForDate = (date) => {
    const dayTasks = getTasksForDate(date);
    const completedTasks = dayTasks.filter((task) => task.status === 'Completed').length;
    const pendingTasks = dayTasks.filter((task) => task.status === 'Pending').length;
    const totalTasks = dayTasks.length;

    return {
      completedTasks,
      pendingTasks,
      totalTasks,
      completionRate: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
  };

  const getHabitSummaryForDate = (date) => {
    const isCompleted = isHabitCompleted(date);
    const dateKey = toUTCDateString(date);
    const todayKey = toUTCDateString(new Date());

    return {
      habitStatus: isCompleted ? 'Completed' : dateKey <= todayKey ? 'Missed' : 'No Data'
    };
  };

  const getDayColorClass = (date) => {
    if (viewMode === 'habits') {
      const summary = getHabitSummaryForDate(date);
      if (summary.habitStatus === 'Completed') return 'bg-green-500 text-white hover:bg-green-600';
      if (summary.habitStatus === 'Missed') return 'bg-red-100 text-red-700 dark:bg-red-900/30';
      return 'bg-gray-200 dark:bg-gray-700';
    }

    const summary = getTaskSummaryForDate(date);
    if (summary.totalTasks === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (summary.pendingTasks > 0 && summary.completedTasks > 0) return 'bg-yellow-100 dark:bg-yellow-900/30';
    if (summary.pendingTasks > 0) return 'bg-red-100 dark:bg-red-900/30';
    return 'bg-green-100 dark:bg-green-900/30';
  };

  const canToggleHabitInModal = useMemo(() => {
    if (!selectedDate) return false;
    return selectedDate === toUTCDateString(new Date());
  }, [selectedDate]);

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
    const days = [];

    // Empty slots
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      date.setHours(0, 0, 0, 0);
      const summary = viewMode === 'habits' ? getHabitSummaryForDate(date) : getTaskSummaryForDate(date);

      days.push(
        <CalendarDay
          key={day}
          day={day}
          isToday={toUTCDateString(date) === toUTCDateString(new Date())}
          colorClass={getDayColorClass(date)}
          summary={summary}
          viewMode={viewMode}
          onClick={() => handleDayClick(date)}
        />
      );
    }

    return days;
  };

  if (loading) {
    return <div className="text-center mt-20 theme-text-secondary">Loading...</div>;
  }

  return (
    <div className="app-page">
      <h1 className="text-3xl theme-heading mb-4">Calendar View</h1>

      <div className="app-card mb-4 flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`px-3 py-2 rounded ${viewMode === 'habits' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setViewMode('habits')}
          >
            Habits
          </button>
          <button
            type="button"
            className={`px-3 py-2 rounded ${viewMode === 'tasks' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setViewMode('tasks')}
          >
            Tasks
          </button>
        </div>

        {viewMode === 'habits' && (
          <select
            className="rounded border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            value={selectedHabit?._id || ''}
            onChange={(event) => {
              const habit = habits.find((item) => item._id === event.target.value);
              setSelectedHabit(habit || null);
              clearCache();
            }}
          >
            {habits.map((habit) => (
              <option key={habit._id} value={habit._id}>
                {habit.name}
              </option>
            ))}
          </select>
        )}
      </div>

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

      <div className="app-card mt-4 p-3">
        <p className="mb-2 text-sm font-semibold theme-text-primary">Legend</p>
        <div className="flex flex-wrap gap-3 text-xs theme-text-secondary">
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-green-500" />Completed</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-red-400" />Missed</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-yellow-400" />Partial</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-gray-400" />No data</span>
        </div>
      </div>

      <DayDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        details={selectedDateDetails}
        viewMode={viewMode}
        selectedDate={selectedDate}
        canToggleHabit={canToggleHabitInModal}
        onToggleHabit={handleToggleHabitFromModal}
        onToggleTask={handleToggleTaskStatusFromModal}
        onEdit={handleEdit}
      />
    </div>
  );
};

export default CalendarView;