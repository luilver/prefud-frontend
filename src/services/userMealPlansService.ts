
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://lovable-meal-planner.onrender.com/api';

export const getMealPlansByUser = async (userId: string) => {
  try {
    console.log('Fetching meal plans for user:', userId);
    
    const response = await fetch(`${API_BASE_URL}/meal-plans/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
