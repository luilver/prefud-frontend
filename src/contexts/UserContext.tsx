
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

export interface BillingHistory {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  description: string;
  invoiceUrl?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card';
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

export interface MealCompletion {
  mealId: string;
  date: string;
  completed: boolean;
}

interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  billingHistory: BillingHistory[];
  paymentMethods: PaymentMethod[];
  mealCompletions: MealCompletion[];
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, phone: string, wantsSubscription: boolean) => Promise<void>;
  logout: () => void;
  updateSubscription: (subscriptionData: any) => void;
  canCreatePlan: () => boolean;
  incrementPlanUsage: () => void;
  // Billing management
  getBillingHistory: () => Promise<BillingHistory[]>;
  getPaymentMethods: () => Promise<PaymentMethod[]>;
  addPaymentMethod: (paymentData: any) => Promise<void>;
  updatePaymentMethod: (methodId: string, paymentData: any) => Promise<void>;
  deletePaymentMethod: (methodId: string) => Promise<void>;
  setDefaultPaymentMethod: (methodId: string) => Promise<void>;
  acceptSubscription: (planType: 'premium') => Promise<void>;
  cancelSubscription: () => Promise<void>;
  // Meal completion
  toggleMealCompletion: (mealId: string, date: string) => void;
  isMealCompleted: (mealId: string, date: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [mealCompletions, setMealCompletions] = useState<MealCompletion[]>([]);

  useEffect(() => {
    // Check if user is logged in (from localStorage or your service)
    const savedUser = localStorage.getItem('user');
    const savedCompletions = localStorage.getItem('mealCompletions');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
    if (savedCompletions) {
      setMealCompletions(JSON.parse(savedCompletions));
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

  // Billing management methods
  const getBillingHistory = async (): Promise<BillingHistory[]> => {
    // TODO: Replace with your API call
    const mockHistory: BillingHistory[] = [
      {
        id: '1',
        date: '2024-05-01',
        amount: 9.99,
        status: 'paid',
        description: 'Pantry Premium - Monthly',
        invoiceUrl: '#'
      },
      {
        id: '2',
        date: '2024-04-01',
        amount: 9.99,
        status: 'paid',
        description: 'Pantry Premium - Monthly',
        invoiceUrl: '#'
      }
    ];
    setBillingHistory(mockHistory);
    return mockHistory;
  };

  const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
    // TODO: Replace with your API call
    const mockMethods: PaymentMethod[] = [
      {
        id: '1',
        type: 'card',
        last4: '4242',
        brand: 'visa',
        expiryMonth: 12,
        expiryYear: 2025,
        isDefault: true
      }
    ];
    setPaymentMethods(mockMethods);
    return mockMethods;
  };

  const addPaymentMethod = async (paymentData: any) => {
    // TODO: Replace with your API call
    console.log('Adding payment method:', paymentData);
  };

  const updatePaymentMethod = async (methodId: string, paymentData: any) => {
    // TODO: Replace with your API call
    console.log('Updating payment method:', methodId, paymentData);
  };

  const deletePaymentMethod = async (methodId: string) => {
    // TODO: Replace with your API call
    console.log('Deleting payment method:', methodId);
    setPaymentMethods(methods => methods.filter(m => m.id !== methodId));
  };

  const setDefaultPaymentMethod = async (methodId: string) => {
    // TODO: Replace with your API call
    console.log('Setting default payment method:', methodId);
    setPaymentMethods(methods => 
      methods.map(m => ({ ...m, isDefault: m.id === methodId }))
    );
  };

  const acceptSubscription = async (planType: 'premium') => {
    // TODO: Replace with your API call
    console.log('Accepting subscription:', planType);
    updateSubscription({
      isSubscribed: true,
      plan: planType,
      planLimits: {
        plansPerMonth: 5,
        usedPlans: user?.subscription.planLimits.usedPlans || 0,
      },
      nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
  };

  const cancelSubscription = async () => {
    // TODO: Replace with your API call
    console.log('Cancelling subscription');
    updateSubscription({
      cancelAtPeriodEnd: true,
    });
  };

  // Meal completion methods
  const toggleMealCompletion = (mealId: string, date: string) => {
    const completionKey = `${mealId}-${date}`;
    const existingIndex = mealCompletions.findIndex(
      c => c.mealId === mealId && c.date === date
    );

    let newCompletions;
    if (existingIndex >= 0) {
      newCompletions = [...mealCompletions];
      newCompletions[existingIndex].completed = !newCompletions[existingIndex].completed;
    } else {
      newCompletions = [...mealCompletions, {
        mealId,
        date,
        completed: true
      }];
    }

    setMealCompletions(newCompletions);
    localStorage.setItem('mealCompletions', JSON.stringify(newCompletions));
  };

  const isMealCompleted = (mealId: string, date: string) => {
    const completion = mealCompletions.find(
      c => c.mealId === mealId && c.date === date
    );
    return completion?.completed || false;
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isAuthenticated,
        billingHistory,
        paymentMethods,
        mealCompletions,
        login,
        signup,
        logout,
        updateSubscription,
        canCreatePlan,
        incrementPlanUsage,
        getBillingHistory,
        getPaymentMethods,
        addPaymentMethod,
        updatePaymentMethod,
        deletePaymentMethod,
        setDefaultPaymentMethod,
        acceptSubscription,
        cancelSubscription,
        toggleMealCompletion,
        isMealCompleted,
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
