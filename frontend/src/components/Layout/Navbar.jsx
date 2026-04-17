import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: '/', label: 'Dashboard' },
    { path: '/habits', label: 'Habits' },
    { path: '/tasks', label: 'Tasks' },
    { path: '/calendar', label: 'Calendar' },
    { path: '/reports', label: 'Reports' },
    { path: '/leaderboard', label: 'Leaderboard' },
    { path: '/gamification', label: 'Gamification' },
    { path: '/profile', label: 'Profile' }
  ];
  const aiLinks = [
    { path: '/ai/habit-coach', label: 'AI Habit Coach' },
    { path: '/ai/task-prioritizer', label: 'AI Task Prioritizer' },
    { path: '/ai/weekly-insights', label: 'AI Weekly Insights' }
  ];

  const NavLinks = ({ onLinkClick }) => (
    <>
      {navLinks.map(link => (
        <Link
          key={link.path}
          to={link.path}
          onClick={() => onLinkClick?.()}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            location.pathname === link.path
              ? 'text-white shadow-md'
              : 'theme-text-secondary hover:text-[var(--text-primary)] hover:bg-[color-mix(in_srgb,var(--card)_70%,var(--primary)_30%)]'
          }`}
          style={location.pathname === link.path ? { backgroundImage: 'linear-gradient(to right, var(--primary), var(--secondary))' } : undefined}
        >
          {link.label}
        </Link>
      ))}
      <span className="hidden lg:inline text-xs uppercase tracking-wider theme-text-secondary ml-2 mr-1">AI Assistant</span>
      {aiLinks.map(link => (
        <Link
          key={link.path}
          to={link.path}
          onClick={() => onLinkClick?.()}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            location.pathname === link.path
              ? 'text-white shadow-md'
              : 'theme-text-secondary hover:text-[var(--text-primary)] hover:bg-[color-mix(in_srgb,var(--card)_70%,var(--primary)_30%)]'
          }`}
          style={location.pathname === link.path ? { backgroundImage: 'linear-gradient(to right, var(--primary), var(--secondary))' } : undefined}
        >
          {link.label}
        </Link>
      ))}
    </>
  );

  return (
    <nav className="sticky top-0 z-40 backdrop-blur border-b border-[var(--border)] bg-[color:color-mix(in_srgb,var(--card)_88%,transparent)] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center">
            <span className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
              🚀 ProductivityTracker
            </span>
          </Link>
          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-4">
              <NavLinks />
              <ThemeToggle />
              <button
                onClick={logout}
                className="btn-primary text-sm px-4 py-2 rounded-lg"
              >
                Logout
              </button>
            </div>
            <button
              className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--card)] focus:outline-none"
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              aria-label="Toggle navigation"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-[var(--border)] py-4">
            <div className="flex flex-col space-y-2">
              <NavLinks onLinkClick={() => setIsMobileMenuOpen(false)} />
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-3 sm:space-y-0 pt-3">
                <p className="text-xs uppercase tracking-wider theme-text-secondary">AI Assistant: Habit Coach, Task Prioritizer, Weekly Insights</p>
                <div className="flex items-center justify-between sm:justify-start">
                  <span className="text-sm font-medium theme-text-secondary mr-3">Theme</span>
                  <ThemeToggle />
                </div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full sm:w-auto btn-primary text-sm px-4 py-2"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
export default Navbar;