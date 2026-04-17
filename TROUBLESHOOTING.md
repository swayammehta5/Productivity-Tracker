# Troubleshooting Guide

## Common Issues and Solutions

### 1. **Features Not Loading / Showing Empty Data**

**Issue:** Components show "No data available" or empty states.

**Solutions:**
- This is normal if you haven't created any habits or tasks yet
- Create some habits and tasks first, then the features will show data
- For gamification: Complete some habits/tasks to earn XP

### 2. **Backend Server Not Starting**

**Issue:** Server crashes with module not found errors.

**Solutions:**
- Run `npm install` in the backend directory
- All dependencies should install automatically
- If OpenAI or Google APIs aren't installed, the server will still start but those features will use fallbacks

### 3. **AI Features Not Working**

**Issue:** AI suggestions or chat not responding.

**Solutions:**
- AI features work with rule-based fallbacks even without OpenAI API key
- To use OpenAI features, add `OPENAI_API_KEY` to your `.env` file
- Without the API key, you'll still get suggestions based on your habits

### 4. **Gamification Shows Level 1 with 0 XP**

**Issue:** Gamification dashboard shows default values.

**Solutions:**
- This is normal for new users
- Complete habits (10 XP each) or tasks (15 XP each) to earn XP
- Level up by earning 100 XP per level
- Badges unlock automatically as you progress

### 5. **Reports Show Zero Values**

**Issue:** Reports page shows all zeros.

**Solutions:**
- Create habits and complete them over several days
- Create tasks and mark them as completed
- Reports need at least a few days of data to be meaningful
- Weekly reports need data from the past 7 days
- Monthly reports need data from the past 30 days

### 6. **Mood Tracker Shows No Insights**

**Issue:** Mood insights are empty.

**Solutions:**
- Record your mood at least once to see insights
- Insights appear after you have mood entries
- Track your mood daily for better insights

### 7. **Leaderboard is Empty**

**Issue:** Leaderboard shows no users.

**Solutions:**
- Leaderboard needs multiple users to be meaningful
- Complete habits/tasks to earn XP and appear on the leaderboard
- Your rank will appear once you have some activity

### 8. **Voice Assistant Not Working**

**Issue:** Voice commands don't work.

**Solutions:**
- Voice Assistant requires browser support for Web Speech API
- Works in Chrome, Edge, and Safari
- Make sure microphone permissions are granted
- Click "Start Listening" and speak clearly

### 9. **Location Features Not Working**

**Issue:** Location-based habits don't show.

**Solutions:**
- Allow browser location access when prompted
- Add location to habits/tasks when creating them
- Location features require GPS/location services to be enabled

## Testing Each Feature

### Smart Suggestions
1. Create a few habits
2. Go to Dashboard
3. Scroll to "Smart Suggestions" section
4. You should see AI-generated or rule-based suggestions

### Reports
1. Create habits and complete them over several days
2. Create tasks and complete some
3. Go to Reports page
4. Switch between Weekly and Monthly views
5. You should see completion rates and charts

### Mood Tracker
1. Go to Mood page
2. Select a mood and energy level
3. Add optional notes
4. Click "Record Mood"
5. View insights on the right side

### Gamification
1. Complete some habits or tasks
2. Go to Gamification page
3. Check your XP, level, and badges
4. Complete more activities to level up

### Leaderboard
1. Complete habits/tasks to earn XP
2. Go to Leaderboard page
3. See your rank and top performers
4. Sort by XP, Level, or Streak

### AI Chat
1. Go to AI Chat page
2. Type a message about productivity
3. Get AI-powered or fallback responses
4. Chat about your habits and tasks

## Environment Variables

Make sure your `.env` file in the backend has:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret

# OpenAI (optional - for AI features)
OPENAI_API_KEY=your_openai_api_key

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

## Still Having Issues?

1. Check browser console for errors (F12)
2. Check backend server logs
3. Verify all dependencies are installed
4. Make sure MongoDB is running and connected
5. Check that backend server is running on port 5000
6. Check that frontend is running on port 3000
7. Verify API_URL in frontend matches backend URL

## Feature Status

Core productivity features are implemented and should work. If a feature shows empty data, it's likely because:
- You need to create some data first (habits/tasks)
- You need to record some activity
- The feature requires optional setup (like API keys)

