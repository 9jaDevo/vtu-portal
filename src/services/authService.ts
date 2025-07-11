import { apiClient } from './apiClient';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: string;
  };
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  async register(userData: RegisterData): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  }
};