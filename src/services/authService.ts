interface LoginResponse {
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  expirationToken: string;
  token: string;
  userId: string;
}

interface ApiResponse {
  message: string;
}

interface ApiErrorResponse {
  message: {
    message: string;
    error: string;
    statusCode: number;
  };
  path_url: string;
}

interface UserProfile {
  _id: string;
  name: string;
  lastName: string;
  weight: number;
  height: number;
  birthday: string;
  healthGoals: {
    dailyCaloriesGoal: number;
    mealsPerDay: number;
    personCount: number;
    _id: string;
  };
  dietTypes: string[];
  alergies: string[];
  phone: string;
  userId: string;
  ruku_client_id: string;
  suscription_id: string;
  addressId: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface PantryApiResponse {
  _id: string;
  user_id: string;
  ingredients: {
    name: string;
    quantity: number;
    unit: string;
    classification: string;
    carbonFootPrintToWaste: number;
    daysToExpire: number;
    dayAdded: string;
  }[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface PantryItem {
  _id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  expiryDate: string;
  purchaseDate: string;
  location?: string;
  notes?: string;
}

interface CompleteLoginResponse extends LoginResponse {
  profile: UserProfile;
  pantry: PantryItem[];
}

class AuthService {
  private baseURL = 'https://pantry-auth-1.onrender.com';
  private pantryURL = 'https://pantry-ms-brain.onrender.com';

  async login(email: string, password: string): Promise<CompleteLoginResponse> {
    try {
      const response = await fetch(`${this.baseURL}/security/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json();
        throw new Error(errorData.message.message);
      }

      const loginData: LoginResponse = await response.json();
      
      // Fetch user profile after successful login
      const profile = await this.getProfile(loginData.userId);
      
      // Fetch user pantry after successful login
      const pantry = await this.getPantry(loginData.userId);
      
      return {
        ...loginData,
        profile,
        pantry
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async getProfile(userId: string): Promise<UserProfile> {
    try {
      const response = await fetch(`${this.baseURL}/user-profile/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json();
        throw new Error(errorData.message.message);
      }

      const profileData: UserProfile = await response.json();
      return profileData;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  async getPantry(userId: string): Promise<PantryItem[]> {
    try {
      const response = await fetch(`${this.pantryURL}/meal-plan/pantry/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json();
        throw new Error(errorData.message.message);
      }

      const pantryResponse: PantryApiResponse = await response.json();
      console.log('Pantry API response:', pantryResponse);
      
      // Transform API response to internal format
      const transformedPantryItems: PantryItem[] = pantryResponse.ingredients.map((ingredient) => {
        const dayAdded = new Date(ingredient.dayAdded);
        const expiryDate = new Date(dayAdded);
        expiryDate.setDate(expiryDate.getDate() + ingredient.daysToExpire);
        
        return {
          _id: `${pantryResponse._id}_${ingredient.name}`, // Create unique ID
          name: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          category: this.mapClassificationToCategory(ingredient.classification),
          expiryDate: expiryDate.toISOString(),
          purchaseDate: ingredient.dayAdded,
          notes: `Carbon footprint: ${ingredient.carbonFootPrintToWaste}kg CO2`
        };
      });
      
      console.log('Transformed pantry items:', transformedPantryItems);
      return transformedPantryItems;
    } catch (error) {
      console.error('Get pantry error:', error);
      // Return empty array if pantry fetch fails to not break the login flow
      console.log('Returning empty pantry due to error');
      return [];
    }
  }

  private mapClassificationToCategory(classification: string): string {
    const categoryMap: Record<string, string> = {
      'dairy': 'Dairy',
      'nut': 'Pantry',
      'protein': 'Meat',
      'vegetable': 'Vegetables',
      'fruit': 'Fruits',
      'grain': 'Grains',
      'spice': 'Pantry',
      'herb': 'Pantry'
    };
    
    return categoryMap[classification.toLowerCase()] || 'Pantry';
  }

  async requestPasswordReset(email: string): Promise<ApiResponse> {
    // Mock implementation - will be replaced with actual API call
    console.log('Password reset requested for:', email);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      message: 'Password reset code has been sent to your email'
    };
  }

  async verifyOTP(email: string, otp: string): Promise<ApiResponse> {
    // Mock implementation - will be replaced with actual API call
    console.log('Verifying OTP:', otp, 'for email:', email);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (otp.length === 6) {
      return {
        message: 'OTP verified successfully'
      };
    } else {
      throw new Error('Invalid OTP');
    }
  }

  async resetPassword(email: string, otp: string, newPassword: string): Promise<ApiResponse> {
    // Mock implementation - will be replaced with actual API call
    console.log('Resetting password for:', email);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      message: 'Password has been reset successfully'
    };
  }

  getStoredToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isTokenExpired(expirationToken: string): boolean {
    const expirationTime = new Date(expirationToken).getTime();
    const currentTime = new Date().getTime();
    return currentTime >= expirationTime;
  }
}

export const authService = new AuthService();
