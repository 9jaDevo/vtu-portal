import { v4 as uuidv4 } from 'uuid';
import {
  findWallet,
  updateWallet,
  createTransaction,
  createWalletTransaction,
  findServiceProvider,
  findAppSetting
} from '../lib/supabase.js';
import { logger } from '../utils/logger.js';

// Helper function to generate VTPass compliant request ID
export const generateRequestId = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const datePrefix = `${year}${month}${day}`;
  
  // Generate a unique suffix
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  return `${datePrefix}${timestamp}${randomSuffix}`;
};

export interface InitiateTransactionParams {
  userId: string;
  type: string;
  amount: number;
  recipient: string;
  provider: string;
  planId?: string;
  variationCode?: string;
  billerCode?: string;
  metadata?: Record<string, any>;
}

export async function initiateTransaction(params: InitiateTransactionParams) {
  const { userId, type, amount, recipient, provider, planId, variationCode, billerCode, metadata } = params;

  // Check wallet balance
  const wallet = await findWallet(userId);

  if (!wallet) {
    throw new Error('Wallet not found');
  }

  const walletBalance = parseFloat(wallet.balance.toString());

  // Get service provider to calculate user discount
  const serviceProvider = await findServiceProvider(provider, type);
  
  let userDiscount = 0;
  // Only apply discount if service is enabled
  if (serviceProvider && serviceProvider.is_enabled) {
    if (serviceProvider.commission_type === 'percentage') {
      userDiscount = (amount * serviceProvider.commission_rate) / 100;
    } else {
      userDiscount = serviceProvider.flat_fee_amount;
    }
  }

  // Ensure discount doesn't exceed the amount
  userDiscount = Math.min(userDiscount, amount);
  
  // Calculate final amount after discount
  const finalAmount = amount - userDiscount;

  if (walletBalance < finalAmount) {
    throw new Error('Insufficient wallet balance');
  }

  const transactionId = uuidv4();
  // Generate VTPass compliant request ID with YYYYMMDD prefix
  const externalReference = generateRequestId();

  // Create transaction record
  const transactionData = {
    id: transactionId,
    user_id: userId,
    type,
    amount,
    user_discount: userDiscount,
    total_amount: finalAmount,
    recipient,
    provider,
    plan_id: planId || null,
    external_reference: externalReference,
    status: 'pending',
    description: `${type} purchase for ${recipient}`,
    metadata: JSON.stringify(metadata || {})
  };

  await createTransaction(transactionData);

  // Deduct from wallet
  await updateWallet(userId, walletBalance - finalAmount);

  // Log wallet transaction
  const walletTransactionId = uuidv4();
  const walletTransactionData = {
    id: walletTransactionId,
    wallet_id: wallet.id,
    user_id: userId,
    type: 'debit',
    amount: finalAmount,
    balance_before: walletBalance,
    balance_after: walletBalance - finalAmount,
    reference: externalReference,
    description: `Payment for ${type} transaction`
  };

  await createWalletTransaction(walletTransactionData);

  return {
    transactionId,
    externalReference,
    finalAmount,
    userDiscount,
    walletBalance,
    wallet
  };
}

export async function handleTransactionSuccess(params: {
  userId: string;
  transactionId: string;
  walletBalance: number;
  wallet: any;
  externalReference: string;
  finalAmount: number;
  userDiscount: number;
  providerResponse: any;
  type: string;
}) {
  try {
    const { 
      userId, 
      transactionId, 
      walletBalance, 
      wallet, 
      externalReference, 
      finalAmount,
      userDiscount, 
      providerResponse, 
      type 
    } = params;
    
    // Update transaction with provider response
    const { supabase } = await import('../lib/supabase.js');
    if (supabase) {
      await supabase
        .from('transactions')
        .update({
          vtpass_reference: providerResponse.providerReference || providerResponse.requestId,
          status: providerResponse.status,
          purchased_code: providerResponse.purchased_code || null,
          description: providerResponse.message,
          user_discount: userDiscount,
          total_amount: finalAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId);
    }
  } catch (error) {
    logger.error('Error handling transaction success', {
      transactionId: params.transactionId,
      error
    });
    throw error;
  }
}

export async function handleTransactionFailure(params: {
  userId: string;
  transactionId: string;
  finalAmount: number;
  walletBalance: number;
  wallet: any;
  externalReference: string;
  type: string;
  error: any;
}) {
  try {
    const { userId, transactionId, finalAmount, walletBalance, wallet, externalReference, type, error } = params;
    
    // Mark transaction as failed
    const { supabase } = await import('../lib/supabase.js');
    if (supabase) {
      await supabase
        .from('transactions')
        .update({
          status: 'failed',
          description: error.message || 'Payment processing failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId);
    }
    
    // Refund wallet
    await updateWallet(userId, walletBalance);
    
    // Log refund transaction
    const refundTransactionId = uuidv4();
    const refundWalletTransactionData = {
      id: refundTransactionId,
      wallet_id: wallet.id,
      user_id: userId,
      type: 'credit',
      amount: finalAmount,
      balance_before: walletBalance - finalAmount,
      balance_after: walletBalance,
      reference: `REFUND_${externalReference}`,
      description: `Refund for failed ${type} transaction`
    };

    await createWalletTransaction(refundWalletTransactionData);
    
    logger.error('Transaction failed with refund', {
      transactionId,
      userId,
      type,
      error: error.message || 'Unknown error'
    });
  } catch (refundError) {
    logger.error('Error during transaction failure handling', {
      transactionId: params.transactionId,
      originalError: params.error,
      refundError
    });
    throw refundError;
  }
}