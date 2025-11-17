const express = require('express');
const Habit = require('../models/Habit');
const auth = require('../middleware/auth');
const UserScore = require('../models/UserScore');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user._id }).sort({ createdAt: -1 });
    habits.forEach(habit => habit.calculateStreak());
    await Promise.all(habits.map(habit => habit.save()));
    res.json(habits);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, description, frequency, goal, color } = req.body;

    const habit = new Habit({
      user: req.user._id,
      name,
      description,
      frequency,
      goal,
      color
    });

    await habit.save();
    res.status(201).json(habit);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    res.json({ message: 'Habit deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/:id/complete', auth, async (req, res) => {
  try {
    const { date } = req.body;
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const completionDate = new Date(date);
    completionDate.setHours(0, 0, 0, 0);

    const existingCompletion = habit.completions.find(c => {
      const d = new Date(c.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === completionDate.getTime();
    });

    if (existingCompletion) {
      existingCompletion.completed = true;
    } else {
      habit.completions.push({ date: completionDate, completed: true });
    }

    habit.calculateStreak();
    await habit.save();

    // Award XP for completing habit
    try {
      let userScore = await UserScore.findOne({ user: req.user._id });
      if (!userScore) {
        userScore = new UserScore({ user: req.user._id });
      }
      await userScore.addXP(10); // 10 XP per habit completion
      userScore.totalHabitsCompleted += 1;
      
      // Update longest streak
      if (habit.longestStreak > userScore.longestStreak) {
        userScore.longestStreak = habit.longestStreak;
      }
      await userScore.save();
    } catch (error) {
      console.error('Error awarding XP:', error);
    }

    res.json(habit);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/:id/uncomplete', auth, async (req, res) => {
  try {
    const { date } = req.body;
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const completionDate = new Date(date);
    completionDate.setHours(0, 0, 0, 0);

    habit.completions = habit.completions.filter(c => {
      const d = new Date(c.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() !== completionDate.getTime();
    });

    habit.calculateStreak();
    await habit.save();

    res.json(habit);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/stats', auth, async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user._id });
    
    const totalHabits = habits.length;
    const totalCompletions = habits.reduce((sum, h) => sum + h.completions.filter(c => c.completed).length, 0);
    const totalStreak = habits.reduce((sum, h) => sum + h.currentStreak, 0);
    const longestStreak = Math.max(...habits.map(h => h.longestStreak), 0);

    res.json({
      totalHabits,
      totalCompletions,
      averageStreak: totalHabits > 0 ? Math.round(totalStreak / totalHabits) : 0,
      longestStreak
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
