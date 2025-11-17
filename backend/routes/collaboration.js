const express = require('express');
const auth = require('../middleware/auth');
const SharedTask = require('../models/SharedTask');
const SharedHabit = require('../models/SharedHabit');
const Task = require('../models/Task');
const Habit = require('../models/Habit');
const User = require('../models/User');
const { sendCollaborationEmail } = require('../utils/emailService');

const router = express.Router();

// Share a task
router.post('/tasks/:taskId/share', auth, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { email, role } = req.body;

    const task = await Task.findById(taskId);
    if (!task || task.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const collaborator = await User.findOne({ email });
    if (!collaborator) {
      return res.status(404).json({ message: 'User not found' });
    }

    let sharedTask = await SharedTask.findOne({ task: taskId });
    if (!sharedTask) {
      sharedTask = new SharedTask({
        task: taskId,
        owner: req.user._id,
        collaborators: []
      });
    }

    const existingCollab = sharedTask.collaborators.find(
      c => c.user.toString() === collaborator._id.toString()
    );

    if (existingCollab) {
      return res.status(400).json({ message: 'User is already a collaborator' });
    }

    sharedTask.collaborators.push({
      user: collaborator._id,
      role: role || 'collaborator'
    });

    await sharedTask.save();

    // Send invitation email
    await sendCollaborationEmail(collaborator.email, req.user.name, task.title, 'task');

    res.json(sharedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Share a habit
router.post('/habits/:habitId/share', auth, async (req, res) => {
  try {
    const { habitId } = req.params;
    const { email, role } = req.body;

    const habit = await Habit.findById(habitId);
    if (!habit || habit.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const collaborator = await User.findOne({ email });
    if (!collaborator) {
      return res.status(404).json({ message: 'User not found' });
    }

    let sharedHabit = await SharedHabit.findOne({ habit: habitId });
    if (!sharedHabit) {
      sharedHabit = new SharedHabit({
        habit: habitId,
        owner: req.user._id,
        collaborators: []
      });
    }

    const existingCollab = sharedHabit.collaborators.find(
      c => c.user.toString() === collaborator._id.toString()
    );

    if (existingCollab) {
      return res.status(400).json({ message: 'User is already a collaborator' });
    }

    sharedHabit.collaborators.push({
      user: collaborator._id,
      role: role || 'collaborator'
    });

    await sharedHabit.save();

    // Send invitation email
    await sendCollaborationEmail(collaborator.email, req.user.name, habit.name, 'habit');

    res.json(sharedHabit);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get shared tasks
router.get('/tasks/shared', auth, async (req, res) => {
  try {
    const sharedTasks = await SharedTask.find({
      $or: [
        { owner: req.user._id },
        { 'collaborators.user': req.user._id }
      ]
    }).populate('task').populate('owner', 'name email').populate('collaborators.user', 'name email');

    res.json(sharedTasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get shared habits
router.get('/habits/shared', auth, async (req, res) => {
  try {
    const sharedHabits = await SharedHabit.find({
      $or: [
        { owner: req.user._id },
        { 'collaborators.user': req.user._id }
      ]
    }).populate('habit').populate('owner', 'name email').populate('collaborators.user', 'name email');

    res.json(sharedHabits);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove collaborator
router.delete('/tasks/:taskId/collaborators/:userId', auth, async (req, res) => {
  try {
    const { taskId, userId } = req.params;

    const sharedTask = await SharedTask.findOne({ task: taskId });
    if (!sharedTask || sharedTask.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    sharedTask.collaborators = sharedTask.collaborators.filter(
      c => c.user.toString() !== userId
    );

    await sharedTask.save();
    res.json({ message: 'Collaborator removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

