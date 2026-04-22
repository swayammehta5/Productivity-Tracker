const express = require('express');
const auth = require('../middleware/auth');
const Habit = require('../models/Habit');
const Task = require('../models/Task');
const {
  getHabitAdvice,
  getTaskPrioritization,
  getWeeklyInsights
} = require('../services/aiService');

const router = express.Router();

const MAX_ASSISTANT_QUESTION_LENGTH = 280;
const HABIT_QUERY_FIELDS = '_id name frequency goal currentStreak longestStreak completions';
const TASK_QUERY_FIELDS = '_id title dueDate priority status category createdAt';

router.use(auth);

const buildDateKey = (value) => {
  const date = new Date(value);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
};

const sanitizeText = (value, maxLength = 280) =>
  String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);

const getWeeklyStats = (habits, tasks) => {
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setUTCDate(today.getUTCDate() - 6);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayMap = dayNames.reduce((acc, day) => ({ ...acc, [day]: { completed: 0, missed: 0 } }), {});

  let missedHabits = 0;
  habits.forEach((habit) => {
    const completionSet = new Set(
      (habit.completions || [])
        .filter((c) => c.completed)
        .map((c) => buildDateKey(c.date))
        .filter(Boolean)
    );

    for (let i = 0; i < 7; i += 1) {
      const date = new Date(sevenDaysAgo);
      date.setUTCDate(sevenDaysAgo.getUTCDate() + i);
      const key = buildDateKey(date);
      const day = dayNames[date.getUTCDay()];
      if (completionSet.has(key)) {
        dayMap[day].completed += 1;
      } else {
        dayMap[day].missed += 1;
        missedHabits += 1;
      }
    }
  });

  const bestDay = Object.entries(dayMap).sort((a, b) => b[1].completed - a[1].completed)[0]?.[0] || 'N/A';
  const worstDay = Object.entries(dayMap).sort((a, b) => b[1].missed - a[1].missed)[0]?.[0] || 'N/A';

  const tasksInWeek = tasks.filter((task) => new Date(task.createdAt) >= sevenDaysAgo);
  const totalTasksCompleted = tasksInWeek.filter((task) => task.status === 'Completed').length;
  const completionRate = tasksInWeek.length ? Number(((totalTasksCompleted / tasksInWeek.length) * 100).toFixed(1)) : 0;

  return { totalTasksCompleted, missedHabits, bestDay, worstDay, completionRate };
};

router.get('/habit-coach', async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user._id }).select(HABIT_QUERY_FIELDS).lean();
    const response = await getHabitAdvice({ habits });
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/task-prioritize', async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id }).select(TASK_QUERY_FIELDS).lean();
    const response = await getTaskPrioritization(tasks);
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/weekly-insights', async (req, res) => {
  try {
    const [habits, tasks] = await Promise.all([
      Habit.find({ user: req.user._id }).select(HABIT_QUERY_FIELDS).lean(),
      Task.find({ userId: req.user._id }).select(TASK_QUERY_FIELDS).lean()
    ]);
    const weeklyStats = getWeeklyStats(habits, tasks);
    const response = await getWeeklyInsights(weeklyStats);
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/assistant', async (req, res) => {
  try {
    const question = sanitizeText(req.body?.question, MAX_ASSISTANT_QUESTION_LENGTH);
    if (!question) {
      return res.status(400).json({ message: 'Please enter a question for the assistant.' });
    }

    const [habits, tasks] = await Promise.all([
      Habit.find({ user: req.user._id }).select(HABIT_QUERY_FIELDS).lean(),
      Task.find({ userId: req.user._id }).select(TASK_QUERY_FIELDS).lean()
    ]);
    const [habitAdvice, taskAdvice, weeklyAdvice] = await Promise.all([
      getHabitAdvice({ habits }),
      getTaskPrioritization(tasks),
      getWeeklyInsights(getWeeklyStats(habits, tasks))
    ]);

    return res.json({
      source: 'rule-based',
      insight: `Question: ${question}`,
      suggestions: [
        habitAdvice.suggestions?.[0],
        taskAdvice.suggestions?.[0],
        weeklyAdvice.suggestions?.[0]
      ].filter(Boolean),
      priorityOrder: taskAdvice.priorityOrder || [],
      stats: {
        habits: habitAdvice.stats?.habits || [],
        weekly: weeklyAdvice.stats || {}
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
