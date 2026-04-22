const express = require('express');
const Habit = require('../models/Habit');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

const router = express.Router();

const toISODate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    .toISOString()
    .split('T')[0];
};

const parseDateRange = (dateString) => {
  if (!dateString) {
    return null;
  }

  const start = new Date(`${dateString}T00:00:00.000Z`);
  if (Number.isNaN(start.getTime())) {
    return null;
  }

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return { start, end };
};

const calculateStreakUntilDate = (habit, dateString) => {
  const completedDates = new Set(
    habit.completions
      .filter((completion) => completion.completed)
      .map((completion) => toISODate(completion.date))
      .filter(Boolean)
  );

  let streak = 0;
  const cursor = new Date(`${dateString}T00:00:00.000Z`);

  while (completedDates.has(toISODate(cursor))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return streak;
};

router.get('/day-details', auth, async (req, res) => {
  try {
    const { date, type, habitId } = req.query;
    const dateRange = parseDateRange(date);

    if (!dateRange) {
      return res.status(400).json({ message: 'Invalid or missing date. Use YYYY-MM-DD.' });
    }

    if (type && !['habit', 'task'].includes(type)) {
      return res.status(400).json({ message: 'Invalid type. Use habit or task.' });
    }

    const [habit, tasks] = await Promise.all([
      habitId
        ? Habit.findOne({ _id: habitId, user: req.user._id })
        : Habit.findOne({ user: req.user._id }).sort({ createdAt: 1 }),
      Task.find({
        userId: req.user._id,
        dueDate: {
          $gte: dateRange.start,
          $lt: dateRange.end
        }
      }).sort({ priority: -1, createdAt: -1 })
    ]);

    const dayISO = toISODate(dateRange.start);
    const todayISO = toISODate(new Date());

    let habitDetails = null;
    if (habit) {
      const completion = habit.completions.find(
        (item) => item.completed && toISODate(item.date) === dayISO
      );

      const completed = Boolean(completion);
      let status = 'No Data';
      if (completed) {
        status = 'Completed';
      } else if (dayISO <= todayISO) {
        status = 'Missed';
      }

      habitDetails = {
        id: habit._id,
        name: habit.name,
        completed,
        status,
        streak: calculateStreakUntilDate(habit, dayISO),
        time: completion?.completedAt
          ? new Date(completion.completedAt).toISOString().slice(11, 16)
          : null,
        notes: completion?.notes || null,
        progress: completion?.progress ?? (completed ? 100 : 0)
      };
    }

    const mappedTasks = tasks.map((task) => ({
      id: task._id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      deadline: task.dueDate ? toISODate(task.dueDate) : null,
      description: task.description || ''
    }));

    const completedTasks = mappedTasks.filter((task) => task.status === 'Completed').length;
    const pendingTasks = mappedTasks.filter((task) => task.status === 'Pending').length;
    const completionRate = mappedTasks.length
      ? Math.round((completedTasks / mappedTasks.length) * 100)
      : 0;

    res.json({
      date: dayISO,
      type: type || 'all',
      habit: habitDetails,
      tasks: mappedTasks,
      summary: {
        completedTasks,
        pendingTasks,
        totalTasks: mappedTasks.length,
        habitStatus: habitDetails?.status || 'No Habit',
        completionRate
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
