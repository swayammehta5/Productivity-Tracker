const express = require('express');
const auth = require('../middleware/auth');
const Habit = require('../models/Habit');
const Task = require('../models/Task');
const User = require('../models/User');

const router = express.Router();

// Calculate distance between two coordinates (Haversine formula)
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c * 1000; // Distance in meters
}

// Get nearby habits/tasks
router.get('/nearby', auth, async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const userLat = parseFloat(latitude);
    const userLon = parseFloat(longitude);

    const [habits, tasks] = await Promise.all([
      Habit.find({ user: req.user._id, 'location.latitude': { $exists: true } }),
      Task.find({ userId: req.user._id, 'location.latitude': { $exists: true } })
    ]);

    const nearbyHabits = habits
      .map(habit => {
        const distance = getDistance(
          userLat,
          userLon,
          habit.location.latitude,
          habit.location.longitude
        );
        return { ...habit.toObject(), distance };
      })
      .filter(h => h.distance <= (h.location.radius || 100))
      .sort((a, b) => a.distance - b.distance);

    const nearbyTasks = tasks
      .map(task => {
        const distance = getDistance(
          userLat,
          userLon,
          task.location.latitude,
          task.location.longitude
        );
        return { ...task.toObject(), distance };
      })
      .filter(t => t.distance <= (t.location.radius || 100))
      .sort((a, b) => a.distance - b.distance);

    res.json({
      habits: nearbyHabits,
      tasks: nearbyTasks
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user home location
router.post('/home-location', auth, async (req, res) => {
  try {
    const { latitude, longitude, address } = req.body;

    const user = await User.findById(req.user._id);
    user.locationPreferences = {
      enabled: true,
      homeLocation: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address: address || ''
      }
    };
    await user.save();

    res.json({ message: 'Home location updated', location: user.locationPreferences.homeLocation });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

