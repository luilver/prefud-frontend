
import { createContext, useContext, useState, ReactNode } from 'react';

interface Subscription {
  plan: string;
  isSubscribed: boolean;
  nextBilling?: string;
  cancelAtPeriodEnd?: boolean;
  planLimits: {
    plansPerMonth: number;
    usedPlans: number;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subscription: Subscription;
  preferences?: any;
}

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

interface BillingHistoryItem {
  id: string;
  description: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  invoiceUrl?: string;
}

interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  expiryDate: Date;
  category?: string;
}

interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category?: string;
  purchased: boolean;
  price?: number;
}

interface UserContextType {
  user: User | null;
  isSignedIn: boolean;
  mealPlans: any[];
  healthyDrinks: any[];
  ingredients: Ingredient[];
  shoppingItems: ShoppingItem[];
  billingHistory: BillingHistoryItem[];
  paymentMethods: PaymentMethod[];
  subscriptionInfo: any;
  signin: (email: string, password: string) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  updateUserProfile: (userData: Partial<User>) => Promise<void>;
  checkSubscription: () => Promise<void>;
  addMealPlan: (plan: any) => void;
  updateMealPlan: (planId: string, updates: any) => void;
  getMealPlanById: (id: string) => any;
  addHealthyDrink: (drink: any) => void;
  getHealthyDrinkById: (id: string) => any;
  addIngredient: (ingredient: Ingredient) => void;
  updatePantryFromIngredients: (ingredientNames: string[]) => void;
  deleteIngredient: (id: string) => void;
  addPantryItem: (item: any) => void;
  addShoppingItem: (item: ShoppingItem) => void;
  updateShoppingItem: (id: string, updates: Partial<ShoppingItem>) => void;
  deleteShoppingItem: (id: string) => void;
  toggleShoppingItemPurchased: (id: string) => void;
  getBillingHistory: () => Promise<void>;
  getPaymentMethods: () => Promise<void>;
  addPaymentMethod: (method: any) => Promise<void>;
  deletePaymentMethod: (id: string) => Promise<void>;
  setDefaultPaymentMethod: (id: string) => Promise<void>;
  acceptSubscription: (plan: string) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  createCheckoutWithPaymentMethod: (planId: string, paymentMethodId: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [mealPlans, setMealPlans] = useState<any[]>([]);
  const [healthyDrinks, setHealthyDrinks] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [billingHistory, setBillingHistory] = useState<BillingHistoryItem[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);

  const signin = async (email: string, password: string) => {
    // Mock authentication
    const mockUser = {
      id: '1',
      name: 'John Doe',
      email: email,
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

  const signup = async (userData: any) => {
    const newUser = {
      id: Date.now().toString(),
      subscription: {
        plan: 'free',
        isSubscribed: false,
        planLimits: {
          plansPerMonth: 1,
          usedPlans: 0
        }
      },
      ...userData
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
    setMealPlans([]);
    setHealthyDrinks([]);
    setIngredients([]);
    setShoppingItems([]);
    setBillingHistory([]);
    setPaymentMethods([]);
    setSubscriptionInfo(null);
  };

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null);
  };

  const updateUserProfile = async (userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null);
  };

  const checkSubscription = async () => {
    // Mock subscription check
    console.log('Checking subscription status...');
  };

  const addMealPlan = (plan: any) => {
    setMealPlans(prev => {
      const existingIndex = prev.findIndex(p => p.id === plan.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = plan;
        return updated;
      }
      return [...prev, plan];
    });
  };

  const updateMealPlan = (planId: string, updates: any) => {
    setMealPlans(prev => prev.map(plan => 
      plan.id === planId ? { ...plan, ...updates } : plan
    ));
  };

  const getMealPlanById = (id: string) => {
    return mealPlans.find(plan => plan.id === id);
  };

  const addHealthyDrink = (drink: any) => {
    setHealthyDrinks(prev => {
      const existingIndex = prev.findIndex(d => d.id === drink.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = drink;
        return updated;
      }
      return [...prev, drink];
    });
  };

  const getHealthyDrinkById = (id: string) => {
    return healthyDrinks.find(drink => drink.id === id);
  };

  const addIngredient = (ingredient: Ingredient) => {
    setIngredients(prev => [...prev, ingredient]);
  };

  const updatePantryFromIngredients = (ingredientNames: string[]) => {
    // Mock implementation to update pantry based on used ingredients
    setIngredients(prev => prev.filter(ing => 
      !ingredientNames.some(name => 
        name.toLowerCase().includes(ing.name.toLowerCase()) || 
        ing.name.toLowerCase().includes(name.toLowerCase())
      )
    ));
  };

  const deleteIngredient = (id: string) => {
    setIngredients(prev => prev.filter(ing => ing.id !== id));
  };

  const addPantryItem = (item: any) => {
    const newIngredient: Ingredient = {
      id: Date.now().toString(),
      name: item.name,
      quantity: item.quantity || 1,
      unit: item.unit || 'piece',
      expiryDate: item.expiryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      category: item.category
    };
    addIngredient(newIngredient);
  };

  const addShoppingItem = (item: ShoppingItem) => {
    setShoppingItems(prev => [...prev, item]);
  };

  const updateShoppingItem = (id: string, updates: Partial<ShoppingItem>) => {
    setShoppingItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const deleteShoppingItem = (id: string) => {
    setShoppingItems(prev => prev.filter(item => item.id !== id));
  };

  const toggleShoppingItemPurchased = (id: string) => {
    setShoppingItems(prev => prev.map(item => 
      item.id === id ? { ...item, purchased: !item.purchased } : item
    ));
  };

  const getBillingHistory = async () => {
    // Mock billing history
    const mockHistory: BillingHistoryItem[] = [
      {
        id: '1',
        description: 'Premium Plan - Monthly',
        date: new Date().toISOString(),
        amount: 9.99,
        status: 'paid',
        invoiceUrl: '#'
      }
    ];
    setBillingHistory(mockHistory);
  };

  const getPaymentMethods = async () => {
    // Mock payment methods
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
    setPaymentMethods(prev => prev.map(method => ({
      ...method,
      isDefault: method.id === id
    })));
  };

  const acceptSubscription = async (plan: string) => {
    setUser(prev => prev ? {
      ...prev,
      subscription: {
        ...prev.subscription,
        plan: plan,
        isSubscribed: true,
        planLimits: {
          plansPerMonth: plan === 'premium' ? 5 : 1,
          usedPlans: 0
        }
      }
    } : null);
  };

  const cancelSubscription = async () => {
    setUser(prev => prev ? {
      ...prev,
      subscription: {
        ...prev.subscription,
        cancelAtPeriodEnd: true
      }
    } : null);
  };

  const createCheckoutWithPaymentMethod = async (planId: string, paymentMethodId: string) => {
    // Mock checkout implementation
    console.log('Creating checkout with payment method:', { planId, paymentMethodId });
  };

  return (
    <UserContext.Provider value={{
      user,
      isSignedIn: !!user,
      mealPlans,
      healthyDrinks,
      ingredients,
      shoppingItems,
      billingHistory,
      paymentMethods,
      subscriptionInfo,
      signin,
      signup,
      logout,
      updateUser,
      updateUserProfile,
      checkSubscription,
      addMealPlan,
      updateMealPlan,
      getMealPlanById,
      addHealthyDrink,
      getHealthyDrinkById,
      addIngredient,
      updatePantryFromIngredients,
      deleteIngredient,
      addPantryItem,
      addShoppingItem,
      updateShoppingItem,
      deleteShoppingItem,
      toggleShoppingItemPurchased,
      getBillingHistory,
      getPaymentMethods,
      addPaymentMethod,
      deletePaymentMethod,
      setDefaultPaymentMethod,
      acceptSubscription,
      cancelSubscription,
      createCheckoutWithPaymentMethod
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
