const express = require('express');
const auth = require('../middleware/auth');
const Habit = require('../models/Habit');
const Task = require('../models/Task');
const { getHabitSuggestions, getProductivityCoachResponse } = require('../utils/openaiService');

const router = express.Router();

// Get AI-based habit and task suggestions
router.get('/suggestions', auth, async (req, res) => {
  try {
    const [habits, tasks] = await Promise.all([
      Habit.find({ user: req.user._id }),
      Task.find({ userId: req.user._id })
    ]);

    const suggestions = await getHabitSuggestions(habits, tasks);
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Chat with AI productivity coach
router.post('/chat', auth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const [habits, tasks] = await Promise.all([
      Habit.find({ user: req.user._id }),
      Task.find({ userId: req.user._id })
    ]);

    const userProgress = {
      habitsCount: habits.length,
      tasksCompleted: tasks.filter(t => t.status === 'Completed').length,
      currentStreak: habits.length > 0 ? Math.max(...habits.map(h => h.currentStreak || 0), 0) : 0
    };

    const response = await getProductivityCoachResponse(message, userProgress);
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

