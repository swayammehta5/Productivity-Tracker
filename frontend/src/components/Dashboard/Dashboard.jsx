import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { habitsAPI } from '../../services/api';
import HabitCard from './HabitCard';
import StreakSummary from './StreakSummary';

const Dashboard = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [habitsRes, statsRes] = await Promise.all([
        habitsAPI.getAll(),
        habitsAPI.getStats()
      ]);
      setHabits(habitsRes.data);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  const todayHabits = getTodayHabits();
  const completedToday = todayHabits.filter(h => h.completedToday).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Let's make today count. Track your habits and build consistency.
        </p>
      </div>

      {stats && <StreakSummary stats={stats} completedToday={completedToday} totalToday={todayHabits.length} />}

      <div className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Today's Habits</h2>
          <Link
            to="/add-habit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition duration-200"
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
    </div>
  );
};

export default Dashboard;