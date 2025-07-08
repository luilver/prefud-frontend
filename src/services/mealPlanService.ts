
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
