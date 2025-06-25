import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  preferences: {
    dietaryRestrictions: string[];
    allergies: string[];
    cuisinePreferences: string[];
    cookingSkillLevel: 'beginner' | 'intermediate' | 'advanced';
    mealPrepTime: number;
    budgetRange: 'low' | 'medium' | 'high';
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

interface UserContextType {
  user: User | null;
  pantryItems: PantryItem[];
  shoppingItems: ShoppingItem[];
  mealPlans: MealPlan[];
  completedMeals: Record<string, string[]>;
  activeShoppingList: any[];
  setUser: (user: User | null) => void;
  addPantryItem: (item: Omit<PantryItem, 'id'>) => void;
  updatePantryItem: (id: string, updates: Partial<PantryItem>) => void;
  deletePantryItem: (id: string) => void;
  addShoppingItem: (item: Omit<ShoppingItem, 'id'>) => void;
  updateShoppingItem: (id: string, updates: Partial<ShoppingItem>) => void;
  deleteShoppingItem: (id: string) => void;
  toggleShoppingItemPurchased: (id: string) => void;
  addMealPlan: (plan: MealPlan) => void;
  deleteMealPlan: (id: string) => void;
  deleteMealFromPlan: (planId: string, mealId: string) => void;
  toggleMealCompletion: (mealId: string, date: string) => void;
  isMealCompleted: (mealId: string, date: string) => boolean;
  updatePantryFromMeal: (ingredients: string[]) => void;
  setActiveShoppingList: (list: any[]) => void;
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
      setMealPlans(JSON.parse(savedMealPlans));
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

  const addPantryItem = (item: Omit<PantryItem, 'id'>) => {
    const newItem: PantryItem = {
      ...item,
      id: Date.now().toString()
    };
    setPantryItems(prev => [...prev, newItem]);
  };

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

  const addMealPlan = (plan: MealPlan) => {
    setMealPlans(prev => [...prev, plan]);
  };

  const deleteMealPlan = (id: string) => {
    setMealPlans(prev => prev.filter(plan => plan.id !== id));
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

  const value = {
    user,
    pantryItems,
    shoppingItems,
    mealPlans,
    completedMeals,
    activeShoppingList,
    setUser,
    addPantryItem,
    updatePantryItem,
    deletePantryItem,
    addShoppingItem,
    updateShoppingItem,
    deleteShoppingItem,
    toggleShoppingItemPurchased,
    addMealPlan,
    deleteMealPlan,
    deleteMealFromPlan,
    toggleMealCompletion,
    isMealCompleted,
    updatePantryFromMeal,
    setActiveShoppingList,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
