import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  preferences: {
    dietaryRestrictions: string[];
    allergies: string[];
    cuisinePreferences: string[];
    cookingSkillLevel: 'beginner' | 'intermediate' | 'advanced';
    mealPrepTime: number;
    budgetRange: 'low' | 'medium' | 'high';
  };
  subscription: {
    plan: 'free' | 'premium';
    isSubscribed: boolean;
    nextBilling?: string;
    cancelAtPeriodEnd?: boolean;
    planLimits: {
      plansPerMonth: number;
      usedPlans: number;
    };
  };
}

interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  expiryDate: Date;
  purchaseDate: Date;
  location?: string;
  notes?: string;
}

interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  purchased: boolean;
  estimatedPrice?: number;
  notes?: string;
}

interface MealPlan {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  meals: any[];
  shoppingList?: any[];
  duration: string;
  preferences: any;
  weeks: any[];
}

interface BillingHistory {
  id: string;
  date: string;
  amount: number;
  description: string;
  status: 'paid' | 'pending' | 'failed';
  invoiceUrl?: string;
}

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

interface UserContextType {
  user: User | null;
  pantryItems: PantryItem[];
  shoppingItems: ShoppingItem[];
  mealPlans: MealPlan[];
  completedMeals: Record<string, string[]>;
  activeShoppingList: any[];
  activeMealPlan: MealPlan | null;
  ingredients: PantryItem[];
  billingHistory: BillingHistory[];
  paymentMethods: PaymentMethod[];
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (userData: any) => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => void;
  addPantryItem: (item: Omit<PantryItem, 'id'>) => void;
  updatePantryItem: (id: string, updates: Partial<PantryItem>) => void;
  deletePantryItem: (id: string) => void;
  addIngredient: (item: Omit<PantryItem, 'id'>) => void;
  deleteIngredient: (id: string) => void;
  updatePantryFromIngredients: (ingredients: string[]) => void;
  addShoppingItem: (item: Omit<ShoppingItem, 'id'>) => void;
  updateShoppingItem: (id: string, updates: Partial<ShoppingItem>) => void;
  deleteShoppingItem: (id: string) => void;
  toggleShoppingItemPurchased: (id: string) => void;
  addMealPlan: (plan: MealPlan) => void;
  deleteMealPlan: (id: string) => void;
  deleteMealFromPlan: (planId: string, mealId: string) => void;
  updateMealPlanShoppingList: (planId: string, shoppingList: any[]) => void;
  toggleMealCompletion: (mealId: string, date: string) => void;
  isMealCompleted: (mealId: string, date: string) => boolean;
  updatePantryFromMeal: (ingredients: string[]) => void;
  setActiveShoppingList: (list: any[]) => void;
  setActiveMealPlan: (plan: MealPlan | null) => void;
  getBillingHistory: () => Promise<void>;
  getPaymentMethods: () => Promise<void>;
  addPaymentMethod: (method: any) => Promise<void>;
  deletePaymentMethod: (id: string) => Promise<void>;
  setDefaultPaymentMethod: (id: string) => Promise<void>;
  acceptSubscription: (plan: string) => Promise<void>;
  cancelSubscription: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [completedMeals, setCompletedMeals] = useState<Record<string, string[]>>({});
  const [activeShoppingList, setActiveShoppingList] = useState<any[]>([]);
  const [activeMealPlan, setActiveMealPlan] = useState<MealPlan | null>(null);
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  // Computed properties
  const ingredients = pantryItems;
  const isAuthenticated = user !== null;

  // Load data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedPantryItems = localStorage.getItem('pantryItems');
    const savedShoppingItems = localStorage.getItem('shoppingItems');
    const savedMealPlans = localStorage.getItem('mealPlans');
    const savedCompletedMeals = localStorage.getItem('completedMeals');

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    if (savedPantryItems) {
      const items = JSON.parse(savedPantryItems);
      // Convert date strings back to Date objects
      const itemsWithDates = items.map((item: any) => ({
        ...item,
        expiryDate: new Date(item.expiryDate),
        purchaseDate: new Date(item.purchaseDate)
      }));
      setPantryItems(itemsWithDates);
    }
    if (savedShoppingItems) {
      setShoppingItems(JSON.parse(savedShoppingItems));
    }
    if (savedMealPlans) {
      const plans = JSON.parse(savedMealPlans);
      setMealPlans(plans);
      if (plans.length > 0) {
        setActiveMealPlan(plans[0]);
      }
    }
    if (savedCompletedMeals) {
      setCompletedMeals(JSON.parse(savedCompletedMeals));
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('pantryItems', JSON.stringify(pantryItems));
  }, [pantryItems]);

  useEffect(() => {
    localStorage.setItem('shoppingItems', JSON.stringify(shoppingItems));
  }, [shoppingItems]);

  useEffect(() => {
    localStorage.setItem('mealPlans', JSON.stringify(mealPlans));
  }, [mealPlans]);

  useEffect(() => {
    localStorage.setItem('completedMeals', JSON.stringify(completedMeals));
  }, [completedMeals]);

  // Authentication methods
  const login = async (email: string, password: string) => {
    // Mock login implementation
    const mockUser: User = {
      id: '1',
      name: 'John Doe',
      email: email,
      phone: '+1234567890',
      preferences: {
        dietaryRestrictions: [],
        allergies: [],
        cuisinePreferences: ['Italian', 'Mexican'],
        cookingSkillLevel: 'intermediate',
        mealPrepTime: 30,
        budgetRange: 'medium'
      },
      subscription: {
        plan: 'free',
        isSubscribed: false,
        planLimits: {
          plansPerMonth: 1,
          usedPlans: 0
        }
      }
    };
    setUser(mockUser);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    window.dispatchEvent(new CustomEvent('user-logout'));
  };

  const signup = async (userData: any) => {
    // Mock signup implementation
    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      preferences: userData.preferences || {
        dietaryRestrictions: [],
        allergies: [],
        cuisinePreferences: [],
        cookingSkillLevel: 'beginner',
        mealPrepTime: 30,
        budgetRange: 'medium'
      },
      subscription: {
        plan: 'free',
        isSubscribed: false,
        planLimits: {
          plansPerMonth: 1,
          usedPlans: 0
        }
      }
    };
    setUser(newUser);
  };

  const updateUserProfile = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  // Pantry/Ingredient methods
  const addPantryItem = (item: Omit<PantryItem, 'id'>) => {
    const newItem: PantryItem = {
      ...item,
      id: Date.now().toString()
    };
    setPantryItems(prev => [...prev, newItem]);
  };

  const addIngredient = addPantryItem;

  const updatePantryItem = (id: string, updates: Partial<PantryItem>) => {
    setPantryItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  const deletePantryItem = (id: string) => {
    setPantryItems(prev => prev.filter(item => item.id !== id));
  };

  const deleteIngredient = deletePantryItem;

  const updatePantryFromIngredients = (ingredientNames: string[]) => {
    ingredientNames.forEach(ingredientName => {
      const matchingItem = pantryItems.find(item => 
        ingredientName.toLowerCase().includes(item.name.toLowerCase())
      );
      
      if (matchingItem && matchingItem.quantity > 0) {
        updatePantryItem(matchingItem.id, {
          quantity: Math.max(0, matchingItem.quantity - 1)
        });
      }
    });
  };

  // Shopping methods
  const addShoppingItem = (item: Omit<ShoppingItem, 'id'>) => {
    const newItem: ShoppingItem = {
      ...item,
      id: Date.now().toString()
    };
    setShoppingItems(prev => [...prev, newItem]);
  };

  const updateShoppingItem = (id: string, updates: Partial<ShoppingItem>) => {
    setShoppingItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  const deleteShoppingItem = (id: string) => {
    setShoppingItems(prev => prev.filter(item => item.id !== id));
  };

  const toggleShoppingItemPurchased = (id: string) => {
    setShoppingItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, purchased: !item.purchased } : item
      )
    );
  };

  // Meal plan methods
  const addMealPlan = (plan: MealPlan) => {
    setMealPlans(prev => [...prev, plan]);
    if (!activeMealPlan) {
      setActiveMealPlan(plan);
    }
  };

  const deleteMealPlan = (id: string) => {
    setMealPlans(prev => prev.filter(plan => plan.id !== id));
    if (activeMealPlan?.id === id) {
      const remainingPlans = mealPlans.filter(plan => plan.id !== id);
      setActiveMealPlan(remainingPlans.length > 0 ? remainingPlans[0] : null);
    }
  };

  const deleteMealFromPlan = (planId: string, mealId: string) => {
    setMealPlans(prev => 
      prev.map(plan => 
        plan.id === planId 
          ? { ...plan, meals: plan.meals.filter(meal => meal.id !== mealId) }
          : plan
      )
    );
  };

  const updateMealPlanShoppingList = (planId: string, shoppingList: any[]) => {
    setMealPlans(prev => 
      prev.map(plan => 
        plan.id === planId 
          ? { ...plan, shoppingList }
          : plan
      )
    );
  };

  const toggleMealCompletion = (mealId: string, date: string) => {
    setCompletedMeals(prev => {
      const dateKey = date;
      const currentMeals = prev[dateKey] || [];
      
      if (currentMeals.includes(mealId)) {
        // Remove meal from completed list
        return {
          ...prev,
          [dateKey]: currentMeals.filter(id => id !== mealId)
        };
      } else {
        // Add meal to completed list
        return {
          ...prev,
          [dateKey]: [...currentMeals, mealId]
        };
      }
    });
  };

  const isMealCompleted = (mealId: string, date: string) => {
    const dateKey = date;
    const completedMealsForDate = completedMeals[dateKey] || [];
    return completedMealsForDate.includes(mealId);
  };

  const updatePantryFromMeal = (ingredients: string[]) => {
    // This is a simplified implementation
    // In a real app, you'd want more sophisticated ingredient matching
    ingredients.forEach(ingredient => {
      const matchingItem = pantryItems.find(item => 
        ingredient.toLowerCase().includes(item.name.toLowerCase())
      );
      
      if (matchingItem && matchingItem.quantity > 0) {
        updatePantryItem(matchingItem.id, {
          quantity: Math.max(0, matchingItem.quantity - 1)
        });
      }
    });
  };

  // Billing methods
  const getBillingHistory = async () => {
    // Mock implementation
    const mockHistory: BillingHistory[] = [
      {
        id: '1',
        date: new Date().toISOString(),
        amount: 9.99,
        description: 'Premium Plan - Monthly',
        status: 'paid',
        invoiceUrl: '#'
      }
    ];
    setBillingHistory(mockHistory);
  };

  const getPaymentMethods = async () => {
    // Mock implementation
    const mockMethods: PaymentMethod[] = [
      {
        id: '1',
        brand: 'visa',
        last4: '4242',
        expiryMonth: 12,
        expiryYear: 2025,
        isDefault: true
      }
    ];
    setPaymentMethods(mockMethods);
  };

  const addPaymentMethod = async (method: any) => {
    // Mock implementation
    const newMethod: PaymentMethod = {
      id: Date.now().toString(),
      brand: 'visa',
      last4: method.cardNumber.slice(-4),
      expiryMonth: parseInt(method.expiryDate.split('/')[0]),
      expiryYear: parseInt('20' + method.expiryDate.split('/')[1]),
      isDefault: paymentMethods.length === 0
    };
    setPaymentMethods(prev => [...prev, newMethod]);
  };

  const deletePaymentMethod = async (id: string) => {
    setPaymentMethods(prev => prev.filter(method => method.id !== id));
  };

  const setDefaultPaymentMethod = async (id: string) => {
    setPaymentMethods(prev => 
      prev.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
  };

  const acceptSubscription = async (plan: string) => {
    if (user) {
      setUser({
        ...user,
        subscription: {
          ...user.subscription,
          plan: plan as 'free' | 'premium',
          isSubscribed: true,
          planLimits: {
            plansPerMonth: plan === 'premium' ? 5 : 1,
            usedPlans: user.subscription.planLimits.usedPlans
          }
        }
      });
    }
  };

  const cancelSubscription = async () => {
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

  const value = {
    user,
    pantryItems,
    shoppingItems,
    mealPlans,
    completedMeals,
    activeShoppingList,
    activeMealPlan,
    ingredients,
    billingHistory,
    paymentMethods,
    isAuthenticated,
    setUser,
    login,
    logout,
    signup,
    updateUserProfile,
    addPantryItem,
    updatePantryItem,
    deletePantryItem,
    addIngredient,
    deleteIngredient,
    updatePantryFromIngredients,
    addShoppingItem,
    updateShoppingItem,
    deleteShoppingItem,
    toggleShoppingItemPurchased,
    addMealPlan,
    deleteMealPlan,
    deleteMealFromPlan,
    updateMealPlanShoppingList,
    toggleMealCompletion,
    isMealCompleted,
    updatePantryFromMeal,
    setActiveShoppingList,
    setActiveMealPlan,
    getBillingHistory,
    getPaymentMethods,
    addPaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    acceptSubscription,
    cancelSubscription,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
