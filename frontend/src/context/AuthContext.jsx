import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true); 
  // This prevents redirects before auth is checked

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        setInitializing(false);
        return;
      }

      try {
        const response = await authAPI.getMe();
        setUser(response.data.user);
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

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = (data) => {
    setUser(prev => ({ ...prev, ...data }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        initializing,
        login,
        register,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export default AuthContext;