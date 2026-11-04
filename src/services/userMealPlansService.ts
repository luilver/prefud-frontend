import { getAuthHeaders } from "@/services/firebaseAuthService";
import { API_BASE_URL, PANTRY_API_URL } from "@/config/api";

const API_MEALS = PANTRY_API_URL;

export const getMealPlansByUser = async (userId: string, page: number = 1, limit: number = 5) => {
  try {
    console.log(`Fetching meal plans for user: ${userId}, page: ${page}, limit: ${limit}`);
    
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/meal-plans/user/${userId}?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Fetched meal plans:', data);
    return data;
  } catch (error) {
    console.error('Error fetching user meal plans:', error);
    throw error;
  }
};

export const getSpecialMealsByUser = async (userId: string, page: number = 1, limit: number = 5) => {
  try {
    console.log(`Fetching special meals for user: ${userId}, page: ${page}, limit: ${limit}`);
    
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_MEALS}/meal-plan/special/${userId}?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Fetched special meals:', data);
    return data;
  } catch (error) {
    console.error('Error fetching special meals:', error);
    throw error;
  }
};
