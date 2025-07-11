import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger.js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if Supabase is configured
const isSupabaseConfigured = supabaseUrl && 
  supabaseServiceKey && 
  supabaseUrl !== 'your_supabase_project_url_here' &&
  supabaseServiceKey !== 'your_supabase_service_role_key_here';

if (!isSupabaseConfigured) {
  logger.warn('Supabase not configured. Please set up your Supabase environment variables.');
  logger.warn('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file');
}

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl!, supabaseServiceKey!)
  : null;

logger.info('Supabase client status:', { configured: !!supabase });

// Helper functions for common database operations using native Supabase methods

// Users table operations
export async function findUser(email: string) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle();
    
  if (error) {
    throw error;
  }
  
  return data;
}

export async function findUserById(id: string) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .maybeSingle();
    
  if (error) {
    throw error;
  }
  
  return data;
}

export async function createUser(userData: any) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const { data, error } = await supabase
    .from('users')
    .insert(userData)
    .select()
    .single();
    
  if (error) {
    throw error;
  }
  
  return data;
}

export async function updateUser(id: string, userData: any) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const { data, error } = await supabase
    .from('users')
    .update(userData)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    throw error;
  }
  
  return data;
}

export async function countUsers(filters: { status?: string; role?: string; search?: string } = {}) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  let query = supabase.from('users').select('*', { count: 'exact', head: true });
  
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.role) {
    query = query.eq('role', filters.role);
  }
  if (filters.search) {
    query = query.or(`email.ilike.%${filters.search}%,first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%`);
  }
  
  const { count, error } = await query;
  
  if (error) {
    throw error;
  }
  
  return count || 0;
}

export async function getAllUsers(page: number = 1, limit: number = 20, filters: { search?: string } = {}) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const offset = (page - 1) * limit;
  
  let query = supabase
    .from('users')
    .select(`
      id, email, first_name, last_name, phone, role, status, 
      email_verified, created_at,
      wallets(balance)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (filters.search) {
    query = query.or(`email.ilike.%${filters.search}%,first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%`);
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw error;
  }
  
  // Flatten wallet balance
  return data?.map(user => ({
    ...user,
    wallet_balance: user.wallets?.[0]?.balance || 0
  })) || [];
}

// Wallet table operations
export async function findWallet(userId: string) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
    
  if (error) {
    throw error;
  }
  
  return data;
}

export async function createWallet(walletData: any) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const { data, error } = await supabase
    .from('wallets')
    .insert(walletData)
    .select()
    .single();
    
  if (error) {
    throw error;
  }
  
  return data;
}

export async function updateWallet(userId: string, newBalance: number) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const { data, error } = await supabase
    .from('wallets')
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single();
    
  if (error) {
    throw error;
  }
  
  return data;
}

export async function countWallets() {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const { count, error } = await supabase
    .from('wallets')
    .select('*', { count: 'exact', head: true });
    
  if (error) {
    throw error;
  }
  
  return count || 0;
}

export async function getWalletStats() {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const { data, error } = await supabase
    .from('wallets')
    .select('balance');
    
  if (error) {
    throw error;
  }
  
  const totalBalance = data?.reduce((sum, wallet) => sum + parseFloat(wallet.balance || '0'), 0) || 0;
  const averageBalance = data?.length ? totalBalance / data.length : 0;
  
  return {
    total_wallet_balance: totalBalance,
    average_wallet_balance: averageBalance,
    total_wallets: data?.length || 0
  };
}

// Transaction table operations
export async function createTransaction(transactionData: any) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const { data, error } = await supabase
    .from('transactions')
    .insert(transactionData)
    .select()
    .single();
    
  if (error) {
    throw error;
  }
  
  return data;
}

export async function updateTransaction(id: string, transactionData: any) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const { data, error } = await supabase
    .from('transactions')
    .update({ ...transactionData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    throw error;
  }
  
  return data;
}

export async function findTransactionById(id: string) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', id)
    .maybeSingle();
    
  if (error) {
    throw error;
  }
  
  return data;
}

export async function findTransactionByExternalReference(externalReference: string) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('external_reference', externalReference)
    .maybeSingle();
    
  if (error) {
    throw error;
  }
  
  return data;
}

export async function getAllTransactions(page: number = 1, limit: number = 20, filters: { userId?: string; status?: string; type?: string; search?: string } = {}) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const offset = (page - 1) * limit;
  
  let query = supabase
    .from('transactions')
    .select(`
      id, type, amount, user_discount, total_amount, recipient, provider, plan_id,
      status, description, created_at, updated_at,
      users(email, first_name, last_name)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (filters.userId) {
    query = query.eq('user_id', filters.userId);
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.type) {
    query = query.eq('type', filters.type);
  }
  if (filters.search) {
    query = query.or(`recipient.ilike.%${filters.search}%,provider.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw error;
  }
  
  // Flatten user data for admin routes
  return data?.map(transaction => ({
    ...transaction,
    user_email: transaction.users?.[0]?.email,
    first_name: transaction.users?.[0]?.first_name,
    last_name: transaction.users?.[0]?.last_name
  })) || [];
}

export async function countTransactions(filters: { userId?: string; status?: string; type?: string; search?: string } = {}) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  let query = supabase.from('transactions').select('*', { count: 'exact', head: true });
  
  if (filters.userId) {
    query = query.eq('user_id', filters.userId);
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.type) {
    query = query.eq('type', filters.type);
  }
  if (filters.search) {
    query = query.or(`recipient.ilike.%${filters.search}%,provider.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }
  
  const { count, error } = await query;
  
  if (error) {
    throw error;
  }
  
  return count || 0;
}

export async function getTransactionStats(filters: { userId?: string } = {}) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  let query = supabase.from('transactions').select('status, amount, user_discount, created_at');
  
  if (filters.userId) {
    query = query.eq('user_id', filters.userId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw error;
  }
  
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const stats = data?.reduce((acc, transaction) => {
    const transactionDate = new Date(transaction.created_at);
    const isThisMonth = transactionDate >= thirtyDaysAgo;
    
    acc.total_transactions++;
    
    if (transaction.status === 'success') {
      acc.successful_transactions++;
      acc.total_volume += parseFloat(transaction.amount || '0');
      acc.total_discounts_given += parseFloat(transaction.user_discount || '0');
      
      if (isThisMonth) {
        acc.transactions_this_month++;
      }
    } else if (transaction.status === 'failed') {
      acc.failed_transactions++;
    } else if (transaction.status === 'pending') {
      acc.pending_transactions++;
    }
    
    return acc;
  }, {
    total_transactions: 0,
    successful_transactions: 0,
    failed_transactions: 0,
    pending_transactions: 0,
    total_volume: 0,
    total_discounts_given: 0,
    transactions_this_month: 0
  }) || {
    total_transactions: 0,
    successful_transactions: 0,
    failed_transactions: 0,
    pending_transactions: 0,
    total_volume: 0,
    total_discounts_given: 0,
    transactions_this_month: 0
  };
  
  return stats;
}

export async function getUserTransactionStats(userId: string) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const { data, error } = await supabase
    .from('transactions')
    .select('status, amount, user_discount, created_at')
    .eq('user_id', userId);
  
  if (error) {
    throw error;
  }
  
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const stats = data?.reduce((acc, transaction) => {
    const transactionDate = new Date(transaction.created_at);
    const isThisMonth = transactionDate >= thirtyDaysAgo;
    
    acc.total_transactions++;
    
    if (transaction.status === 'success') {
      acc.successful_transactions++;
      acc.total_amount_spent += parseFloat(transaction.amount || '0');
      
      if (isThisMonth) {
        acc.monthly_transactions++;
        acc.monthly_amount += parseFloat(transaction.amount || '0');
        acc.monthly_saved += parseFloat(transaction.user_discount || '0');
      }
    } else if (transaction.status === 'failed') {
      acc.failed_transactions++;
    } else if (transaction.status === 'pending') {
      acc.pending_transactions++;
    }
    
    return acc;
  }, {
    total_transactions: 0,
    successful_transactions: 0,
    failed_transactions: 0,
    pending_transactions: 0,
    total_amount_spent: 0,
    monthly_transactions: 0,
    monthly_amount: 0,
    monthly_saved: 0
  }) || {
    total_transactions: 0,
    successful_transactions: 0,
    failed_transactions: 0,
    pending_transactions: 0,
    total_amount_spent: 0,
    monthly_transactions: 0,
    monthly_amount: 0,
    monthly_saved: 0
  };
  
  return stats;
}

// Wallet Transaction operations
export async function createWalletTransaction(walletTransactionData: any) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const { data, error } = await supabase
    .from('wallet_transactions')
    .insert(walletTransactionData)
    .select()
    .single();
    
  if (error) {
    throw error;
  }
  
  return data;
}

export async function getWalletTransactions(userId: string, page: number = 1, limit: number = 20) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const offset = (page - 1) * limit;
  
  const { data, error } = await supabase
    .from('wallet_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
    
  if (error) {
    throw error;
  }
  
  return data || [];
}

export async function countWalletTransactions(userId: string) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const { count, error } = await supabase
    .from('wallet_transactions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);
    
  if (error) {
    throw error;
  }
  
  return count || 0;
}

export async function getWalletTransactionStats(userId: string) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const { data, error } = await supabase
    .from('wallet_transactions')
    .select('type, amount, created_at')
    .eq('user_id', userId);
    
  if (error) {
    throw error;
  }
  
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const stats = data?.reduce((acc, transaction) => {
    const transactionDate = new Date(transaction.created_at);
    const isThisMonth = transactionDate >= thirtyDaysAgo;
    const amount = parseFloat(transaction.amount || '0');
    
    if (transaction.type === 'credit') {
      acc.total_credited += amount;
      acc.credit_count++;
      if (isThisMonth) {
        acc.monthly_credited += amount;
      }
    } else {
      acc.total_debited += amount;
      acc.debit_count++;
      if (isThisMonth) {
        acc.monthly_debited += amount;
      }
    }
    
    return acc;
  }, {
    total_credited: 0,
    total_debited: 0,
    credit_count: 0,
    debit_count: 0,
    monthly_credited: 0,
    monthly_debited: 0
  }) || {
    total_credited: 0,
    total_debited: 0,
    credit_count: 0,
    debit_count: 0,
    monthly_credited: 0,
    monthly_debited: 0
  };
  
  return stats;
}

// Payment Gateway Transaction operations
export async function createPaymentGatewayTransaction(data: any) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const { data: result, error } = await supabase
    .from('payment_gateway_transactions')
    .insert(data)
    .select()
    .single();
    
  if (error) {
    throw error;
  }
  
  return result;
}

export async function updatePaymentGatewayTransaction(id: string, data: any) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const { data: result, error } = await supabase
    .from('payment_gateway_transactions')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    throw error;
  }
  
  return result;
}

export async function findPaymentGatewayTransactionByReference(reference: string) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const { data, error } = await supabase
    .from('payment_gateway_transactions')
    .select('*')
    .eq('gateway_reference', reference)
    .maybeSingle();
    
  if (error) {
    throw error;
  }
  
  return data;
}

// Service Providers table operations
export async function findServiceProvider(code: string, type: string) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const { data, error } = await supabase
    .from('service_providers')
    .select('*')
    .eq('code', code)
    .eq('type', type)
    .maybeSingle();
    
  if (error) {
    throw error;
  }
  
  return data;
}

export async function createServiceProvider(providerData: any) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const { data, error } = await supabase
    .from('service_providers')
    .insert(providerData)
    .select()
    .single();
    
  if (error) {
    throw error;
  }
  
  return data;
}

export async function updateServiceProvider(id: string, providerData: any) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const { data, error } = await supabase
    .from('service_providers')
    .update({ ...providerData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    throw error;
  }
  
  return data;
}

export async function countServiceProviders() {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const { count, error } = await supabase
    .from('service_providers')
    .select('*', { count: 'exact', head: true });
    
  if (error) {
    throw error;
  }
  
  return count || 0;
}

export async function getAllServiceProviders() {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const { data, error } = await supabase
    .from('service_providers')
    .select('*')
    .eq('status', 'active')
    .order('type', { ascending: true })
    .order('name', { ascending: true });
    
  if (error) {
    throw error;
  }
  
  return data || [];
}

export async function getServiceProvidersWithPlanCount() {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const { data, error } = await supabase
    .from('service_providers')
    .select(`
      *,
      service_plans(count)
    `)
    .eq('status', 'active')
    .order('type', { ascending: true })
    .order('name', { ascending: true });
    
  if (error) {
    throw error;
  }
  
  return data?.map(provider => ({
    ...provider,
    plan_count: provider.service_plans?.[0]?.count || 0
  })) || [];
}

// Service Plans table operations
export async function findServicePlan(providerId: string, code: string) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const { data, error } = await supabase
    .from('service_plans')
    .select('*')
    .eq('provider_id', providerId)
    .eq('code', code)
    .maybeSingle();
    
  if (error) {
    throw error;
  }
  
  return data;
}

export async function createServicePlan(planData: any) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const { data, error } = await supabase
    .from('service_plans')
    .insert(planData)
    .select()
    .single();
    
  if (error) {
    throw error;
  }
  
  return data;
}

export async function updateServicePlan(id: string, planData: any) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const { data, error } = await supabase
    .from('service_plans')
    .update({ ...planData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    throw error;
  }
  
  return data;
}

export async function countServicePlans() {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const { count, error } = await supabase
    .from('service_plans')
    .select('*', { count: 'exact', head: true });
    
  if (error) {
    throw error;
  }
  
  return count || 0;
}

export async function getServicePlans(providerId: string) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const { data, error } = await supabase
    .from('service_plans')
    .select('*')
    .eq('provider_id', providerId)
    .eq('status', 'active')
    .order('amount', { ascending: true });
    
  if (error) {
    throw error;
  }
  
  return data || [];
}

// App Settings table operations
export async function findAppSetting(key: string) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const { data, error } = await supabase
    .from('app_settings')
    .select('*')
    .eq('key_name', key)
    .maybeSingle();
    
  if (error) {
    throw error;
  }
  
  return data;
}

export async function createAppSetting(settingData: any) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const { data, error } = await supabase
    .from('app_settings')
    .insert(settingData)
    .select()
    .single();
    
  if (error) {
    throw error;
  }
  
  return data;
}

export async function updateAppSetting(key: string, value: string) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const existingSetting = await findAppSetting(key);
  
  if (existingSetting) {
    const { data, error } = await supabase
      .from('app_settings')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('key_name', key)
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    return data;
  } else {
    return await createAppSetting({ key_name: key, value });
  }
}

export async function getAllAppSettings() {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const { data, error } = await supabase
    .from('app_settings')
    .select('*')
    .order('key_name', { ascending: true });
    
  if (error) {
    throw error;
  }
  
  return data || [];
}

// API Keys table operations
export async function createApiKey(apiKeyData: any) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const { data, error } = await supabase
    .from('api_keys')
    .insert(apiKeyData)
    .select()
    .single();
    
  if (error) {
    throw error;
  }
  
  return data;
}

export async function updateApiKey(id: string, apiKeyData: any) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const { data, error } = await supabase
    .from('api_keys')
    .update({ ...apiKeyData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    throw error;
  }
  
  return data;
}

export async function findApiKeysByUser(userId: string) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const { data, error } = await supabase
    .from('api_keys')
    .select('id, name, permissions, usage_limit, usage_count, last_used, status, created_at, updated_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) {
    throw error;
  }
  
  return data || [];
}

export async function getAllActiveApiKeys() {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const { data, error } = await supabase
    .from('api_keys')
    .select(`
      *,
      users(id, email, status)
    `)
    .eq('status', 'active')
    .eq('users.status', 'active');
    
  if (error) {
    throw error;
  }
  
  return data || [];
}

export async function incrementApiKeyUsage(id: string) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  // First get the current usage count
  const { data: currentData, error: fetchError } = await supabase
    .from('api_keys')
    .select('usage_count')
    .eq('id', id)
    .single();
  
  if (fetchError) {
    throw fetchError;
  }
  
  const newUsageCount = (currentData?.usage_count || 0) + 1;
  
  const { data, error } = await supabase
    .from('api_keys')
    .update({ 
      usage_count: newUsageCount,
      last_used: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    throw error;
  }
  
  return data;
}