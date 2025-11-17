import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  // Load user data on initial mount
  useEffect(() => {
    let isMounted = true;
    
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        if (isMounted) {
          setLoading(false);
          setInitializing(false);
        }
        return;
      }

      try {
        const response = await authAPI.getMe();
        if (isMounted) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error("Auth error:", error.message);
        localStorage.removeItem('token');
      } finally {
        if (isMounted) {
          setLoading(false);
          setInitializing(false);
        }
      }
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email, password, otp) => {
    try {
      setLoading(true);
      const response = await authAPI.login({ email, password, otp });

      if (response.data.requires2FA) {
        return { requires2FA: true };
      }

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        return { success: true };
      }

      throw new Error('No token received from server');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    try {
      setLoading(true);
      const response = await authAPI.register({ name, email, password });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        return { success: true };
      }
      
      throw new Error('Registration failed');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  const updateUser = useCallback((data) => {
    setUser(prev => ({
      ...prev,
      ...data
    }));
  }, []);

  const value = {
    user,
    loading,
    initializing,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
