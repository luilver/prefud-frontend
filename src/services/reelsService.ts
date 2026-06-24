import axios from 'axios';

const BASE_URL = 'https://pantry-ms-brain.onrender.com';

export interface ReelIngredient {
  name: string;
  quantity: number;
  unit: string;
  classification: string;
  carbonFootPrintToWaste: number;
  daysToExpire: number;
}

export interface NutritionalInfo {
  protein: number;
  fat: number;
  carbohydrates: number;
  fiber: number;
  vitamins: string[];
}

export interface Reel {
  _id: string;
  name: string;
  description: string;
  benefits: string[];
  instructions: string[];
  prepTip: string;
  cookingTime: number;
  carbonFootprint: number;
  steps: string[];
  calories: number;
  nutritionalInfo: NutritionalInfo;
  mealType: string;
  totalCarbonFootprint: number;
  ingredientsList: ReelIngredient[];
  servings: number;
  dietaryRestrictions: string[];
  cuisinePreferences: string[];
  allergiesIntolerance: string[];
  customIntolerance: string;
  healthGoals: string[];
  videoUrl: string;
  likes: number;
  saved: number;
  shared: number;
  author: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReelsMeta {
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ReelsResponse {
  data: Reel[];
  meta: ReelsMeta;
}

export const getReelsPaginated = async (page: number = 0, limit: number = 8): Promise<ReelsResponse> => {
  try {
    const response = await axios.get<ReelsResponse>(`${BASE_URL}/reels/paginated`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching reels:', error);
    throw error;
  }
};

export const likeReel = async (reelId: string): Promise<void> => {
  try {
    await axios.post(`${BASE_URL}/reels/${reelId}/like`);
  } catch (error) {
    console.error('Error liking reel:', error);
    throw error;
  }
};

export const saveReel = async (reelId: string): Promise<void> => {
  try {
    await axios.post(`${BASE_URL}/reels/${reelId}/save`);
  } catch (error) {
    console.error('Error saving reel:', error);
    throw error;
  }
};

export const shareReel = async (reelId: string): Promise<void> => {
  try {
    await axios.post(`${BASE_URL}/reels/${reelId}/share`);
  } catch (error) {
    console.error('Error sharing reel:', error);
    throw error;
  }
};
