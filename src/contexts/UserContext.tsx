import React, { createContext, useState, useContext, useEffect } from 'react';

// Define the types for User, Ingredient, and ShoppingItem
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  country?: string;
  language?: string;
  preferences?: {
    dietaryRestrictions?: string[];
    cuisinePreferences?: string[];
    allergies?: string[];
  };
  subscription?: {
    isSubscribed: boolean;
    plan: string;
    planLimits: {
      plansPerMonth: number;
      usedPlans: number;
    };
    nextBilling?: string;
    cancelAtPeriodEnd?: boolean;
  };
}

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  quantity?: number;
  unit?: string;
  expiryDate?: Date;
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  purchased: boolean;
}

export interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  expiryDate?: Date;
  purchaseDate?: Date;
  notes?: string;
}

export interface AIMeal {
  id: string;
  name: string;
  cuisine: string;
  cookingTime: number;
  difficulty: string;
  description: string;
  tags?: string[];
  ingredients?: any[];
  instructions?: string[];
  calories?: number;
}

export interface AIDrink {
  id: string;
  name: string;
  type: string;
  prepTime: string;
  calories: number;
  description: string;
  nutritionHighlights?: string[];
  ingredients?: any[];
  instructions?: string[];
}

export interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

export interface BillingHistory {
  id: string;
  description: string;
  amount: number;
  date: string;
  status: string;
  invoiceUrl?: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  logout: () => void;
  updateUserProfile: (profileData: any) => Promise<void>;
  checkSubscription: () => Promise<void>;
  
  // Meal Plans
  mealPlans: any[];
  setMealPlans: (plans: any[]) => void;
  addMealPlan: (plan: any) => void;
  updateMealPlan: (planId: string, updatedPlan: any) => void;
  getMealPlanById: (planId: string) => any;
  refreshMealPlans: () => Promise<void>;
  deleteMealFromPlan: (planId: string, mealId: string) => void;
  toggleMealCompletion: (mealId: string, date: string) => void;
  isMealCompleted: (mealId: string, date: string) => boolean;
  
  // Ingredients
  ingredients: Ingredient[];
  setIngredients: (ingredients: Ingredient[]) => void;
  addIngredient: (ingredient: Ingredient) => void;
  updateIngredient: (id: string, ingredient: Partial<Ingredient>) => void;
  deleteIngredient: (id: string) => void;
  updatePantryFromIngredients: (ingredients: any[]) => void;
  
  // Pantry
  pantryItems: PantryItem[];
  addPantryItem: (item: PantryItem) => void;
  
  // Shopping List
  shoppingList: ShoppingItem[];
  setShoppingList: (items: ShoppingItem[]) => void;
  addToShoppingList: (item: ShoppingItem) => void;
  updateShoppingItem: (id: string, item: Partial<ShoppingItem>) => void;
  deleteFromShoppingList: (id: string) => void;
  shoppingItems: ShoppingItem[];
  addShoppingItem: (item: ShoppingItem) => void;
  deleteShoppingItem: (id: string) => void;
  toggleShoppingItemPurchased: (id: string) => void;
  
  // AI Meals
  aiMeals: AIMeal[];
  addAIMeal: (meal: AIMeal) => void;
  deleteAIMeal: (id: string) => void;
  
  // AI Drinks
  aiDrinks: AIDrink[];
  addAIDrink: (drink: AIDrink) => void;
  deleteAIDrink: (id: string) => void;
  
  // Billing & Payments
  billingHistory: BillingHistory[];
  paymentMethods: PaymentMethod[];
  getBillingHistory: () => Promise<void>;
  getPaymentMethods: () => Promise<void>;
  addPaymentMethod: (method: any) => Promise<void>;
  deletePaymentMethod: (methodId: string) => Promise<void>;
  setDefaultPaymentMethod: (methodId: string) => Promise<void>;
  acceptSubscription: (plan: string) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  createCheckoutWithPaymentMethod: (plan: string, methodId: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [mealPlans, setMealPlans] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [aiMeals, setAiMeals] = useState<AIMeal[]>([]);
  const [aiDrinks, setAiDrinks] = useState<AIDrink[]>([]);
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [completedMeals, setCompletedMeals] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load user data from localStorage on component mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Load ingredients from localStorage on component mount
    const storedIngredients = localStorage.getItem('ingredients');
    if (storedIngredients) {
      setIngredients(JSON.parse(storedIngredients));
    }

     // Load shopping list from localStorage on component mount
     const storedShoppingList = localStorage.getItem('shoppingList');
     if (storedShoppingList) {
       setShoppingList(JSON.parse(storedShoppingList));
     }
  }, []);

  useEffect(() => {
    // Save user data to localStorage whenever it changes
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user'); // Remove user from localStorage when logging out
    }
  }, [user]);

  useEffect(() => {
    // Save ingredients to localStorage whenever it changes
    localStorage.setItem('ingredients', JSON.stringify(ingredients));
  }, [ingredients]);

  useEffect(() => {
    // Save shopping list to localStorage whenever it changes
    localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
  }, [shoppingList]);

  useEffect(() => {
    // Load pantry items from localStorage
    const storedPantryItems = localStorage.getItem('pantryItems');
    if (storedPantryItems) {
      setPantryItems(JSON.parse(storedPantryItems));
    }

    // Load AI meals from localStorage
    const storedAiMeals = localStorage.getItem('aiMeals');
    if (storedAiMeals) {
      setAiMeals(JSON.parse(storedAiMeals));
    }

    // Load AI drinks from localStorage
    const storedAiDrinks = localStorage.getItem('aiDrinks');
    if (storedAiDrinks) {
      setAiDrinks(JSON.parse(storedAiDrinks));
    }

    // Load completed meals from localStorage
    const storedCompletedMeals = localStorage.getItem('completedMeals');
    if (storedCompletedMeals) {
      setCompletedMeals(new Set(JSON.parse(storedCompletedMeals)));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('pantryItems', JSON.stringify(pantryItems));
  }, [pantryItems]);

  useEffect(() => {
    localStorage.setItem('aiMeals', JSON.stringify(aiMeals));
  }, [aiMeals]);

  useEffect(() => {
    localStorage.setItem('aiDrinks', JSON.stringify(aiDrinks));
  }, [aiDrinks]);

  useEffect(() => {
    localStorage.setItem('completedMeals', JSON.stringify(Array.from(completedMeals)));
  }, [completedMeals]);

  // Auth methods
  const isAuthenticated = !!user;
  
  const login = async (email: string, password: string) => {
    console.log('Login attempt for:', email);
    // Mock login - replace with actual auth logic
    setUser({
      id: '1',
      name: 'Test User',
      email,
      subscription: {
        isSubscribed: false,
        plan: 'free',
        planLimits: {
          plansPerMonth: 1,
          usedPlans: 0
        }
      }
    });
  };

  const signup = async (userData: any) => {
    console.log('Signup attempt:', userData);
    // Mock signup - replace with actual auth logic
    setUser({
      id: '1',
      name: userData.name || 'New User',
      email: userData.email,
      subscription: {
        isSubscribed: false,
        plan: 'free',
        planLimits: {
          plansPerMonth: 1,
          usedPlans: 0
        }
      }
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateUserProfile = async (profileData: any) => {
    console.log('Updating user profile:', profileData);
    if (user) {
      setUser({ ...user, ...profileData });
    }
  };

  const checkSubscription = async () => {
    console.log('Checking subscription status');
    // Mock subscription check - replace with actual logic
  };

  const addMealPlan = (plan: any) => {
    console.log('Adding meal plan to context:', plan);
    setMealPlans(prev => {
      // Check if plan already exists to avoid duplicates
      const exists = prev.some(p => p.id === plan.id);
      if (exists) {
        // Update existing plan
        return prev.map(p => p.id === plan.id ? plan : p);
      } else {
        // Add new plan
        return [...prev, plan];
      }
    });
  };

  const updateMealPlan = (planId: string, updatedPlan: any) => {
    setMealPlans(prev =>
      prev.map(plan => (plan.id === planId ? updatedPlan : plan))
    );
  };

  const getMealPlanById = (planId: string) => {
    return mealPlans.find(plan => plan.id === planId);
  };

  const refreshMealPlans = async () => {
    console.log('Refreshing meal plans from API');
    // Mock API call - replace with actual implementation
  };

  const deleteMealFromPlan = (planId: string, mealId: string) => {
    setMealPlans(prev =>
      prev.map(plan => {
        if (plan.id === planId) {
          return {
            ...plan,
            meals: plan.meals.filter((meal: any) => meal.id !== mealId)
          };
        }
        return plan;
      })
    );
  };

  const toggleMealCompletion = (mealId: string, date: string) => {
    const key = `${mealId}-${date}`;
    setCompletedMeals(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const isMealCompleted = (mealId: string, date: string) => {
    return completedMeals.has(`${mealId}-${date}`);
  };

  const addIngredient = (ingredient: Ingredient) => {
    setIngredients(prev => [...prev, ingredient]);
  };

  const updateIngredient = (id: string, ingredient: Partial<Ingredient>) => {
    setIngredients(prev =>
      prev.map(item => (item.id === id ? { ...item, ...ingredient } : item))
    );
  };

  const deleteIngredient = (id: string) => {
    setIngredients(prev => prev.filter(item => item.id !== id));
  };

  const updatePantryFromIngredients = (ingredients: any[]) => {
    const newPantryItems = ingredients.map((ingredient, index) => ({
      id: `pantry-${Date.now()}-${index}`,
      name: ingredient.name || ingredient,
      quantity: ingredient.quantity || 1,
      unit: ingredient.unit || 'piece',
      category: ingredient.category || 'other',
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      purchaseDate: new Date(),
      notes: 'Added from AI meal creation'
    }));
    
    setPantryItems(prev => [...prev, ...newPantryItems]);
  };

  // Pantry methods
  const addPantryItem = (item: PantryItem) => {
    setPantryItems(prev => [...prev, item]);
  };

  const addToShoppingList = (item: ShoppingItem) => {
    setShoppingList(prev => [...prev, item]);
  };

  const updateShoppingItem = (id: string, item: Partial<ShoppingItem>) => {
    setShoppingList(prev =>
      prev.map(shoppingItem => (shoppingItem.id === id ? { ...shoppingItem, ...item } : shoppingItem))
    );
  };

  const deleteFromShoppingList = (id: string) => {
    setShoppingList(prev => prev.filter(item => item.id !== id));
  };

  // Shopping methods (both sets for compatibility)
  const shoppingItems = shoppingList; // Alias for compatibility
  
  const addShoppingItem = (item: ShoppingItem) => {
    setShoppingList(prev => [...prev, item]);
  };

  const deleteShoppingItem = (id: string) => {
    setShoppingList(prev => prev.filter(item => item.id !== id));
  };

  const toggleShoppingItemPurchased = (id: string) => {
    setShoppingList(prev =>
      prev.map(item => (item.id === id ? { ...item, purchased: !item.purchased } : item))
    );
  };

  // AI Meals methods
  const addAIMeal = (meal: AIMeal) => {
    setAiMeals(prev => [...prev, meal]);
  };

  const deleteAIMeal = (id: string) => {
    setAiMeals(prev => prev.filter(meal => meal.id !== id));
  };

  // AI Drinks methods
  const addAIDrink = (drink: AIDrink) => {
    setAiDrinks(prev => [...prev, drink]);
  };

  const deleteAIDrink = (id: string) => {
    setAiDrinks(prev => prev.filter(drink => drink.id !== id));
  };

  // Billing methods
  const getBillingHistory = async () => {
    console.log('Getting billing history');
    // Mock data - replace with actual API call
    setBillingHistory([]);
  };

  const getPaymentMethods = async () => {
    console.log('Getting payment methods');
    // Mock data - replace with actual API call
    setPaymentMethods([]);
  };

  const addPaymentMethod = async (method: any) => {
    console.log('Adding payment method:', method);
    // Mock implementation - replace with actual API call
  };

  const deletePaymentMethod = async (methodId: string) => {
    console.log('Deleting payment method:', methodId);
    setPaymentMethods(prev => prev.filter(method => method.id !== methodId));
  };

  const setDefaultPaymentMethod = async (methodId: string) => {
    console.log('Setting default payment method:', methodId);
    setPaymentMethods(prev =>
      prev.map(method => ({
        ...method,
        isDefault: method.id === methodId
      }))
    );
  };

  const acceptSubscription = async (plan: string) => {
    console.log('Accepting subscription:', plan);
    // Mock implementation - replace with actual API call
  };

  const cancelSubscription = async () => {
    console.log('Cancelling subscription');
    // Mock implementation - replace with actual API call
  };

  const createCheckoutWithPaymentMethod = async (plan: string, methodId: string) => {
    console.log('Creating checkout with payment method:', plan, methodId);
    // Mock implementation - replace with actual API call
  };

  const value: UserContextType = {
    user,
    setUser,
    isAuthenticated,
    login,
    signup,
    logout,
    updateUserProfile,
    checkSubscription,
    mealPlans,
    setMealPlans,
    addMealPlan,
    updateMealPlan,
    getMealPlanById,
    refreshMealPlans,
    deleteMealFromPlan,
    toggleMealCompletion,
    isMealCompleted,
    ingredients,
    setIngredients,
    addIngredient,
    updateIngredient,
    deleteIngredient,
    updatePantryFromIngredients,
    pantryItems,
    addPantryItem,
    shoppingList,
    setShoppingList,
    addToShoppingList,
    updateShoppingItem,
    deleteFromShoppingList,
    shoppingItems,
    addShoppingItem,
    deleteShoppingItem,
    toggleShoppingItemPurchased,
    aiMeals,
    addAIMeal,
    deleteAIMeal,
    aiDrinks,
    addAIDrink,
    deleteAIDrink,
    billingHistory,
    paymentMethods,
    getBillingHistory,
    getPaymentMethods,
    addPaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    acceptSubscription,
    cancelSubscription,
    createCheckoutWithPaymentMethod,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
