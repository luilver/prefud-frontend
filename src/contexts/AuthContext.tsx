
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthUser {
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  expirationToken: string;
  token: string;
  userId: string;
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
      const expirationTime = new Date(parsedUser.expirationToken).getTime();
      const currentTime = new Date().getTime();
      
      if (currentTime < expirationTime) {
        setUser(parsedUser);
      } else {
        // Token expired, clear storage
        localStorage.removeItem('authUser');
        localStorage.removeItem('authToken');
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Mock API call - replace with actual endpoint later
      const mockResponse = {
        email: email,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        expirationToken: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        token: "mock-jwt-token-" + Date.now(),
        userId: "mock-user-id-" + Math.random().toString(36).substr(2, 9)
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Store user data and token
      localStorage.setItem('authUser', JSON.stringify(mockResponse));
      localStorage.setItem('authToken', mockResponse.token);
      
      setUser(mockResponse);
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
