import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { habitsAPI, tasksAPI, statsAPI } from '../../services/api';
import HabitCard from './HabitCard';
import StreakSummary from './StreakSummary';
import SmartSuggestions from '../AI/SmartSuggestions';

const Dashboard = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [habitsRes, tasksRes, statsRes] = await Promise.all([
        habitsAPI.getAll(),
        tasksAPI.getAll({ sortBy: 'dueDate' }),
        statsAPI.getCombined()
      ]);
      setHabits(habitsRes.data);
      setTasks(tasksRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleHabit = async (habitId, completed) => {
    try {
      const today = new Date().toISOString();
      if (completed) {
        await habitsAPI.complete(habitId, today);
      } else {
        await habitsAPI.uncomplete(habitId, today);
      }
      loadData();
    } catch (error) {
      console.error('Failed to toggle habit:', error);
    }
  };

  const getTodayHabits = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return habits.map(habit => {
      const todayCompletion = habit.completions.find(c => {
        const d = new Date(c.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
      });
      
      return {
        ...habit,
        completedToday: todayCompletion?.completed || false
      };
    });
  };

  const getUpcomingTasks = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    return tasks
      .filter(task => task.status === 'Pending' && task.dueDate)
      .filter(task => {
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate >= today && dueDate <= nextWeek;
      })
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);
  };

  const getOverdueTasks = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return tasks
      .filter(task => task.status === 'Pending' && task.dueDate)
      .filter(task => {
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < today;
      })
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  const todayHabits = getTodayHabits();
  const completedToday = todayHabits.filter(h => h.completedToday).length;
  const upcomingTasks = getUpcomingTasks();
  const overdueTasks = getOverdueTasks();
  const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
  // Removed unused completedTasks variable

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 space-y-2 text-center sm:text-left">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">
          Let's make today count. Track your habits and tasks to boost productivity.
        </p>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Habits</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.habits.total}
                </p>
              </div>
              <div className="text-4xl">🎯</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Tasks</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.tasks.total}
                </p>
              </div>
              <div className="text-4xl">📋</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completed Tasks</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {stats.tasks.completed}
                </p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending Tasks</p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats.tasks.pending}
                </p>
              </div>
              <div className="text-4xl">⏳</div>
            </div>
          </div>
        </div>
      )}

      {stats && <StreakSummary stats={stats} completedToday={completedToday} totalToday={todayHabits.length} />}

      {/* Smart Suggestions */}
      <div className="mt-8 mb-8">
        <SmartSuggestions />
      </div>

      {/* Overdue Tasks Alert */}
      {overdueTasks.length > 0 && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="text-3xl md:text-2xl">⚠️</div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-1">
                {overdueTasks.length} Overdue Task{overdueTasks.length > 1 ? 's' : ''}
              </h3>
              <p className="text-sm text-red-700 dark:text-red-400">
                You have {overdueTasks.length} task{overdueTasks.length > 1 ? 's' : ''} that {overdueTasks.length > 1 ? 'are' : 'is'} past due date.
              </p>
            </div>
            <Link
              to="/tasks"
              className="mt-2 md:mt-0 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition duration-200 text-center"
            >
              View Tasks
            </Link>
          </div>
        </div>
      )}

      {/* Today's Habits */}
      <div className="mt-8 mb-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Today's Habits</h2>
          <Link
            to="/add-habit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition duration-200 text-center"
          >
            + Add Habit
          </Link>
        </div>

        {todayHabits.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No habits yet. Start building your routine!</p>
            <Link
              to="/add-habit"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition duration-200"
            >
              Create Your First Habit
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {todayHabits.map(habit => (
              <HabitCard
                key={habit._id}
                habit={habit}
                onToggle={() => handleToggleHabit(habit._id, !habit.completedToday)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Tasks */}
      <div className="mt-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upcoming Tasks</h2>
          <Link
            to="/tasks"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition duration-200 text-center"
          >
            View All Tasks
          </Link>
        </div>

        {upcomingTasks.length === 0 && pendingTasks === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No tasks yet. Start organizing your work!</p>
            <Link
              to="/tasks"
              className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition duration-200"
            >
              Create Your First Task
            </Link>
          </div>
        ) : upcomingTasks.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow">
            <p className="text-gray-500 dark:text-gray-400">No upcoming tasks in the next 7 days.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingTasks.map(task => (
              <div
                key={task._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-purple-500"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {task.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    task.priority === 'High' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                    task.priority === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                    'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  }`}>
                    {task.priority}
                  </span>
                </div>
                {task.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {task.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    📅 {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  {task.category && (
                    <span className="text-gray-500 dark:text-gray-400">
                      🏷️ {task.category}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
