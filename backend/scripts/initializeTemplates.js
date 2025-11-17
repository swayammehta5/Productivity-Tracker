const mongoose = require('mongoose');
require('dotenv').config();
const HabitTemplate = require('../models/HabitTemplate');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

const initializeTemplates = async () => {
  try {
    await connectDB();

    // Clear existing default templates
    await HabitTemplate.deleteMany({ isDefault: true });

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
      },
      {
        name: 'Learning & Growth',
        description: 'Habits to foster continuous learning',
        category: 'Learning',
        habits: [
          { name: 'Read', description: 'Read for 30 minutes', frequency: 'daily', goal: 1, color: '#3B82F6' },
          { name: 'Practice skills', description: 'Practice a skill for 1 hour', frequency: 'daily', goal: 1, color: '#8B5CF6' },
          { name: 'Learn something new', description: 'Learn something new each day', frequency: 'daily', goal: 1, color: '#10B981' }
        ],
        isDefault: true
      },
      {
        name: 'Wellness & Mindfulness',
        description: 'Habits for mental and emotional wellness',
        category: 'Mindfulness',
        habits: [
          { name: 'Meditation', description: '10 minutes of meditation', frequency: 'daily', goal: 1, color: '#8B5CF6' },
          { name: 'Gratitude journal', description: 'Write in gratitude journal', frequency: 'daily', goal: 1, color: '#10B981' },
          { name: 'Nature time', description: 'Spend time in nature', frequency: 'daily', goal: 1, color: '#3B82F6' }
        ],
        isDefault: true
      }
    ];

    const templates = await HabitTemplate.insertMany(defaultTemplates);
    console.log(`Initialized ${templates.length} default templates`);
    process.exit(0);
  } catch (error) {
    console.error('Error initializing templates:', error);
    process.exit(1);
  }
};

initializeTemplates();

