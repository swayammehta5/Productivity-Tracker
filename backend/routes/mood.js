const express = require('express');
const auth = require('../middleware/auth');
const Mood = require('../models/Mood');
const Habit = require('../models/Habit');
const Task = require('../models/Task');

const router = express.Router();

// Record mood
router.post('/', auth, async (req, res) => {
  try {
    const { mood, energyLevel, notes } = req.body;

    if (!mood || !energyLevel) {
      return res.status(400).json({ message: 'Mood and energy level are required' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's completions
    const [habits, tasks] = await Promise.all([
      Habit.find({ user: req.user._id }),
      Task.find({ userId: req.user._id })
    ]);

    const habitsCompleted = habits.reduce((count, habit) => {
      const hasCompletion = habit.completions.some(c => {
        const cDate = new Date(c.date);
        cDate.setHours(0, 0, 0, 0);
        return cDate.getTime() === today.getTime() && c.completed;
      });
      return count + (hasCompletion ? 1 : 0);
    }, 0);

    const tasksCompleted = tasks.filter(t => {
      if (t.status !== 'Completed') return false;
      const completed = new Date(t.completedAt);
      completed.setHours(0, 0, 0, 0);
      return completed.getTime() === today.getTime();
    }).length;

    // Update or create mood entry
    const moodEntry = await Mood.findOneAndUpdate(
      { user: req.user._id, date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) } },
      {
        user: req.user._id,
        date: today,
        mood,
        energyLevel,
        notes: notes || '',
        habitsCompleted,
        tasksCompleted
      },
      { upsert: true, new: true }
    );

    res.json(moodEntry);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get mood history
router.get('/', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { user: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const moods = await Mood.find(query).sort({ date: -1 }).limit(30);
    res.json(moods);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get mood insights
router.get('/insights', auth, async (req, res) => {
  try {
    const moods = await Mood.find({ user: req.user._id }).sort({ date: -1 }).limit(30);

    if (moods.length === 0) {
      return res.json({ 
        averageEnergy: 0,
        moodDistribution: {},
        productivityCorrelation: [],
        totalEntries: 0,
        message: 'No mood data available yet' 
      });
    }

    const avgEnergy = moods.reduce((sum, m) => sum + (m.energyLevel || 0), 0) / moods.length;
    const moodDistribution = moods.reduce((acc, m) => {
      const mood = m.mood || 'Unknown';
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {});

    // Calculate correlation between productivity and mood
    const productivityCorrelation = moods.map(m => ({
      mood: m.mood || 'Unknown',
      energy: m.energyLevel || 0,
      productivity: (m.habitsCompleted || 0) + (m.tasksCompleted || 0)
    }));

    res.json({
      averageEnergy: Math.round(avgEnergy * 10) / 10,
      moodDistribution,
      productivityCorrelation,
      totalEntries: moods.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

