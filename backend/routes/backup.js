const express = require('express');
const auth = require('../middleware/auth');
const Habit = require('../models/Habit');
const Task = require('../models/Task');
const Mood = require('../models/Mood');
const User = require('../models/User');

const router = express.Router();

// Export user data
router.get('/export', auth, async (req, res) => {
  try {
    const [habits, tasks, moods, user] = await Promise.all([
      Habit.find({ user: req.user._id }),
      Task.find({ userId: req.user._id }),
      Mood.find({ user: req.user._id }),
      User.findById(req.user._id).select('-password -twoFactorSecret')
    ]);

    const backupData = {
      exportDate: new Date().toISOString(),
      user: {
        name: user.name,
        email: user.email,
        theme: user.theme,
        preferences: user.notificationPreferences
      },
      habits: habits.map(h => ({
        name: h.name,
        description: h.description,
        frequency: h.frequency,
        goal: h.goal,
        color: h.color,
        completions: h.completions,
        currentStreak: h.currentStreak,
        longestStreak: h.longestStreak,
        createdAt: h.createdAt
      })),
      tasks: tasks.map(t => ({
        title: t.title,
        description: t.description,
        dueDate: t.dueDate,
        priority: t.priority,
        status: t.status,
        category: t.category,
        createdAt: t.createdAt,
        completedAt: t.completedAt
      })),
      moods: moods.map(m => ({
        date: m.date,
        mood: m.mood,
        energyLevel: m.energyLevel,
        notes: m.notes,
        habitsCompleted: m.habitsCompleted,
        tasksCompleted: m.tasksCompleted
      }))
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=backup-${Date.now()}.json`);
    res.json(backupData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Import user data
router.post('/import', auth, async (req, res) => {
  try {
    const { backupData } = req.body;

    if (!backupData || !backupData.habits || !backupData.tasks) {
      return res.status(400).json({ message: 'Invalid backup data' });
    }

    // Import habits
    const importedHabits = [];
    for (const habitData of backupData.habits) {
      const habit = new Habit({
        ...habitData,
        user: req.user._id
      });
      await habit.save();
      importedHabits.push(habit);
    }

    // Import tasks
    const importedTasks = [];
    for (const taskData of backupData.tasks) {
      const task = new Task({
        ...taskData,
        userId: req.user._id
      });
      await task.save();
      importedTasks.push(task);
    }

    // Import moods
    const importedMoods = [];
    if (backupData.moods) {
      for (const moodData of backupData.moods) {
        const mood = new Mood({
          ...moodData,
          user: req.user._id
        });
        await mood.save();
        importedMoods.push(mood);
      }
    }

    res.json({
      message: 'Data imported successfully',
      imported: {
        habits: importedHabits.length,
        tasks: importedTasks.length,
        moods: importedMoods.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

