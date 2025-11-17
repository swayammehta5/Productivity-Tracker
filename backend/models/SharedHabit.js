const mongoose = require('mongoose');

const sharedHabitSchema = new mongoose.Schema({
  habit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['viewer', 'collaborator', 'owner'],
      default: 'collaborator'
    },
    invitedAt: {
      type: Date,
      default: Date.now
    },
    acceptedAt: {
      type: Date
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SharedHabit', sharedHabitSchema);

