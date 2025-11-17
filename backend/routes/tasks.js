const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const UserScore = require('../models/UserScore');

const router = express.Router();

// GET /api/tasks - Get all tasks for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const { status, priority, category, sortBy } = req.query;
    
    const query = { userId: req.user._id };
    
    if (status) {
      query.status = status;
    }
    
    if (priority) {
      query.priority = priority;
    }
    
    if (category) {
      query.category = category;
    }
    
    let sortOptions = { createdAt: -1 };
    if (sortBy === 'dueDate') {
      sortOptions = { dueDate: 1 };
    } else if (sortBy === 'priority') {
      sortOptions = { priority: -1, createdAt: -1 };
    }
    
    const tasks = await Task.find(query).sort(sortOptions);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/tasks - Add a new task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, dueDate, priority, category } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const task = new Task({
      userId: req.user._id,
      title,
      description: description || '',
      dueDate: dueDate ? new Date(dueDate) : null,
      priority: priority || 'Medium',
      category: category || 'General',
      status: 'Pending'
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/tasks/:id - Update task details
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, dueDate, priority, status, category } = req.body;
    
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;
    if (priority !== undefined) task.priority = priority;
    if (category !== undefined) task.category = category;
    
    // Handle status change
    if (status !== undefined) {
      const wasCompleted = task.status === 'Completed';
      task.status = status;
      if (status === 'Completed' && !task.completedAt) {
        task.completedAt = new Date();
        
        // Award XP for completing task (only if it wasn't already completed)
        if (!wasCompleted) {
          try {
            let userScore = await UserScore.findOne({ user: req.user._id });
            if (!userScore) {
              userScore = new UserScore({ user: req.user._id });
            }
            await userScore.addXP(15); // 15 XP per task completion
            userScore.totalTasksCompleted += 1;
            await userScore.save();
          } catch (error) {
            console.error('Error awarding XP:', error);
          }
        }
      } else if (status === 'Pending') {
        task.completedAt = null;
      }
    }

    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/tasks/stats - Get task statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id });
    
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
    const highPriorityTasks = tasks.filter(t => t.priority === 'High' && t.status === 'Pending').length;
    
    // Tasks by priority
    const tasksByPriority = {
      High: tasks.filter(t => t.priority === 'High').length,
      Medium: tasks.filter(t => t.priority === 'Medium').length,
      Low: tasks.filter(t => t.priority === 'Low').length
    };
    
    // Tasks by category
    const categoryCounts = {};
    tasks.forEach(task => {
      const cat = task.category || 'General';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    res.json({
      totalTasks,
      completedTasks,
      pendingTasks,
      highPriorityTasks,
      tasksByPriority,
      categoryCounts
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

