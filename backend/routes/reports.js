const express = require('express');
const auth = require('../middleware/auth');
const Habit = require('../models/Habit');
const Task = require('../models/Task');
const Mood = require('../models/Mood');

const router = express.Router();

// Get weekly report
router.get('/weekly', auth, async (req, res) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);

    const [habits, tasks, moods] = await Promise.all([
      Habit.find({ user: req.user._id }),
      Task.find({ userId: req.user._id }),
      Mood.find({ user: req.user._id, date: { $gte: startDate, $lte: endDate } })
    ]);

    // Calculate habit completion rate
    const habitCompletions = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      date.setHours(0, 0, 0, 0);
      
      const completed = habits.reduce((count, habit) => {
        const hasCompletion = habit.completions.some(c => {
          const cDate = new Date(c.date);
          cDate.setHours(0, 0, 0, 0);
          return cDate.getTime() === date.getTime() && c.completed;
        });
        return count + (hasCompletion ? 1 : 0);
      }, 0);
      
      habitCompletions.push({
        date: date.toISOString(),
        completed,
        total: habits.length
      });
    }

    // Calculate task completion rate
    const tasksInPeriod = tasks.filter(t => {
      const created = new Date(t.createdAt);
      return created >= startDate;
    });
    const completedTasks = tasksInPeriod.filter(t => t.status === 'Completed').length;

    // Calculate average streak
    const avgStreak = habits.length > 0
      ? habits.reduce((sum, h) => sum + (h.currentStreak || 0), 0) / habits.length
      : 0;

    // Calculate consistency score (percentage of days with at least one habit completed)
    const daysWithCompletion = habitCompletions.filter(h => h.completed > 0).length;
    const consistencyScore = habitCompletions.length > 0 ? (daysWithCompletion / habitCompletions.length) * 100 : 0;

    res.json({
      period: 'weekly',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      habits: {
        total: habits.length,
        averageStreak: Math.round(avgStreak * 10) / 10,
        completionRate: habitCompletions.reduce((sum, h) => sum + (h.total > 0 ? (h.completed / h.total) * 100 : 0), 0) / 7,
        dailyCompletions: habitCompletions
      },
      tasks: {
        total: tasksInPeriod.length,
        completed: completedTasks,
        completionRate: tasksInPeriod.length > 0 ? (completedTasks / tasksInPeriod.length) * 100 : 0
      },
      moods: moods.length > 0 ? {
        averageEnergy: moods.reduce((sum, m) => sum + m.energyLevel, 0) / moods.length,
        moodDistribution: moods.reduce((acc, m) => {
          acc[m.mood] = (acc[m.mood] || 0) + 1;
          return acc;
        }, {})
      } : null,
      consistencyScore: Math.round(consistencyScore * 10) / 10
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get monthly report
router.get('/monthly', auth, async (req, res) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - 1);

    const [habits, tasks, moods] = await Promise.all([
      Habit.find({ user: req.user._id }),
      Task.find({ userId: req.user._id }),
      Mood.find({ user: req.user._id, date: { $gte: startDate, $lte: endDate } })
    ]);

    // Calculate weekly breakdown
    const weeks = [];
    for (let week = 0; week < 4; week++) {
      const weekStart = new Date(startDate);
      weekStart.setDate(startDate.getDate() + (week * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const weekTasks = tasks.filter(t => {
        const created = new Date(t.createdAt);
        return created >= weekStart && created <= weekEnd;
      });
      const weekCompleted = weekTasks.filter(t => t.status === 'Completed').length;

      weeks.push({
        week: week + 1,
        startDate: weekStart.toISOString(),
        endDate: weekEnd.toISOString(),
        tasksCompleted: weekCompleted,
        tasksTotal: weekTasks.length
      });
    }

    // Calculate habit statistics
    const totalCompletions = habits.reduce((sum, habit) => {
      if (!habit.completions || !Array.isArray(habit.completions)) return sum;
      return sum + habit.completions.filter(c => {
        const cDate = new Date(c.date);
        return cDate >= startDate && cDate <= endDate && c.completed;
      }).length;
    }, 0);

    const avgStreak = habits.length > 0
      ? habits.reduce((sum, h) => sum + (h.currentStreak || 0), 0) / habits.length
      : 0;

    const longestStreak = habits.length > 0 ? Math.max(...habits.map(h => h.longestStreak || 0), 0) : 0;

    // Task statistics
    const tasksInPeriod = tasks.filter(t => {
      const created = new Date(t.createdAt);
      return created >= startDate;
    });
    const completedTasks = tasksInPeriod.filter(t => t.status === 'Completed').length;

    // Mood statistics
    const moodStats = moods.length > 0 ? {
      averageEnergy: moods.reduce((sum, m) => sum + m.energyLevel, 0) / moods.length,
      moodDistribution: moods.reduce((acc, m) => {
        acc[m.mood] = (acc[m.mood] || 0) + 1;
        return acc;
      }, {})
    } : null;

    res.json({
      period: 'monthly',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      habits: {
        total: habits.length,
        totalCompletions,
        averageStreak: Math.round(avgStreak * 10) / 10,
        longestStreak,
        completionRate: habits.length > 0 ? (totalCompletions / (habits.length * 30)) * 100 : 0
      },
      tasks: {
        total: tasksInPeriod.length,
        completed: completedTasks,
        completionRate: tasksInPeriod.length > 0 ? (completedTasks / tasksInPeriod.length) * 100 : 0,
        weeklyBreakdown: weeks
      },
      moods: moodStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

