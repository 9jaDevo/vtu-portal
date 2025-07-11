import express from 'express';
import Joi from 'joi';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { paymentServiceManager } from '../services/paymentServiceManager.js';
import { findTransactionById } from '../lib/supabase.js';
import { logger } from '../utils/logger.js';
import { 
  initiateTransaction, 
  handleTransactionSuccess, 
  handleTransactionFailure 
} from '../services/transactionHelpers.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

const airtimePurchaseSchema = Joi.object({
  provider: Joi.string().required(),
  amount: Joi.number().positive().required(),
  recipient: Joi.string().required(),
  metadata: Joi.object().optional()
});

// Get all airtime providers
router.get('/providers', async (req, res, next) => {
  try {
    // We need to use direct Supabase query for filtering providers
    const { supabase } = await import('../lib/supabase.js');
    if (!supabase) {
      return res.status(503).json({ error: 'Database service not available' });
    }
    
    const { data, error } = await supabase
      .from('service_providers')
      .select('*')
      .eq('type', 'airtime')
      .eq('status', 'active')
      .eq('is_enabled', true)
      .order('name', { ascending: true });
      
    if (error) throw error;
    
    res.json(data || []);
  } catch (error) {
    next(error);
  }
});

// Purchase airtime
router.post('/purchase', async (req: AuthRequest, res, next) => {
  try {
    const { error, value } = airtimePurchaseSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    const userId = req.user!.id;
    const { provider, amount, recipient, metadata } = value;
    
    try {
      // Initialize transaction
      const {
        transactionId,
        externalReference,
        finalAmount,
        userDiscount,
        walletBalance,
        wallet
      } = await initiateTransaction({
        userId,
        type: 'airtime',
        amount,
        recipient,
        provider,
        metadata
      });
      
      // Process with payment provider
      const paymentProvider = paymentServiceManager.getProvider();
      
      try {
        const transactionResponse = await paymentProvider.purchaseAirtime({
          serviceId: provider,
          amount,
          phone: recipient,
          requestId: externalReference
        });
        
        // Handle transaction success
        await handleTransactionSuccess({
          userId,
          transactionId,
          walletBalance,
          wallet,
          externalReference,
          finalAmount,
          userDiscount,
          providerResponse: transactionResponse,
          type: 'airtime'
        });
        
        logger.info('Airtime purchase processed successfully', { 
          transactionId, 
          externalReference, 
          provider: paymentServiceManager.getProviderName(),
          status: transactionResponse.status 
        });
      } catch (providerError: any) {
        // Handle transaction failure
        await handleTransactionFailure({
          userId,
          transactionId,
          finalAmount,
          walletBalance,
          wallet,
          externalReference,
          type: 'airtime',
          error: providerError
        });
        
        throw providerError;
      }
      
      // Get updated transaction
      const updatedTransaction = await findTransactionById(transactionId);
      
      return res.status(201).json({
        message: 'Airtime purchase processed successfully',
        transaction: updatedTransaction
      });
      
    } catch (error: any) {
      logger.error('Error in airtime purchase', {
        userId,
        provider,
        amount,
        recipient,
        error: error.message
      });
      
      if (error.message === 'Insufficient wallet balance') {
        return res.status(400).json({ error: 'Insufficient wallet balance' });
      }
      
      return res.status(500).json({
        error: 'Failed to process airtime purchase',
        message: error.message
      });
    }
  } catch (error) {
    next(error);
  }
});

export { router as airtimeRoutes };