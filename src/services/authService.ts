
interface LoginResponse {
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  expirationToken: string;
  token: string;
  userId: string;
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

    /* 
    // Actual implementation (commented out for now):
    try {
      const response = await fetch(`${this.baseURL}/security/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
    */
  }

  async resetPassword(email: string): Promise<void> {
    // Mock implementation
    console.log('Password reset requested for:', email);
    await new Promise(resolve => setTimeout(resolve, 1000));
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
