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


function AppContent() {
  console.log('🔍 AppContent: Function called');
  
  // Use useAuth - if it fails, the ErrorBoundary will catch it
  let user, initializing;
  try {
    console.log('🔍 AppContent: Calling useAuth...');
    const auth = useAuth();
    user = auth.user;
    initializing = auth.initializing;
    console.log('🔍 AppContent: useAuth successful', { hasUser: !!user, initializing });
  } catch (error) {
    console.error('🔍 AppContent: useAuth ERROR:', error);
    // Re-throw so ErrorBoundary can catch it
    throw error;
  }

  /* ✅ FIXED PRIVATEROUTE — moved inside AppContent to ensure AuthProvider is available */
  const PrivateRoute = ({ children }) => {
    const { user: routeUser, loading, initializing: routeInitializing } = useAuth();

    // Prevent redirect loop during auth check
    if (routeInitializing || loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl">Loading...</div>
        </div>
      );
    }

    return routeUser ? children : <Navigate to="/" />;
  };

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
  console.log('🔍 App: Rendering...');
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div>Loading...</div></div>}>
            <AppContent />
          </React.Suspense>
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
