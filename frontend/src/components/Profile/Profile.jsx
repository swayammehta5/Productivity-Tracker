import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI, habitsAPI } from '../../services/api';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    emailReminders: user?.emailReminders !== false
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await habitsAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authAPI.updateProfile(formData);
      updateUser(response.data.user);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Profile Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account information and preferences
        </p>
      </div>

      {/* Account Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Your Statistics
        </h2>
        {loadingStats ? (
          <p className="text-gray-500 dark:text-gray-400">Loading stats...</p>
        ) : stats ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {stats.totalHabits}
              </p>
              <p className="text-gray-600 dark:text-gray-300">Total Habits</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.completedHabits}
              </p>
              <p className="text-gray-600 dark:text-gray-300">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.streak}
              </p>
              <p className="text-gray-600 dark:text-gray-300">Current Streak</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {stats.bestStreak}
              </p>
              <p className="text-gray-600 dark:text-gray-300">Best Streak</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            No stats available yet.
          </p>
        )}
      </div>

      {/* Profile Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Account Information
        </h2>

        {/* Name Input */}
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Enter your name"
          />
        </div>

        {/* Email Reminders Toggle */}
        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            checked={formData.emailReminders}
            onChange={(e) =>
              setFormData({ ...formData, emailReminders: e.target.checked })
            }
            className="mr-2"
          />
          <label className="text-gray-700 dark:text-gray-300">
            Receive email reminders
          </label>
        </div>

        {/* Success / Error Messages */}
        {success && (
          <p className="text-green-600 dark:text-green-400 mb-3">{success}</p>
        )}
        {error && <p className="text-red-600 dark:text-red-400 mb-3">{error}</p>}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition duration-200 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default Profile;
