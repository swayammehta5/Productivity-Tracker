const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Task = require('../models/Task');

const router = express.Router();

let google;
let oauth2Client;

try {
  google = require('googleapis').google;
  oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/calendar/callback'
  );
} catch (error) {
  console.log('Google APIs module not installed. Calendar sync will not work.');
}

// Get authorization URL
router.get('/auth-url', auth, (req, res) => {
  if (!oauth2Client) {
    return res.status(503).json({ message: 'Google Calendar integration not available. Please install googleapis package.' });
  }
  const scopes = ['https://www.googleapis.com/auth/calendar'];
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    state: req.user._id.toString()
  });
  res.json({ url });
});

// Handle OAuth callback
router.get('/callback', async (req, res) => {
  try {
    if (!oauth2Client) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/calendar/sync?success=false&error=not_available`);
    }
    const { code, state } = req.query;
    const { tokens } = await oauth2Client.getToken(code);
    
    const user = await User.findById(state);
    if (user) {
      user.googleCalendarTokens = {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : null
      };
      await user.save();
    }

    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/calendar/sync?success=true`);
  } catch (error) {
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/calendar/sync?success=false`);
  }
});

// Sync tasks to Google Calendar
router.post('/sync', auth, async (req, res) => {
  try {
    if (!oauth2Client || !google) {
      return res.status(503).json({ message: 'Google Calendar integration not available. Please install googleapis package.' });
    }
    const user = await User.findById(req.user._id);
    if (!user.googleCalendarTokens || !user.googleCalendarTokens.accessToken) {
      return res.status(400).json({ message: 'Google Calendar not connected' });
    }

    oauth2Client.setCredentials({
      access_token: user.googleCalendarTokens.accessToken,
      refresh_token: user.googleCalendarTokens.refreshToken
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Get pending tasks with due dates
    const tasks = await Task.find({
      userId: req.user._id,
      status: 'Pending',
      dueDate: { $exists: true }
    });

    const events = [];
    for (const task of tasks) {
      try {
        const event = {
          summary: task.title,
          description: task.description || '',
          start: {
            dateTime: new Date(task.dueDate).toISOString(),
            timeZone: 'UTC'
          },
          end: {
            dateTime: new Date(new Date(task.dueDate).getTime() + 60 * 60 * 1000).toISOString(),
            timeZone: 'UTC'
          }
        };

        const createdEvent = await calendar.events.insert({
          calendarId: 'primary',
          resource: event
        });

        events.push(createdEvent.data);
      } catch (error) {
        console.error(`Error creating event for task ${task._id}:`, error);
      }
    }

    res.json({ message: 'Tasks synced to Google Calendar', events: events.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Disconnect Google Calendar
router.post('/disconnect', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.googleCalendarTokens = undefined;
    await user.save();

    res.json({ message: 'Google Calendar disconnected' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

