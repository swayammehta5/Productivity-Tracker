import React, { useState, useEffect } from 'react';
import { habitsAPI } from '../../services/api';

const WeeklyView = () => {
  const [habits, setHabits] = useState([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(new Date()));
  const [loading, setLoading] = useState(true);

  function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      const response = await habitsAPI.getAll();
      setHabits(response.data);
    } catch (error) {
      console.error('Failed to load habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const isHabitCompletedOnDate = (habit, date) => {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    return habit.completions.some(c => {
      const completionDate = new Date(c.date);
      completionDate.setHours(0, 0, 0, 0);
      return c.completed && completionDate.getTime() === checkDate.getTime();
    });
  };

  const handleToggleCompletion = async (habitId, date) => {
    const habit = habits.find(h => h._id === habitId);
    const isCompleted = isHabitCompletedOnDate(habit, date);

    try {
      if (isCompleted) {
        await habitsAPI.uncomplete(habitId, date.toISOString());
      } else {
        await habitsAPI.complete(habitId, date.toISOString());
      }
      loadHabits();
    } catch (error) {
      console.error('Failed to toggle habit:', error);
    }
  };

  const changeWeek = (direction) => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(currentWeekStart.getDate() + (direction * 7));
    setCurrentWeekStart(getWeekStart(newDate));
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };
   const isFuture = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate > today;
  };

  const getWeeklyCompletionRate = (habit) => {
    const weekDays = getWeekDays();
    const validDays = weekDays.filter(d => !isFuture(d));
    if (validDays.length === 0) return 0;
    
    const completed = validDays.filter(d => isHabitCompletedOnDate(habit, d)).length;
    return Math.round((completed / validDays.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (habits.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow">
          <div className="text-6xl mb-4">📅</div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            No habits to display
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Create a habit first to see the weekly view
          </p>
        </div>
      </div>
    );
  }

  const weekDays = getWeekDays();
  const weekEnd = new Date(weekDays[weekDays.length - 1]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Weekly View
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your weekly habit progress at a glance
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center">
          <button
            onClick={() => changeWeek(-1)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {currentWeekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            {' - '}
            {weekEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </h2>
          
          <button
            onClick={() => changeWeek(1)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Habit
                </th>
                {weekDays.map((day, index) => (
                  <th
                    key={index}
                    className={`px-4 py-4 text-center text-sm font-semibold ${
                      isToday(day)
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    <div>{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                    <div className="text-xs font-normal text-gray-500 dark:text-gray-400">
                      {day.getDate()}
                    </div>
                  </th>
                ))}
                <th className="px-4 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                  Rate
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {habits.map((habit) => (
                <tr key={habit._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: habit.color }}
                      />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {habit.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          🔥 {habit.currentStreak} day streak
                        </div>
                      </div>
                    </div>
                  </td>
                  {weekDays.map((day, index) => {
                    const completed = isHabitCompletedOnDate(habit, day);
                    const future = isFuture(day);
                    
                    return (
                      <td key={index} className="px-4 py-4">
                        <button
                          onClick={() => !future && handleToggleCompletion(habit._id, day)}
                          disabled={future}
                          className={`w-10 h-10 rounded-lg font-medium transition-all mx-auto block ${
                            completed
                              ? 'bg-green-500 text-white hover:bg-green-600'
                              : future
                              ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}
                        >
                          {completed ? '✓' : ''}
                        </button>
                      </td>
                    );
                  })}
                  <td className="px-4 py-4 text-center">
                    <div className="inline-flex items-center space-x-2">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {getWeeklyCompletionRate(habit)}%
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
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
      </div>
    </div>
  );
};

export default WeeklyView;
