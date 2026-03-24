import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { habitsAPI, tasksAPI, statsAPI } from '../../services/api';
import HabitCard from './HabitCard';
import StreakSummary from './StreakSummary';

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
        // ...habit to include all existing properties of the habit[spread operator]
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
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
      {/* Welcome Section */}
      <div className="mb-8 space-y-4 text-center sm:text-left animate-fade-in">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
          Let's make today count. Track your habits and tasks to boost productivity.
        </p>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="group relative bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl shadow-soft-lg border border-white/20 dark:border-white/10 p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-glass-light dark:hover:shadow-glass-dark">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Habits</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  {stats.habits.total}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-400 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🎯</span>
              </div>
            </div>
          </div>

          <div className="group relative bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl shadow-soft-lg border border-white/20 dark:border-white/10 p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-glass-light dark:hover:shadow-glass-dark">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Tasks</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {stats.tasks.total}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">📋</span>
              </div>
            </div>
          </div>

          <div className="group relative bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl shadow-soft-lg border border-white/20 dark:border-white/10 p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-glass-light dark:hover:shadow-glass-dark">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Completed Tasks</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {stats.tasks.completed}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-400 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="group relative bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl shadow-soft-lg border border-white/20 dark:border-white/10 p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-glass-light dark:hover:shadow-glass-dark">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Pending Tasks</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  {stats.tasks.pending}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {stats && <StreakSummary stats={stats} completedToday={completedToday} totalToday={todayHabits.length} />}

      {/* Overdue Tasks Alert */}
      {overdueTasks.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 backdrop-blur-xl border-l-4 border-red-500 rounded-2xl p-6 shadow-soft-lg animate-slide-up">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="text-3xl md:text-2xl animate-pulse">⚠️</div>
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
              className="mt-2 md:mt-0 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl font-medium shadow-lg transform hover:scale-105 transition-all duration-300 text-center active:scale-95"
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
            className="group px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-medium shadow-lg transform hover:scale-105 transition-all duration-300 text-center active:scale-95"
          >
            <span className="flex items-center space-x-2">
              <span>+</span>
              <span>Add Habit</span>
            </span>
          </Link>
        </div>

        {todayHabits.length === 0 ? (
          <div className="text-center py-16 bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl shadow-soft-lg border border-white/20 dark:border-white/10 animate-scale-in">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-3xl">🎯</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">No habits yet. Start building your routine!</p>
            <Link
              to="/add-habit"
              className="inline-block px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-medium shadow-lg transform hover:scale-105 transition-all duration-300 active:scale-95"
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
            className="group px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-medium shadow-lg transform hover:scale-105 transition-all duration-300 text-center active:scale-95"
          >
            <span className="flex items-center space-x-2">
              <span>📋</span>
              <span>View All Tasks</span>
            </span>
          </Link>
        </div>

        {upcomingTasks.length === 0 && pendingTasks === 0 ? (
          <div className="text-center py-16 bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl shadow-soft-lg border border-white/20 dark:border-white/10 animate-scale-in">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-3xl">📋</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">No tasks yet. Start organizing your work!</p>
            <Link
              to="/tasks"
              className="inline-block px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-medium shadow-lg transform hover:scale-105 transition-all duration-300 active:scale-95"
            >
              Create Your First Task
            </Link>
          </div>
        ) : upcomingTasks.length === 0 ? (
          <div className="text-center py-12 bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl shadow-soft-lg border border-white/20 dark:border-white/10">
            <p className="text-gray-600 dark:text-gray-300">No upcoming tasks in the next 7 days.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingTasks.map(task => (
              <div
                key={task._id}
                className="group bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl shadow-soft-lg border border-white/20 dark:border-white/10 p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-glass-light dark:hover:shadow-glass-dark animate-scale-in"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                      {task.title}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                      task.priority === 'High' 
                        ? 'bg-red-100/80 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200/50 dark:border-red-800/30' 
                        : task.priority === 'Medium' 
                        ? 'bg-yellow-100/80 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-200/50 dark:border-yellow-800/30'
                        : 'bg-green-100/80 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200/50 dark:border-green-800/30'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                      <span>📅</span>
                      <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </span>
                    {task.category && (
                      <span className="text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                        <span>🏷️</span>
                        <span>{task.category}</span>
                      </span>
                    )}
                  </div>
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
