// server.js

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const cron = require('node-cron');

// Import models
const Habit = require('./models/Habit');
const Task = require('./models/Task');
const User = require('./models/User');

// Import utility functions
const { sendReminderEmail } = require('./utils/emailService');

// Import routes
const authRoutes = require('./routes/auth');
const habitRoutes = require('./routes/habits');
const taskRoutes = require('./routes/tasks');
const reportsRoutes = require('./routes/reports');
const gamificationRoutes = require('./routes/gamification');
const leaderboardRoutes = require('./routes/leaderboard');
const collaborationRoutes = require('./routes/collaboration');

// Import middleware
const auth = require('./middleware/auth');

const app = express();


// ===========================
// 🔹 Middleware
// ===========================
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});


// ===========================
// 🔹 API Routes
// ===========================
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/collaboration', collaborationRoutes);

// Health check (works even if MongoDB is not connected)
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    status: 'ok', 
    message: 'API is running',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});


// ===========================
// 🔹 Combined Stats Endpoint
// ===========================
app.get('/api/stats', auth, async (req, res) => {
  try {
    const [habits, tasks] = await Promise.all([
      Habit.find({ user: req.user._id }),
      Task.find({ userId: req.user._id })
    ]);

    // Habit stats
    const totalHabits = habits.length;
    const totalCompletions = habits.reduce(
      (sum, h) => sum + h.completions.filter(c => c.completed).length,
      0
    );
    const totalStreak = habits.reduce((sum, h) => sum + h.currentStreak, 0);
    const longestStreak = Math.max(...habits.map(h => h.longestStreak), 0);

    // Task stats
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
    const highPriorityTasks = tasks.filter(
      t => t.priority === 'High' && t.status === 'Pending'
    ).length;

    res.json({
      habits: {
        total: totalHabits,
        totalCompletions,
        averageStreak: totalHabits > 0 ? Math.round(totalStreak / totalHabits) : 0,
        longestStreak
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        pending: pendingTasks,
        highPriority: highPriorityTasks
      },
      overall: {
        totalActivities: totalHabits + totalTasks,
        completedActivities: totalCompletions + completedTasks
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// ===========================
// 🔹 Cron Job for Daily Reminders
// ===========================
cron.schedule('0 8 * * *', async () => {
  try {
    console.log('Sending daily reminders...');
    const users = await User.find({ emailReminders: true });
    
    for (const user of users) {
      const habits = await Habit.find({ user: user._id, frequency: 'daily' });
      if (habits.length > 0) {
        await sendReminderEmail(user.email, user.name, habits);
      }
    }
  } catch (error) {
    console.error('Error sending reminders:', error);
  }
});


// ===========================
// 🔹 Serve Static Files (Production)
// ===========================
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html'));
  });
}


// ===========================
// 🔹 Error Handling
// ===========================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});


// ===========================
// 🔹 Start Server
// ===========================
const startServer = async () => {
  try {
    // Start server first so Render can detect the port
    const PORT = parseInt(process.env.PORT, 10) || 5001;
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`🌐 API available at http://0.0.0.0:${PORT}/api`);
    });

    // Connect to MongoDB after server starts (non-blocking)
    try {
      await connectDB();
    } catch (dbError) {
      console.error('⚠️  Server started but MongoDB connection failed.');
      console.error('⚠️  API endpoints will not work until MongoDB is connected.');
      console.error('⚠️  Please check your MONGODB_URI environment variable in Render.');
    }

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received. Shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

    // Error handlers
    process.on('unhandledRejection', (err) => {
      console.error('Unhandled Rejection:', err);
      server.close(() => process.exit(1));
    });

    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err);
      server.close(() => process.exit(1));
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
