import React, { createContext, useContext, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  preferences?: {
    dietaryRestrictions: string[];
    allergies: string[];
    cuisinePreferences: string[];
  };
}

interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  expiryDate?: string;
  carbonFootprint?: number;
}

interface MealPlan {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  duration?: string;
  preferences?: any;
  meals?: any[];
}

interface EcoAction {
  id: string;
  type: string;
  description: string;
  points: number;
  date: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User) => void;
  ingredients: Ingredient[];
  addIngredient: (ingredient: Ingredient) => void;
  updateIngredient: (id: string, updates: Partial<Ingredient>) => void;
  removeIngredient: (id: string) => void;
  mealPlans: MealPlan[];
  addMealPlan: (plan: MealPlan) => void;
  updateMealPlan: (id: string, updates: Partial<MealPlan>) => void;
  getMealPlanById: (id: string) => MealPlan | undefined;
  drinks: any[];
  addDrink: (drink: any) => void;
  specialMeals: any[];
  addSpecialMeal: (meal: any) => void;
  carbonFootprint: number;
  updateCarbonFootprint: (amount: number) => void;
  ecoActions: EcoAction[];
  addEcoAction: (action: EcoAction) => void;
  ecoPoints: number;
  addEcoPoints: (points: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [drinks, setDrinks] = useState<any[]>([]);
  const [specialMeals, setSpecialMeals] = useState<any[]>([]);
  const [carbonFootprint, setCarbonFootprint] = useState(0);
  const [ecoActions, setEcoActions] = useState<EcoAction[]>([]);
  const [ecoPoints, setEcoPoints] = useState(0);

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

  const updateCarbonFootprint = (amount: number) => {
    setCarbonFootprint(prev => prev + amount);
  };

  const addEcoAction = (action: EcoAction) => {
    setEcoActions(prev => [...prev, action]);
  };

  const addEcoPoints = (points: number) => {
    setEcoPoints(prev => prev + points);
  };

  const value = {
    user,
    setUser,
    ingredients,
    addIngredient,
    updateIngredient,
    removeIngredient,
    mealPlans,
    addMealPlan,
    updateMealPlan,
    getMealPlanById,
    drinks,
    addDrink,
    specialMeals,
    addSpecialMeal,
    carbonFootprint,
    updateCarbonFootprint,
    ecoActions,
    addEcoAction,
    ecoPoints,
    addEcoPoints,
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
