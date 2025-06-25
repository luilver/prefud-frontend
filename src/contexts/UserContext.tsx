import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Subscription {
  isSubscribed: boolean;
  plan: 'free' | 'premium';
  planLimits: {
    plansPerMonth: number;
    usedPlans: number;
  };
  nextBilling?: string;
  cancelAtPeriodEnd?: boolean;
}

interface User {
  id: string;
  name?: string;
  email: string;
  phone: string;
  isSubscribed: boolean;
  subscription: Subscription;
  profile?: {
    weight: number;
    height: number;
    birthday: string;
    healthGoals: string[];
    dietTypes: string[];
    allergies: string[];
  };
}

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

interface BillingHistory {
  id: string;
  description: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'failed';
  invoiceUrl?: string;
}

interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  expiryDate: Date;
  location?: string;
}

interface MealPlan {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  meals: any[];
}

interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, phone: string, wantsSubscription: boolean, profile?: any) => Promise<void>;
  logout: () => void;
  updateUserProfile: (profile: any) => Promise<void>;
  
  // Subscription & Billing
  billingHistory: BillingHistory[];
  paymentMethods: PaymentMethod[];
  getBillingHistory: () => Promise<void>;
  getPaymentMethods: () => Promise<void>;
  addPaymentMethod: (method: any) => Promise<void>;
  deletePaymentMethod: (methodId: string) => Promise<void>;
  setDefaultPaymentMethod: (methodId: string) => Promise<void>;
  acceptSubscription: (plan: string) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  
  // Ingredients
  ingredients: Ingredient[];
  addIngredient: (ingredient: any) => void;
  deleteIngredient: (id: string) => void;
  updatePantryFromIngredients: (ingredients: string[]) => void;
  
  // Meal Planning
  mealPlans: MealPlan[];
  addMealPlan: (plan: any) => void;
  deleteMealPlan: (id: string) => void;
  deleteMealFromPlan: (planId: string, mealId: string) => void;
  toggleMealCompletion: (mealId: string, date: string) => void;
  isMealCompleted: (mealId: string, date: string) => boolean;
  updatePantryFromMeal: (ingredients: string[]) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [completedMeals, setCompletedMeals] = useState<Record<string, string[]>>({});

  const login = async (email: string, password: string) => {
    console.log('Mock: Login attempt:', { email, password });
    
    // Mock login process
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock user data
    const mockUser: User = {
      id: '1',
      name: 'John Doe',
      email,
      phone: '+1 (555) 123-4567',
      isSubscribed: false,
      subscription: {
        isSubscribed: false,
        plan: 'free',
        planLimits: {
          plansPerMonth: 1,
          usedPlans: 0
        }
      }
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
      name: profile?.name || 'New User',
      email,
      phone,
      isSubscribed: wantsSubscription,
      subscription: {
        isSubscribed: wantsSubscription,
        plan: wantsSubscription ? 'premium' : 'free',
        planLimits: {
          plansPerMonth: wantsSubscription ? 5 : 1,
          usedPlans: 0
        },
        nextBilling: wantsSubscription ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined
      },
      profile,
    };
    
    setUser(newUser);
    console.log('Mock: Signup successful, user created:', newUser);
  };

  const logout = () => {
    console.log('Mock: User logged out');
    setUser(null);
    
    // Dispatch a custom event to notify other components about logout
    window.dispatchEvent(new CustomEvent('user-logout'));
  };

  const updateUserProfile = async (profile: any) => {
    console.log('Mock: Updating user profile:', profile);
    if (user) {
      setUser({ ...user, profile, name: profile.name || user.name });
    }
  };

  // Billing methods
  const getBillingHistory = async () => {
    console.log('Mock: Getting billing history');
    setBillingHistory([
      {
        id: '1',
        description: 'Premium Plan - Monthly',
        amount: 9.99,
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'paid',
        invoiceUrl: '#'
      }
    ]);
  };

  const getPaymentMethods = async () => {
    console.log('Mock: Getting payment methods');
    setPaymentMethods([
      {
        id: '1',
        brand: 'visa',
        last4: '4242',
        expiryMonth: 12,
        expiryYear: 2025,
        isDefault: true
      }
    ]);
  };

  const addPaymentMethod = async (method: any) => {
    console.log('Mock: Adding payment method:', method);
    const newMethod: PaymentMethod = {
      id: Date.now().toString(),
      brand: 'visa',
      last4: method.cardNumber.slice(-4),
      expiryMonth: parseInt(method.expiryDate.split('/')[0]),
      expiryYear: 2000 + parseInt(method.expiryDate.split('/')[1]),
      isDefault: paymentMethods.length === 0
    };
    setPaymentMethods([...paymentMethods, newMethod]);
  };

  const deletePaymentMethod = async (methodId: string) => {
    console.log('Mock: Deleting payment method:', methodId);
    setPaymentMethods(paymentMethods.filter(m => m.id !== methodId));
  };

  const setDefaultPaymentMethod = async (methodId: string) => {
    console.log('Mock: Setting default payment method:', methodId);
    setPaymentMethods(paymentMethods.map(m => ({
      ...m,
      isDefault: m.id === methodId
    })));
  };

  const acceptSubscription = async (plan: string) => {
    console.log('Mock: Accepting subscription:', plan);
    if (user) {
      setUser({
        ...user,
        isSubscribed: true,
        subscription: {
          ...user.subscription,
          isSubscribed: true,
          plan: plan as 'free' | 'premium',
          planLimits: {
            plansPerMonth: plan === 'premium' ? 5 : 1,
            usedPlans: 0
          },
          nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      });
    }
  };

  const cancelSubscription = async () => {
    console.log('Mock: Canceling subscription');
    if (user) {
      setUser({
        ...user,
        subscription: {
          ...user.subscription,
          cancelAtPeriodEnd: true
        }
      });
    }
  };

  // Ingredient methods
  const addIngredient = (ingredient: any) => {
    console.log('Mock: Adding ingredient:', ingredient);
    const newIngredient: Ingredient = {
      id: Date.now().toString(),
      ...ingredient,
      expiryDate: new Date(ingredient.expiryDate)
    };
    setIngredients([...ingredients, newIngredient]);
  };

  const deleteIngredient = (id: string) => {
    console.log('Mock: Deleting ingredient:', id);
    setIngredients(ingredients.filter(i => i.id !== id));
  };

  const updatePantryFromIngredients = (ingredientNames: string[]) => {
    console.log('Mock: Updating pantry from ingredients:', ingredientNames);
    // Mock implementation - would normally reduce quantities
  };

  // Meal planning methods
  const addMealPlan = (plan: any) => {
    console.log('Mock: Adding meal plan:', plan);
    const newPlan: MealPlan = {
      id: Date.now().toString(),
      ...plan
    };
    setMealPlans([...mealPlans, newPlan]);
  };

  const deleteMealPlan = (id: string) => {
    console.log('Mock: Deleting meal plan:', id);
    setMealPlans(mealPlans.filter(p => p.id !== id));
  };

  const deleteMealFromPlan = (planId: string, mealId: string) => {
    console.log('Mock: Deleting meal from plan:', { planId, mealId });
    setMealPlans(mealPlans.map(plan => 
      plan.id === planId 
        ? { ...plan, meals: plan.meals.filter(m => m.id !== mealId) }
        : plan
    ));
  };

  const toggleMealCompletion = (mealId: string, date: string) => {
    console.log('Mock: Toggling meal completion:', { mealId, date });
    setCompletedMeals(prev => {
      const dateKey = date;
      const currentMeals = prev[dateKey] || [];
      const isCompleted = currentMeals.includes(mealId);
      
      return {
        ...prev,
        [dateKey]: isCompleted 
          ? currentMeals.filter(id => id !== mealId)
          : [...currentMeals, mealId]
      };
    });
  };

  const isMealCompleted = (mealId: string, date: string): boolean => {
    const dateKey = date;
    return (completedMeals[dateKey] || []).includes(mealId);
  };

  const updatePantryFromMeal = (ingredientNames: string[]) => {
    console.log('Mock: Updating pantry from meal:', ingredientNames);
    // Mock implementation - would normally reduce quantities
  };

  return (
    <UserContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      signup,
      logout,
      updateUserProfile,
      billingHistory,
      paymentMethods,
      getBillingHistory,
      getPaymentMethods,
      addPaymentMethod,
      deletePaymentMethod,
      setDefaultPaymentMethod,
      acceptSubscription,
      cancelSubscription,
      ingredients,
      addIngredient,
      deleteIngredient,
      updatePantryFromIngredients,
      mealPlans,
      addMealPlan,
      deleteMealPlan,
      deleteMealFromPlan,
      toggleMealCompletion,
      isMealCompleted,
      updatePantryFromMeal,
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
