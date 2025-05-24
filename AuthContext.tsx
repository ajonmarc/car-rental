// AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import api from "../car-rental/src/config/axios"; // Import the axios instance

interface User {
  id: number;
  name: string;
  email: string;
  country: string;
  city: string;
  job: string;
  description: string | null;
  role: number;
  role_name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        const userData = await AsyncStorage.getItem('user');

        if (token && userData) {
          // Parse stored user data
          const parsedUser = JSON.parse(userData);
          // Temporarily set user to avoid flashing login screen
          setUser(parsedUser);

          // Verify token with /auth/me
          const response = await api.get('/auth/me');
          if (response.data.success) {
            setUser(response.data.data.user);
            // Redirect to appropriate dashboard
            if (response.data.data.user.role === 1) {
              router.replace('/partnerDashboard');
            } else {
              router.replace('/dashboard');
            }
          } else {
            // Invalid token, clear storage
            await AsyncStorage.removeItem('auth_token');
            await AsyncStorage.removeItem('user');
            setUser(null);
            router.replace('/login');
          }
        } else {
          setUser(null);
          router.replace('/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        await AsyncStorage.removeItem('auth_token');
        await AsyncStorage.removeItem('user');
        setUser(null);
        router.replace('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user');
      setUser(null);
      router.replace('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, logout }}>
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