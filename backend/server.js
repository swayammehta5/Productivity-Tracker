const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const habitRoutes = require('./routes/habits');
const { sendReminderEmail } = require('./utils/emailService');
const User = require('./models/User');
const Habit = require('./models/Habit');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Habit Tracker API is running' });
});

// Schedule daily reminders at 8:00 AM
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
