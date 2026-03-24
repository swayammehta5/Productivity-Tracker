import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// AuthProvider
// Wraps app
// Stores global auth state (user, token)

// useAuth
// Custom hook
// Used to access:// user// login// logout
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Components
import GoogleLogin from './components/Auth/GoogleLogin';
import Dashboard from './components/Dashboard/Dashboard';
import HabitsList from './components/Habits/HabitsList';
import AddHabit from './components/Habits/AddHabit';
import TasksList from './components/Tasks/TasksList';
import CalendarView from './components/Calendar/CalendarView';
import Profile from './components/Profile/Profile';
import Navbar from './components/Layout/Navbar';
import Reports from './components/Reports/Reports';
import Leaderboard from './components/Leaderboard/Leaderboard';
import GamificationDashboard from './components/Gamification/GamificationDashboard';
import TwoFactorAuth from './components/Auth/TwoFactorAuth';


// 🔒 Private Route Component
const PrivateRoute = ({ children }) => { // this is a wrapper component Only allow access if user is logged in
  const { user, loading, initializing } = useAuth(); // initializing → checking login at app start

  // Wait until auth is resolved
  if (loading || initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // If user exists → allow, else redirect to login
  return user ? children : <Navigate to="/" replace />;
};


// 🧠 Main App Content
function AppContent() {
  const { user, initializing } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-peach-50 dark:from-gray-900 dark:via-slate-900 dark:to-slate-800 transition-all duration-500 ease-in-out">
      {/* Show Navbar only if logged in */}
      {user && <Navbar />}
      <Routes>
        {/* Root Route */}
        <Route
          path="/"
          element={
            initializing ? (
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl text-gray-600 dark:text-gray-300 animate-pulse">Loading...</div>
              </div>
            ) : user ? (
              <Dashboard />
            ) : (
              <GoogleLogin />
            )
          }
        />

        {/* Protected Routes */}
        <Route path="/habits" element={<PrivateRoute><HabitsList /></PrivateRoute>} />
        <Route path="/add-habit" element={<PrivateRoute><AddHabit /></PrivateRoute>} />
        <Route path="/tasks" element={<PrivateRoute><TasksList /></PrivateRoute>} />
        <Route path="/calendar" element={<PrivateRoute><CalendarView /></PrivateRoute>} />
        <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
        <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
        <Route path="/gamification" element={<PrivateRoute><GamificationDashboard /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/2fa" element={<PrivateRoute><TwoFactorAuth /></PrivateRoute>} />
      </Routes>
    </div>
  );
}


// 🚀 Root App Component
function App() {
  return (
    <BrowserRouter> 
    {/* //Enables routing */}
      <AuthProvider>  
        {/* //Makes auth available globally */}
        <ThemeProvider>

          {/* Used for lazy loading components
            Shows loading while components load */}
          <React.Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center">
                <div>Loading...</div>
              </div>
            }
          >
            {/* Main app UI runs here */}
            <AppContent />
          </React.Suspense>

          {/* Toast Notifications */}
          <ToastContainer   //CONTROLs 
            position="top-right" // position of popup
            autoClose={5000}  // duration
            theme="colored" // colored
          />

        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;