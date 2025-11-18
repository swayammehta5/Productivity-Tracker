# Quick Fix Checklist for Google OAuth

## ✅ Current Configuration Status

### URLs:
- **Backend:** `https://productivity-tracker1.onrender.com`
- **Frontend:** `https://productivity-tracker-djk9.onrender.com`

### Environment Variables to Verify:

#### Frontend (Static Site):
- [ ] `REACT_APP_API_URL` = `https://productivity-tracker1.onrender.com/api`
- [ ] `REACT_APP_GOOGLE_CLIENT_ID` = `961655925122-b4nsqfbud74d1m9h45e0j2a3slk2ihl7.apps.googleusercontent.com` (ends with `ihl7`)

#### Backend (Web Service):
- [ ] `GOOGLE_CLIENT_ID` = `961655925122-b4nsqfbud74d1m9h45e0j2a3slk2ihl7.apps.googleusercontent.com` (ends with `ihl7`)
- [ ] `FRONTEND_URL` = `https://productivity-tracker-djk9.onrender.com`
- [ ] `MONGODB_URI` = (your MongoDB connection string)
- [ ] `JWT_SECRET` = (your JWT secret)

### Google Cloud Console Settings:

#### Authorized JavaScript Origins:
- [ ] `https://productivity-tracker-djk9.onrender.com`
- [ ] `http://localhost:3000` (for local testing)

#### Authorized Redirect URIs:
- [ ] `https://productivity-tracker-djk9.onrender.com`

## 🔧 Steps to Fix:

1. **Fix Frontend Client ID:**
   - Go to Render → Frontend Static Site → Environment
   - Edit `REACT_APP_GOOGLE_CLIENT_ID`
   - Make sure it ends with `ihl7` (not `ih17`)
   - Value: `961655925122-b4nsqfbud74d1m9h45e0j2a3slk2ihl7.apps.googleusercontent.com`

2. **Verify Backend Client ID:**
   - Go to Render → Backend Web Service → Environment
   - Verify `GOOGLE_CLIENT_ID` ends with `ihl7`
   - Should match frontend exactly

3. **Redeploy Both Services:**
   - Frontend: Manual Deploy → Clear build cache & deploy
   - Backend: Manual Deploy → Clear build cache & deploy

4. **Test:**
   - Visit: `https://productivity-tracker-djk9.onrender.com`
   - Should see Google Login button
   - Click and test authentication

## 🐛 If Still Not Working:

1. **Check Browser Console:**
   - Press F12 → Console tab
   - Look for any red error messages
   - Share the errors

2. **Check Render Logs:**
   - Frontend logs: Check for build errors
   - Backend logs: Check for API errors

3. **Verify Google Cloud Console:**
   - Make sure OAuth consent screen is published (if not in testing mode)
   - Add test users if in testing mode

