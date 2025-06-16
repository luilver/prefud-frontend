import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

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

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  expiryDate: Date;
  category: string;
  location?: string;
}

export interface MealPlan {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  meals: any[];
  createdAt: string;
}

interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  billingHistory: BillingHistory[];
  paymentMethods: PaymentMethod[];
  mealCompletions: MealCompletion[];
  ingredients: Ingredient[];
  mealPlans: MealPlan[];
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
  // Pantry management
  updatePantryFromMeal: (mealIngredients: string[]) => void;
  updatePantryFromIngredients: (updatedIngredients: Ingredient[]) => void;
  addIngredient: (ingredient: Ingredient) => void;
  deleteIngredient: (ingredientId: string) => void;
  // Meal plan management
  addMealPlan: (plan: MealPlan) => void;
  deleteMealPlan: (planId: string) => void;
  deleteMealFromPlan: (planId: string, mealId: string) => void;
  // User profile management
  updateUserProfile: (profileData: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [mealCompletions, setMealCompletions] = useState<MealCompletion[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load saved data from localStorage
    const savedUser = localStorage.getItem('user');
    const savedCompletions = localStorage.getItem('mealCompletions');
    const savedIngredients = localStorage.getItem('ingredients');
    const savedMealPlans = localStorage.getItem('mealPlans');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
    if (savedCompletions) {
      setMealCompletions(JSON.parse(savedCompletions));
    }
    if (savedIngredients) {
      const parsedIngredients = JSON.parse(savedIngredients);
      // Convert date strings back to Date objects
      const ingredientsWithDates = parsedIngredients.map((ing: any) => ({
        ...ing,
        expiryDate: new Date(ing.expiryDate)
      }));
      setIngredients(ingredientsWithDates);
    } else {
      // Initialize with default ingredients
      const defaultIngredients: Ingredient[] = [
        {
          id: "1",
          name: "Chicken Breast",
          quantity: 2,
          unit: "lbs",
          expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          category: "Meat",
          location: "Refrigerator"
        },
        {
          id: "2",
          name: "Greek Yogurt",
          quantity: 1,
          unit: "container",
          expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          category: "Dairy",
          location: "Refrigerator"
        },
        {
          id: "3",
          name: "Bananas",
          quantity: 6,
          unit: "pieces",
          expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          category: "Fruits",
          location: "Counter"
        }
      ];
      setIngredients(defaultIngredients);
    }
    if (savedMealPlans) {
      setMealPlans(JSON.parse(savedMealPlans));
    }
  }, []);

  // Save ingredients to localStorage whenever they change
  useEffect(() => {
    if (ingredients.length > 0) {
      localStorage.setItem('ingredients', JSON.stringify(ingredients));
    }
  }, [ingredients]);

  // Save meal plans to localStorage whenever they change
  useEffect(() => {
    if (mealPlans.length > 0) {
      localStorage.setItem('mealPlans', JSON.stringify(mealPlans));
    }
  }, [mealPlans]);

  const login = async (email: string, password: string) => {
    try {
      console.log('Login attempt:', { email, password });
      
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
      console.log('Signup attempt:', { email, password, phone, wantsSubscription });
      
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
    console.log('Adding payment method:', paymentData);
  };

  const updatePaymentMethod = async (methodId: string, paymentData: any) => {
    console.log('Updating payment method:', methodId, paymentData);
  };

  const deletePaymentMethod = async (methodId: string) => {
    console.log('Deleting payment method:', methodId);
    setPaymentMethods(methods => methods.filter(m => m.id !== methodId));
  };

  const setDefaultPaymentMethod = async (methodId: string) => {
    console.log('Setting default payment method:', methodId);
    setPaymentMethods(methods => 
      methods.map(m => ({ ...m, isDefault: m.id === methodId }))
    );
  };

  const acceptSubscription = async (planType: 'premium') => {
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
    console.log('Cancelling subscription');
    updateSubscription({
      cancelAtPeriodEnd: true,
    });
  };

  // Meal completion methods
  const toggleMealCompletion = (mealId: string, date: string) => {
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

  // New pantry management methods
  const updatePantryFromMeal = (mealIngredients: string[]) => {
    const updatedIngredients = ingredients.map(ingredient => {
      const usedIngredient = mealIngredients.find(mealIng => 
        mealIng.toLowerCase().includes(ingredient.name.toLowerCase())
      );
      
      if (usedIngredient) {
        // Reduce quantity by 1 or remove if quantity becomes 0
        const newQuantity = Math.max(0, ingredient.quantity - 1);
        return newQuantity > 0 ? { ...ingredient, quantity: newQuantity } : null;
      }
      return ingredient;
    }).filter(Boolean) as Ingredient[];

    setIngredients(updatedIngredients);
    
    toast({
      title: "Pantry Updated",
      description: "Ingredients have been updated based on meal completion.",
    });
  };

  const updatePantryFromIngredients = (updatedIngredients: Ingredient[]) => {
    setIngredients(updatedIngredients);
    
    toast({
      title: "Pantry Updated",
      description: "Your ingredient list has been updated.",
    });
  };

  const addIngredient = (ingredient: Ingredient) => {
    setIngredients(prev => [...prev, ingredient]);
    
    toast({
      title: "Ingredient Added",
      description: `${ingredient.name} has been added to your pantry.`,
    });
  };

  const deleteIngredient = (ingredientId: string) => {
    const ingredient = ingredients.find(ing => ing.id === ingredientId);
    setIngredients(prev => prev.filter(ing => ing.id !== ingredientId));
    
    toast({
      title: "Ingredient Removed",
      description: `${ingredient?.name} has been removed from your pantry.`,
    });
  };

  // Meal plan management methods
  const addMealPlan = (plan: MealPlan) => {
    setMealPlans(prev => [...prev, plan]);
    
    toast({
      title: "Meal Plan Created",
      description: `${plan.name} has been added to your meal plans.`,
    });
  };

  const deleteMealPlan = (planId: string) => {
    const plan = mealPlans.find(p => p.id === planId);
    setMealPlans(prev => prev.filter(p => p.id !== planId));
    
    // Also remove meal completions for this plan
    const planMealIds = plan?.meals.map(meal => meal.id) || [];
    setMealCompletions(prev => 
      prev.filter(completion => !planMealIds.includes(completion.mealId))
    );
    
    toast({
      title: "Meal Plan Deleted",
      description: `${plan?.name} and all its meals have been removed.`,
    });
  };

  const deleteMealFromPlan = (planId: string, mealId: string) => {
    setMealPlans(prev => 
      prev.map(plan => {
        if (plan.id === planId) {
          return {
            ...plan,
            meals: plan.meals.filter(meal => meal.id !== mealId)
          };
        }
        return plan;
      })
    );

    // Remove meal completions for this meal
    setMealCompletions(prev => 
      prev.filter(completion => completion.mealId !== mealId)
    );
    
    toast({
      title: "Meal Removed",
      description: "The meal has been removed from your plan.",
    });
  };

  // User profile management methods
  const updateUserProfile = (profileData: Partial<User>) => {
    if (user) {
      const updatedUser = {
        ...user,
        ...profileData,
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully updated.",
      });
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isAuthenticated,
        billingHistory,
        paymentMethods,
        mealCompletions,
        ingredients,
        mealPlans,
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
        updatePantryFromMeal,
        updatePantryFromIngredients,
        addIngredient,
        deleteIngredient,
        addMealPlan,
        deleteMealPlan,
        deleteMealFromPlan,
        updateUserProfile,
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
