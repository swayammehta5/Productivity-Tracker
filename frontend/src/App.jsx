import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import Navbar from './components/Layout/Navbar';

// ✅ Lazy Loading (Performance Boost) Component loads ONLY when needed This is called on-demand loading
const GoogleLogin = lazy(() => import('./components/Auth/GoogleLogin'));
const Dashboard = lazy(() => import('./components/Dashboard/Dashboard'));
const HabitsList = lazy(() => import('./components/Habits/HabitsList'));
const AddHabit = lazy(() => import('./components/Habits/AddHabit'));
const TasksList = lazy(() => import('./components/Tasks/TasksList'));
const CalendarView = lazy(() => import('./components/Calendar/CalendarView'));
const Profile = lazy(() => import('./components/Profile/Profile'));
const Reports = lazy(() => import('./components/Reports/Reports'));
const Leaderboard = lazy(() => import('./components/Leaderboard/Leaderboard'));
const GamificationDashboard = lazy(() => import('./components/Gamification/GamificationDashboard'));
const TwoFactorAuth = lazy(() => import('./components/Auth/TwoFactorAuth'));


// ✅ Clean PrivateRoute
const PrivateRoute = ({ user, initializing, children }) => {
  if (initializing) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return user ? children : <Navigate to="/" />;
};


function AppContent() {
  const { user, initializing } = useAuth();

  if (process.env.NODE_ENV === "development") {
    console.log("Auth State:", { user, initializing });
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {user && <Navbar />}

      <Routes>

        {/* ✅ Clean Root Logic */}
        <Route
          path="/"
          element={
            initializing
              ? <div className="min-h-screen flex justify-center items-center">Loading...</div>
              : user
                ? <Navigate to="/dashboard" />
                : <GoogleLogin />
          }
        />

        <Route path="/dashboard" element={
          <PrivateRoute user={user} initializing={initializing}>
            <Dashboard />
          </PrivateRoute>
        } />

        <Route path="/habits" element={<PrivateRoute user={user} initializing={initializing}><HabitsList /></PrivateRoute>} />
        <Route path="/add-habit" element={<PrivateRoute user={user} initializing={initializing}><AddHabit /></PrivateRoute>} />
        <Route path="/tasks" element={<PrivateRoute user={user} initializing={initializing}><TasksList /></PrivateRoute>} />
        <Route path="/calendar" element={<PrivateRoute user={user} initializing={initializing}><CalendarView /></PrivateRoute>} />
        <Route path="/reports" element={<PrivateRoute user={user} initializing={initializing}><Reports /></PrivateRoute>} />
        <Route path="/leaderboard" element={<PrivateRoute user={user} initializing={initializing}><Leaderboard /></PrivateRoute>} />
        <Route path="/gamification" element={<PrivateRoute user={user} initializing={initializing}><GamificationDashboard /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute user={user} initializing={initializing}><Profile /></PrivateRoute>} />
        <Route path="/2fa" element={<PrivateRoute user={user} initializing={initializing}><TwoFactorAuth /></PrivateRoute>} />
        <Route path="/backup" element={<PrivateRoute user={user} initializing={initializing}><BackupRestore /></PrivateRoute>} />
        <Route path="/templates" element={<PrivateRoute user={user} initializing={initializing}><HabitTemplates /></PrivateRoute>} />
        <Route path="/notifications" element={<PrivateRoute user={user} initializing={initializing}><NotificationManager /></PrivateRoute>} />
        <Route path="/calendar-sync" element={<PrivateRoute user={user} initializing={initializing}><CalendarSync /></PrivateRoute>} />

        {/* ✅ 404 Page */}
        <Route path="*" element={<div className="text-center mt-10 text-xl">404 - Page Not Found</div>} />

      </Routes>
    </div>
  );
}


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>

          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              Loading...
            </div>
          }>
            <AppContent />
          </Suspense>

          <ToastContainer position="top-right" autoClose={5000} theme="colored" />

        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;