import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/habits', label: 'Habits', icon: '✅' },
    { path: '/tasks', label: 'Tasks', icon: '📝' },
    { path: '/calendar', label: 'Calendar', icon: '📅' },
    { path: '/reports', label: 'Reports', icon: '📈' },
    { path: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
    { path: '/gamification', label: 'Gamification', icon: '🎮' },
    { path: '/profile', label: 'Profile', icon: '👤' }
  ];

  const NavLinks = ({ onLinkClick, mobile = false }) => (
    <>
      {navLinks.map(link => (
        <Link
          key={link.path}
          to={link.path}
          onClick={() => onLinkClick?.()}
          className={`group relative px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
            location.pathname === link.path
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg dark:from-purple-500 dark:to-pink-500'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-orange-100 hover:to-amber-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30'
          } ${mobile ? 'w-full text-left' : ''}`}
        >
          <span className="flex items-center space-x-2">
            <span className="text-base">{link.icon}</span>
            <span className={`${mobile ? 'block' : 'hidden sm:inline'}`}>{link.label}</span>
          </span>
          {location.pathname === link.path && (
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 dark:from-purple-500 dark:to-pink-500 opacity-20 blur-sm"></div>
          )}
        </Link>
      ))}
    </>
  );

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-black/80 border-b border-white/20 dark:border-white/10 shadow-soft-lg transition-all duration-300">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 min-w-0">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 group transform hover:scale-105 transition-all duration-300 flex-shrink-0"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-400 dark:from-purple-400 dark:to-pink-400 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-glass-light dark:group-hover:shadow-glass-dark transition-all duration-300">
              <span className="text-xl">🚀</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent hidden sm:block">
              ProductivityTracker
            </span>
            <span className="text-lg font-bold bg-gradient-to-r from-orange-600 to-amber-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent sm:hidden">
              PT
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2 min-w-0">
            <div className="flex items-center space-x-1 bg-gray-100/50 dark:bg-gray-800/50 rounded-2xl p-1 backdrop-blur-sm flex-shrink-0">
              <NavLinks />
            </div>
            
            {/* Theme Toggle */}
            <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
              <div className="p-2 bg-gray-100/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm">
                <ThemeToggle />
              </div>
              
              {/* Logout Button */}
              <button
                onClick={logout}
                className="group px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-medium shadow-lg transform hover:scale-105 hover:shadow-glass transition-all duration-300 whitespace-nowrap"
              >
                <span className="flex items-center space-x-2">
                  <span>🚪</span>
                  <span className="hidden sm:inline">Logout</span>
                  <span className="sm:hidden">🚪</span>
                </span>
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden inline-flex items-center justify-center p-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 backdrop-blur-sm transition-all duration-300 transform hover:scale-105 flex-shrink-0"
            onClick={() => setIsMobileMenuOpen(prev => !prev)}
            aria-label="Toggle navigation"
          >
            <svg
              className="h-6 w-6 transition-transform duration-300"
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

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200/50 dark:border-gray-700/50 py-4 animate-slide-up overflow-x-hidden">
            <div className="flex flex-col space-y-3">
              <NavLinks mobile onLinkClick={() => setIsMobileMenuOpen(false)} />
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-3 sm:space-y-0 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center justify-between sm:justify-start p-3 bg-gray-100/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300 mr-3">Theme</span>
                  <ThemeToggle />
                </div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full sm:w-auto px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-medium shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>🚪</span>
                    <span>Logout</span>
                  </span>
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