import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '@/types';
import api from '@/lib/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');

    if (savedUser && savedToken) {
      setState({
        user: JSON.parse(savedUser),
        token: savedToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const response = await api.post('/auth/login', { email, password });

      const { token, user } = response.data;

      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);

      setState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });

      return { success: true };
    } catch (error: any) {
      setState(prev => ({ ...prev, isLoading: false }));
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const response = await api.post('/auth/register', { name, email, password });

      const { token, user } = response.data;

      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);

      setState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });

      return { success: true };
    } catch (error: any) {
      setState(prev => ({ ...prev, isLoading: false }));
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const updateProfile = (data: Partial<User>) => {
    if (state.user) {
      const updatedUser = { ...state.user, ...data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setState(prev => ({ ...prev, user: updatedUser }));
    }
  };

  const forgotPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    // In production, this would send a reset email
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateProfile, forgotPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
