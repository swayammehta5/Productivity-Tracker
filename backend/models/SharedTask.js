const mongoose = require('mongoose');

const sharedTaskSchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
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

module.exports = mongoose.model('SharedTask', sharedTaskSchema);

