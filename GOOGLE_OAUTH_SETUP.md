# Google OAuth Setup Guide

Complete step-by-step guide to set up Google OAuth authentication for your Productivity Tracker application.

---

## 📋 Prerequisites

- A Google account
- Access to Google Cloud Console
- Your application deployed on Render (or localhost for testing)

---

## 🔧 Step 1: Create a Google Cloud Project

1. **Go to Google Cloud Console**
   - Visit: [https://console.cloud.google.com/](https://console.cloud.google.com/)
   - Sign in with your Google account

2. **Create a New Project**
   - Click the project dropdown at the top
   - Click **"New Project"**
   - Enter project name: `Productivity Tracker` (or any name you prefer)
   - Click **"Create"**
   - Wait for the project to be created (may take a few seconds)

3. **Select Your Project**
   - Make sure your new project is selected in the project dropdown

---

## 🔑 Step 2: Enable Google+ API / OAuth Consent Screen

1. **Navigate to APIs & Services**
   - In the left sidebar, go to **"APIs & Services"** → **"Library"**
   - Search for **"Google+ API"** or **"People API"**
   - Click on it and click **"Enable"**

   **Note:** For OAuth 2.0, you actually need to configure the OAuth Consent Screen, not necessarily enable a specific API. The People API is useful for getting user profile information.

2. **Configure OAuth Consent Screen**
   - Go to **"APIs & Services"** → **"OAuth consent screen"**
   - Select **"External"** (unless you have a Google Workspace account, then you can use "Internal")
   - Click **"Create"**

3. **Fill in App Information**
   - **App name:** `Productivity Tracker` (or your app name)
   - **User support email:** Your email address
   - **App logo:** (Optional) Upload a logo if you have one
   - **App domain:** Leave blank for now
   - **Developer contact information:** Your email address
   - Click **"Save and Continue"**

4. **Scopes (Optional)**
   - Click **"Add or Remove Scopes"**
   - For basic login, you can use the default scopes:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
   - Click **"Update"** then **"Save and Continue"**

5. **Test Users (For Testing)**
   - If your app is in "Testing" mode, add test users:
     - Click **"Add Users"**
     - Add your email address and any other test emails
   - Click **"Save and Continue"**

6. **Summary**
   - Review the information
   - Click **"Back to Dashboard"**

---

## 🔐 Step 3: Create OAuth 2.0 Credentials

1. **Navigate to Credentials**
   - Go to **"APIs & Services"** → **"Credentials"**

2. **Create OAuth 2.0 Client ID**
   - Click **"+ Create Credentials"** → **"OAuth client ID"**
   - If prompted, select **"Web application"** as the application type

3. **Configure OAuth Client**
   - **Name:** `Productivity Tracker Web Client` (or any name)
   
   - **Authorized JavaScript origins:**
     - For local development: `http://localhost:3000`
     - For production: `https://productivity-tracker-djk9.onrender.com` (your frontend URL)
     - Click **"+ Add URI"** for each
   
   - **Authorized redirect URIs:**
     - For local development: `http://localhost:3000`
     - For production: `https://productivity-tracker-djk9.onrender.com` (your frontend URL)
     - Click **"+ Add URI"** for each
   
   - Click **"Create"**

4. **Copy Your Credentials**
   - A popup will appear with your **Client ID** and **Client Secret**
   - **IMPORTANT:** Copy both values immediately (you won't be able to see the secret again)
   - Store them securely

---

## 🌐 Step 4: Add Environment Variables to Render

### Frontend (Static Site) Environment Variables

1. Go to your **Frontend Static Site** in Render dashboard
2. Navigate to **"Environment"**
3. Add the following variable:
   - **Key:** `REACT_APP_GOOGLE_CLIENT_ID`
   - **Value:** Your Google Client ID (from Step 3)
   - Example: `123456789-abcdefghijklmnop.apps.googleusercontent.com`
4. Click **"Save"**

### Backend (Web Service) Environment Variables

1. Go to your **Backend Web Service** in Render dashboard
2. Navigate to **"Environment"**
3. Add/Update the following variables:
   - **Key:** `GOOGLE_CLIENT_ID`
   - **Value:** Your Google Client ID (same as frontend)
   - Example: `123456789-abcdefghijklmnop.apps.googleusercontent.com`
   
   - **Key:** `GOOGLE_CLIENT_SECRET` (Optional - only if you need server-side verification)
   - **Value:** Your Google Client Secret
   - **Note:** For this implementation, we only need the Client ID on the frontend. The backend verifies the token using the Client ID only.

4. Click **"Save"**

---

## 📦 Step 5: Install Dependencies

### Backend

The backend needs `google-auth-library` to verify Google tokens. It should already be in `package.json`, but if not:

```bash
cd backend
npm install google-auth-library
```

### Frontend

The frontend needs `@react-oauth/google`. It should already be in `package.json`, but if not:

```bash
cd frontend
npm install @react-oauth/google
```

---

## 🚀 Step 6: Deploy Your Changes

1. **Commit and Push Your Code**
   ```bash
   git add .
   git commit -m "Add Google OAuth authentication"
   git push
   ```

2. **Redeploy Services on Render**
   - **Frontend:** Go to your static site → **"Manual Deploy"** → **"Clear build cache & deploy"**
   - **Backend:** Go to your web service → **"Manual Deploy"** → **"Clear build cache & deploy"**

3. **Wait for Deployment**
   - Both services should redeploy automatically
   - Check the logs to ensure there are no errors

---

## ✅ Step 7: Test Google OAuth

1. **Visit Your Frontend URL**
   - Go to: `https://productivity-tracker-djk9.onrender.com`
   - You should see the Google Login button

2. **Click "Sign in with Google"**
   - Select your Google account
   - Grant permissions if prompted
   - You should be redirected to the dashboard

3. **Verify in MongoDB**
   - Check your MongoDB Atlas database
   - You should see a new user document with:
     - `googleId`: The Google user ID
     - `email`: Your Google email
     - `name`: Your Google name
     - `password`: Should be `undefined` or not present

---

## 🔍 Troubleshooting

### Issue: "Error 400: redirect_uri_mismatch"

**Solution:**
- Go to Google Cloud Console → Credentials
- Edit your OAuth 2.0 Client ID
- Make sure the **Authorized redirect URIs** exactly match your frontend URL
- Include both `http://localhost:3000` (for local dev) and your production URL
- Save and wait a few minutes for changes to propagate

### Issue: "Invalid Google token"

**Solution:**
- Verify `REACT_APP_GOOGLE_CLIENT_ID` is set correctly in frontend environment variables
- Verify `GOOGLE_CLIENT_ID` is set correctly in backend environment variables
- Make sure both use the same Client ID
- Redeploy both services after setting environment variables

### Issue: "OAuth consent screen not configured"

**Solution:**
- Complete the OAuth consent screen configuration (Step 2)
- Make sure you've added test users if your app is in "Testing" mode
- Wait a few minutes after configuration

### Issue: "User not found" or "Authentication failed"

**Solution:**
- Check backend logs for detailed error messages
- Verify MongoDB connection is working
- Check that the User model has been updated with `googleId` field
- Make sure you've run database migrations if needed

---

## 📝 Important Notes

1. **Client Secret:** For this implementation, we only use the Client ID. The Client Secret is not needed because we're using the frontend Google OAuth flow, and the backend verifies the token using the Client ID.

2. **Security:** The Google token is verified on the backend before creating/updating user accounts. This ensures security.

3. **User Migration:** Existing users with passwords will continue to work. New users created via Google OAuth won't have passwords.

4. **Email Uniqueness:** The system checks for existing users by both `googleId` and `email`, so if a user previously registered with email/password and then logs in with Google, their accounts will be linked.

---

## 🎉 You're Done!

Your application now supports Google OAuth authentication. Users can sign in with their Google accounts without needing to create separate accounts.

For any issues, check the Render logs and Google Cloud Console for detailed error messages.

