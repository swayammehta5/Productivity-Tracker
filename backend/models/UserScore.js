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
  // Improved leveling formula: level = Math.floor(Math.sqrt(totalXP / 10)) + 1
  const newLevel = Math.floor(Math.sqrt(this.totalXP / 10)) + 1;
  // Fallback: if no XP, ensure level is at least 1
  this.currentLevel = Math.max(newLevel, 1);
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

