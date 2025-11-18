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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              🎯 Productivity Tracker
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Start your journey to better habits
            </p>
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Sign in with your Google account to continue
              </p>
              <div className="flex justify-center">
                <GoogleLoginButton
                  onSuccess={handleSuccess}
                  onError={handleError}
                  useOneTap
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleLogin;

