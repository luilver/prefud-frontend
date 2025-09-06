// Mock service for meal plan operations
// In a real app, these would be API calls to your backend

export interface MealPlan {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  numberOfWeeks: number;
  numberOfPersons: number;
  mealsPerDay: number;
  meals: any[];
}

export interface Meal {
  id: string;
  name: string;
  description?: string;
  ingredients: string[];
  steps: string[];
  prepTime: number;
  calories: number;
  difficulty: string;
  type: string;
  date: string;
  planId: string;
  mealType: 'meal' | 'snack';
}

// Updated API response interface to match the new structure you provided
interface ApiMealPlan {
  _id: string;
  user_id: string;
  plan_name: string;
  plan_description?: string;
  start_date: string;
  plan: {
    mealPlan: Array<{
      day: number;
      date: string;
      dayOfWeek: string;
      meals: Array<{
        id?: string;
        consumed?: boolean;
        name: string;
        description?: string;
        ingredients: Array<{
          name: string;
          quantity: number;
          unit: string;
        }>;
        prepTip?: string;
        cookingTime: number;
        carbonFootprint?: number;
        steps: string[];
        calories: number;
        nutritionalInfo?: {
          protein: number;
          fat: number;
          carbohydrates: number;
          fiber: number;
        };
        mealType: string;
      }>;
    }>;
    ingredientsList?: Array<{
      name: string;
      quantity: number;
      unit: string;
      classification?: string;
      carbonFootPrintToWaste?: number;
      daysToExpire?: number;
    }>;
    totalCarbonFootprint?: number;
  };
  duration: number;
  numberPeople: number;
  mealsPerDay: number;
  dietaryRestrictions?: string[];
  cuisinePreferences?: string[];
  allergiesIntolerance?: string[];
  dislikes?: string;
  maxCookingTime?: number;
  cookingSkillLevel?: string;
  budgetRange?: string;
  healthGoals?: string[];
  createdAt: string;
  updatedAt: string;
}

interface MealPlansApiResponse {
  data: ApiMealPlan[];
  total: number;
  page: number;
  totalPages: number;
}

// Local MealPlan interface (matching UserContext expectations)
export interface LocalMealPlan {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  meals: any[];
  shoppingList?: any[];
  duration: string;
  preferences: any;
  weeks: any[];
  totalCarbonFootprint?: number;
}

// API functions for creating meal plans
export interface CreateMealPlanRequest {
  duration: number;
  numberPeople: number;
  mealsPerDay: number;
  dietaryRestrictions?: string[];
  cuisinePreferences?: string[];
  allergiesIntolerance?: string[];
  dislikes?: string;
  maxCookingTime: number;
  cookingSkillLevel: string;
  budgetRange: string;
  healthGoals?: string[];
  language: string;
  user_id: string;
  start_date: string;
  plan_name: string;
  plan_description?: string;
}

const API_BASE_URL = import.meta.env.VITE_PANTRY_URL || 'https://pantry-ms-brain.onrender.com';


export const createMealPlan = async (planData: CreateMealPlanRequest): Promise<ApiMealPlan> => {
  console.log('Service: Creating meal plan', planData);
  
  try {
    const response = await fetch(`${API_BASE_URL}/meal-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(planData)
    });

    const data = await response.json();
    console.log('API Response:', data);
    
    // Check for specific error codes first (even with 201 status)
    if (data.code === "03") {
      console.log('Meal plan subscription limit reached - code 03 detected');
      const error = new Error(data.message || "No meal plans available according to your subscription");
      (error as any).code = "03";
      throw error;
    }

    if (!response.ok) {
      throw new Error(`Failed to create meal plan: ${response.status}`);
    }

    console.log('Service: Meal plan created successfully', data);
    
    return data;
  } catch (error) {
    console.error('Service: Error creating meal plan', error);
    throw error;
  }
};

// Mock delay to simulate API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const addMealToPlan = async (planId: string, meal: Meal): Promise<void> => {
  console.log('Service: Adding meal to plan', { planId, meal });
  
  // Simulate API call delay
  await delay(500);
  
  // In a real app, this would make an API call to add the meal to the plan
  // For now, we'll just log the action
  console.log('Service: Meal added successfully');
};

export const substituteMealInPlan = async (planId: string, mealIdToReplace: string, newMeal: Meal): Promise<void> => {
  console.log('Service: Substituting meal in plan', { planId, mealIdToReplace, newMeal });
  
  // Simulate API call delay
  await delay(500);
  
  // In a real app, this would make an API call to replace the meal in the plan
  // For now, we'll just log the action
  console.log('Service: Meal substituted successfully');
};

export const removeMealFromPlan = async (planId: string, mealId: string): Promise<void> => {
  console.log('Service: Removing meal from plan', { planId, mealId });
  
  // Simulate API call delay
  await delay(300);
  
  // In a real app, this would make an API call to remove the meal from the plan
  console.log('Service: Meal removed successfully');
};

export const updateMealInPlan = async (planId: string, mealId: string, updatedMeal: Partial<Meal>): Promise<void> => {
  console.log('Service: Updating meal in plan', { planId, mealId, updatedMeal });
  
  // Simulate API call delay
  await delay(400);
  
  // In a real app, this would make an API call to update the meal in the plan
  console.log('Service: Meal updated successfully');
};

export const getMealPlans = async (userId: string, page: number = 1, limit: number = 10): Promise<MealPlansApiResponse> => {
  console.log('Service: Fetching meal plans', { userId, page, limit });
  
  try {
    const response = await fetch(`${API_BASE_URL}/meal-plan/${userId}?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch meal plans: ${response.status}`);
    }

    const data: MealPlansApiResponse = await response.json();
    console.log('Service: Meal plans fetched successfully', data);
    
    return data;
  } catch (error) {
    console.error('Service: Error fetching meal plans', error);
    throw error;
  }
};

export const transformApiMealPlanToLocal = (apiPlan: ApiMealPlan): LocalMealPlan => {
  console.log('Transforming API meal plan:', apiPlan);
  
  // Calculate duration and dates with better error handling
  let startDate: Date;
  let endDate: Date;
  let duration: string;

  // Handle missing or invalid start_date
  if (apiPlan.start_date) {
    startDate = new Date(apiPlan.start_date);
    // Check if the date is valid
    if (isNaN(startDate.getTime())) {
      console.warn('Invalid start_date received, using current date as fallback');
      startDate = new Date();
    }
  } else {
    console.warn('No start_date provided, using current date as fallback');
    startDate = new Date();
  }

  // Calculate end date and duration
  const durationDays = apiPlan.duration || 7; // Default to 7 days if duration is missing
  endDate = new Date(startDate.getTime() + (durationDays * 24 * 60 * 60 * 1000));
  duration = `${durationDays} days`;

  // Transform meals from the nested structure
  const transformedMeals: any[] = [];
  
  if (apiPlan.plan && apiPlan.plan.mealPlan && Array.isArray(apiPlan.plan.mealPlan)) {
    apiPlan.plan.mealPlan.forEach((dayPlan) => {
      if (dayPlan.meals && Array.isArray(dayPlan.meals)) {
        dayPlan.meals.forEach((meal, mealIndex) => {
          transformedMeals.push({
            id: meal.id || `${dayPlan.day || 1}-${mealIndex}`,
            consumed: meal.consumed || false,
            name: meal.name || 'Unnamed Meal',
            description: meal.description || '',
            type: meal.mealType || 'meal',
            calories: meal.calories || 0,
            prepTime: meal.cookingTime || 0,
            servings: apiPlan.numberPeople || 1,
            difficulty: apiPlan.cookingSkillLevel || 'medium',
            ingredients: meal.ingredients ? meal.ingredients.map(ing => ing.name) : [],
            instructions: meal.steps || [],
            steps: meal.steps || [],
            week: Math.ceil((dayPlan.day || 1) / 7),
            day: dayPlan.day || 1,
            date: dayPlan.date || startDate.toISOString().split('T')[0],
            dayOfWeek: dayPlan.dayOfWeek || 'Unknown',
            nutritionalInfo: meal.nutritionalInfo,
            prepTip: meal.prepTip,
            carbonFootprint: meal.carbonFootprint,
            detailedIngredients: meal.ingredients || []
          });
        });
      }
    });
  }

  console.log('Transformed meals:', transformedMeals);

  // Create weeks array based on duration
  const numberOfWeeks = Math.ceil(durationDays / 7);
  const weeks = Array.from({ length: numberOfWeeks }, (_, index) => ({
    id: `week-${index + 1}`,
    weekNumber: index + 1,
    meals: transformedMeals.filter(meal => meal.week === index + 1)
  }));

  // Transform shopping list from ingredients list
  const shoppingList = (apiPlan.plan?.ingredientsList && Array.isArray(apiPlan.plan.ingredientsList)) 
    ? apiPlan.plan.ingredientsList.map((ingredient, index) => ({
        id: `ingredient-${index}`,
        name: ingredient.name || 'Unknown Ingredient',
        quantity: ingredient.quantity || 1,
        unit: ingredient.unit || 'piece',
        category: ingredient.classification || 'other',
        priority: 'medium',
        purchased: false,
        estimatedPrice: 0,
        carbonFootPrintToWaste: ingredient.carbonFootPrintToWaste,
        daysToExpire: ingredient.daysToExpire
      })) 
    : [];

  console.log('Transformed shopping list:', shoppingList);

  // Make sure preferences object matches what the cards expect
  const transformedPlan: LocalMealPlan = {
    id: apiPlan._id,
    name: apiPlan.plan_name || 'Unnamed Meal Plan',
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    meals: transformedMeals,
    shoppingList,
    duration,
    preferences: {
      numberOfPersons: apiPlan.numberPeople || 1,
      numberOfDays: durationDays,
      mealsPerDay: apiPlan.mealsPerDay || 3,
      numberOfWeeks,
      people: apiPlan.numberPeople || 1,
      dietaryRestrictions: apiPlan.dietaryRestrictions || [],
      cuisinePreferences: apiPlan.cuisinePreferences || [],
      allergiesIntolerance: apiPlan.allergiesIntolerance || [],
      dislikes: apiPlan.dislikes || '',
      maxCookingTime: apiPlan.maxCookingTime || 60,
      cookingSkillLevel: apiPlan.cookingSkillLevel || 'medium',
      budgetRange: apiPlan.budgetRange || 'medium',
      healthGoals: apiPlan.healthGoals || []
    },
    weeks,
    totalCarbonFootprint: apiPlan.plan?.totalCarbonFootprint || 0
  };

  console.log('Final transformed plan:', transformedPlan);
  return transformedPlan;
};
