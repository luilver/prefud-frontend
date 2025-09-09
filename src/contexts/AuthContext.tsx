
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/authService';

interface AuthUser {
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  expirationToken: string;
  token: string;
  userId: string;
  profile?: {
    _id: string;
    name: string;
    lastName: string;
    weight: number;
    height: number;
    birthday: string;
    healthGoals: {
      dailyCaloriesGoal: number;
      mealsPerDay: number;
      personCount: number;
      _id: string;
    };
    dietTypes: string[];
    alergies: string[];
    phone: string;
    userId: string;
    ruku_client_id: string;
    suscription_id: string;
    languages?: string;
    country?: string;
    addressId: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  pantry?: {
    _id: string;
    name: string;
    quantity: number;
    unit: string;
    category: string;
    expiryDate: string;
    purchaseDate: string;
    location?: string;
    notes?: string;
    classification: string;
    carbonFootPrintToWaste: number;
    daysToExpire: number;
    dayAdded: string;
  }[];
  originalPantryResponse?: {
    _id: string;
    user_id: string;
    ingredients: any[];
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  subscription?: {
    userId: string;
    subscriptionTypeId: string;
    dayOfTheMonth: number;
    dateStarted: string;
    status: boolean;
    mealPlans: number;
    specialMeals: number;
    healthyDrinks: number;
    generateMeals: number;
    _id: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  } | null;
}

interface AuthContextType {
  user: AuthUser | null;
  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void | any>;
  logout: () => void;
  isLoading: boolean;
   updateSubscription: (subscription: AuthUser['subscription']) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount to persist session
  useEffect(() => {
    const restoreSession = () => {
      try {
        const savedUser = localStorage.getItem('authUser');
        const savedToken = localStorage.getItem('authToken');
        
        if (savedUser && savedToken) {
          const parsedUser = JSON.parse(savedUser);
          
          // Check if token is expired
          if (authService.isTokenExpired(parsedUser.expirationToken)) {
            // Token expired, clear storage
            localStorage.removeItem('authUser');
            localStorage.removeItem('authToken');
            console.log('Session expired, cleared storage');
          } else {
            // Valid session, restore user
            setUser(parsedUser);
            console.log('Session restored successfully');
            
            // Trigger pantry sync event for UserContext
            if (parsedUser.pantry) {
              window.dispatchEvent(new CustomEvent('pantry-sync', { 
                detail: { 
                  pantry: parsedUser.pantry,
                  originalPantryResponse: parsedUser.originalPantryResponse
                } 
              }));
            }

            // Trigger subscription sync event for SubscriptionContext
            if (parsedUser.subscription) {
              window.dispatchEvent(new CustomEvent('subscription-sync', { 
                detail: { subscription: parsedUser.subscription } 
              }));
            }
          }
        }
      } catch (error) {
        console.error('Error restoring session:', error);
        // Clear potentially corrupted data
        localStorage.removeItem('authUser');
        localStorage.removeItem('authToken');
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      
      const userData: AuthUser = {
        email: response.email,
        isActive: response.isActive,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
        expirationToken: response.expirationToken,
        token: response.token,
        userId: response.userId,
        profile: response.profile,
        pantry: response.pantry.transformedItems,
        originalPantryResponse: response.pantry.originalResponse,
        subscription: response.subscription
      };

      // Store user data and token for session persistence
      localStorage.setItem('authUser', JSON.stringify(userData));
      localStorage.setItem('authToken', response.token);
      
      setUser(userData);
      console.log('Login successful, session saved');
      
      // Trigger pantry sync event for UserContext with both formats
      if (response.pantry.transformedItems) {
        window.dispatchEvent(new CustomEvent('pantry-sync', { 
          detail: { 
            pantry: response.pantry.transformedItems,
            originalPantryResponse: response.pantry.originalResponse
          } 
        }));
      }

      // Trigger subscription sync event for SubscriptionContext
      if (response.subscription) {
        window.dispatchEvent(new CustomEvent('subscription-sync', { 
          detail: { subscription: response.subscription } 
        }));
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('Logging out and clearing all session data');
    
    // Clear user state
    setUser(null);
    
    // Clean all authentication-related data from localStorage for security
    localStorage.removeItem('authUser');
    localStorage.removeItem('authToken');
    
    // Optional: Clear any other session-related data if needed in the future
    // This ensures complete cleanup without affecting other app data
    const keysToRemove = ['authUser', 'authToken'];
    keysToRemove.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('Session cleanup completed');
  };

//update subscription
const updateSubscription = (newSubscription: AuthUser['subscription']) => {
  setUser(prevUser => 
    prevUser ? { ...prevUser, subscription: newSubscription } : prevUser
  );

  // Keep session persistence updated
  const savedUser = localStorage.getItem('authUser');
  if (savedUser) {
    const parsedUser = JSON.parse(savedUser);
    parsedUser.subscription = newSubscription;
    localStorage.setItem('authUser', JSON.stringify(parsedUser));
  }

  // Trigger subscription-sync event
  window.dispatchEvent(
    new CustomEvent('subscription-sync', { detail: { subscription: newSubscription } })
  );
};


  const value = {
    user,
    setUser,
    isAuthenticated: !!user,
    login,
    logout,
    isLoading,
    updateSubscription
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
