import { apiClient } from './apiClient';

interface DashboardStats {
  users: {
    total_users: number;
    active_users: number;
    suspended_users: number;
    new_users_this_month: number;
  };
  transactions: {
    total_transactions: number;
    successful_transactions: number;
    failed_transactions: number;
    pending_transactions: number;
    total_volume: number;
    total_discounts_given: number;
    transactions_this_month: number;
  };
  wallets: {
    total_wallet_balance: number;
    average_wallet_balance: number;
    total_wallets: number;
  };
}

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: string;
  status: 'active' | 'suspended' | 'pending';
  email_verified: boolean;
  created_at: string;
  wallet_balance: number;
}

interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface Transaction {
  id: string;
  type: 'airtime' | 'data' | 'tv' | 'electricity' | 'education' | 'insurance';
  amount: number;
  user_discount: number;
  total_amount: number;
  recipient: string;
  provider: string;
  status: 'pending' | 'success' | 'failed' | 'reversed';
  user_email: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

interface TransactionsResponse {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface ServiceProvider {
  id: string;
  name: string;
  type: 'airtime' | 'data' | 'tv' | 'electricity' | 'education' | 'insurance';
  code: string;
  logo_url?: string;
  status: 'active' | 'inactive';
  commission_rate: number;
  commission_type: 'percentage' | 'flat_fee';
  flat_fee_amount: number;
  is_enabled: boolean;
  plan_count: number;
  created_at: string;
  updated_at: string;
}

export const adminService = {
  async getStats(): Promise<DashboardStats> {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  },

  async getUsers(page: number = 1, limit: number = 20, search?: string): Promise<UsersResponse> {
    let url = `/admin/users?page=${page}&limit=${limit}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    const response = await apiClient.get(url);
    return response.data;
  },

  async getTransactions(page: number = 1, limit: number = 20, status?: string, type?: string, search?: string): Promise<TransactionsResponse> {
    let url = `/admin/transactions?page=${page}&limit=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }
    if (type) {
      url += `&type=${type}`;
    }
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    const response = await apiClient.get(url);
    return response.data;
  },

  async updateUserStatus(userId: string, status: 'active' | 'suspended'): Promise<{ message: string }> {
    const response = await apiClient.patch(`/admin/users/${userId}/status`, { status });
    return response.data;
  },

  async getProviders() {
    const response = await apiClient.get('/admin/providers');
    return response.data;
  },

  async getPlans(providerId?: string) {
    let url = '/admin/plans';
    if (providerId) {
      url += `?provider_id=${providerId}`;
    }
    const response = await apiClient.get(url);
    return response.data;
  },

  async getServices(): Promise<ServiceProvider[]> {
    const response = await apiClient.get('/admin/services');
    return response.data;
  },

  async updateServiceCommission(
    id: string, 
    data: { 
      commission_rate?: number; 
      commission_type?: 'percentage' | 'flat_fee'; 
      flat_fee_amount?: number; 
      is_enabled?: boolean;
    }
  ): Promise<{ message: string }> {
    const response = await apiClient.patch(`/admin/services/${id}`, data);
    return response.data;
  },

  async getSettings() {
    const response = await apiClient.get('/admin/settings');
    return response.data;
  },

  async updateSetting(key: string, value: any) {
    const response = await apiClient.patch(`/admin/settings/${key}`, { value });
    return response.data;
  },

  async resetUserPassword(userId: string, newPassword: string): Promise<{ message: string }> {
    const response = await apiClient.patch(`/admin/users/${userId}/reset-password`, { newPassword });
    return response.data;
  },

  async creditUserWallet(userId: string, amount: number): Promise<{ message: string; amount: number; newBalance: number }> {
    const response = await apiClient.post(`/admin/users/${userId}/credit-wallet`, { amount });
    return response.data;
  }
};