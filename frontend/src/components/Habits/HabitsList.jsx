import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { habitsAPI } from '../../services/api';

const HabitsList = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filter, setFilter] = useState('all'); // all, active, archived

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

  const handleDelete = async (habitId) => {
    try {
      await habitsAPI.delete(habitId);
      setHabits(habits.filter(h => h._id !== habitId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete habit:', error);
      alert('Failed to delete habit. Please try again.');
    }
  };

  const getFilteredHabits = () => {
    switch (filter) {
      case 'active':
        return habits.filter(h => h.currentStreak > 0);
      case 'archived':
        return habits.filter(h => h.currentStreak === 0);
      default:
        return habits;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  const filteredHabits = getFilteredHabits();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Your Habits</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage and track all your habits</p>
        </div>
        <Link
          to="/add-habit"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition duration-200 shadow-lg"
        >
          + Add New Habit
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex space-x-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 font-medium transition ${
            filter === 'all'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          All ({habits.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 font-medium transition ${
            filter === 'active'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Active ({habits.filter(h => h.currentStreak > 0).length})
        </button>
        <button
          onClick={() => setFilter('archived')}
          className={`px-4 py-2 font-medium transition ${
            filter === 'archived'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Inactive ({habits.filter(h => h.currentStreak === 0).length})
        </button>
      </div>

      {filteredHabits.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            {filter === 'all' ? 'No habits yet' : `No ${filter} habits`}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {filter === 'all' 
              ? 'Start building better habits today!' 
              : `You don't have any ${filter} habits at the moment.`}
          </p>
          {filter === 'all' && (
            <Link
              to="/add-habit"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition duration-200"
            >
              Create Your First Habit
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredHabits.map(habit => (
            <div
              key={habit._id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-xl"
            >
              <div className="h-2" style={{ backgroundColor: habit.color }} />
              
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <Link to={`/habits/${habit._id}`}>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition">
                        {habit.name}
                      </h3>
                    </Link>
                    {habit.description && (
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {habit.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500 dark:text-gray-400">Frequency:</span>
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium capitalize">
                          {habit.frequency}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500 dark:text-gray-400">Goal:</span>
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                          {habit.goal} {habit.goal === 1 ? 'time' : 'times'} per day
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-8">
                      <div>
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                          {habit.currentStreak}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Current Streak</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                          {habit.longestStreak}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Longest Streak</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                          {habit.completions.filter(c => c.completed).length}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Total Completions</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <Link
                      to={`/habits/${habit._id}`}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition duration-200 text-center"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => setDeleteConfirm(habit._id)}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              {deleteConfirm === habit._id && (
                <div className="bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800 p-4">
                  <p className="text-red-700 dark:text-red-300 mb-3">
                    Are you sure you want to delete "{habit.name}"? This action cannot be undone.
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleDelete(habit._id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition duration-200"
                    >
                      Yes, Delete
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HabitsList;
