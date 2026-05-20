
import React, { createContext, useContext, useState, useEffect } from 'react';

interface SubscriptionInfo {
  userId: string;
  subscriptionTypeId: string;
  dayOfTheMonth: number;
  dateStarted: string;
  status: boolean;
  mealPlans: number;
  specialMeals: number;
  healthyDrinks: number;
  generateMeals: number;
  processImages: number;
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface SubscriptionContextType {
  subscription: SubscriptionInfo | null;
  setSubscription: (subscription: SubscriptionInfo | null) => void;
  isActive: boolean;
  hasActivePlans: boolean;
  canCreateMealPlan: boolean;
  canCreateSpecialMeal: boolean;
  canCreateHealthyDrink: boolean;
  canGenerateMeal: boolean;
  canProcessImage: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);

  // Load subscription from localStorage on mount
  useEffect(() => {
    const savedSubscription = localStorage.getItem('userSubscription');
    if (savedSubscription) {
      try {
        const parsedSubscription = JSON.parse(savedSubscription);
        setSubscription(parsedSubscription);
        console.log('Subscription restored from localStorage:', parsedSubscription);
      } catch (error) {
        console.error('Error parsing saved subscription:', error);
        localStorage.removeItem('userSubscription');
      }
    }
  }, []);

  // Save subscription to localStorage whenever it changes
  useEffect(() => {
    if (subscription) {
      localStorage.setItem('userSubscription', JSON.stringify(subscription));
      console.log('Subscription saved to localStorage:', subscription);
    } else {
      localStorage.removeItem('userSubscription');
    }
  }, [subscription]);

  // Listen for subscription sync events from AuthContext
  useEffect(() => {
    const handleSubscriptionSync = (event: CustomEvent) => {
      const { subscription: subscriptionData } = event.detail;
      console.log('Syncing subscription from auth:', subscriptionData);
      setSubscription(subscriptionData);
    };

    window.addEventListener('subscription-sync', handleSubscriptionSync as EventListener);
    
    return () => {
      window.removeEventListener('subscription-sync', handleSubscriptionSync as EventListener);
    };
  }, []);

  // Computed properties
  const isActive = subscription?.status || false;
  const hasActivePlans = subscription ? subscription.mealPlans > 0 : false;
  const canCreateMealPlan = subscription ? subscription.mealPlans > 0 : false;
  const canCreateSpecialMeal = subscription ? subscription.specialMeals > 0 : false;
  const canCreateHealthyDrink = subscription ? subscription.healthyDrinks > 0 : false;
  const canGenerateMeal = subscription ? subscription.generateMeals > 0 : false;
  const canProcessImage = subscription ? (subscription.processImages ?? 0) > 0 : false;

  const value = {
    subscription,
    setSubscription,
    isActive,
    hasActivePlans,
    canCreateMealPlan,
    canCreateSpecialMeal,
    canCreateHealthyDrink,
    canGenerateMeal,
    canProcessImage,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
