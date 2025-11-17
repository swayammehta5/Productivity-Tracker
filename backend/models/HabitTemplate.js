const mongoose = require('mongoose');

const habitTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['Health', 'Fitness', 'Productivity', 'Mindfulness', 'Learning', 'Social', 'Finance', 'Other'],
    default: 'Other'
  },
  habits: [{
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly'],
      default: 'daily'
    },
    goal: {
      type: Number,
      default: 1
    },
    color: {
      type: String,
      default: '#3B82F6'
    }
  }],
  isDefault: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('HabitTemplate', habitTemplateSchema);

