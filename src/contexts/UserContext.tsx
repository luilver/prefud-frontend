
import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  subscription?: string;
  preferences?: any;
}

interface UserContextType {
  user: User | null;
  isSignedIn: boolean;
  mealPlans: any[];
  healthyDrinks: any[];
  signin: (email: string, password: string) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  addMealPlan: (plan: any) => void;
  getMealPlanById: (id: string) => any;
  addHealthyDrink: (drink: any) => void;
  getHealthyDrinkById: (id: string) => any;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [mealPlans, setMealPlans] = useState<any[]>([]);
  const [healthyDrinks, setHealthyDrinks] = useState<any[]>([]);

  const signin = async (email: string, password: string) => {
    // Mock authentication
    const mockUser = {
      id: '1',
      name: 'John Doe',
      email: email,
      subscription: 'free'
    };
    setUser(mockUser);
  };

  const signup = async (userData: any) => {
    const newUser = {
      id: Date.now().toString(),
      ...userData
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
    setMealPlans([]);
    setHealthyDrinks([]);
  };

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null);
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

  return (
    <UserContext.Provider value={{
      user,
      isSignedIn: !!user,
      mealPlans,
      healthyDrinks,
      signin,
      signup,
      logout,
      updateUser,
      addMealPlan,
      getMealPlanById,
      addHealthyDrink,
      getHealthyDrinkById
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
