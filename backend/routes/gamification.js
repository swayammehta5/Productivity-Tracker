const express = require('express');
const auth = require('../middleware/auth');
const UserScore = require('../models/UserScore');
const Habit = require('../models/Habit');
const Task = require('../models/Task');

const router = express.Router();

// Get user gamification stats
router.get('/stats', auth, async (req, res) => {
  try {
    let userScore = await UserScore.findOne({ user: req.user._id });
    if (!userScore) {
      userScore = new UserScore({ user: req.user._id });
      await userScore.save();
    }

    const [habits, tasks] = await Promise.all([
      Habit.find({ user: req.user._id }),
      Task.find({ userId: req.user._id })
    ]);

    const totalStreak = habits.length > 0 ? habits.reduce((sum, h) => sum + h.currentStreak, 0) : 0;
    const longestStreak = habits.length > 0 ? Math.max(...habits.map(h => h.longestStreak || 0), 0) : 0;

    // Define badges
    const availableBadges = [
      { id: 'first_habit', name: 'First Habit', description: 'Created your first habit', icon: '🎯' },
      { id: 'streak_7', name: 'Week Warrior', description: '7-day streak', icon: '🔥' },
      { id: 'streak_30', name: 'Month Master', description: '30-day streak', icon: '🌟' },
      { id: 'level_5', name: 'Level 5', description: 'Reached level 5', icon: '⭐' },
      { id: 'level_10', name: 'Level 10', description: 'Reached level 10', icon: '💎' },
      { id: 'task_master', name: 'Task Master', description: 'Completed 100 tasks', icon: '✅' },
      { id: 'habit_hero', name: 'Habit Hero', description: 'Completed 1000 habits', icon: '🏆' }
    ];

    // Check for new badges
    const newBadges = [];
    if (habits.length > 0 && !userScore.badges.includes('first_habit')) {
      newBadges.push('first_habit');
    }
    if (longestStreak >= 7 && !userScore.badges.includes('streak_7')) {
      newBadges.push('streak_7');
    }
    if (longestStreak >= 30 && !userScore.badges.includes('streak_30')) {
      newBadges.push('streak_30');
    }
    if (userScore.currentLevel >= 5 && !userScore.badges.includes('level_5')) {
      newBadges.push('level_5');
    }
    if (userScore.currentLevel >= 10 && !userScore.badges.includes('level_10')) {
      newBadges.push('level_10');
    }
    if (userScore.totalTasksCompleted >= 100 && !userScore.badges.includes('task_master')) {
      newBadges.push('task_master');
    }
    if (userScore.totalHabitsCompleted >= 1000 && !userScore.badges.includes('habit_hero')) {
      newBadges.push('habit_hero');
    }

    // Add new badges
    for (const badgeId of newBadges) {
      await userScore.addBadge(badgeId);
    }

    // Refresh user score
    userScore = await UserScore.findOne({ user: req.user._id });

    res.json({
      xp: userScore.totalXP,
      level: userScore.currentLevel,
      xpForNextLevel: (userScore.currentLevel * 100) - userScore.totalXP,
      badges: userScore.badges.map(badgeId => 
        availableBadges.find(b => b.id === badgeId)
      ).filter(Boolean),
      availableBadges,
      stats: {
        totalHabitsCompleted: userScore.totalHabitsCompleted,
        totalTasksCompleted: userScore.totalTasksCompleted,
        longestStreak: userScore.longestStreak,
        currentStreak: totalStreak
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Award XP (called when completing habits/tasks)
router.post('/award-xp', auth, async (req, res) => {
  try {
    const { xp, type, itemId } = req.body; // type: 'habit' or 'task'

    let userScore = await UserScore.findOne({ user: req.user._id });
    if (!userScore) {
      userScore = new UserScore({ user: req.user._id });
    }

    await userScore.addXP(xp);

    if (type === 'habit') {
      userScore.totalHabitsCompleted += 1;
    } else if (type === 'task') {
      userScore.totalTasksCompleted += 1;
    }

    await userScore.save();

    res.json({
      xp: userScore.totalXP,
      level: userScore.currentLevel,
      xpForNextLevel: (userScore.currentLevel * 100) - userScore.totalXP
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

