import { apiClient } from './apiClient';

interface WalletBalance {
  id: string;
  balance: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  balance_before: number;
  balance_after: number;
  reference: string;
  description: string;
  created_at: string;
}

interface WalletTransactionsResponse {
  transactions: WalletTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface WalletStats {
  total_credited: number;
  total_debited: number;
  credit_count: number;
  debit_count: number;
  monthly_credited: number;
  monthly_debited: number;
}

interface FundWalletData {
  amount: number;
  payment_method: 'bank_transfer' | 'card' | 'ussd';
  reference?: string;
}

export const walletService = {
  async getBalance(): Promise<WalletBalance> {
    const response = await apiClient.get('/wallet/balance');
    return response.data;
  },

  async getTransactions(page: number = 1, limit: number = 20): Promise<WalletTransactionsResponse> {
    const response = await apiClient.get(`/wallet/transactions?page=${page}&limit=${limit}`);
    return response.data;
  },

  async getStats(): Promise<WalletStats> {
    const response = await apiClient.get('/wallet/stats');
    return response.data;
  },

  async fundWallet(data: FundWalletData) {
    const response = await apiClient.post('/wallet/fund', data);
    return response.data;
  },
  
  async verifyPayment(reference: string) {
    const response = await apiClient.post('/wallet/verify-payment', { reference });
    return response.data;
  }
};