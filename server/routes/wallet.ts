import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';
import { 
  findWallet, 
  createWalletTransaction, 
  getWalletTransactions, 
  countWalletTransactions, 
  getWalletTransactionStats,
  updateWallet,
  createPaymentGatewayTransaction,
  updatePaymentGatewayTransaction,
  findPaymentGatewayTransactionByReference,
  findUser
} from '../lib/supabase.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { paymentServiceManager } from '../services/paymentServiceManager.js';
import { paystackService } from '../services/paystack.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

const fundWalletSchema = Joi.object({
  amount: Joi.number().positive().min(100).required(),
  payment_method: Joi.string().valid('paystack').required(),
  payment_gateway: Joi.string().valid('wallet', 'paystack').optional(),
  reference: Joi.string().optional(),
  callback_url: Joi.string().uri().optional()
});

// Get wallet balance
router.get('/balance', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const wallet = await findWallet(userId);

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    res.json(wallet);
  } catch (error) {
    next(error);
  }
});

// Get wallet transactions
router.get('/transactions', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const transactions = await getWalletTransactions(userId, page, limit);
    const total = await countWalletTransactions(userId);
    const totalPages = Math.ceil(total / limit);

    res.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
});

// Fund wallet
router.post('/fund', async (req: AuthRequest, res, next) => {
  try {
    const { error, value } = fundWalletSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const userId = req.user!.id;
    const { amount, payment_method, payment_gateway = 'paystack', reference, callback_url } = value;

    // Get user wallet
    const wallet = await findWallet(userId);

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const currentBalance = parseFloat(wallet.balance.toString());

    // Get user details for Paystack
    const user = await findUser(req.user!.email);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (payment_gateway === 'paystack') {
      // Use Paystack for payment processing
      // Generate unique reference
      const paystackReference = reference || `FUND_${Date.now()}_${uuidv4().substring(0, 8)}`;
      
      // Create pending wallet transaction
      const walletTransactionId = uuidv4();
      const walletTransactionData = {
        id: walletTransactionId,
        wallet_id: wallet.id,
        user_id: userId,
        type: 'credit',
        amount,
        balance_before: currentBalance,
        balance_after: currentBalance, // Will be updated when payment is confirmed
        reference: paystackReference,
        description: `Wallet funding via ${payment_method}`,
        payment_gateway: 'paystack'
      };

      await createWalletTransaction(walletTransactionData);

      // Initialize Paystack transaction
      // Always use redirect flow instead of inline popup
      try {
        const paystackResponse = await paystackService.initializeTransaction({
          email: user.email,
          amount: amount * 100, // Convert to kobo
          reference: paystackReference,
          callback_url: callback_url || `${process.env.CLIENT_URL}/dashboard/wallet?payment=success`,
          metadata: {
            user_id: userId,
            wallet_transaction_id: walletTransactionId,
            payment_method,
            redirect_url: callback_url || `${process.env.CLIENT_URL}/dashboard/wallet?payment=success`, 
            cancel_url: `${process.env.CLIENT_URL}/dashboard/wallet?payment=cancelled`,
            custom_fields: [ 
              {
                display_name: "Wallet Funding",
                variable_name: "wallet_funding",
                value: "true"
              }
            ]
          }
        });

        // Store Paystack transaction details
        const gatewayTransactionId = uuidv4();
        const gatewayTransactionData = {
          id: gatewayTransactionId,
          user_id: userId,
          wallet_transaction_id: walletTransactionId,
          gateway: 'paystack',
          gateway_reference: paystackReference,
          amount,
          currency: 'NGN',
          status: 'pending',
          authorization_url: paystackResponse.data.authorization_url,
          access_code: paystackResponse.data.access_code,
          callback_url: callback_url || null,
          metadata: JSON.stringify({
            payment_method,
            user_email: user.email,
            user_name: `${user.first_name} ${user.last_name}`
          })
        };

        await createPaymentGatewayTransaction(gatewayTransactionData);

        logger.info('Paystack transaction initialized', { 
          userId, 
          amount, 
          reference: paystackReference,
          authorizationUrl: paystackResponse.data.authorization_url
        });

        res.json({
          message: 'Payment initialized successfully',
          payment_gateway: 'paystack',
          authorization_url: paystackResponse.data.authorization_url,
          access_code: paystackResponse.data.access_code,
          reference: paystackReference,
          amount,
          currency: 'NGN'
        });

      } catch (paystackError: any) {
        logger.error('Paystack initialization failed:', paystackError);
        
        // Remove the pending wallet transaction
        // Note: In a real implementation, we'd use a database transaction to roll this back
        logger.warn('Paystack initialization failed, wallet transaction may need cleanup', { walletTransactionId });

        return res.status(400).json({ 
          error: 'Payment initialization failed',
          message: paystackError.response?.data?.message || paystackError.message
        });
      }

    }

  } catch (error) {
    next(error);
  }
});

// Verify Paystack payment
router.post('/verify-payment', async (req: AuthRequest, res, next) => {
  try {
    const { reference } = req.body;
    
    if (!reference) {
      return res.status(400).json({ error: 'Payment reference is required' });
    }

    const userId = req.user!.id;

    // Get the gateway transaction
    const gatewayTransaction = await findPaymentGatewayTransactionByReference(reference);

    if (!gatewayTransaction || gatewayTransaction.user_id !== userId) {
      return res.status(404).json({ error: 'Payment transaction not found' });
    }

    if (gatewayTransaction.status === 'success') {
      return res.json({
        message: 'Payment already verified',
        status: 'success',
        amount: gatewayTransaction.amount
      });
    }

    // Verify with Paystack
    try {
      const verificationResult = await paystackService.verifyTransaction(reference);
      
      if (verificationResult.data.status === 'success') {
        // Update gateway transaction status
        await updatePaymentGatewayTransaction(gatewayTransaction.id, {
          status: 'success',
          gateway_response: JSON.stringify(verificationResult.data)
        });

        // Get wallet and update balance
        const wallet = await findWallet(userId);

        if (wallet) {
          const currentBalance = parseFloat(wallet.balance.toString());
          const newBalance = currentBalance + gatewayTransaction.amount;

          // Update wallet balance
          await updateWallet(userId, newBalance);

          // Update wallet transaction if it exists
          if (gatewayTransaction.wallet_transaction_id) {
            // We need to use a direct Supabase update since we don't have a helper for this specific case
            const { supabase } = await import('../lib/supabase.js');
            if (supabase) {
              await supabase
                .from('wallet_transactions')
                .update({
                  balance_after: newBalance,
                  gateway_reference: reference,
                  gateway_response: JSON.stringify(verificationResult.data)
                })
                .eq('id', gatewayTransaction.wallet_transaction_id);
            }
          }

          logger.info('Payment verified and wallet credited', {
            userId,
            reference,
            amount: gatewayTransaction.amount,
            newBalance
          });

          res.json({
            message: 'Payment verified successfully',
            status: 'success',
            amount: gatewayTransaction.amount,
            new_balance: newBalance
          });
        } else {
          res.status(404).json({ error: 'Wallet not found' });
        }
      } else {
        // Update gateway transaction status to failed
        await updatePaymentGatewayTransaction(gatewayTransaction.id, {
          status: 'failed',
          gateway_response: JSON.stringify(verificationResult.data)
        });

        res.json({
          message: 'Payment verification failed',
          status: 'failed',
          gateway_response: verificationResult.data.gateway_response
        });
      }
    } catch (verificationError: any) {
      logger.error('Payment verification error:', verificationError);
      res.status(400).json({
        error: 'Payment verification failed',
        message: verificationError.message
      });
    }

  } catch (error) {
    next(error);
  }
});

// Get wallet statistics
router.get('/stats', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const stats = await getWalletTransactionStats(userId);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

export { router as walletRoutes };