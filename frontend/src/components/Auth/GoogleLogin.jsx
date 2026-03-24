import React from 'react';
import { GoogleLogin as GoogleLoginButton } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const GoogleLogin = () => {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    try {
      console.log('🔍 GoogleLogin: Token received, length:', credentialResponse.credential?.length);
      console.log('🔍 GoogleLogin: Calling googleLogin with token...');
      const result = await googleLogin(credentialResponse.credential);
      console.log('🔍 GoogleLogin: Success!', result);
      toast.success('Successfully logged in with Google!');
      navigate('/');
    } catch (error) {
      console.error('🔍 GoogleLogin: Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        fullError: error
      });
      const errorMessage = error.response?.data?.message || error.message || 'Failed to login with Google';
      toast.error(errorMessage);
    }
  };

  const handleError = () => {
    toast.error('Google login failed. Please try again.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 transition-all duration-500 ease-in-out">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-300/30 to-amber-300/30 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-300/30 to-pink-300/30 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      <div className="relative max-w-md w-full mx-4">
        {/* Glassmorphism card */}
        <div className="backdrop-blur-xl bg-white/70 dark:bg-white/10 rounded-3xl shadow-glass border border-white/20 dark:border-white/10 p-8 animate-scale-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-400 to-amber-400 rounded-2xl mb-4 shadow-lg transform hover:scale-105 transition-transform duration-300">
              <span className="text-3xl">🎯</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-2">
              Productivity Tracker
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Start your journey to better habits
            </p>
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-700 dark:text-gray-200 mb-8 text-lg font-medium">
                Sign in with your Google account to continue
              </p>
              
              {/* Google Sign-In Button */}
              <div className="flex justify-center">
                <div className="transform hover:scale-105 transition-all duration-300 hover:shadow-glass-light dark:hover:shadow-glass-dark">
                  <GoogleLoginButton
                    onSuccess={handleSuccess}
                    onError={handleError}
                    useOneTap
                    theme="filled_black"
                    size="large"
                    text="signin_with"
                    shape="pill"
                  />
                </div>
              </div>
            </div>

            {/* Additional info */}
            <div className="text-center pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                By signing in, you agree to our terms and privacy policy
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Built with ❤️ for productivity enthusiasts
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoogleLogin;

