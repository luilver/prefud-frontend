
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

interface CompleteLoginResponse extends LoginResponse {
  profile: UserProfile;
}

class AuthService {
  private baseURL = 'https://pantry-auth-1.onrender.com';

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
      
      return {
        ...loginData,
        profile
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
