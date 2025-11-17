# Environment Variables for Render Deployment

## 🔧 Backend (Web Service) Environment Variables

Add these environment variables in your Render backend service:

### Required Variables:

1. **MONGODB_URI**
   - Description: MongoDB connection string
   - Example: `mongodb+srv://username:password@cluster.mongodb.net/habit-tracker?retryWrites=true&w=majority`
   - **Required**: Yes

2. **JWT_SECRET**
   - Description: Secret key for signing JWT tokens
   - Example: Generate a strong random string (e.g., `openssl rand -base64 32`)
   - **Required**: Yes

3. **NODE_ENV**
   - Description: Environment mode
   - Value: `production`
   - **Required**: Yes (for production)

4. **PORT**
   - Description: Server port (Render will set this automatically, but you can override)
   - Default: `5001` (if not set)
   - **Required**: No (Render provides this)

5. **FRONTEND_URL**
   - Description: Your frontend static site URL on Render
   - Example: `https://your-app-name.onrender.com`
   - **Required**: Yes (for CORS and email links)

### Email Configuration (Required for email features):

6. **EMAIL_SERVICE**
   - Description: Email service provider
   - Example: `gmail`, `outlook`, `yahoo`, etc.
   - **Required**: Yes (if using email features)

7. **EMAIL_USER**
   - Description: Email address for sending emails
   - Example: `your-email@gmail.com`
   - **Required**: Yes (if using email features)

8. **EMAIL_PASS**
   - Description: Email password or app-specific password
   - Example: For Gmail, use an App Password (not your regular password)
   - **Required**: Yes (if using email features)

### Optional Variables (for specific features):

9. **OPENAI_API_KEY**
   - Description: OpenAI API key for AI-powered suggestions and chat
   - Example: `sk-...`
   - **Required**: No (app will use rule-based suggestions if not provided)

10. **GOOGLE_CLIENT_ID**
    - Description: Google OAuth Client ID for Google Calendar integration
    - Example: `123456789-abcdefg.apps.googleusercontent.com`
    - **Required**: No (only if using Google Calendar sync)

11. **GOOGLE_CLIENT_SECRET**
    - Description: Google OAuth Client Secret for Google Calendar integration
    - Example: `GOCSPX-...`
    - **Required**: No (only if using Google Calendar sync)

12. **GOOGLE_REDIRECT_URI**
    - Description: Google OAuth redirect URI
    - Example: `https://your-backend.onrender.com/api/calendar/callback`
    - **Required**: No (only if using Google Calendar sync)

---

## 🎨 Frontend (Static Site) Environment Variables

Add these environment variables in your Render static site:

### Required Variables:

1. **REACT_APP_API_URL**
   - Description: Backend API URL
   - Example: `https://your-backend-service.onrender.com/api`
   - **Required**: Yes
   - **Note**: Must start with `REACT_APP_` prefix for React to access it

---

## 📝 Important Notes:

### Backend CORS Configuration:
⚠️ **IMPORTANT**: You need to update the CORS configuration in `backend/server.js` to allow your frontend URL in production:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));
```

### Email Setup:
- For Gmail: You'll need to enable 2-Step Verification and create an App Password
- Go to Google Account → Security → 2-Step Verification → App Passwords
- Use the generated app password in `EMAIL_PASS`

### Google Calendar Setup:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `https://your-backend.onrender.com/api/calendar/callback`
6. Copy Client ID and Client Secret to environment variables

### MongoDB Setup:
- Use MongoDB Atlas (free tier available)
- Create a cluster and get the connection string
- Replace `<password>` with your database password
- Whitelist Render's IP addresses (or use `0.0.0.0/0` for all IPs in development)

### Security Best Practices:
- Never commit `.env` files to Git
- Use strong, random values for `JWT_SECRET`
- Keep API keys secure and rotate them regularly
- Use environment-specific values (different for dev/staging/prod)

---

## 🔧 Troubleshooting Deployment Issues:

### Backend Error: "No open ports detected"

**Solution:** The server now starts before connecting to MongoDB, so Render can detect the port. Make sure:
- The `PORT` environment variable is set (Render sets this automatically)
- The server is listening on `0.0.0.0` (already configured)

### Backend Error: "MongoDB Connection Error: connect ECONNREFUSED"

This error means the `MONGODB_URI` environment variable is either:
1. **Not set** - Add it in Render dashboard
2. **Pointing to localhost** - Use MongoDB Atlas (cloud database) instead

**Solution:**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free cluster
2. Create a database user and get the connection string
3. In Render dashboard, add environment variable:
   - Key: `MONGODB_URI`
   - Value: `mongodb+srv://username:password@cluster.mongodb.net/habit-tracker?retryWrites=true&w=majority`
4. Replace `username`, `password`, and `cluster` with your actual values
5. In MongoDB Atlas, add `0.0.0.0/0` to Network Access (whitelist all IPs) or add Render's IPs

**Important:** The server will start even if MongoDB fails, but API endpoints won't work until MongoDB is connected. Check the logs to verify connection.

### Frontend Build Error: "react-scripts: Permission denied"

This is a common issue on Render. We've created a custom build script to fix this.

**Solution 1: Use the Custom Build Script (Already Applied)**
- The build script now uses `node scripts/build.js` which directly imports `react-scripts/scripts/build`
- It also polyfills `localStorage`/`sessionStorage`, preventing the Node 20+ `SecurityError: Cannot initialize local storage` issue during builds
- This should work automatically on Render

**Solution 2: Override Build Command in Render Dashboard (If Solution 1 fails):**
1. Go to your Static Site settings in Render
2. Under "Build Command", set: `npm install && npm run build`
3. Under "Publish Directory", set: `build`
4. Make sure "Node Version" is set to 18.x or 20.x

**Solution 3: Use npm exec directly (Alternative):**
If the custom script doesn't work, override the build command in Render to:
```bash
npm install && npm exec -- react-scripts build
```

**Solution 4: Ensure Node Version:**
- Render should use Node.js 18.x or 20.x
- The `package.json` already specifies this in the `engines` field

**Solution 5: Clean Build (If issues persist):**
Add this to your build command in Render:
```bash
npm install && rm -rf build node_modules/.cache && npm run build
```

---

## 🚀 Quick Setup Checklist:

### Backend:
- [ ] Set `MONGODB_URI`
- [ ] Set `JWT_SECRET` (generate a strong random string)
- [ ] Set `NODE_ENV` to `production`
- [ ] Set `FRONTEND_URL` to your frontend Render URL
- [ ] Set email variables (`EMAIL_SERVICE`, `EMAIL_USER`, `EMAIL_PASS`)
- [ ] (Optional) Set `OPENAI_API_KEY` for AI features
- [ ] (Optional) Set Google Calendar variables if using calendar sync
- [ ] Update CORS configuration in `server.js` to use `process.env.FRONTEND_URL`

### Frontend:
- [ ] Set `REACT_APP_API_URL` to your backend Render URL
- [ ] Rebuild the frontend after setting environment variables

---

## 📋 Example Render Environment Variables Setup:

### Backend Service:
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/habit-tracker
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=production
FRONTEND_URL=https://your-frontend.onrender.com
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
OPENAI_API_KEY=sk-... (optional)
GOOGLE_CLIENT_ID=... (optional)
GOOGLE_CLIENT_SECRET=... (optional)
GOOGLE_REDIRECT_URI=https://your-backend.onrender.com/api/calendar/callback (optional)
```

### Frontend Static Site:
```
REACT_APP_API_URL=https://your-backend.onrender.com/api
```

