
const API_BASE_URL = import.meta.env.VITE_PANTRY_URL || 'https://pantry-ms-brain.onrender.com';

export interface ApiDrinkIngredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface ApiDrinkNutritionalInfo {
  protein: number;
  fat: number;
  carbohydrates: number;
  fiber: number;
  vitamins: string[];
}

export interface ApiHealthyDrink {
  name: string;
  description: string;
  benefits: string;
  instructions: string;
  ingredients: ApiDrinkIngredient[];
  prepTip: string;
  cookingTime: number;
  carbonFootprint: number;
  steps: string[];
  calories: number;
  nutritionalInfo: ApiDrinkNutritionalInfo;
  drinkType: string;
  valueFreshness: number;
}

export interface ApiDrinkPlan {
  healthyDrink: ApiHealthyDrink;
  totalCarbonFootprint: number;
  ingredientsList: Array<{
    name: string;
    quantity: number;
    unit: string;
    classification: string;
    carbonFootPrintToWaste: number;
    daysToExpire: number;
  }>;
}

export interface ApiDrink {
  _id: string;
  user_id: string;
  drink_name: string;
  drinkPlan: ApiDrinkPlan;
  numberPeople: number;
  dietaryRestrictions: string[];
  cuisinePreferences: string[];
  allergiesIntolerance: string[];
  dislikes: string;
  maxCookingTime: number;
  cookingSkillLevel: string;
  budgetRange: string;
  drinkType: string;
  language: string;
  healthGoals: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiDrinksResponse {
  data: ApiDrink[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreateDrinkRequest {
  user_id: string;
  drink_name: string;
  numberPeople: number;
  dietaryRestrictions: string[];
  cuisinePreferences: string[];
  allergiesIntolerance: string[];
  dislikes: string;
  maxCookingTime: number;
  cookingSkillLevel: string;
  budgetRange: string;
  drinkType: string;
  language: string;
  healthGoals: string[];
}

export const getDrinksByUser = async (userId: string, page: number = 1, limit: number = 10): Promise<ApiDrinksResponse> => {
  try {
    console.log('Fetching drinks for user:', userId);
    
    const response = await fetch(`${API_BASE_URL}/meal-plan/healthy-drink/${userId}?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Fetched drinks:', data);
    return data;
  } catch (error) {
    console.error('Error fetching user drinks:', error);
    throw error;
  }
};

export const createHealthyDrink = async (drinkData: CreateDrinkRequest): Promise<ApiDrinkPlan> => {
  try {
    console.log('Creating healthy drink with data:', drinkData);
    
    const response = await fetch(`${API_BASE_URL}/meal-plan/healthy-drink`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(drinkData),
    });

    const data = await response.json();
    console.log('API Response:', data);
    
    // Check for specific error codes first
    if (data.code === "03") {
      console.log('Subscription limit reached - code 03 detected');
      const error = new Error(data.message || "No healthy drinks available according to your subscription");
      (error as any).code = "03";
      throw error;
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('Created drink plan:', data);
    return data;
  } catch (error) {
    console.error('Error creating healthy drink:', error);
    throw error;
  }
};

export interface CreateHealthyDrinkJobResponse {
  jobId: string;
}

export const createHealthyDrinkJob = async (
  drinkData: CreateDrinkRequest
): Promise<CreateHealthyDrinkJobResponse> => {
  const response = await fetch(`${API_BASE_URL}/meal-plan/healthy-drink`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(drinkData),
  });

  const data = await response.json();
  console.log('createHealthyDrinkJob response:', data);

  if (data?.code === "03") {
    const error = new Error(
      data.message || "No healthy drinks available according to your subscription"
    );
    (error as any).code = "03";
    throw error;
  }

  if (!response.ok) {
    throw new Error(data?.message || `Failed to create healthy drink: ${response.status}`);
  }

  if (!data?.jobId) {
    throw new Error("Server did not return a jobId");
  }

  return { jobId: data.jobId };
};
