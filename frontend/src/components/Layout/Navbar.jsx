import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext_fixed';
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
    { path: '/mood', label: 'Mood' },
    { path: '/leaderboard', label: 'Leaderboard' },
    { path: '/gamification', label: 'Gamification' },
    { path: '/profile', label: 'Profile' }
  ];

  const NavLinks = ({ onLinkClick }) => (
    <>
      {navLinks.map(link => (
        <Link
          key={link.path}
          to={link.path}
          onClick={() => onLinkClick?.()}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            location.pathname === link.path
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          {link.label}
        </Link>
      ))}
    </>
  );

  return (
    <nav className="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center">
            <span className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
              🚀 ProductivityTracker
            </span>
          </Link>
          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-4">
              <NavLinks />
              <ThemeToggle />
              <button
                onClick={logout}
                className="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
            <button
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
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
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
            <div className="flex flex-col space-y-2">
              <NavLinks onLinkClick={() => setIsMobileMenuOpen(false)} />
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-3 sm:space-y-0 pt-3">
                <div className="flex items-center justify-between sm:justify-start">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300 mr-3">Theme</span>
                  <ThemeToggle />
                </div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-md text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
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