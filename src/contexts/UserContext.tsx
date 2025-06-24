
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  phone: string;
  isSubscribed: boolean;
  profile?: {
    weight: number;
    height: number;
    birthday: string;
    healthGoals: string[];
    dietTypes: string[];
    allergies: string[];
  };
}

interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, phone: string, wantsSubscription: boolean, profile?: any) => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    console.log('Mock: Login attempt:', { email, password });
    
    // Mock login process
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock user data
    const mockUser: User = {
      id: '1',
      email,
      phone: '+1 (555) 123-4567',
      isSubscribed: false,
    };
    
    setUser(mockUser);
    console.log('Mock: Login successful');
  };

  const signup = async (email: string, password: string, phone: string, wantsSubscription: boolean, profile?: any) => {
    console.log('Mock: Signup attempt:', { email, password, phone, wantsSubscription, profile });
    
    // Mock signup process
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock user creation
    const newUser: User = {
      id: '1',
      email,
      phone,
      isSubscribed: wantsSubscription,
      profile,
    };
    
    setUser(newUser);
    console.log('Mock: Signup successful, user created:', newUser);
  };

  const logout = () => {
    console.log('Mock: User logged out');
    setUser(null);
  };

  return (
    <UserContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      signup,
      logout,
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
