// Debug utility to check environment variables at build time
export const debugEnv = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('=== Environment Variables Debug ===');
    console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
    console.log('REACT_APP_GOOGLE_CLIENT_ID:', process.env.REACT_APP_GOOGLE_CLIENT_ID);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('===================================');
  }
};

