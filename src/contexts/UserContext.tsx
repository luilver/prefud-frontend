
import React, { createContext, useContext, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  preferences?: {
    dietaryRestrictions: string[];
    allergies: string[];
    cuisinePreferences: string[];
  };
  subscription?: {
    isSubscribed: boolean;
    plan: string;
    nextBilling?: string;
    cancelAtPeriodEnd?: boolean;
    planLimits: {
      usedPlans: number;
      plansPerMonth: number;
      mealCreations: number;
      deliveryCommissions: number;
      homeDeliveries?: number;
    };
  };
}

interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  expiryDate: Date;
  carbonFootprint?: number;
  location?: string;
  purchaseDate?: Date;
  addedFromShoppingList?: boolean;
}

interface MealPlan {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  duration?: string;
  preferences?: any;
  meals?: any[];
  shoppingList?: any[];
}

interface EcoAction {
  id: string;
  type: string;
  description: string;
  points: number;
  date: string;
}

interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  purchased: boolean;
  price?: number;
  store?: string;
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
  amount: number;
  date: string;
  description: string;
  status: string;
  invoiceUrl?: string;
}

interface SubscriptionInfo {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User) => void;
  updateUserProfile: (updates: Partial<User>) => void;
  logout: () => void;
  signup: (userData: any) => Promise<void>;
  
  // Ingredients
  ingredients: Ingredient[];
  addIngredient: (ingredient: Ingredient) => void;
  updateIngredient: (id: string, updates: Partial<Ingredient>) => void;
  removeIngredient: (id: string) => void;
  deleteIngredient: (id: string) => void;
  updatePantryFromIngredients: (ingredients: any[]) => void;
  addPantryItem: (item: any) => void;
  
  // Meal Plans
  mealPlans: MealPlan[];
  addMealPlan: (plan: MealPlan) => void;
  updateMealPlan: (id: string, updates: Partial<MealPlan>) => void;
  getMealPlanById: (id: string) => MealPlan | undefined;
  
  // Drinks and Special Meals
  drinks: any[];
  addDrink: (drink: any) => void;
  specialMeals: any[];
  addSpecialMeal: (meal: any) => void;
  
  // Shopping
  shoppingItems: ShoppingItem[];
  addShoppingItem: (item: ShoppingItem) => void;
  updateShoppingItem: (id: string, updates: Partial<ShoppingItem>) => void;
  deleteShoppingItem: (id: string) => void;
  toggleShoppingItemPurchased: (id: string) => void;
  
  // Environment
  carbonFootprint: number;
  updateCarbonFootprint: (amount: number) => void;
  ecoActions: EcoAction[];
  addEcoAction: (action: EcoAction) => void;
  ecoPoints: number;
  addEcoPoints: (points: number) => void;
  
  // Billing and Payments
  paymentMethods: PaymentMethod[];
  billingHistory: BillingHistory[];
  subscriptionInfo: SubscriptionInfo | null;
  getBillingHistory: () => Promise<void>;
  getPaymentMethods: () => Promise<void>;
  addPaymentMethod: (method: any) => Promise<void>;
  deletePaymentMethod: (id: string) => Promise<void>;
  setDefaultPaymentMethod: (id: string) => Promise<void>;
  checkSubscription: () => Promise<void>;
  createCheckoutWithPaymentMethod: (plan: any, paymentMethodId: string) => Promise<string>;
  acceptSubscription: (planId: string) => Promise<void>;
  cancelSubscription: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>({
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    subscription: {
      isSubscribed: true,
      plan: 'family',
      planLimits: {
        usedPlans: 2,
        plansPerMonth: 5,
        mealCreations: 8,
        deliveryCommissions: 1
      }
    }
  });
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [drinks, setDrinks] = useState<any[]>([]);
  const [specialMeals, setSpecialMeals] = useState<any[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [carbonFootprint, setCarbonFootprint] = useState(0);
  const [ecoActions, setEcoActions] = useState<EcoAction[]>([]);
  const [ecoPoints, setEcoPoints] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      brand: 'visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true
    }
  ]);
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([]);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>({
    subscribed: true,
    subscription_tier: 'Family',
    subscription_end: '2024-12-31'
  });

  const updateUserProfile = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  const logout = () => {
    setUser(null);
  };

  const signup = async (userData: any) => {
    // Mock signup implementation
    console.log('Signing up user:', userData);
  };

  const addIngredient = (ingredient: Ingredient) => {
    setIngredients(prev => [...prev, ingredient]);
  };

  const updateIngredient = (id: string, updates: Partial<Ingredient>) => {
    setIngredients(prev => 
      prev.map(ingredient => 
        ingredient.id === id ? { ...ingredient, ...updates } : ingredient
      )
    );
  };

  const removeIngredient = (id: string) => {
    setIngredients(prev => prev.filter(ingredient => ingredient.id !== id));
  };

  const deleteIngredient = (id: string) => {
    removeIngredient(id);
  };

  const updatePantryFromIngredients = (newIngredients: any[]) => {
    // Mock implementation for updating pantry
    console.log('Updating pantry from ingredients:', newIngredients);
  };

  const addPantryItem = (item: any) => {
    const newIngredient: Ingredient = {
      id: `pantry-${Date.now()}`,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category,
      expiryDate: item.expiryDate || new Date(),
      location: item.location || 'Pantry',
      purchaseDate: new Date(),
      addedFromShoppingList: true
    };
    addIngredient(newIngredient);
  };

  const addMealPlan = (plan: MealPlan) => {
    setMealPlans(prev => [...prev, plan]);
  };

  const updateMealPlan = (id: string, updates: Partial<MealPlan>) => {
    setMealPlans(prev => 
      prev.map(plan => 
        plan.id === id ? { ...plan, ...updates } : plan
      )
    );
  };

  const getMealPlanById = (id: string) => {
    return mealPlans.find(plan => plan.id === id);
  };

  const addDrink = (drink: any) => {
    setDrinks(prev => [...prev, drink]);
  };

  const addSpecialMeal = (meal: any) => {
    setSpecialMeals(prev => [...prev, meal]);
  };

  const addShoppingItem = (item: ShoppingItem) => {
    setShoppingItems(prev => [...prev, item]);
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

  const updateCarbonFootprint = (amount: number) => {
    setCarbonFootprint(prev => prev + amount);
  };

  const addEcoAction = (action: EcoAction) => {
    setEcoActions(prev => [...prev, action]);
  };

  const addEcoPoints = (points: number) => {
    setEcoPoints(prev => prev + points);
  };

  // Mock billing and payment methods
  const getBillingHistory = async () => {
    console.log('Getting billing history');
  };

  const getPaymentMethods = async () => {
    console.log('Getting payment methods');
  };

  const addPaymentMethod = async (method: any) => {
    const newMethod: PaymentMethod = {
      id: Date.now().toString(),
      brand: method.brand || 'visa',
      last4: method.cardNumber?.slice(-4) || '0000',
      expiryMonth: parseInt(method.expiryDate?.split('/')[0]) || 12,
      expiryYear: parseInt('20' + method.expiryDate?.split('/')[1]) || 2025,
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

  const checkSubscription = async () => {
    console.log('Checking subscription status');
  };

  const createCheckoutWithPaymentMethod = async (plan: any, paymentMethodId: string) => {
    console.log('Creating checkout with payment method:', plan, paymentMethodId);
    return 'https://checkout.stripe.com/session';
  };

  const acceptSubscription = async (planId: string) => {
    console.log('Accepting subscription:', planId);
  };

  const cancelSubscription = async () => {
    console.log('Cancelling subscription');
  };

  const value = {
    user,
    setUser,
    updateUserProfile,
    logout,
    signup,
    ingredients,
    addIngredient,
    updateIngredient,
    removeIngredient,
    deleteIngredient,
    updatePantryFromIngredients,
    addPantryItem,
    mealPlans,
    addMealPlan,
    updateMealPlan,
    getMealPlanById,
    drinks,
    addDrink,
    specialMeals,
    addSpecialMeal,
    shoppingItems,
    addShoppingItem,
    updateShoppingItem,
    deleteShoppingItem,
    toggleShoppingItemPurchased,
    carbonFootprint,
    updateCarbonFootprint,
    ecoActions,
    addEcoAction,
    ecoPoints,
    addEcoPoints,
    paymentMethods,
    billingHistory,
    subscriptionInfo,
    getBillingHistory,
    getPaymentMethods,
    addPaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    checkSubscription,
    createCheckoutWithPaymentMethod,
    acceptSubscription,
    cancelSubscription,
  };

  return (
    <UserContext.Provider value={value}>
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
