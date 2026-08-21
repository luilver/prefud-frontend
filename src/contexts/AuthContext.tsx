
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/authService';
import { isNativePlatform } from '@/services/revenueCatService';
import { storageService } from '@/services/storageService';

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
    phonePrefix?: string;
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
  loginFirebase: (token: string) => Promise<void | any>;
  logout: () => void;
  isLoading: boolean;
   updateSubscription: (subscription: AuthUser['subscription']) => void;
   refreshProfile: () => Promise<void>;
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

  // Load user from storage on mount to persist session
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedUser = await storageService.getItem('authUser');
        const savedToken = await storageService.getItem('authToken');
        
        if (savedUser && savedToken) {
          let parsedUser = JSON.parse(savedUser);
          let tokenToUse = savedToken;
          
          // Check if token is expired
          if (authService.isTokenExpired(parsedUser.expirationToken)) {
            if (parsedUser.refreshToken) {
              console.log('Token expired, attempting refresh...');
              try {
                const refreshResponse = await authService.refreshToken(parsedUser.refreshToken);
                // Update tokens and user data
                parsedUser = refreshResponse;
                tokenToUse = refreshResponse.token;
                
                await storageService.setItem('authUser', JSON.stringify(parsedUser));
                await storageService.setItem('authToken', tokenToUse);
                console.log('Session refreshed successfully');
              } catch (refreshError) {
                console.log('Refresh failed, clearing session');
                await storageService.removeItem('authUser');
                await storageService.removeItem('authToken');
                setIsLoading(false);
                return;
              }
            } else {
              // Token expired, no refresh token, clear storage
              await storageService.removeItem('authUser');
              await storageService.removeItem('authToken');
              console.log('Session expired, cleared storage');
              setIsLoading(false);
              return;
            }
          }
          
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
      } catch (error) {
        console.error('Error restoring session:', error);
        // Clear potentially corrupted data
        await storageService.removeItem('authUser');
        await storageService.removeItem('authToken');
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
      await storageService.setItem('authUser', JSON.stringify(userData));
      await storageService.setItem('authToken', response.token);
      
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

      // Return the user data so it can be used immediately
      return userData;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginFirebase = async (token: string) => {
    setIsLoading(true);
    try {
      const response = await authService.loginFirebase(token);
      
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
      await storageService.setItem('authUser', JSON.stringify(userData));
      await storageService.setItem('authToken', response.token);
      
      setUser(userData);
      console.log('Firebase Login successful, session saved');
      
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

      // Return the user data so it can be used immediately
      return userData;
    } catch (error) {
      console.error('Firebase Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };


  const logout = async () => {
    console.log('Logging out and clearing all session data');
    
    // Clear user state
    setUser(null);
    
    // Clean all session-related data from storage for security
    const keysToRemove = [
      'authUser', 'authToken', 'userSubscription',
      'user', 'pantryItems', 'shoppingItems', 'mealPlans',
      'completedMeals', 'subscriptionInfo', 'aiMeals',
      'aiDrinks', 'favoriteMeals', 'pantry-cart'
    ];
    for (const key of keysToRemove) {
      await storageService.removeItem(key);
    }
    
    // Clear subscription context via sync event
    window.dispatchEvent(new CustomEvent('subscription-sync', { detail: { subscription: null } }));
    
    
    console.log('Session cleanup completed');
  };

//update subscription
const updateSubscription = async (newSubscription: AuthUser['subscription']) => {
  setUser(prevUser => 
    prevUser ? { ...prevUser, subscription: newSubscription } : prevUser
  );

  // Keep session persistence updated
  const savedUser = await storageService.getItem('authUser');
  if (savedUser) {
    const parsedUser = JSON.parse(savedUser);
    parsedUser.subscription = newSubscription;
    await storageService.setItem('authUser', JSON.stringify(parsedUser));
  }

  // Trigger subscription-sync event
  window.dispatchEvent(
    new CustomEvent('subscription-sync', { detail: { subscription: newSubscription } })
  );
};


  const refreshProfile = async () => {
    if (!user) return;
    try {
      const profile = await authService.getProfile(user.userId);
      setUser(prev => {
        if (!prev) return prev;
        const updatedUser = { ...prev, profile };
        storageService.setItem('authUser', JSON.stringify(updatedUser)).catch(console.error);
        
        // Trigger profile-sync event for UserContext
        window.dispatchEvent(
          new CustomEvent('profile-sync', { detail: { profile } })
        );
        
        return updatedUser;
      });
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  };

  const value = {
    user,
    setUser,
    isAuthenticated: !!user,
    login,
    loginFirebase,
    logout,
    isLoading,
    updateSubscription,
    refreshProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
