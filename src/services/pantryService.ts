
import axios from "axios";

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  classification: string;
  carbonFootPrintToWaste: number;
  daysToExpire: number;
  dayAdded: string;
}

export interface PantryIngredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  purchased: boolean;
  purchaseDate: string;
  carbonFootPrintToWaste: number;
  daysToExpire: number;
  expiryDate: string;
  notes: string;
}

const BASE_URL = import.meta.env.VITE_PANTRY_URL || 'https://pantry-ms-brain.onrender.com';

export interface AnalyzeImageJobResponse {
  jobId: string;
}

/**
 * Submit an image (base64) to the analyze-image endpoint.
 * Returns a jobId that is then resolved asynchronously via socket
 * (generationCompleted / generationFailed).
 */
export const analyzeImageJob = async (
  userId: string,
  image: File | Blob,
  filename?: string
): Promise<AnalyzeImageJobResponse> => {
  const form = new FormData();
  form.append("userId", userId);
  const finalName =
    filename || (image as File).name || "photo.jpg";
  form.append("image", image, finalName);

  const headers: Record<string, string> = {};
  try {
    const token = localStorage.getItem("authToken");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  } catch {}

  const response = await axios.post(
    `${BASE_URL}/meal-plan/analyze-image`,
    form,
    { headers }
  );

  const data = response.data;
  console.log("analyzeImageJob response:", data);

  if (!data?.jobId) {
    throw new Error("Server did not return a jobId");
  }

  return { jobId: data.jobId };
};

export const updatePantry = async (
  userId: string,
  ingredients: Ingredient[]
): Promise<any> => {
  try {
    console.log('Updating pantry for user:', userId);
    console.log('With ingredients:', ingredients);
    
    const response = await axios.put(
      `${BASE_URL}/meal-plan/pantry/${userId}`,
      { user_id: userId, ingredients },
      { headers: { "Content-Type": "application/json" } }
    );
    
    console.log('Pantry update response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error updating pantry:", error.response?.data || error.message);
    throw error;
  }
};

export const addIngredientsToPantry = async (
  userId: string,
  ingredients: PantryIngredient[]
): Promise<any> => {
  try {
    console.log('Adding ingredients to pantry for user:', userId);
    console.log('With ingredients:', ingredients);
    
    const response = await axios.patch(
      `${BASE_URL}/meal-plan/pantry/${userId}/add-ingredients`,
      ingredients,
      { headers: { "Content-Type": "application/json" } }
    );
    
    console.log('Add ingredients response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error adding ingredients to pantry:", error.response?.data || error.message);
    throw error;
  }
};

export const getPantry = async (userId: string): Promise<any> => {
  try {
    const response = await axios.get(
      `${BASE_URL}/meal-plan/pantry/${userId}`,
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error getting pantry:", error.response?.data || error.message);
    throw error;
  }
};

export const updateMealConsumed = async (
  planId: string,
  mealId: string,
  consumed: boolean,
  day: number
): Promise<any> => {
  try {
    console.log(`Updating meal consumed for plan: ${planId}, meal: ${mealId}`);

    const response = await axios.patch(
      `${BASE_URL}/meal-plan/updateconsumed?plan=${planId}&meal=${mealId}`,
      { consumed, day },
      { headers: { "Content-Type": "application/json" } }
    );

    console.log("Update meal consumed response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      "Error updating meal consumed:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const generateMealsFromPantry = async (
  userId: string,
  startDate: string,
  servings: number,
  language: string
): Promise<any> => {
  try {
    console.log('Generating meals from pantry for user:', userId);
    
    const response = await axios.post(
      `${BASE_URL}/meal-plan/generateMeals`,
      {
        user_id: userId,
        start_date: startDate,
        servings,
        language
      },
      { headers: { "Content-Type": "application/json" } }
    );
    
    console.log('Generate meals response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error generating meals:", error.response?.data || error.message);
    throw error;
  }
};

export class PantryMealsNoIngredientsError extends Error {
  apiMessage?: string;
  constructor(message?: string) {
    super(message || "No ingredients available");
    this.name = "PantryMealsNoIngredientsError";
    this.apiMessage = message;
  }
}

export class PantryMealsSubscriptionLimitError extends Error {
  apiMessage?: string;
  constructor(message?: string) {
    super(message || "Subscription limit reached");
    this.name = "PantryMealsSubscriptionLimitError";
    this.apiMessage = message;
  }
}

export const generateMealsFromPantryJob = async (
  userId: string,
  startDate: string,
  servings: number,
  language: string
): Promise<{ jobId: string }> => {
  try {
    const response = await axios.post(
      `${BASE_URL}/meal-plan/generateMeals`,
      {
        user_id: userId,
        start_date: startDate,
        servings,
        language,
      },
      { headers: { "Content-Type": "application/json" } }
    );

    const data = response.data || {};

    if (data.code === "02") {
      throw new PantryMealsNoIngredientsError(data.message);
    }
    if (data.code === "03") {
      throw new PantryMealsSubscriptionLimitError(data.message);
    }

    if (!data.jobId) {
      throw new Error("Invalid response: missing jobId");
    }

    return { jobId: data.jobId };
  } catch (error: any) {
    if (
      error instanceof PantryMealsNoIngredientsError ||
      error instanceof PantryMealsSubscriptionLimitError
    ) {
      throw error;
    }
    console.error(
      "Error creating pantry meals job:",
      error.response?.data || error.message
    );
    throw error;
  }
};
