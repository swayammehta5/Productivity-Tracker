import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css';
import App from './App';

// Wrap localStorage access in a check
const getStoredTheme = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem('theme');
  }
  return null;
};

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Show error if Google Client ID is not configured
if (!GOOGLE_CLIENT_ID) {
  root.render(
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f3f4f6',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        maxWidth: '600px',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#ef4444', marginBottom: '20px' }}>⚠️ Configuration Error</h1>
        <p style={{ color: '#374151', marginBottom: '20px', fontSize: '16px' }}>
          Google OAuth Client ID is not configured. Please add <code style={{ backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>REACT_APP_GOOGLE_CLIENT_ID</code> to your environment variables in Render.
        </p>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          See <strong>GOOGLE_OAUTH_SETUP.md</strong> for setup instructions.
        </p>
      </div>
    </div>
  );
} else {
  root.render(
    <React.StrictMode>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    </React.StrictMode>
  );
}