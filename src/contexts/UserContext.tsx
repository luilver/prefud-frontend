
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  subscription: {
    isSubscribed: boolean;
    plan: 'free' | 'premium';
    planLimits: {
      plansPerMonth: number;
      usedPlans: number;
    };
    billingCycle: 'monthly' | 'yearly';
    nextBilling?: string;
    cancelAtPeriodEnd?: boolean;
  };
  createdAt: string;
}

interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, phone: string, wantsSubscription: boolean) => Promise<void>;
  logout: () => void;
  updateSubscription: (subscriptionData: any) => void;
  canCreatePlan: () => boolean;
  incrementPlanUsage: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in (from localStorage or your service)
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // TODO: Replace with your service call
      console.log('Login attempt:', { email, password });
      
      // Mock user data - replace with actual API response
      const mockUser: User = {
        id: '1',
        email,
        phone: '+1234567890',
        name: 'John Doe',
        subscription: {
          isSubscribed: false,
          plan: 'free',
          planLimits: {
            plansPerMonth: 1,
            usedPlans: 0,
          },
          billingCycle: 'monthly',
        },
        createdAt: new Date().toISOString(),
      };

      setUser(mockUser);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, phone: string, wantsSubscription: boolean) => {
    try {
      // TODO: Replace with your service call
      console.log('Signup attempt:', { email, password, phone, wantsSubscription });
      
      // Mock user data - replace with actual API response
      const mockUser: User = {
        id: Date.now().toString(),
        email,
        phone,
        name: email.split('@')[0],
        subscription: {
          isSubscribed: wantsSubscription,
          plan: wantsSubscription ? 'premium' : 'free',
          planLimits: {
            plansPerMonth: wantsSubscription ? 5 : 1,
            usedPlans: 0,
          },
          billingCycle: 'monthly',
          nextBilling: wantsSubscription ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        },
        createdAt: new Date().toISOString(),
      };

      setUser(mockUser);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

  const updateSubscription = (subscriptionData: any) => {
    if (user) {
      const updatedUser = {
        ...user,
        subscription: {
          ...user.subscription,
          ...subscriptionData,
        },
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const canCreatePlan = () => {
    if (!user) return false;
    return user.subscription.planLimits.usedPlans < user.subscription.planLimits.plansPerMonth;
  };

  const incrementPlanUsage = () => {
    if (user && canCreatePlan()) {
      const updatedUser = {
        ...user,
        subscription: {
          ...user.subscription,
          planLimits: {
            ...user.subscription.planLimits,
            usedPlans: user.subscription.planLimits.usedPlans + 1,
          },
        },
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        signup,
        logout,
        updateSubscription,
        canCreatePlan,
        incrementPlanUsage,
      }}
    >
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
