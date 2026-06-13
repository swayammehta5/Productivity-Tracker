# Productivity Tracker

## Overview

Productivity Tracker is a full-stack web application that helps users manage tasks, track habits, monitor productivity, and stay motivated through gamification and AI-powered insights.

## Features

* User Authentication (JWT & Google OAuth)
* Task Management
* Habit Tracking with Streaks
* Analytics Dashboard
* AI-Powered Productivity Suggestions
* XP, Levels, and Badges
* Leaderboard System
* Email Reminders
* Progressive Web App (PWA)
* Responsive Design

## Tech Stack

### Frontend

* React.js
* Tailwind CSS
* React Router
* Axios

### Backend

* Node.js
* Express.js

### Database

* MongoDB Atlas

### Authentication

* JWT
* Google OAuth

### Deployment

* Render

---

## Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-username/productivity-tracker.git
cd productivity-tracker
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
OPENAI_API_KEY=your_openai_key
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

Start backend:

```bash
npm start
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

The application will run locally at:

```text
Frontend: http://localhost:3000
Backend: http://localhost:5001
```

---

## Project Structure

```text
frontend/
backend/
docs/
README.md
SCOPE.md
DECISIONS.md
AI_USAGE.md
```

---

## AI Tools Used

### ChatGPT

Used for:

* Architecture planning
* API design suggestions
* Documentation assistance
* Debugging support

### GitHub Copilot

Used for:

* Code completion
* Boilerplate generation
* Refactoring suggestions

## AI Usage Policy

All AI-generated suggestions were manually reviewed, tested, and modified before implementation.

---

## Deployment

Application deployed on Render.

Lovely Professional University
