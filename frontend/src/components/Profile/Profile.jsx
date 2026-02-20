import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI, statsAPI } from '../../services/api';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    emailReminders: user?.emailReminders !== false,
    profilePicture: user?.profilePicture || ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        emailReminders: user.emailReminders !== false,
        profilePicture: user.profilePicture || ''
      });
    }
    loadStats();
  }, [user]);

  const loadStats = async () => {
    try {
      const response = await statsAPI.getCombined();
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

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // For now, we'll just store the file name or use a placeholder
      // In a real app, you'd upload to a service like Cloudinary or AWS S3
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profilePicture: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Profile Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account information and preferences
        </p>
      </div>

      {/* Profile Picture Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Profile Picture
        </h2>
        <div className="flex items-center space-x-6">
          <div className="relative">
            {formData.profilePicture ? (
              <img
                src={formData.profilePicture}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-gray-200 dark:border-gray-700">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div>
            <label className="block">
              <span className="sr-only">Choose profile picture</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="block w-full text-sm text-gray-500 dark:text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  dark:file:bg-blue-900/30 dark:file:text-blue-300"
              />
            </label>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              JPG, PNG or GIF. Max size 2MB.
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Your Statistics
        </h2>
        {loadingStats ? (
          <p className="text-gray-500 dark:text-gray-400">Loading stats...</p>
        ) : stats ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.habits.total}
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">Total Habits</p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {stats.tasks.total}
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">Total Tasks</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.tasks.completed}
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">Completed Tasks</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.tasks.pending}
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">Pending Tasks</p>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {stats.habits.averageStreak}
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">Avg Streak</p>
            </div>
            <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {stats.habits.longestStreak}
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">Best Streak</p>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {stats.tasks.highPriority}
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">High Priority</p>
            </div>
            <div className="text-center p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
              <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">
                {stats.overall.totalActivities}
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">Total Activities</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            No stats available yet.
          </p>
        )}
      </div>

      {/* Account Information Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Account Information
        </h2>
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
            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            placeholder="Enter your name"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white opacity-50 cursor-not-allowed"
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Email cannot be changed
          </p>
        </div>

        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            checked={formData.emailReminders}
            onChange={(e) =>
              setFormData({ ...formData, emailReminders: e.target.checked })
            }
            className="mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
          <label className="text-gray-700 dark:text-gray-300">
            Receive email reminders
          </label>
        </div>

        {success && (
          <p className="text-green-600 dark:text-green-400 mb-3">{success}</p>
        )}
        {error && <p className="text-red-600 dark:text-red-400 mb-3">{error}</p>}

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
