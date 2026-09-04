import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Rehydrate session from localStorage
    try {
      const storedToken = localStorage.getItem('linktrack_token');
      const storedUser = localStorage.getItem('linktrack_user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Failed to parse cached user data', e);
      localStorage.removeItem('linktrack_token');
      localStorage.removeItem('linktrack_user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const data = await authService.login({ email, password });
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('linktrack_token', data.token);
    localStorage.setItem('linktrack_user', JSON.stringify(data.user));
    return data;
  };

  const register = async (name, email, password) => {
    return await authService.register({ name, email, password });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('linktrack_token');
    localStorage.removeItem('linktrack_user');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('linktrack_user', JSON.stringify(updatedUser));
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
