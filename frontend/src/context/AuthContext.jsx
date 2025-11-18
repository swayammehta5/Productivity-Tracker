import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  console.log('🔍 AuthProvider: Initializing...');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true); 
  // This prevents redirects before auth is checked

  useEffect(() => {
    console.log('🔍 AuthProvider: useEffect running...');
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('🔍 AuthProvider: No token found');
        setLoading(false);
        setInitializing(false);
        return;
      }

      try {
        console.log('🔍 AuthProvider: Loading user with token...');
        const response = await authAPI.getMe();
        setUser(response.data.user);
        console.log('🔍 AuthProvider: User loaded successfully');
      } catch (error) {
        console.error("Auth error:", error.message);
        localStorage.removeItem('token');
        setUser(null);
      }

      setLoading(false);
      setInitializing(false);
    };

    loadUser();
  }, []);

  const login = async (email, password, otp) => {
    const response = await authAPI.login({ email, password, otp });

    if (response.data.requires2FA) {
      return { requires2FA: true };
    }

    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);

    return response.data;
  };

  const register = async (name, email, password) => {
    const response = await authAPI.register({ name, email, password });

    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);

    return response.data;
  };

  const googleLogin = async (tokenId) => {
    const response = await authAPI.googleLogin(tokenId);

    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);

    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = (data) => {
    setUser(prev => ({ ...prev, ...data }));
  };

  const contextValue = {
    user,
    loading,
    initializing,
    login,
    register,
    googleLogin,
    logout,
    updateUser
  };

  console.log('🔍 AuthProvider: Rendering with context value:', { 
    hasUser: !!user, 
    loading, 
    initializing 
  });

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
export default AuthContext;