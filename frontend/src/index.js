import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Wrap localStorage access in a check
const getStoredTheme = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem('theme');
  }
  return null;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);