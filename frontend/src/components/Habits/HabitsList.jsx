import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { habitsAPI } from '../../services/api';
import AddHabit from './AddHabit';

const HabitsList = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState(null);

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
      toast.success('Habit deleted successfully');
    } catch (error) {
      console.error('Failed to delete habit:', error);
      toast.error('Failed to delete habit. Please try again.');
    }
  };

  const handleEditClick = (habit) => {
    setHabitToEdit(habit);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setHabitToEdit(null);
  };

  const handleHabitSaved = (savedHabit) => {
    if (habitToEdit) {
      setHabits(prev =>
        prev.map(habit => (habit._id === savedHabit._id ? savedHabit : habit))
      );
      toast.success('Habit updated successfully');
      return;
    }

    // Keep newest habits first to match backend sorting.
    setHabits(prev => [savedHabit, ...prev]);
    toast.success('Habit created successfully');
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
        <div className="text-xl theme-text-secondary">Loading...</div>
      </div>
    );
  }

  const filteredHabits = getFilteredHabits();

  return (
    <div className="app-page">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl theme-heading mb-2">Your Habits</h1>
          <p className="theme-text-secondary">Manage and track all your habits</p>
        </div>
        <button
          onClick={() => {
            setHabitToEdit(null);
            setShowAddModal(true);
          }}
          className="btn-primary px-6 py-3"
        >
          + Add New Habit
        </button>
      </div>
      <div className="mb-6 flex flex-wrap gap-2 border-b border-[var(--border)] pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 font-medium transition ${
            filter === 'all'
              ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
              : 'theme-text-secondary hover:text-[var(--text-primary)]'
          }`}
        >
          All ({habits.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 font-medium transition ${
            filter === 'active'
              ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
              : 'theme-text-secondary hover:text-[var(--text-primary)]'
          }`}
        >
          Active ({habits.filter(h => h.currentStreak > 0).length})
        </button>
        <button
          onClick={() => setFilter('archived')}
          className={`px-4 py-2 font-medium transition ${
            filter === 'archived'
              ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
              : 'theme-text-secondary hover:text-[var(--text-primary)]'
          }`}
        >
          Inactive ({habits.filter(h => h.currentStreak === 0).length})
        </button>
      </div>

      {filteredHabits.length === 0 ? (
        <div className="text-center py-16 app-card">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">
            {filter === 'all' ? 'No habits yet' : `No ${filter} habits`}
          </h2>
          <p className="theme-text-secondary mb-6">
            {filter === 'all' 
              ? 'Start building better habits today!' 
              : `You don't have any ${filter} habits at the moment.`}
          </p>
          {filter === 'all' && (
            <button
              onClick={() => {
                setHabitToEdit(null);
                setShowAddModal(true);
              }}
              className="btn-primary"
            >
              Create Your First Habit
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredHabits.map(habit => (
            <div
              key={habit._id}
              className="app-card overflow-hidden transition-all hover:shadow-xl"
            >
              <div className="h-2" style={{ backgroundColor: habit.color }} />
              
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <Link to={`/habits/${habit._id}`}>
                      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 hover:text-[var(--primary)] transition">
                        {habit.name}
                      </h3>
                    </Link>
                    {habit.description && (
                      <p className="theme-text-secondary mb-4">
                        {habit.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="theme-text-secondary">Frequency:</span>
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium capitalize">
                          {habit.frequency}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="theme-text-secondary">Goal:</span>
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                          {habit.goal} {habit.goal === 1 ? 'time' : 'times'} per day
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-6">
                      <div>
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                          {habit.currentStreak}
                        </div>
                        <div className="text-sm theme-text-secondary">Current Streak</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                          {habit.longestStreak}
                        </div>
                        <div className="text-sm theme-text-secondary">Longest Streak</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                          {habit.completions.filter(c => c.completed).length}
                        </div>
                        <div className="text-sm theme-text-secondary">Total Completions</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => handleEditClick(habit)}
                      className="btn-primary px-4 py-2 text-sm"
                    >
                      Edit
                    </button>
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
                <div className="bg-[color-mix(in_srgb,var(--card)_65%,#ef4444_35%)] border-t border-red-400 p-4">
                  <p className="text-red-200 mb-3">
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
                      className="px-4 py-2 btn-outline text-sm"
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

      {showAddModal && (
        <AddHabit 
          onClose={handleCloseModal} 
          habitToEdit={habitToEdit}
          isModal={true}
          onSaved={handleHabitSaved}
        />
      )}
    </div>
  );
};

export default HabitsList;
