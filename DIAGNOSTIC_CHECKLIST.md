# Blank Screen Diagnostic Checklist

Follow these steps in order to identify the issue.

---

## 🔍 Step 1: Check Browser Console Errors

1. **Open your frontend URL:** `https://productivity-tracker-djk9.onrender.com`
2. **Press F12** to open Developer Tools
3. **Go to Console tab**
4. **Look for errors** and share:
   - Any red error messages
   - The exact error text
   - Line numbers (e.g., `main.xxxxx.js:2`)

**Common errors to look for:**
- `useAuth must be used within an AuthProvider`
- `Cannot read property of undefined`
- `Failed to load resource`
- Any React errors

---

## 🔍 Step 2: Check Render Build Logs

1. **Go to Render Dashboard** → Your Frontend Static Site
2. **Click "Logs" tab**
3. **Check the latest build logs** and look for:
   - Build success/failure messages
   - Any errors during `npm install`
   - Any errors during `npm run build`
   - Environment variable warnings

**Share:**
- Last 50 lines of build logs
- Any error messages in red

---

## 🔍 Step 3: Verify Environment Variables

### Frontend (Static Site):
1. Go to **Render** → **Frontend Static Site** → **Environment**
2. Verify these exact values:

```
REACT_APP_API_URL = https://productivity-tracker1.onrender.com/api
REACT_APP_GOOGLE_CLIENT_ID = 961655925122-b4nsqfbud74d1m9h45e0j2a3slk2ihl7.apps.googleusercontent.com
```

**Check:**
- [ ] Both variables exist
- [ ] No extra spaces before/after values
- [ ] Client ID ends with `ihl7` (not `ih17`)
- [ ] API URL ends with `/api`

### Backend (Web Service):
1. Go to **Render** → **Backend Web Service** → **Environment**
2. Verify:

```
GOOGLE_CLIENT_ID = 961655925122-b4nsqfbud74d1m9h45e0j2a3slk2ihl7.apps.googleusercontent.com
FRONTEND_URL = https://productivity-tracker-djk9.onrender.com
MONGODB_URI = mongodb+srv://swayam:swayam1010@productivitytracker.ugc5ri2.mongodb.net/?appName=ProductivityTracker
JWT_SECRET = (your JWT secret)
```

---

## 🔍 Step 4: Check Network Tab

1. **Open Developer Tools** (F12)
2. **Go to Network tab**
3. **Refresh the page** (Ctrl+R or F5)
4. **Look for:**
   - Failed requests (red status codes)
   - Missing JavaScript files
   - 404 errors

**Share:**
- Any failed requests
- Status codes (404, 500, etc.)

---

## 🔍 Step 5: Verify Build Output

1. **Go to Render** → **Frontend Static Site** → **Logs**
2. **Find the build section** (look for "Running build command")
3. **Check if build completed successfully**

**Look for:**
```
==> Build successful 🎉
```

**If you see errors, share them.**

---

## 🔍 Step 6: Test Environment Variable in Build

The environment variable must be available **during build time**. Let's verify:

1. **Check build logs** for this line:
   ```
   ==> Running build command 'npm install && npm run build'
   ```

2. **Look for any warnings** about missing environment variables

3. **After build completes**, check if files were created:
   - Go to Render → Your Static Site
   - Check if "Uploading build..." appears
   - Check if build files were uploaded

---

## 🔍 Step 7: Check Source Code

Let me verify the code structure is correct. I'll check:

1. **index.js** - Should wrap app with GoogleOAuthProvider
2. **App.jsx** - Should have AuthProvider
3. **AuthContext.jsx** - Should export useAuth correctly

---

## 🔍 Step 8: Manual Test

Try accessing the built files directly:

1. **Check if index.html exists:**
   - Try: `https://productivity-tracker-djk9.onrender.com/index.html`
   - Should show the HTML (even if blank)

2. **Check browser console for:**
   - `REACT_APP_GOOGLE_CLIENT_ID` value
   - Add this to browser console:
     ```javascript
     console.log('Client ID:', process.env.REACT_APP_GOOGLE_CLIENT_ID);
     ```
   - **Note:** This won't work because env vars are replaced at build time, but it helps verify the build

---

## 📋 Quick Diagnostic Commands

Run these in your browser console (F12 → Console):

```javascript
// Check if React is loaded
console.log('React:', typeof React);

// Check if root element exists
console.log('Root:', document.getElementById('root'));

// Check for any global errors
console.log('Errors:', window.onerror);
```

---

## 🎯 Most Likely Issues

Based on the error pattern, here are the most common causes:

1. **Environment variable not set at build time** (90% likely)
   - Solution: Clear build cache & redeploy

2. **Client ID typo** (5% likely)
   - Solution: Verify exact value matches Google Console

3. **Code structure issue** (5% likely)
   - Solution: Verify all files are correct

---

## 📤 What to Share With Me

Please share:

1. **Browser Console Errors:**
   - Screenshot or copy all red error messages

2. **Render Build Logs:**
   - Last 50-100 lines from the latest build

3. **Environment Variables:**
   - Screenshot of your Render environment variables (you can mask sensitive values)

4. **Network Tab:**
   - Any failed requests

5. **Current Behavior:**
   - What you see (blank screen, error message, etc.)

With this information, I can pinpoint the exact issue!

