import React, { createContext, useState, useContext, useEffect } from 'react';

// Define the types for User, Ingredient, and ShoppingItem
export interface User {
  id: string;
  name: string;
  email: string;
  // Add other user properties as needed
}

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  // Add other ingredient properties as needed
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  purchased: boolean;
  // Add other shopping item properties as needed
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  mealPlans: any[];
  setMealPlans: (plans: any[]) => void;
  addMealPlan: (plan: any) => void;
  updateMealPlan: (planId: string, updatedPlan: any) => void;
  getMealPlanById: (planId: string) => any;
  ingredients: Ingredient[];
  setIngredients: (ingredients: Ingredient[]) => void;
  addIngredient: (ingredient: Ingredient) => void;
  updateIngredient: (id: string, ingredient: Partial<Ingredient>) => void;
  deleteIngredient: (id: string) => void;
  shoppingList: ShoppingItem[];
  setShoppingList: (items: ShoppingItem[]) => void;
  addToShoppingList: (item: ShoppingItem) => void;
  updateShoppingItem: (id: string, item: Partial<ShoppingItem>) => void;
  deleteFromShoppingList: (id: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [mealPlans, setMealPlans] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);

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

  const value: UserContextType = {
    user,
    setUser,
    mealPlans,
    setMealPlans,
    addMealPlan,
    updateMealPlan,
    getMealPlanById,
    ingredients,
    setIngredients,
    addIngredient,
    updateIngredient,
    deleteIngredient,
    shoppingList,
    setShoppingList,
    addToShoppingList,
    updateShoppingItem,
    deleteFromShoppingList,
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
