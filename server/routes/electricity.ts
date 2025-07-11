import express from 'express';
import Joi from 'joi';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { paymentServiceManager } from '../services/paymentServiceManager.js';
import { vtpassService } from '../services/vtpass.js';
import { findTransactionById, getServicePlans } from '../lib/supabase.js';
import { logger } from '../utils/logger.js';
import { 
  initiateTransaction, 
  handleTransactionSuccess, 
  handleTransactionFailure 
} from '../services/transactionHelpers.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

const electricityPurchaseSchema = Joi.object({
  provider: Joi.string().required(),
  variation_code: Joi.string().valid('prepaid', 'postpaid').required(),
  amount: Joi.number().positive().required(),
  recipient: Joi.string().required(),
  biller_code: Joi.string().required(),
  metadata: Joi.object().optional(),
  phone: Joi.string().optional()
});

// Get all electricity providers
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
      .eq('type', 'electricity')
      .eq('status', 'active')
      .eq('is_enabled', true)
      .order('name', { ascending: true });
      
    if (error) throw error;
    
    res.json(data || []);
  } catch (error) {
    next(error);
  }
});

// Get electricity plans for a provider (not typically used but kept for consistency)
router.get('/providers/:providerId/plans', async (req, res, next) => {
  try {
    const providerId = req.params.providerId;
    const plans = await getServicePlans(providerId);
    res.json(plans);
  } catch (error) {
    next(error);
  }
});

// Verify electricity customer
router.post('/verify-customer', async (req: AuthRequest, res, next) => {
  try {
    const { serviceId, meterNumber, meterType } = req.body;

    if (!serviceId || !meterNumber || !meterType) {
      return res.status(400).json({ error: 'Service ID, meter number, and meter type are required' });
    }

    if (!['prepaid', 'postpaid'].includes(meterType)) {
      return res.status(400).json({ error: 'Meter type must be either prepaid or postpaid' });
    }

    const verificationResult = await vtpassService.verifyElectricityCustomer({
      serviceId,
      customerId: meterNumber,
      meterType: meterType as 'prepaid' | 'postpaid'
    });

    res.json(verificationResult);
  } catch (error: any) {
    logger.error('Electricity customer verification failed:', error);
    res.status(400).json({ 
      error: 'Electricity customer verification failed',
      message: error.response?.data?.response_description || error.message
    });
  }
});

// Purchase electricity
router.post('/purchase', async (req: AuthRequest, res, next) => {
  try {
    const { error, value } = electricityPurchaseSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    const userId = req.user!.id;
    const { provider, variation_code, amount, recipient, biller_code, metadata, phone } = value;
    
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
        type: 'electricity',
        amount,
        recipient,
        provider,
        variationCode: variation_code,
        billerCode: biller_code,
        metadata
      });
      
      // Process with payment provider
      const paymentProvider = paymentServiceManager.getProvider();
      
      try {
        const transactionResponse = await paymentProvider.purchaseElectricity({
          serviceId: provider,
          billerCode: biller_code,
          variationCode: variation_code,
          meterType: variation_code as 'prepaid' | 'postpaid',
          amount,
          phone: phone || recipient,
          requestId: externalReference
        });
        
        // Handle transaction success
        await handleTransactionSuccess({
          userId,
          transactionId,
          walletBalance,
          wallet,
          externalReference,
          providerResponse: transactionResponse,
          finalAmount,
          userDiscount,
          type: 'electricity'
        });
        
        logger.info('Electricity purchase processed successfully', { 
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
          type: 'electricity',
          error: providerError
        });
        
        throw providerError;
      }
      
      // Get updated transaction
      const updatedTransaction = await findTransactionById(transactionId);
      
      return res.status(201).json({
        message: 'Electricity purchase processed successfully',
        transaction: updatedTransaction
      });
      
    } catch (error: any) {
      logger.error('Error in electricity purchase', {
        userId,
        provider,
        variation_code,
        amount,
        recipient,
        error: error.message
      });
      
      if (error.message === 'Insufficient wallet balance') {
        return res.status(400).json({ error: 'Insufficient wallet balance' });
      }
      
      return res.status(500).json({
        error: 'Failed to process electricity purchase',
        message: error.message
      });
    }
  } catch (error) {
    next(error);
  }
});

export { router as electricityRoutes };