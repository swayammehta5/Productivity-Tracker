const express = require('express');
const auth = require('../middleware/auth');
const HabitTemplate = require('../models/HabitTemplate');
const Habit = require('../models/Habit');

const router = express.Router();

// Get all templates
router.get('/', async (req, res) => {
  try {
    const templates = await HabitTemplate.find();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Apply template to user
router.post('/:templateId/apply', auth, async (req, res) => {
  try {
    const { templateId } = req.params;
    const template = await HabitTemplate.findById(templateId);
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    const createdHabits = [];
    for (const habitData of template.habits) {
      const habit = new Habit({
        ...habitData,
        user: req.user._id
      });
      await habit.save();
      createdHabits.push(habit);
    }

    res.json({
      message: 'Template applied successfully',
      habits: createdHabits
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Initialize default templates
router.post('/initialize', async (req, res) => {
  try {
    const defaultTemplates = [
      {
        name: 'Morning Routine',
        description: 'Start your day right with these morning habits',
        category: 'Health',
        habits: [
          { name: 'Wake up early', description: 'Wake up at a consistent time', frequency: 'daily', goal: 1, color: '#3B82F6' },
          { name: 'Drink water', description: 'Drink a glass of water first thing', frequency: 'daily', goal: 1, color: '#10B981' },
          { name: 'Exercise', description: 'Morning workout or stretch', frequency: 'daily', goal: 1, color: '#F59E0B' },
          { name: 'Meditate', description: '10 minutes of meditation', frequency: 'daily', goal: 1, color: '#8B5CF6' }
        ],
        isDefault: true
      },
      {
        name: 'Fitness Plan',
        description: 'Build a consistent fitness routine',
        category: 'Fitness',
        habits: [
          { name: 'Cardio workout', description: '30 minutes of cardio', frequency: 'daily', goal: 1, color: '#EF4444' },
          { name: 'Strength training', description: 'Strength training session', frequency: 'weekly', goal: 3, color: '#F59E0B' },
          { name: 'Stretch', description: 'Daily stretching routine', frequency: 'daily', goal: 1, color: '#10B981' }
        ],
        isDefault: true
      },
      {
        name: 'Productivity Boost',
        description: 'Habits to improve productivity',
        category: 'Productivity',
        habits: [
          { name: 'Plan your day', description: 'Plan tasks for the day', frequency: 'daily', goal: 1, color: '#3B82F6' },
          { name: 'Deep work session', description: 'Focus on important tasks', frequency: 'daily', goal: 2, color: '#8B5CF6' },
          { name: 'Review progress', description: 'Review what you accomplished', frequency: 'daily', goal: 1, color: '#10B981' }
        ],
        isDefault: true
      }
    ];

    // Clear existing default templates and insert new ones
    await HabitTemplate.deleteMany({ isDefault: true });
    const templates = await HabitTemplate.insertMany(defaultTemplates);

    res.json({ message: 'Default templates initialized', templates });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

