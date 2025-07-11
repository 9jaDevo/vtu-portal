import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { 
  findTransactionByExternalReference, 
  updateTransaction, 
  findWallet, 
  updateWallet, 
  createWalletTransaction,
  findPaymentGatewayTransactionByReference,
  updatePaymentGatewayTransaction,
  findServiceProvider,
  findServicePlan,
  createServicePlan,
  updateServicePlan
} from '../lib/supabase.js';
import { paystackService } from '../services/paystack.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Webhook endpoint for VTpass callbacks
router.post('/vtpass', async (req, res, next) => {
  try {
    const webhookData = req.body;
    
    // Log the incoming webhook for debugging
    logger.info('VTpass webhook received', {
      type: webhookData.type,
      timestamp: new Date().toISOString(),
      data: webhookData
    });

    // Validate webhook structure
    if (!webhookData.type || !webhookData.data) {
      logger.error('Invalid webhook structure', { webhookData });
      return res.status(400).json({ error: 'Invalid webhook structure' });
    }

    // Process webhook based on type
    switch (webhookData.type) {
      case 'transaction-update':
        await handleTransactionUpdate(webhookData.data);
        break;
      
      case 'variations-update':
        await handleVariationsUpdate(webhookData);
        break;
      
      default:
        logger.warn('Unknown webhook type received', { type: webhookData.type });
        break;
    }

    // Send required success response to VTpass
    res.json({ response: 'success' });

  } catch (error) {
    logger.error('Webhook processing error:', error);
    next(error);
  }
});

// Webhook endpoint for Paystack callbacks
router.post('/paystack', express.raw({ type: 'application/json' }), async (req, res, next) => {
  try {
    const signature = req.headers['x-paystack-signature'] as string;
    const payload = req.body.toString();

    // Verify webhook signature
    if (!paystackService.verifyWebhookSignature(payload, signature)) {
      logger.error('Invalid Paystack webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const webhookData = JSON.parse(payload);
    
    logger.info('Paystack webhook received', {
      event: webhookData.event,
      timestamp: new Date().toISOString(),
      reference: webhookData.data?.reference
    });

    // Process webhook based on event type
    switch (webhookData.event) {
      case 'charge.success':
        await handlePaystackChargeSuccess(webhookData.data);
        break;
      
      case 'charge.failed':
        await handlePaystackChargeFailed(webhookData.data);
        break;
      
      case 'transfer.success':
        await handlePaystackTransferSuccess(webhookData.data);
        break;
      
      case 'transfer.failed':
        await handlePaystackTransferFailed(webhookData.data);
        break;
      
      default:
        logger.info('Unhandled Paystack webhook event', { event: webhookData.event });
        break;
    }

    // Send success response to Paystack
    res.status(200).send('OK');

  } catch (error) {
    logger.error('Paystack webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Handle Paystack successful charge
async function handlePaystackChargeSuccess(data: any) {
  try {
    const { reference, amount, customer, status, gateway_response } = data;
    
    if (!reference) {
      logger.error('Paystack charge success webhook missing reference', { data });
      return;
    }

    // Find the gateway transaction
    const gatewayTransaction = await findPaymentGatewayTransactionByReference(reference);

    if (!gatewayTransaction) {
      logger.warn('Gateway transaction not found for Paystack webhook', { reference });
      return;
    }

    // Check if already processed
    if (gatewayTransaction.status === 'success') {
      logger.info('Paystack transaction already processed', { reference });
      return;
    }

    // Update gateway transaction status
    await updatePaymentGatewayTransaction(gatewayTransaction.id, {
      status: 'success',
      gateway_response: JSON.stringify(data)
    });

    // Get user wallet and update balance
    const wallet = await findWallet(gatewayTransaction.user_id);

    if (wallet) {
      const currentBalance = parseFloat(wallet.balance.toString());
      const creditAmount = gatewayTransaction.amount;
      const newBalance = currentBalance + creditAmount;

      // Update wallet balance
      await updateWallet(gatewayTransaction.user_id, newBalance);

      // Update wallet transaction if exists
      if (gatewayTransaction.wallet_transaction_id) {
        // We need to use direct Supabase query for this update
        const { supabase } = await import('../lib/supabase.js');
        if (supabase) {
          await supabase
            .from('wallet_transactions')
            .update({
              balance_after: newBalance,
              gateway_reference: reference,
              gateway_response: JSON.stringify(data)
            })
            .eq('id', gatewayTransaction.wallet_transaction_id);
        }
      } else {
        // Create new wallet transaction if not exists
        const walletTransactionId = uuidv4();
        const walletTransactionData = {
          id: walletTransactionId,
          wallet_id: wallet.id,
          user_id: gatewayTransaction.user_id,
          type: 'credit',
          amount: creditAmount,
          balance_before: currentBalance,
          balance_after: newBalance,
          reference,
          description: 'Wallet funding via Paystack',
          payment_gateway: 'paystack',
          gateway_reference: reference,
          gateway_response: JSON.stringify(data)
        };

        await createWalletTransaction(walletTransactionData);

        // Update gateway transaction with wallet transaction ID
        await updatePaymentGatewayTransaction(gatewayTransaction.id, {
          wallet_transaction_id: walletTransactionId
        });
      }

      logger.info('Paystack payment processed successfully', {
        reference,
        userId: gatewayTransaction.user_id,
        amount: creditAmount,
        newBalance
      });
    } else {
      logger.error('Wallet not found for Paystack payment', { 
        userId: gatewayTransaction.user_id,
        reference 
      });
    }

  } catch (error) {
    logger.error('Error handling Paystack charge success:', error);
    throw error;
  }
}

// Handle Paystack failed charge
async function handlePaystackChargeFailed(data: any) {
  try {
    const { reference, gateway_response } = data;
    
    if (!reference) {
      logger.error('Paystack charge failed webhook missing reference', { data });
      return;
    }

    // Update gateway transaction status
    const gatewayTransaction = await findPaymentGatewayTransactionByReference(reference);
    
    if (gatewayTransaction) {
      await updatePaymentGatewayTransaction(gatewayTransaction.id, {
        status: 'failed',
        gateway_response: JSON.stringify(data)
      });
    }

    logger.info('Paystack payment failed', {
      reference,
      gateway_response
    });

  } catch (error) {
    logger.error('Error handling Paystack charge failed:', error);
    throw error;
  }
}

// Handle Paystack transfer success (for future use)
async function handlePaystackTransferSuccess(data: any) {
  try {
    logger.info('Paystack transfer success', { data });
    // Implementation for handling successful transfers (withdrawals)
  } catch (error) {
    logger.error('Error handling Paystack transfer success:', error);
    throw error;
  }
}

// Handle Paystack transfer failed (for future use)
async function handlePaystackTransferFailed(data: any) {
  try {
    logger.info('Paystack transfer failed', { data });
    // Implementation for handling failed transfers (withdrawals)
  } catch (error) {
    logger.error('Error handling Paystack transfer failed:', error);
    throw error;
  }
}

// Handle VTPass transaction status updates
async function handleTransactionUpdate(data: any) {
  try {
    const { requestId, code, content, response_description, amount } = data;
    
    if (!requestId) {
      logger.error('Transaction update webhook missing requestId', { data });
      return;
    }

    // Find the transaction by external_reference (which is our requestId)
    const transaction = await findTransactionByExternalReference(requestId);

    if (!transaction) {
      logger.warn('Transaction not found for webhook update', { requestId });
      return;
    }

    const transactionStatus = content?.transactions?.status;
    const transactionId = content?.transactions?.transactionId;
    
    // Determine the new status based on webhook data
    let newStatus = transaction.status;
    let statusMessage = response_description || 'Transaction updated';

    if (code === '000') {
      // Success codes
      if (transactionStatus === 'delivered' || transactionStatus === 'successful') {
        newStatus = 'success';
        statusMessage = 'Transaction completed successfully';
      } else if (transactionStatus === 'pending' || transactionStatus === 'processing') {
        newStatus = 'pending';
        statusMessage = 'Transaction is being processed';
      } else {
        newStatus = 'success';
        statusMessage = response_description || 'Transaction processed';
      }
    } else if (code === '040') {
      // Reversal code
      newStatus = 'reversed';
      statusMessage = 'Transaction reversed to wallet';
      
      // Handle wallet refund for reversed transactions
      await handleTransactionReversal(transaction, amount || transaction.total_amount);
    } else {
      // Other codes are generally failures
      newStatus = 'failed';
      statusMessage = response_description || 'Transaction failed';
      
      // Handle wallet refund for failed transactions if not already refunded
      if (transaction.status === 'pending') {
        await handleTransactionReversal(transaction, transaction.total_amount);
      }
    }

    // Update transaction status
    await updateTransaction(transaction.id, {
      status: newStatus,
      description: statusMessage,
      vtpass_reference: transactionId || null
    });

    logger.info('Transaction updated via webhook', {
      transactionId: transaction.id,
      requestId,
      oldStatus: transaction.status,
      newStatus,
      code,
      transactionStatus
    });

  } catch (error) {
    logger.error('Error handling transaction update webhook:', error);
    throw error;
  }
}

// Handle transaction reversals and refunds
async function handleTransactionReversal(transaction: any, refundAmount: number) {
  try {
    // Only process refund if transaction was not already failed/reversed
    if (transaction.status === 'failed' || transaction.status === 'reversed') {
      logger.info('Transaction already refunded, skipping reversal', { 
        transactionId: transaction.id,
        status: transaction.status 
      });
      return;
    }

    // Get user's wallet
    const wallet = await findWallet(transaction.user_id);

    if (!wallet) {
      logger.error('Wallet not found for transaction reversal', { 
        userId: transaction.user_id,
        transactionId: transaction.id 
      });
      return;
    }

    const currentBalance = parseFloat(wallet.balance.toString());
    const newBalance = currentBalance + refundAmount;

    // Credit the wallet
    await updateWallet(transaction.user_id, newBalance);

    // Log the wallet transaction
    const walletTransactionId = uuidv4();
    const walletTransactionData = {
      id: walletTransactionId,
      wallet_id: wallet.id,
      user_id: transaction.user_id,
      type: 'credit',
      amount: refundAmount,
      balance_before: currentBalance,
      balance_after: newBalance,
      reference: `WEBHOOK_REFUND_${transaction.id}`,
      description: 'Refund from VTpass webhook notification'
    };

    await createWalletTransaction(walletTransactionData);

    logger.info('Wallet refunded via webhook', {
      transactionId: transaction.id,
      userId: transaction.user_id,
      refundAmount,
      newBalance
    });

  } catch (error) {
    logger.error('Error handling transaction reversal:', error);
    throw error;
  }
}

// Handle service variations updates
async function handleVariationsUpdate(webhookData: any) {
  try {
    const { serviceID, data, summary, actionRequired } = webhookData;
    
    if (!serviceID || !data?.content?.variations) {
      logger.error('Invalid variations update webhook', { webhookData });
      return;
    }

    logger.info('Processing variations update', {
      serviceID,
      summary,
      variationsCount: data.content.variations.length
    });

    // Get the service provider for this serviceID
    const serviceProvider = await findServiceProvider(serviceID, 'tv'); // Assuming TV for now

    if (!serviceProvider) {
      logger.warn('Service provider not found for variations update', { serviceID });
      return;
    }

    const providerId = serviceProvider.id;
    const variations = data.content.variations;

    // Track which variation codes we've processed
    const processedVariationCodes = new Set<string>();

    // Process each variation from the webhook
    for (const variation of variations) {
      const { variation_code, name, variation_amount, fixedPrice } = variation;
      
      if (!variation_code) {
        logger.warn('Variation missing variation_code', { variation });
        continue;
      }

      processedVariationCodes.add(variation_code);

      // Check if this plan already exists
      const existingPlan = await findServicePlan(providerId, variation_code);

      if (existingPlan) {
        // Update existing plan
        await updateServicePlan(existingPlan.id, {
          name,
          amount: parseFloat(variation_amount),
          status: 'active'
        });

        logger.info('Updated service plan via webhook', {
          planId: existingPlan.id,
          serviceID,
          variation_code,
          oldName: existingPlan.name,
          newName: name,
          oldAmount: existingPlan.amount,
          newAmount: variation_amount
        });
      } else {
        // Create new plan
        const planId = uuidv4();
        const planData = {
          id: planId,
          provider_id: providerId,
          name,
          code: variation_code,
          amount: parseFloat(variation_amount),
          validity: null, // validity not provided in webhook
          description: `${name} - Updated via webhook`,
          status: 'active'
        };

        await createServicePlan(planData);

        logger.info('Created new service plan via webhook', {
          planId,
          serviceID,
          variation_code,
          name,
          amount: variation_amount
        });
      }
    }

    // Mark plans as inactive if they weren't in the webhook update
    // (This means they were removed from VTpass)
    const { supabase } = await import('../lib/supabase.js');
    if (!supabase) {
      logger.error('Supabase not available for deactivating plans');
      return;
    }

    const { data: allPlans, error } = await supabase
      .from('service_plans')
      .select('id, code')
      .eq('provider_id', providerId)
      .eq('status', 'active');

    if (error) {
      throw error;
    }

    for (const plan of allPlans || []) {
      if (!processedVariationCodes.has(plan.code)) {
        await updateServicePlan(plan.id, { status: 'inactive' });

        logger.info('Deactivated service plan via webhook', {
          planId: plan.id,
          serviceID,
          variation_code: plan.code,
          reason: 'Not present in webhook update'
        });
      }
    }

    logger.info('Variations update completed', {
      serviceID,
      processedCount: processedVariationCodes.size,
      summary
    });

  } catch (error) {
    logger.error('Error handling variations update webhook:', error);
    throw error;
  }
}

export { router as webhookRoutes };