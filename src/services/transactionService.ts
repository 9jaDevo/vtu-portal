import { apiClient } from './apiClient';

interface Transaction {
  id: string;
  type: 'airtime' | 'data' | 'tv' | 'electricity' | 'education' | 'insurance';
  amount: number;
  user_discount: number;
  total_amount: number;
  recipient: string;
  provider: string;
  plan_id?: string;
  status: 'pending' | 'success' | 'failed' | 'reversed';
  description: string;
  created_at: string;
  purchased_code?: string;
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

interface TransactionStats {
  total_transactions: number;
  successful_transactions: number;
  failed_transactions: number;
  pending_transactions: number;
  total_amount_spent: number;
  monthly_transactions: number;
  monthly_amount: number;
  total_discounts_given: number;
}

interface ServiceProvider {
  id: string;
  name: string;
  type: string;
  code: string;
  logo_url?: string;
  commission_rate: number;
  commission_type: 'percentage' | 'flat_fee';
  flat_fee_amount: number;
  is_enabled: boolean;
  plan_count: number;
}

interface ServicePlan {
  id: string;
  name: string;
  code: string;
  amount: number;
  validity?: string;
  description?: string;
}

interface TransactionFormData {
  type: string;
  provider: string;
  plan_id?: string;
  amount: number;
  recipient: string;
  biller_code?: string;
  variation_code?: string;
  quantity?: number;
  subscription_type?: string;
  // Insurance specific fields
  Insured_Name?: string;
  engine_capacity?: string;
  Chasis_Number?: string;
  Plate_Number?: string;
  vehicle_make?: string;
  vehicle_color?: string;
  vehicle_model?: string;
  YearofMake?: string;
  state?: string;
  lga?: string;
  email?: string;
}

export const transactionService = {
  async getTransactions(page: number = 1, limit: number = 20): Promise<TransactionsResponse> {
    const response = await apiClient.get(`/transactions?page=${page}&limit=${limit}`);
    return response.data;
  },

  async getTransaction(id: string): Promise<Transaction> {
    const response = await apiClient.get(`/transactions/${id}`);
    return response.data;
  },

  async getStats(): Promise<TransactionStats> {
    const response = await apiClient.get('/transactions/stats/summary');
    return response.data;
  },

  async getProviders(): Promise<ServiceProvider[]> {
    const response = await apiClient.get('/transactions/services/providers');
    return response.data;
  },

  async getPlans(providerId: string): Promise<ServicePlan[]> {
    const response = await apiClient.get(`/transactions/services/providers/${providerId}/plans`);
    return response.data;
  },

  async getDynamicPlans(providerId: string): Promise<ServicePlan[]> {
    const response = await apiClient.get(`/transactions/services/providers/${providerId}/dynamic-plans`);
    return response.data;
  },

  async createTransaction(data: TransactionFormData): Promise<Transaction> {
    const response = await apiClient.post('/transactions', data);
    return response.data.transaction;
  },

  // Customer verification methods
  async verifyCustomer(serviceId: string, customerId: string, type?: string) {
    const response = await apiClient.post('/transactions/verify-customer', {
      serviceId,
      customerId,
      type
    });
    return response.data;
  },

  async verifyDSTVCustomer(smartcardNumber: string) {
    const response = await apiClient.post('/transactions/verify-dstv-customer', {
      smartcardNumber
    });
    return response.data;
  },

  async verifyGOTVCustomer(smartcardNumber: string) {
    const response = await apiClient.post('/transactions/verify-gotv-customer', {
      smartcardNumber
    });
    return response.data;
  },

  async verifyStartimesCustomer(smartcardNumber: string) {
    const response = await apiClient.post('/transactions/verify-startimes-customer', {
      smartcardNumber
    });
    return response.data;
  },

  async verifyElectricityCustomer(serviceId: string, meterNumber: string, meterType: 'prepaid' | 'postpaid') {
    const response = await apiClient.post('/transactions/verify-electricity-customer', {
      serviceId,
      meterNumber,
      meterType
    });
    return response.data;
  },

  async verifyJambCustomer(profileId: string, variationCode: string) {
    const response = await apiClient.post('/transactions/verify-jamb-customer', {
      profileId,
      variationCode
    });
    return response.data;
  },

  // Insurance auxiliary data methods
  async getVehicleColors() {
    const response = await apiClient.get('/transactions/insurance/vehicle-colors');
    return response.data;
  },

  async getEngineCapacities() {
    const response = await apiClient.get('/transactions/insurance/engine-capacities');
    return response.data;
  },

  async getStates() {
    const response = await apiClient.get('/transactions/insurance/states');
    return response.data;
  },

  async getLGAs(stateCode: string) {
    const response = await apiClient.get(`/transactions/insurance/lgas/${stateCode}`);
    return response.data;
  },

  async getVehicleMakes() {
    const response = await apiClient.get('/transactions/insurance/vehicle-makes');
    return response.data;
  },

  async getVehicleModels(vehicleMakeCode: string) {
    const response = await apiClient.get(`/transactions/insurance/vehicle-models/${vehicleMakeCode}`);
    return response.data;
  }
};