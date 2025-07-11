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

const educationPurchaseSchema = Joi.object({
  provider: Joi.string().required(),
  variation_code: Joi.string().required(),
  amount: Joi.number().positive().required(),
  recipient: Joi.string().required(),
  biller_code: Joi.when('provider', {
    is: 'jamb',
    then: Joi.string().required(),
    otherwise: Joi.string().optional()
  }),
  quantity: Joi.number().integer().min(1).optional(),
  metadata: Joi.object().optional()
});

// Get all education providers
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
      .eq('type', 'education')
      .eq('status', 'active')
      .eq('is_enabled', true)
      .order('name', { ascending: true });
      
    if (error) throw error;
    
    res.json(data || []);
  } catch (error) {
    next(error);
  }
});

// Get education plans for a provider
router.get('/providers/:providerId/plans', async (req, res, next) => {
  try {
    const providerId = req.params.providerId;
    const plans = await getServicePlans(providerId);
    res.json(plans);
  } catch (error) {
    next(error);
  }
});

// Verify customer - generic
router.post('/verify-customer', async (req: AuthRequest, res, next) => {
  try {
    const { serviceId, customerId, type } = req.body;

    if (!serviceId || !customerId) {
      return res.status(400).json({ error: 'Service ID and Customer ID are required' });
    }

    const paymentProvider = paymentServiceManager.getProvider();
    const verificationResult = await paymentProvider.verifyCustomer({
      serviceId,
      customerId,
      type
    });

    res.json(verificationResult);
  } catch (error: any) {
    logger.error('Education customer verification failed:', error);
    res.status(400).json({ 
      error: 'Customer verification failed',
      message: error.response?.data?.response_description || error.message
    });
  }
});

// Verify JAMB customer (Profile ID verification)
router.post('/verify-jamb-customer', async (req: AuthRequest, res, next) => {
  try {
    const { profileId, variationCode } = req.body;

    if (!profileId || !variationCode) {
      return res.status(400).json({ error: 'Profile ID and variation code are required' });
    }

    const verificationResult = await vtpassService.verifyJambCustomer({
      serviceId: 'jamb',
      customerId: profileId,
      type: variationCode
    });

    res.json(verificationResult);
  } catch (error: any) {
    logger.error('JAMB customer verification failed:', error);
    res.status(400).json({ 
      error: 'JAMB customer verification failed',
      message: error.response?.data?.response_description || error.message
    });
  }
});

// Purchase education services
router.post('/purchase', async (req: AuthRequest, res, next) => {
  try {
    const { error, value } = educationPurchaseSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    const userId = req.user!.id;
    const { provider, variation_code, amount, recipient, biller_code, quantity, metadata } = value;
    
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
        type: 'education',
        amount,
        recipient,
        provider,
        variationCode: variation_code,
        billerCode: biller_code,
        metadata: {
          ...metadata,
          quantity
        }
      });
      
      // Process with payment provider
      const paymentProvider = paymentServiceManager.getProvider();
      
      try {
        // For JAMB, we use a specialized approach
        let transactionResponse;
        
        if (provider === 'jamb') {
          transactionResponse = await paymentProvider.purchaseJambPin({
            serviceId: provider,
            billersCode: biller_code || '',
            variationCode: variation_code,
            amount,
            phone: recipient,
            requestId: externalReference,
            quantity: quantity
          });
        } else {
          transactionResponse = await paymentProvider.payEducationBill({
            serviceId: provider,
            billerCode: biller_code || recipient,
            variationCode: variation_code,
            amount,
            phone: recipient,
            requestId: externalReference,
            quantity: quantity
          });
        }
        
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
          type: 'education'
        });
        
        logger.info('Education service purchase processed successfully', { 
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
          type: 'education',
          error: providerError
        });
        
        throw providerError;
      }
      
      // Get updated transaction
      const updatedTransaction = await findTransactionById(transactionId);
      
      return res.status(201).json({
        message: 'Education service purchase processed successfully',
        transaction: updatedTransaction
      });
      
    } catch (error: any) {
      logger.error('Error in education service purchase', {
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
        error: 'Failed to process education service purchase',
        message: error.message
      });
    }
  } catch (error) {
    next(error);
  }
});

export { router as educationRoutes };