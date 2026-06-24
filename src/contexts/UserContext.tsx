import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import {
  getMealPlans,
  transformApiMealPlanToLocal,
} from "@/services/mealPlanService";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  country?: string;
  language?: "en" | "es" | "pt";
  preferences: {
    dietaryRestrictions: string[];
    allergies: string[];
    cuisinePreferences: string[];
    cookingSkillLevel: "beginner" | "intermediate" | "advanced";
    mealPrepTime: number;
    budgetRange: "low" | "medium" | "high";
  };
  subscription: {
    plan: "free" | "family" | "professional";
    isSubscribed: boolean;
    nextBilling?: string;
    cancelAtPeriodEnd?: boolean;
    planLimits: {
      plansPerMonth: number;
      usedPlans: number;
      mealCreations: number;
      usedMealCreations: number;
      deliveryCommissions: number;
      usedDeliveryCommissions: number;
      homeDeliveries?: number;
      usedHomeDeliveries?: number;
    };
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
  carbonFootPrintToWaste?: number;
  daysToExpire?: number;
  purchased?: boolean;
}

interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  priority: "low" | "medium" | "high";
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

interface BillingHistory {
  id: string;
  date: string;
  amount: number;
  description: string;
  status: "paid" | "pending" | "failed";
  invoiceUrl?: string;
}

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

interface SubscriptionInfo {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  stripe_customer_id: string | null;
}

interface AIMeal {
  id: string;
  name: string;
  type: string;
  cuisine: string;
  cookingTime: number;
  difficulty: string;
  description: string;
  tags: string[];
  ingredients: string[];
  instructions: string[];
  calories: number;
  prepTime: string;
}

interface AIDrink {
  id: string;
  name: string;
  type: string;
  description: string;
  prepTime: string;
  calories: number;
  ingredients: { name: string; amount: string }[];
  instructions: string[];
  nutritionHighlights: string[];
  tips: string[];
}

interface UserContextType {
  user: User | null;
  pantryItems: PantryItem[];
  shoppingItems: ShoppingItem[];
  mealPlans: MealPlan[];
  completedMeals: Record<string, string[]>;
  activeShoppingList: any[];
  activeMealPlan: MealPlan | null;
  ingredients: PantryItem[];
  billingHistory: BillingHistory[];
  paymentMethods: PaymentMethod[];
  subscriptionInfo: SubscriptionInfo | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  signup: (userData: any) => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => void;
  addPantryItem: (item: Omit<PantryItem, "id">) => void;
  updatePantryItem: (id: string, updates: Partial<PantryItem>) => void;
  deletePantryItem: (id: string) => void;
  addIngredient: (item: Omit<PantryItem, "id">) => void;
  deleteIngredient: (id: string) => void;
  updatePantryFromIngredients: (ingredients: string[]) => void;
  addShoppingItem: (item: Omit<ShoppingItem, "id">) => void;
  updateShoppingItem: (id: string, updates: Partial<ShoppingItem>) => void;
  deleteShoppingItem: (id: string) => void;
  toggleShoppingItemPurchased: (id: string) => void;
  addMealPlan: (plan: MealPlan) => void;
  updateMealPlan: (id: string, updates: Partial<MealPlan>) => void;
  deleteMealPlan: (id: string) => void;
  deleteMealFromPlan: (planId: string, mealId: string) => void;
  updateMealPlanShoppingList: (planId: string, shoppingList: any[]) => void;
  toggleMealCompletion: (
    mealId: string,
    date: string,
    completed: boolean
  ) => void;
  isMealCompleted: (mealId: string, date: string) => boolean;
  updatePantryFromMeal: (ingredients: string[]) => void;
  setActiveShoppingList: (list: any[]) => void;
  setActiveMealPlan: (plan: MealPlan | null) => void;
  refreshMealPlans: () => void;
  getMealPlanById: (id: string) => MealPlan | null;
  fetchMealPlansFromAPI: (
    userId: string,
    page?: number,
    limit?: number
  ) => Promise<{
    data: MealPlan[];
    totalPages: number;
    currentPage: number;
    totalCount: number;
  }>;
  getBillingHistory: () => Promise<void>;
  getPaymentMethods: () => Promise<void>;
  addPaymentMethod: (method: any) => Promise<void>;
  deletePaymentMethod: (id: string) => Promise<void>;
  setDefaultPaymentMethod: (id: string) => Promise<void>;
  acceptSubscription: (plan: string) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  checkSubscription: () => Promise<void>;
  createCheckoutWithPaymentMethod: (
    plan: any,
    paymentMethodId?: string
  ) => Promise<string>;
  aiMeals: AIMeal[];
  aiDrinks: AIDrink[];
  addAIMeal: (meal: AIMeal) => void;
  addAIDrink: (drink: AIDrink) => void;
  deleteAIMeal: (id: string) => void;
  deleteAIDrink: (id: string) => void;
  setPantryItems: (items: PantryItem[], originalResponse?: any) => void;
  convertPantryItemsToApiFormat: (items: PantryItem[]) => any[];
  updatePantryInAPI: (updatedItems: PantryItem[]) => Promise<void>;
  originalPantryResponse: any;
  favoriteMeals: any[];
  addFavoriteMeal: (meal: any) => void;
  removeFavoriteMeal: (mealId: string) => void;
  isMealFavorite: (mealId: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const {
    user: authUser,
    login: authLogin,
    logout: authLogout,
    isAuthenticated: authIsAuthenticated,
  } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [originalPantryResponse, setOriginalPantryResponse] =
    useState<any>(null);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [completedMeals, setCompletedMeals] = useState<
    Record<string, string[]>
  >({});
  const [activeShoppingList, setActiveShoppingList] = useState<any[]>([]);
  const [activeMealPlan, setActiveMealPlan] = useState<MealPlan | null>(null);
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [subscriptionInfo, setSubscriptionInfo] =
    useState<SubscriptionInfo | null>(null);
  const [aiMeals, setAIMeals] = useState<AIMeal[]>([]);
  const [aiDrinks, setAIDrinks] = useState<AIDrink[]>([]);
  const [favoriteMeals, setFavoriteMeals] = useState<any[]>([]);

  // Computed properties
  const ingredients = pantryItems;
  const isAuthenticated = authIsAuthenticated || user !== null;

  // Function to fetch meal plans from API - now callable from meal planner
  const fetchMealPlansFromAPI = useCallback(
    async (userId: string, page: number = 1, limit: number = 10) => {
      try {
        console.log(
          "Fetching meal plans from API for user:",
          userId,
          "page:",
          page
        );

        const response = await getMealPlans(userId, page, limit);

        if (response.data && response.data.length > 0) {
          const transformedPlans = response.data.map(
            transformApiMealPlanToLocal
          );
          console.log("Transformed meal plans from API:", transformedPlans);

          return {
            data: transformedPlans,
            totalPages:
              response.totalPages ||
              Math.ceil((response.total || transformedPlans.length) / limit),
            currentPage: page,
            totalCount: response.total || transformedPlans.length,
          };
        }

        return {
          data: [],
          totalPages: 1,
          currentPage: 1,
          totalCount: 0,
        };
      } catch (error) {
        console.error("Failed to fetch meal plans from API:", error);
        throw error;
      }
    },
    []
  );

  // Listen for pantry sync events from AuthContext
  useEffect(() => {
    const handlePantrySync = (event: CustomEvent) => {
      const { pantry, originalPantryResponse } = event.detail;
      console.log("Syncing pantry from auth:", pantry);
      console.log("Original pantry response:", originalPantryResponse);

      if (pantry && Array.isArray(pantry)) {
        // Transform pantry items from API format to UserContext format
        const transformedPantryItems: PantryItem[] = pantry.map(
          (item: any) => ({
            id: item._id || item.id,
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            category: item.category,
            expiryDate: new Date(item.expiryDate),
            purchaseDate: new Date(item.purchaseDate),
            location: item.location,
            notes: item.notes,
          })
        );

        console.log(
          "Setting pantry items from auth sync:",
          transformedPantryItems
        );
        setPantryItems(transformedPantryItems);
        setOriginalPantryResponse(originalPantryResponse);
        console.log("Pantry items updated from API:", transformedPantryItems);
        console.log("Original pantry response stored:", originalPantryResponse);
      }
    };

    window.addEventListener("pantry-sync", handlePantrySync as EventListener);

    return () => {
      window.removeEventListener(
        "pantry-sync",
        handlePantrySync as EventListener
      );
    };
  }, []);

  // Enhanced setPantryItems function that also stores original response
  const setPantryItemsWithOriginal = useCallback(
    (items: PantryItem[], originalResponse?: any) => {
      console.log(
        "setPantryItemsWithOriginal called with:",
        items,
        originalResponse
      );
      setPantryItems(items);
      if (originalResponse) {
        setOriginalPantryResponse(originalResponse);
      }
    },
    []
  );

  // Sync with AuthContext user - removed automatic meal plans fetching
  useEffect(() => {
    if (authUser && !user) {
      // Create user profile from auth user
      const userProfile: User = {
        id: authUser.userId,
        name: authUser.profile?.name || authUser.email.split("@")[0],
        email: authUser.email,
        phone: authUser.profile?.phone,
        language: "en",
        preferences: {
          dietaryRestrictions: authUser.profile?.dietTypes || [],
          allergies: authUser.profile?.alergies || [],
          cuisinePreferences: [],
          cookingSkillLevel: "beginner",
          mealPrepTime: 30,
          budgetRange: "medium",
        },
        subscription: {
          plan: "free",
          isSubscribed: false,
          planLimits: {
            plansPerMonth: 1,
            usedPlans: 0,
            mealCreations: 3,
            usedMealCreations: 0,
            deliveryCommissions: 0,
            usedDeliveryCommissions: 0,
          },
        },
      };
      setUser(userProfile);
    } else if (!authUser && user) {
      setUser(null);
    }
  }, [authUser, user]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedPantryItems = localStorage.getItem("pantryItems");
    const savedShoppingItems = localStorage.getItem("shoppingItems");
    const savedMealPlans = localStorage.getItem("mealPlans");
    const savedCompletedMeals = localStorage.getItem("completedMeals");
    const savedSubscriptionInfo = localStorage.getItem("subscriptionInfo");
    const savedAIMeals = localStorage.getItem("aiMeals");
    const savedAIDrinks = localStorage.getItem("aiDrinks");
    const savedFavoriteMeals = localStorage.getItem("favoriteMeals");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    if (savedPantryItems) {
      const items = JSON.parse(savedPantryItems);
      // Convert date strings back to Date objects
      const itemsWithDates = items.map((item: any) => ({
        ...item,
        expiryDate: new Date(item.expiryDate),
        purchaseDate: new Date(item.purchaseDate),
      }));
      setPantryItems(itemsWithDates);
    }
    if (savedShoppingItems) {
      setShoppingItems(JSON.parse(savedShoppingItems));
    }
    if (savedMealPlans) {
      const plans = JSON.parse(savedMealPlans);
      setMealPlans(plans);
      if (plans.length > 0) {
        setActiveMealPlan(plans[0]);
        // Sync shopping items with active meal plan
        syncShoppingItemsWithActivePlan(plans[0]);
      }
    }
    if (savedCompletedMeals) {
      setCompletedMeals(JSON.parse(savedCompletedMeals));
    }
    if (savedSubscriptionInfo) {
      setSubscriptionInfo(JSON.parse(savedSubscriptionInfo));
    }
    if (savedAIMeals) {
      setAIMeals(JSON.parse(savedAIMeals));
    }
    if (savedAIDrinks) {
      setAIDrinks(JSON.parse(savedAIDrinks));
    }
    if (savedFavoriteMeals) {
      setFavoriteMeals(JSON.parse(savedFavoriteMeals));
    }
  }, []);

  // Sync shopping items with active meal plan
  const syncShoppingItemsWithActivePlan = (plan: MealPlan | null) => {
    if (plan && plan.shoppingList) {
      // Convert meal plan shopping list to shopping items format
      const planShoppingItems = plan.shoppingList.map((item: any) => ({
        ...item,
        category: item.category || "meal-ingredient",
        priority: item.priority || "medium",
        purchased: item.purchased || false,
        estimatedPrice: item.estimatedPrice,
        notes: item.notes || `From meal plan: ${plan.name}`,
      }));
      setShoppingItems(planShoppingItems);
    }
  };

  // Save data to localStorage whenever state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem("pantryItems", JSON.stringify(pantryItems));
  }, [pantryItems]);

  useEffect(() => {
    localStorage.setItem("shoppingItems", JSON.stringify(shoppingItems));
  }, [shoppingItems]);

  useEffect(() => {
    localStorage.setItem("mealPlans", JSON.stringify(mealPlans));
    console.log("Meal plans updated in localStorage:", mealPlans);
  }, [mealPlans]);

  useEffect(() => {
    localStorage.setItem("completedMeals", JSON.stringify(completedMeals));
  }, [completedMeals]);

  useEffect(() => {
    if (subscriptionInfo) {
      localStorage.setItem(
        "subscriptionInfo",
        JSON.stringify(subscriptionInfo)
      );
    }
  }, [subscriptionInfo]);

  useEffect(() => {
    localStorage.setItem("aiMeals", JSON.stringify(aiMeals));
  }, [aiMeals]);

  useEffect(() => {
    localStorage.setItem("aiDrinks", JSON.stringify(aiDrinks));
  }, [aiDrinks]);

  useEffect(() => {
    localStorage.setItem("favoriteMeals", JSON.stringify(favoriteMeals));
  }, [favoriteMeals]);

  // Sync shopping items back to active meal plan when shopping items change
  useEffect(() => {
    if (activeMealPlan && shoppingItems.length > 0) {
      const updatedPlan = {
        ...activeMealPlan,
        shoppingList: shoppingItems.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          category: item.category,
          priority: item.priority,
          purchased: item.purchased,
          estimatedPrice: item.estimatedPrice,
          notes: item.notes,
          mealId: (item as any).mealId,
          mealName: (item as any).mealName,
        })),
      };

      setMealPlans((prev) =>
        prev.map((plan) => (plan.id === activeMealPlan.id ? updatedPlan : plan))
      );
      setActiveMealPlan(updatedPlan);
    }
  }, [shoppingItems]);

  // Method to convert UI pantry items back to API format for updates
  const convertPantryItemsToApiFormat = (items: PantryItem[]) => {
    if (!originalPantryResponse) {
      console.warn("No original pantry response available for conversion");
      return [];
    }

    return items.map((item) => {
      // Find original item to preserve API-specific fields
      const originalItem = originalPantryResponse.ingredients?.find(
        (orig: any) => orig.name === item.name
      );

      return {
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        classification: originalItem?.classification || "other",
        carbonFootPrintToWaste: originalItem?.carbonFootPrintToWaste || 0,
        daysToExpire: originalItem?.daysToExpire || 7,
        dayAdded: originalItem?.dayAdded || new Date().toISOString(),
      };
    });
  };

  // Method to update pantry in the API
  const updatePantryInAPI = async (updatedItems: PantryItem[]) => {
    if (!user?.id || !originalPantryResponse) {
      console.warn(
        "Cannot update pantry: missing user ID or original response"
      );
      return;
    }

    try {
      const apiFormatItems = convertPantryItemsToApiFormat(updatedItems);
      console.log("Updating pantry with items:", apiFormatItems);

      console.log("Pantry updated successfully");
    } catch (error) {
      console.error("Failed to update pantry:", error);
    }
  };

  // Authentication methods - now using AuthContext
  const login = async (email: string, password: string) => {
    const userData = await authLogin(email, password);
    // User profile will be created in the useEffect above
    await checkSubscription();
    return userData;
  };

  const logout = () => {
    authLogout();
    setUser(null);
    setSubscriptionInfo(null);
    // Clear all user-related state including meal plans
    setPantryItems([]);
    setMealPlans([]);
    setShoppingItems([]);
    setCompletedMeals({});
    setActiveShoppingList([]);
    setActiveMealPlan(null);
    setAIMeals([]);
    setAIDrinks([]);
    setBillingHistory([]);
    setPaymentMethods([]);

    // Clear localStorage for user data
    localStorage.removeItem("user");
    localStorage.removeItem("subscriptionInfo");
    localStorage.removeItem("mealPlans");
    localStorage.removeItem("shoppingItems");
    localStorage.removeItem("completedMeals");
    localStorage.removeItem("aiMeals");
    localStorage.removeItem("aiDrinks");

    window.dispatchEvent(new CustomEvent("user-logout"));
  };

  const signup = async (userData: any) => {
    // Mock signup implementation
    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      country: userData.country,
      language: userData.language || "en",
      preferences: userData.preferences || {
        dietaryRestrictions: [],
        allergies: [],
        cuisinePreferences: [],
        cookingSkillLevel: "beginner",
        mealPrepTime: 30,
        budgetRange: "medium",
      },
      subscription: {
        plan: "free",
        isSubscribed: false,
        planLimits: {
          plansPerMonth: 1,
          usedPlans: 0,
          mealCreations: 3,
          usedMealCreations: 0,
          deliveryCommissions: 0,
          usedDeliveryCommissions: 0,
        },
      },
    };
    setUser(newUser);
    await checkSubscription();
  };

  const updateUserProfile = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  const addPantryItem = (item: Omit<PantryItem, "id">) => {
    const newItem: PantryItem = {
      ...item,
      id: Date.now().toString(),
    };
    const updatedItems = [...pantryItems, newItem];
    setPantryItems(updatedItems);
    updatePantryInAPI(updatedItems);
  };

  const addIngredient = addPantryItem;

  const updatePantryItem = (id: string, updates: Partial<PantryItem>) => {
    const updatedItems = pantryItems.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    setPantryItems(updatedItems);
    updatePantryInAPI(updatedItems);
  };

  const deletePantryItem = (id: string) => {
    const updatedItems = pantryItems.filter((item) => item.id !== id);
    setPantryItems(updatedItems);
    updatePantryInAPI(updatedItems);
  };

  const deleteIngredient = deletePantryItem;

  const updatePantryFromIngredients = (ingredientNames: string[]) => {
    ingredientNames.forEach((ingredientName) => {
      const matchingItem = pantryItems.find((item) =>
        ingredientName.toLowerCase().includes(item.name.toLowerCase())
      );

      if (matchingItem && matchingItem.quantity > 0) {
        updatePantryItem(matchingItem.id, {
          quantity: Math.max(0, matchingItem.quantity - 1),
        });
      }
    });
  };

  const addShoppingItem = (item: Omit<ShoppingItem, "id">) => {
    const newItem: ShoppingItem = {
      ...item,
      id: Date.now().toString(),
    };
    setShoppingItems((prev) => [...prev, newItem]);
  };

  const updateShoppingItem = (id: string, updates: Partial<ShoppingItem>) => {
    setShoppingItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const deleteShoppingItem = (id: string) => {
    setShoppingItems((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleShoppingItemPurchased = (id: string) => {
    setShoppingItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, purchased: !item.purchased } : item
      )
    );
  };

  const addMealPlan = (plan: MealPlan) => {
    console.log("Adding meal plan:", plan);
    setMealPlans((prev) => {
      const updated = [...prev, plan];
      console.log("Updated meal plans after add:", updated);
      return updated;
    });
    if (!activeMealPlan) {
      setActiveMealPlan(plan);
      syncShoppingItemsWithActivePlan(plan);
    }
  };

  const updateMealPlan = (id: string, updates: Partial<MealPlan>) => {
    console.log("Updating meal plan:", { id, updates });
    setMealPlans((prev) => {
      const updated = prev.map((plan) =>
        plan.id === id ? { ...plan, ...updates } : plan
      );
      console.log("Updated meal plans after update:", updated);
      return updated;
    });

    if (activeMealPlan?.id === id) {
      const updatedPlan = { ...activeMealPlan, ...updates };
      setActiveMealPlan(updatedPlan);
      syncShoppingItemsWithActivePlan(updatedPlan);
    }
  };

  const deleteMealPlan = (id: string) => {
    setMealPlans((prev) => prev.filter((plan) => plan.id !== id));
    if (activeMealPlan?.id === id) {
      const remainingPlans = mealPlans.filter((plan) => plan.id !== id);
      const newActivePlan =
        remainingPlans.length > 0 ? remainingPlans[0] : null;
      setActiveMealPlan(newActivePlan);
      syncShoppingItemsWithActivePlan(newActivePlan);
    }
  };

  const deleteMealFromPlan = (planId: string, mealId: string) => {
    console.log("Deleting meal from plan:", { planId, mealId });
    setMealPlans((prev) => {
      const updated = prev.map((plan) =>
        plan.id === planId
          ? { ...plan, meals: plan.meals.filter((meal) => meal.id !== mealId) }
          : plan
      );
      console.log("Updated meal plans after meal deletion:", updated);
      return updated;
    });
  };

  const updateMealPlanShoppingList = (planId: string, shoppingList: any[]) => {
    setMealPlans((prev) =>
      prev.map((plan) =>
        plan.id === planId ? { ...plan, shoppingList } : plan
      )
    );

    if (activeMealPlan?.id === planId) {
      const planShoppingItems = shoppingList.map((item: any) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        category: item.category || "meal-ingredient",
        priority: item.priority || "medium",
        purchased: item.purchased || false,
        estimatedPrice: item.estimatedPrice,
        notes: item.notes || `From meal plan: ${activeMealPlan.name}`,
      }));
      setShoppingItems(planShoppingItems);
    }
  };

  const refreshMealPlans = async () => {
    if (!user?.id) {
      console.log("No user ID available for refreshing meal plans");
      return;
    }

    try {
      console.log("Refreshing meal plans for user:", user.id);
      // Fetch first page of meal plans
      const response = await fetchMealPlansFromAPI(user.id, 1, 50);
      setMealPlans(response.data || []);
      console.log("Meal plans refreshed:", response.data);
    } catch (error) {
      console.error("Error refreshing meal plans:", error);
    }
  };

  const getMealPlanById = (id: string): MealPlan | null => {
    return mealPlans.find((plan) => plan.id === id) || null;
  };

  const setActiveMealPlanUpdated = (plan: MealPlan | null) => {
    setActiveMealPlan(plan);
    syncShoppingItemsWithActivePlan(plan);
  };

  const toggleMealCompletion = (
    mealId: string,
    date: string,
    completed: boolean
  ) => {
    setCompletedMeals((prev) => {
      const dateKey = date;
      const currentMeals = prev[dateKey] || [];

      if (completed) {
        // Si completed es true, agregamos el meal si no está ya
        if (!currentMeals.includes(mealId)) {
          return {
            ...prev,
            [dateKey]: [...currentMeals, mealId],
          };
        }
        return prev; // no cambiamos nada si ya está
      } else {
        // Si completed es false, eliminamos el meal si está
        if (currentMeals.includes(mealId)) {
          return {
            ...prev,
            [dateKey]: currentMeals.filter((id) => id !== mealId),
          };
        }
        return prev; // no cambiamos nada si no está
      }
    });
  };

  const isMealCompleted = (mealId: string, date: string) => {
    const dateKey = date;
    const completedMealsForDate = completedMeals[dateKey] || [];
    return completedMealsForDate.includes(mealId);
  };

  const updatePantryFromMeal = (ingredients: string[]) => {
    ingredients.forEach((ingredient) => {
      const matchingItem = pantryItems.find((item) =>
        ingredient.toLowerCase().includes(item.name.toLowerCase())
      );

      if (matchingItem && matchingItem.quantity > 0) {
        updatePantryItem(matchingItem.id, {
          quantity: Math.max(0, matchingItem.quantity - 1),
        });
      }
    });
  };

  // Updated billing and subscription methods
  const getBillingHistory = async () => {
    const mockHistory: BillingHistory[] = [
      {
        id: "1",
        date: new Date().toISOString(),
        amount: 9.99,
        description: "Premium Plan - Monthly",
        status: "paid",
        invoiceUrl: "#",
      },
    ];
    setBillingHistory(mockHistory);
  };

  const getPaymentMethods = async () => {
    const mockMethods: PaymentMethod[] = [
      {
        id: "1",
        brand: "visa",
        last4: "4242",
        expiryMonth: 12,
        expiryYear: 2025,
        isDefault: true,
      },
      {
        id: "2",
        brand: "mastercard",
        last4: "8888",
        expiryMonth: 10,
        expiryYear: 2026,
        isDefault: false,
      },
    ];
    setPaymentMethods(mockMethods);
  };

  const addPaymentMethod = async (method: any) => {
    const newMethod: PaymentMethod = {
      id: Date.now().toString(),
      brand: "visa",
      last4: method.cardNumber.slice(-4),
      expiryMonth: parseInt(method.expiryDate.split("/")[0]),
      expiryYear: parseInt("20" + method.expiryDate.split("/")[1]),
      isDefault: paymentMethods.length === 0,
    };
    setPaymentMethods((prev) => [...prev, newMethod]);
  };

  const deletePaymentMethod = async (id: string) => {
    setPaymentMethods((prev) => prev.filter((method) => method.id !== id));
  };

  const setDefaultPaymentMethod = async (id: string) => {
    setPaymentMethods((prev) =>
      prev.map((method) => ({
        ...method,
        isDefault: method.id === id,
      }))
    );
  };

  const acceptSubscription = async (plan: string) => {
    if (user) {
      let planLimits;
      switch (plan) {
        case "family":
          planLimits = {
            plansPerMonth: 5,
            usedPlans: user.subscription.planLimits.usedPlans,
            mealCreations: 10,
            usedMealCreations:
              user.subscription.planLimits.usedMealCreations || 0,
            deliveryCommissions: 3,
            usedDeliveryCommissions:
              user.subscription.planLimits.usedDeliveryCommissions || 0,
          };
          break;
        case "professional":
          planLimits = {
            plansPerMonth: 12,
            usedPlans: user.subscription.planLimits.usedPlans,
            mealCreations: -1, // unlimited
            usedMealCreations:
              user.subscription.planLimits.usedMealCreations || 0,
            deliveryCommissions: 10,
            usedDeliveryCommissions:
              user.subscription.planLimits.usedDeliveryCommissions || 0,
            homeDeliveries: 3,
            usedHomeDeliveries:
              user.subscription.planLimits.usedHomeDeliveries || 0,
          };
          break;
        default: // free
          planLimits = {
            plansPerMonth: 1,
            usedPlans: user.subscription.planLimits.usedPlans,
            mealCreations: 3,
            usedMealCreations:
              user.subscription.planLimits.usedMealCreations || 0,
            deliveryCommissions: 0,
            usedDeliveryCommissions: 0,
          };
      }

      const updatedUser = {
        ...user,
        subscription: {
          ...user.subscription,
          plan: plan as "free" | "family" | "professional",
          isSubscribed: plan !== "free",
          planLimits,
        },
      };
      setUser(updatedUser);

      // Update subscription info
      const newSubscriptionInfo: SubscriptionInfo = {
        subscribed: plan !== "free",
        subscription_tier:
          plan === "family"
            ? "Family"
            : plan === "professional"
            ? "Professional"
            : null,
        subscription_end:
          plan !== "free"
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            : null,
        stripe_customer_id: "cus_mock_customer_id",
      };
      setSubscriptionInfo(newSubscriptionInfo);
    }
  };

  const cancelSubscription = async () => {
    if (user) {
      setUser({
        ...user,
        subscription: {
          ...user.subscription,
          cancelAtPeriodEnd: true,
        },
      });
    }
  };

  const checkSubscription = useCallback(async () => {
    // Mock subscription check - in real app this would call Supabase edge function
    try {
      const mockSubscriptionInfo: SubscriptionInfo = {
        subscribed: user?.subscription?.isSubscribed || false,
        subscription_tier:
          user?.subscription?.plan === "family"
            ? "Family"
            : user?.subscription?.plan === "professional"
            ? "Professional"
            : null,
        subscription_end: user?.subscription?.isSubscribed
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          : null,
        stripe_customer_id: user?.subscription?.isSubscribed
          ? "cus_mock_customer_id"
          : null,
      };
      setSubscriptionInfo(mockSubscriptionInfo);
    } catch (error) {
      console.error("Failed to check subscription:", error);
    }
  }, [user?.subscription?.isSubscribed, user?.subscription?.plan]);

  const createCheckoutWithPaymentMethod = async (
    plan: any,
    paymentMethodId?: string
  ): Promise<string> => {
    // Mock checkout creation - in real app this would call Supabase edge function
    try {
      console.log(
        "Creating checkout for plan:",
        plan,
        "with payment method:",
        paymentMethodId
      );

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Return mock checkout URL
      return "https://checkout.stripe.com/mock-session-url";
    } catch (error) {
      console.error("Failed to create checkout:", error);
      throw error;
    }
  };

  const addAIMeal = (meal: AIMeal) => {
    setAIMeals((prev) => [...prev, meal]);
  };

  const addAIDrink = (drink: AIDrink) => {
    setAIDrinks((prev) => [...prev, drink]);
  };

  const deleteAIMeal = (id: string) => {
    setAIMeals((prev) => prev.filter((meal) => meal.id !== id));
  };

  const deleteAIDrink = (id: string) => {
    setAIDrinks((prev) => prev.filter((drink) => drink.id !== id));
  };

  const addFavoriteMeal = (meal: any) => {
    setFavoriteMeals((prev) => {
      // Check if meal is already favorited
      if (prev.some(fav => fav.id === meal.id)) {
        return prev;
      }
      return [...prev, { ...meal, favoritedAt: new Date().toISOString() }];
    });
  };

  const removeFavoriteMeal = (mealId: string) => {
    setFavoriteMeals((prev) => prev.filter((meal) => meal.id !== mealId));
  };

  const isMealFavorite = (mealId: string) => {
    return favoriteMeals.some((meal) => meal.id === mealId);
  };

  const value = {
    user,
    pantryItems,
    shoppingItems,
    mealPlans,
    completedMeals,
    activeShoppingList,
    activeMealPlan,
    ingredients,
    billingHistory,
    paymentMethods,
    subscriptionInfo,
    isAuthenticated,
    setUser,
    login,
    logout,
    signup,
    updateUserProfile,
    addPantryItem,
    updatePantryItem,
    deletePantryItem,
    addIngredient,
    deleteIngredient,
    updatePantryFromIngredients,
    addShoppingItem,
    updateShoppingItem,
    deleteShoppingItem,
    toggleShoppingItemPurchased,
    addMealPlan,
    updateMealPlan,
    deleteMealPlan,
    deleteMealFromPlan,
    updateMealPlanShoppingList,
    toggleMealCompletion,
    isMealCompleted,
    updatePantryFromMeal,
    setActiveShoppingList,
    setActiveMealPlan: setActiveMealPlanUpdated,
    refreshMealPlans,
    getMealPlanById,
    fetchMealPlansFromAPI,
    getBillingHistory,
    getPaymentMethods,
    addPaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    acceptSubscription,
    cancelSubscription,
    checkSubscription,
    createCheckoutWithPaymentMethod,
    aiMeals,
    aiDrinks,
    addAIMeal,
    addAIDrink,
    deleteAIMeal,
    deleteAIDrink,
    setPantryItems: setPantryItemsWithOriginal,
    // Expose methods for pantry API operations
    convertPantryItemsToApiFormat,
    updatePantryInAPI,
    originalPantryResponse,
    favoriteMeals,
    addFavoriteMeal,
    removeFavoriteMeal,
    isMealFavorite,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
