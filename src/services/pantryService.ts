
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

const BASE_URL = import.meta.env.VITE_PANTRY_URL || 'https://pantry-ms-brain.onrender.com';

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
