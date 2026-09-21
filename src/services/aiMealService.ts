import { getAuthHeaders } from "@/services/firebaseAuthService";

const API_MEALS = import.meta.env.VITE_PANTRY_URL || 'https://pantry-ms-brain.onrender.com';

interface AIMealRequest {
  userId: string;
  cuisinePreferences: string[];
  allergiesIntolerance: string[];
  customIntolerance?: string;
  nameOfMeal?: string;
}

interface AIMealResponse {
  code?: string;
  message?: string;
  [key: string]: any;
}

export class SubscriptionLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SubscriptionLimitError';
  }
}

export const createAIMeal = async (mealData: AIMealRequest): Promise<AIMealResponse> => {
  try {
    console.log("Sending AI meal request with payload:", mealData);

    const headers = await getAuthHeaders();
    const response = await fetch(`${API_MEALS}/meal-plan/special`, {
      method: 'POST',
      headers,
      body: JSON.stringify(mealData)
    });

    const data = await response.json();
    console.log("AI meal API response:", data);

    // Check for subscription limit error (code "03")
    if (data.code === "03" || data.message?.includes("No special meals available according to your subscription")) {
      throw new SubscriptionLimitError(data.message || "No special meals available according to your subscription");
    }

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Error creating AI meal:', error);
    throw error;
  }
};

export interface CreateAIMealJobResponse {
  jobId: string;
}

export const createAIMealJob = async (
  mealData: AIMealRequest
): Promise<CreateAIMealJobResponse> => {
  console.log('createAIMealJob payload:', mealData);

  const headers = await getAuthHeaders();
  const response = await fetch(`${API_MEALS}/meal-plan/special`, {
    method: 'POST',
    headers,
    body: JSON.stringify(mealData),
  });

  const data = await response.json();
  console.log('createAIMealJob response:', data);

  if (
    data?.code === '03' ||
    data?.message?.includes('No special meals available according to your subscription')
  ) {
    throw new SubscriptionLimitError(
      data.message || 'No special meals available according to your subscription'
    );
  }

  if (!response.ok) {
    throw new Error(data?.message || `Failed to create AI meal: ${response.status}`);
  }

  if (!data?.jobId) {
    throw new Error('Server did not return a jobId');
  }

  return { jobId: data.jobId };
};