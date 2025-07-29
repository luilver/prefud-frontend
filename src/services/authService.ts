
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

class AuthService {
  private baseURL = 'https://pantry-auth-1.onrender.com';

  async login(email: string, password: string): Promise<LoginResponse> {
    // Mock implementation - will be replaced with actual API call
    const mockResponse: LoginResponse = {
      email: email,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expirationToken: new Date(Date.now() + 3600000).toISOString(),
      token: "mock-jwt-token-" + Date.now(),
      userId: "mock-user-id-" + Math.random().toString(36).substr(2, 9)
    };

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    return mockResponse;
  }

  async requestPasswordReset(email: string): Promise<ApiResponse> {
    // Mock implementation
    console.log('Password reset requested for:', email);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      message: 'Password reset code has been sent to your email'
    };
  }

  async verifyOTP(email: string, otp: string): Promise<ApiResponse> {
    // Mock implementation
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
    // Mock implementation
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
