
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/authService';

interface AuthUser {
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  expirationToken: string;
  token: string;
  userId: string;
  profile?: {
    _id: string;
    name: string;
    lastName: string;
    weight: number;
    height: number;
    birthday: string;
    healthGoals: {
      dailyCaloriesGoal: number;
      mealsPerDay: number;
      personCount: number;
      _id: string;
    };
    dietTypes: string[];
    alergies: string[];
    phone: string;
    userId: string;
    ruku_client_id: string;
    suscription_id: string;
    addressId: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('authUser');
    const savedToken = localStorage.getItem('authToken');
    
    if (savedUser && savedToken) {
      const parsedUser = JSON.parse(savedUser);
      // Check if token is expired
      if (authService.isTokenExpired(parsedUser.expirationToken)) {
        // Token expired, clear storage
        localStorage.removeItem('authUser');
        localStorage.removeItem('authToken');
      } else {
        setUser(parsedUser);
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      
      const userData: AuthUser = {
        email: response.email,
        isActive: response.isActive,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
        expirationToken: response.expirationToken,
        token: response.token,
        userId: response.userId,
        profile: response.profile
      };

      // Store user data and token
      localStorage.setItem('authUser', JSON.stringify(userData));
      localStorage.setItem('authToken', response.token);
      
      setUser(userData);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authUser');
    localStorage.removeItem('authToken');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
