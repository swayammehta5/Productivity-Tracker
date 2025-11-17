const mongoose = require('mongoose');

const userScoreSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  totalXP: {
    type: Number,
    default: 0
  },
  currentLevel: {
    type: Number,
    default: 1
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  totalHabitsCompleted: {
    type: Number,
    default: 0
  },
  totalTasksCompleted: {
    type: Number,
    default: 0
  },
  badges: [{
    type: String
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

userScoreSchema.methods.addXP = async function(points) {
  this.totalXP = (this.totalXP || 0) + points;
  const newLevel = Math.floor(this.totalXP / 100) + 1;
  if (newLevel > this.currentLevel) {
    this.currentLevel = newLevel;
  }
  this.lastUpdated = new Date();
  await this.save();
  return this;
};

userScoreSchema.methods.addBadge = async function(badgeName) {
  if (!this.badges) {
    this.badges = [];
  }
  if (!this.badges.includes(badgeName)) {
    this.badges.push(badgeName);
    await this.save();
  }
  return this;
};

module.exports = mongoose.model('UserScore', userScoreSchema);

