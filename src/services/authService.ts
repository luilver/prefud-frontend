interface LoginResponse {
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  expirationToken: string;
  token: string;
  refreshToken?: string;
  userId: string;
}

interface ApiResponse {
  message: string;
  success?: boolean;
}

interface ApiErrorResponse {
  message: {
    message: string | string[];
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
  phonePrefix?: string;
  userId: string;
  ruku_client_id: string;
  suscription_id: string;
  languages?: string;
  country?: string;
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
  classification: string;
  carbonFootPrintToWaste: number;
  daysToExpire: number;
  dayAdded: string;
}

interface SubscriptionInfo {
  userId: string;
  subscriptionTypeId: string;
  dayOfTheMonth: number;
  dateStarted: string;
  status: boolean;
  mealPlans: number;
  specialMeals: number;
  healthyDrinks: number;
  generateMeals: number;
  processImages?: number;
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface CompleteLoginResponse extends LoginResponse {
  profile: UserProfile;
  pantry: {
    originalResponse: PantryApiResponse;
    transformedItems: PantryItem[];
  };
  subscription: SubscriptionInfo | null;
}

class AuthService {
  private baseURL = import.meta.env.VITE_BASE_URL ||'https://pantry-ms-brain.onrender.com';
  private pantryURL = import.meta.env.VITE_PANTRY_URL || 'https://pantry-ms-brain.onrender.com';

  async login(email: string, password: string): Promise<CompleteLoginResponse> {
    try {
      const response = await fetch(`${this.baseURL}/security/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const responseData = await response.json();

      // Check for ACCOUNT_INCOMPLETE before any other handling
      if (responseData.code === 'ACCOUNT_INCOMPLETE') {
        const error = new Error(responseData.message || 'Account incomplete');
        (error as any).code = 'ACCOUNT_INCOMPLETE';
        (error as any).email = email; // Use the email from the form since response may have empty email
        (error as any).userId = responseData.userId; // May or may not be present
        throw error;
      }

      if (!response.ok) {
        // Handle both array and string error messages
        const errorMessage = Array.isArray(responseData.message?.message) 
          ? responseData.message.message[0] 
          : responseData.message?.message || responseData.message;
        throw new Error(errorMessage);
      }

      const loginData: LoginResponse = responseData;
      
      // Fetch user profile after successful login
      const profile = await this.getProfile(loginData.userId);
      
      // Fetch user pantry after successful login
      const pantry = await this.getPantry(loginData.userId);
      
      // Fetch user subscription after successful login
      const subscription = await this.getSubscription(loginData.userId);
      
      return {
        ...loginData,
        profile,
        pantry,
        subscription
      };
    } catch (error) {
      console.error('Login error:', error);
      // Re-throw the error so it can be handled by the UI
      throw error;
    }
  }

  async loginFirebase(token: string): Promise<CompleteLoginResponse> {
    try {
      const response = await fetch(`${this.baseURL}/security/loginfirebase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({})
      });

      const responseData = await response.json();

      if (responseData.code === 'ACCOUNT_INCOMPLETE') {
        const error = new Error(responseData.message || 'Account incomplete');
        (error as any).code = 'ACCOUNT_INCOMPLETE';
        (error as any).userId = responseData.userId;
        throw error;
      }

      if (!response.ok) {
        const errorMessage = Array.isArray(responseData.message?.message) 
          ? responseData.message.message[0] 
          : responseData.message?.message || responseData.message;
        const err = new Error(errorMessage);
        (err as any).statusCode = response.status;
        (err as any).responseData = responseData;
        throw err;
      }

      const loginData: LoginResponse = responseData;
      const profile = await this.getProfile(loginData.userId);
      const pantry = await this.getPantry(loginData.userId);
      const subscription = await this.getSubscription(loginData.userId);
      
      return {
        ...loginData,
        profile,
        pantry,
        subscription
      };
    } catch (error) {
      console.error('Firebase Login error:', error);
      throw error;
    }
  }

  async refreshToken(token: string): Promise<CompleteLoginResponse> {
    try {
      const response = await fetch(`${this.baseURL}/security/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken: token })
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = Array.isArray(responseData.message?.message) 
          ? responseData.message.message[0] 
          : responseData.message?.message || responseData.message;
        throw new Error(errorMessage);
      }

      const loginData: LoginResponse = responseData;
      
      // Fetch user profile
      const profile = await this.getProfile(loginData.userId);
      // Fetch user pantry
      const pantry = await this.getPantry(loginData.userId);
      // Fetch user subscription
      const subscription = await this.getSubscription(loginData.userId);
      
      return {
        ...loginData,
        profile,
        pantry,
        subscription
      };
    } catch (error) {
      console.error('Refresh Token error:', error);
      throw error;
    }
  }

  async signupFirebase(token: string, additionalData: any = {}): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/security/signupfirebase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(additionalData)
      });
      const responseData = await response.json();
      if (!response.ok) {
        const errorMessage = Array.isArray(responseData.message?.message) 
          ? responseData.message.message[0] 
          : responseData.message?.message || responseData.message;
        throw new Error(errorMessage);
      }
      return responseData;
    } catch (error) {
      console.error('Firebase Signup error:', error);
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
        const errorMessage = Array.isArray(errorData.message.message) 
          ? errorData.message.message[0] 
          : errorData.message.message;
        throw new Error(errorMessage);
      }

      const profileData: UserProfile = await response.json();
      return profileData;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  async updateProfile(userId: string, token: string, data: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await fetch(`${this.baseURL}/user-profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json();
        const errorMessage = Array.isArray(errorData.message?.message) 
          ? errorData.message.message[0] 
          : errorData.message?.message || 'Failed to update profile';
        throw new Error(errorMessage);
      }

      const updatedProfile: UserProfile = await response.json();
      return updatedProfile;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  async getPantry(userId: string): Promise<{ originalResponse: PantryApiResponse; transformedItems: PantryItem[] }> {
    try {
      const response = await fetch(`${this.pantryURL}/meal-plan/pantry/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json();
        const errorMessage = Array.isArray(errorData.message.message) 
          ? errorData.message.message[0] 
          : errorData.message.message;
        throw new Error(errorMessage);
      }

      const pantryResponse: PantryApiResponse = await response.json();
      console.log('Pantry API response:', pantryResponse);
      
      // Transform API response to internal format while preserving original data
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
          notes: `Carbon footprint: ${ingredient.carbonFootPrintToWaste}kg CO2`,
          // Preserve original API fields
          classification: ingredient.classification,
          carbonFootPrintToWaste: ingredient.carbonFootPrintToWaste,
          daysToExpire: ingredient.daysToExpire,
          dayAdded: ingredient.dayAdded
        };
      });
      
      console.log('Transformed pantry items:', transformedPantryItems);
      return {
        originalResponse: pantryResponse,
        transformedItems: transformedPantryItems
      };
    } catch (error) {
      console.error('Get pantry error:', error);
      // Return empty data if pantry fetch fails to not break the login flow
      console.log('Returning empty pantry due to error');
      return {
        originalResponse: { _id: '', user_id: userId, ingredients: [], createdAt: '', updatedAt: '', __v: 0 },
        transformedItems: []
      };
    }
  }

  async getSubscription(userId: string): Promise<SubscriptionInfo | null> {
    try {
      const response = await fetch(`${this.baseURL}/subscription/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json();
        console.error('Subscription API error:', errorData);
        // Return null if subscription fetch fails to not break the login flow
        return null;
      }

      const subscriptionData: SubscriptionInfo = await response.json();
      console.log('Subscription data:', subscriptionData);
      return subscriptionData;
    } catch (error) {
      console.error('Get subscription error:', error);
      // Return null if subscription fetch fails to not break the login flow
      return null;
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

  async updatePassword(userId: string, oldPassword: string, newPassword: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseURL}/security/update-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          oldPassword: oldPassword,
          newPassword: newPassword
        })
      });

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json();
        // Handle both array and string error messages
        const errorMessage = Array.isArray(errorData.message.message) 
          ? errorData.message.message[0] 
          : errorData.message.message;
        throw new Error(errorMessage);
      }

      const data: ApiResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  }

  async resendOTP(userId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseURL}/security/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId
        })
      });

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json();
        // Handle both array and string error messages
        const errorMessage = Array.isArray(errorData.message.message) 
          ? errorData.message.message[0] 
          : errorData.message.message;
        throw new Error(errorMessage);
      }

      const data: ApiResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Resend OTP error:', error);
      throw error;
    }
  }

  async requestPasswordReset(email: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseURL}/security/request-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email
        })
      });

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json();
        // Handle both array and string error messages
        const errorMessage = Array.isArray(errorData.message.message) 
          ? errorData.message.message[0] 
          : errorData.message.message;
        throw new Error(errorMessage);
      }

      const data: ApiResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Request password reset error:', error);
      throw error;
    }
  }

  async validateOTP(email: string, otp: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseURL}/security/validate-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          otp: otp
        })
      });

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json();
        // Handle both array and string error messages
        const errorMessage = Array.isArray(errorData.message.message) 
          ? errorData.message.message[0] 
          : errorData.message.message;
        throw new Error(errorMessage);
      }

      const data: ApiResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Validate OTP error:', error);
      throw error;
    }
  }

  async resetPassword(email: string, otp: string, newPassword: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseURL}/security/recover-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          newPassword: newPassword
        })
      });

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json();
        // Handle both array and string error messages
        const errorMessage = Array.isArray(errorData.message.message) 
          ? errorData.message.message[0] 
          : errorData.message.message;
        throw new Error(errorMessage);
      }

      const data: ApiResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
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
