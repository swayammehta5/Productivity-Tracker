import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import GoogleLogin from './components/Auth/GoogleLogin';
import Dashboard from './components/Dashboard/Dashboard';
import HabitsList from './components/Habits/HabitsList';
import AddHabit from './components/Habits/AddHabit';
import TasksList from './components/Tasks/TasksList';
import CalendarView from './components/Calendar/CalendarView';
import Profile from './components/Profile/Profile';
import Navbar from './components/Layout/Navbar';
import Reports from './components/Reports/Reports';
import MoodTracker from './components/Mood/MoodTracker';
import Leaderboard from './components/Leaderboard/Leaderboard';
import GamificationDashboard from './components/Gamification/GamificationDashboard';
import TwoFactorAuth from './components/Auth/TwoFactorAuth';
import AIChat from './components/AI/AIChat';
import BackupRestore from './components/Backup/BackupRestore';
import HabitTemplates from './components/Templates/HabitTemplates';
import LocationHabits from './components/Location/LocationHabits';
import VoiceAssistant from './components/Voice/VoiceAssistant';
import NotificationManager from './components/Notifications/NotificationManager';
import CalendarSync from './components/Calendar/CalendarSync';


/* ✅ FIXED PRIVATEROUTE — no infinite loop */
const PrivateRoute = ({ children }) => {
  const { user, loading, initializing } = useAuth();

  // Prevent redirect loop during auth check
  if (initializing || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return user ? children : <Navigate to="/" />;
};


function AppContent() {
  const { user, initializing } = useAuth();

  // Prevent login/register redirect loop during initialization
  const blockUntilReady = initializing ? true : false;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {user && <Navbar />}

      <Routes>
        <Route
          path="/"
          element={!user && !blockUntilReady ? <GoogleLogin /> : <PrivateRoute><Dashboard /></PrivateRoute>}
        />
        <Route path="/habits" element={<PrivateRoute><HabitsList /></PrivateRoute>} />
        <Route path="/add-habit" element={<PrivateRoute><AddHabit /></PrivateRoute>} />
        <Route path="/tasks" element={<PrivateRoute><TasksList /></PrivateRoute>} />
        <Route path="/calendar" element={<PrivateRoute><CalendarView /></PrivateRoute>} />
        <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
        <Route path="/mood" element={<PrivateRoute><MoodTracker /></PrivateRoute>} />
        <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
        <Route path="/gamification" element={<PrivateRoute><GamificationDashboard /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/2fa" element={<PrivateRoute><TwoFactorAuth /></PrivateRoute>} />
        <Route path="/ai-chat" element={<PrivateRoute><AIChat /></PrivateRoute>} />
        <Route path="/backup" element={<PrivateRoute><BackupRestore /></PrivateRoute>} />
        <Route path="/templates" element={<PrivateRoute><HabitTemplates /></PrivateRoute>} />
        <Route path="/location" element={<PrivateRoute><LocationHabits /></PrivateRoute>} />
        <Route path="/voice" element={<PrivateRoute><VoiceAssistant /></PrivateRoute>} />
        <Route path="/notifications" element={<PrivateRoute><NotificationManager /></PrivateRoute>} />
        <Route path="/calendar-sync" element={<PrivateRoute><CalendarSync /></PrivateRoute>} />
      </Routes>
    </div>
  );
}


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
