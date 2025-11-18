import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css';
import App from './App';

// Debug: Log environment variables (will be replaced at build time)
console.log('🔍 Build-time Environment Check:');
console.log('REACT_APP_GOOGLE_CLIENT_ID:', process.env.REACT_APP_GOOGLE_CLIENT_ID || '(NOT SET)');
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL || '(NOT SET)');

// Wrap localStorage access in a check
const getStoredTheme = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem('theme');
  }
  return null;
};

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

// Additional debug
console.log('🔍 Runtime Check - GOOGLE_CLIENT_ID value:', GOOGLE_CLIENT_ID || '(EMPTY)');
console.log('🔍 Runtime Check - GOOGLE_CLIENT_ID length:', GOOGLE_CLIENT_ID ? GOOGLE_CLIENT_ID.length : 0);

const root = ReactDOM.createRoot(document.getElementById('root'));

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
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
            <h1 style={{ color: '#ef4444', marginBottom: '20px' }}>⚠️ Application Error</h1>
            <p style={{ color: '#374151', marginBottom: '20px', fontSize: '16px' }}>
              {this.state.error?.message || 'An error occurred while loading the application.'}
            </p>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '10px' }}>
              Please check the browser console for more details.
            </p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 20px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Always render the app, but handle missing Client ID gracefully
try {
  if (!GOOGLE_CLIENT_ID) {
    root.render(
      <React.StrictMode>
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
            <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '20px' }}>
              Current value: (empty)
            </p>
          </div>
        </div>
      </React.StrictMode>
    );
  } else {
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <App />
          </GoogleOAuthProvider>
        </ErrorBoundary>
      </React.StrictMode>
    );
  }
} catch (error) {
  console.error('Fatal error rendering app:', error);
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
        <h1 style={{ color: '#ef4444', marginBottom: '20px' }}>⚠️ Fatal Error</h1>
        <p style={{ color: '#374151', marginBottom: '20px', fontSize: '16px' }}>
          {error.message || 'A fatal error occurred while loading the application.'}
        </p>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Please check the browser console for more details.
        </p>
      </div>
    </div>
  );
}