import React, { useState, useEffect, useCallback } from 'react';
import { locationAPI } from '../../services/api';

const LocationHabits = () => {
  const [nearbyHabits, setNearbyHabits] = useState([]);
  const [nearbyTasks, setNearbyTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);

  const loadNearbyItems = useCallback(async (lat, lng) => {
    try {
      setLoading(true);
      const res = await locationAPI.getNearby({ latitude: lat, longitude: lng });
      setNearbyHabits(res.data.habits || []);
      setNearbyTasks(res.data.tasks || []);
    } catch (error) {
      console.error('Error loading nearby items:', error);
      setNearbyHabits([]);
      setNearbyTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setLocation(coords);
          loadNearbyItems(coords.latitude, coords.longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please enable location services.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  }, [loadNearbyItems]);

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        📍 Location-Based Habits & Tasks
      </h1>

      <div className="mb-6">
        <button
          onClick={getCurrentLocation}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh Location'}
        </button>
      </div>

      {location && (
        <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          Current Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
        </div>
      )}

      {/* Nearby Habits */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Nearby Habits
        </h2>
        {nearbyHabits.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No habits found near your location.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nearbyHabits.map((habit) => (
              <div
                key={habit._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {habit.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Distance: {Math.round(habit.distance)}m away
                </p>
                {habit.location.address && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    📍 {habit.location.address}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Nearby Tasks */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Nearby Tasks
        </h2>
        {nearbyTasks.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No tasks found near your location.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nearbyTasks.map((task) => (
              <div
                key={task._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {task.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Distance: {Math.round(task.distance)}m away
                </p>
                {task.location.address && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    📍 {task.location.address}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationHabits;

