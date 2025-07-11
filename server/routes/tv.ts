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

const tvPurchaseSchema = Joi.object({
  provider: Joi.string().required(),
  variation_code: Joi.when('subscription_type', {
    is: 'change',
    then: Joi.string().required(), // Required for bouquet change
    otherwise: Joi.string().optional() // Not required for renewal
  }),
  amount: Joi.when('subscription_type', {
    is: 'renew',
    then: Joi.number().positive().optional(), // Amount comes from verification for renewal
    otherwise: Joi.number().positive().required()
  }),
  recipient: Joi.string().required(),
  biller_code: Joi.string().required(), // Always required for TV (smartcard number)
  subscription_type: Joi.string().valid('change', 'renew').required(),
  quantity: Joi.number().integer().min(1).optional(),
  metadata: Joi.object().optional()
});

// Get all TV providers
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
      .eq('type', 'tv')
      .eq('status', 'active')
      .eq('is_enabled', true)
      .order('name', { ascending: true });
      
    if (error) throw error;
    
    res.json(data || []);
  } catch (error) {
    next(error);
  }
});

// Get TV plans for a provider
router.get('/providers/:providerId/plans', async (req, res, next) => {
  try {
    const providerId = req.params.providerId;
    const plans = await getServicePlans(providerId);
    res.json(plans);
  } catch (error) {
    next(error);
  }
});

// Get dynamic TV plans from VTpass API
router.get('/providers/:providerId/dynamic-plans', async (req: AuthRequest, res, next) => {
  const providerId = req.params.providerId;
  try {
    // Get provider details
    const { supabase } = await import('../lib/supabase.js');
    if (!supabase) {
      return res.status(503).json({ error: 'Database service not available' });
    }

    const { data: providers, error: providerError } = await supabase
      .from('service_providers')
      .select('id, code, name, type')
      .eq('id', providerId);

    if (providerError) {
      throw providerError;
    }

    if (!providers || providers.length === 0) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    const provider = providers[0];

    // For TV providers, fetch dynamic plans from VTpass
    if (provider.type === 'tv') {
      try {
        logger.info(`Fetching dynamic plans for TV provider: ${provider.name}`);
        
        const variationsResponse = await vtpassService.getServiceVariations(provider.code);
        
        if (!variationsResponse.content || !variationsResponse.content.variations) {
          return res.status(400).json({ 
            error: 'No variations found from VTpass API',
            details: variationsResponse
          });
        }

        const variations = variationsResponse.content.variations;
        
        // Map VTpass variations to our ServicePlan interface
        const dynamicPlans = variations.map((variation: any) => ({
          id: `dynamic-${variation.variation_code}`, // Temporary ID for dynamic plans
          name: variation.name,
          code: variation.variation_code,
          amount: parseFloat(variation.variation_amount),
          validity: null, // Not provided in VTpass response
          description: `${variation.name} - ${provider.name} bouquet`
        }));

        logger.info('Successfully fetched TV dynamic plans', {
          provider: provider.name,
          plansCount: dynamicPlans.length
        });

        res.json(dynamicPlans);
      } catch (vtpassError: any) {
        logger.error('VTpass API error during TV plan fetch', {
          provider: provider.name,
          serviceCode: provider.code,
          error: vtpassError.message,
          response: vtpassError.response?.data
        });

        return res.status(500).json({
          error: 'Failed to fetch TV plans from VTpass API',
          message: vtpassError.message,
          provider: provider.name
        });
      }
    } else {
      return res.status(400).json({
        error: 'Dynamic plans not supported for this provider',
        provider: provider.name,
        code: provider.code
      });
    }
  } catch (error) {
    logger.error('Dynamic plans fetch error', { providerId, error });
    next(error);
  }
});

// Verify TV customer (generic)
router.post('/verify-customer', async (req: AuthRequest, res, next) => {
  try {
    const { serviceId, customerId } = req.body;

    if (!serviceId || !customerId) {
      return res.status(400).json({ error: 'Service ID and Customer ID are required' });
    }

    const paymentProvider = paymentServiceManager.getProvider();
    const verificationResult = await paymentProvider.verifyCustomer({
      serviceId,
      customerId
    });

    res.json(verificationResult);
  } catch (error: any) {
    logger.error('TV customer verification failed:', error);
    res.status(400).json({ 
      error: 'Customer verification failed',
      message: error.response?.data?.response_description || error.message
    });
  }
});

// DSTV-specific customer verification
router.post('/verify-dstv-customer', async (req: AuthRequest, res, next) => {
  try {
    const { smartcardNumber } = req.body;

    if (!smartcardNumber) {
      return res.status(400).json({ error: 'Smartcard number is required' });
    }

    const verificationResult = await vtpassService.verifyDSTVCustomer({
      serviceId: 'dstv',
      customerId: smartcardNumber
    });

    res.json(verificationResult);
  } catch (error: any) {
    logger.error('DSTV customer verification failed:', error);
    res.status(400).json({ 
      error: 'DSTV customer verification failed',
      message: error.response?.data?.response_description || error.message
    });
  }
});

// GOTV-specific customer verification
router.post('/verify-gotv-customer', async (req: AuthRequest, res, next) => {
  try {
    const { smartcardNumber } = req.body;

    if (!smartcardNumber) {
      return res.status(400).json({ error: 'Smartcard number is required' });
    }

    const verificationResult = await vtpassService.verifyGOTVCustomer({
      serviceId: 'gotv',
      customerId: smartcardNumber
    });

    res.json(verificationResult);
  } catch (error: any) {
    logger.error('GOTV customer verification failed:', error);
    res.status(400).json({ 
      error: 'GOTV customer verification failed',
      message: error.response?.data?.response_description || error.message
    });
  }
});

// Startimes-specific customer verification
router.post('/verify-startimes-customer', async (req: AuthRequest, res, next) => {
  try {
    const { smartcardNumber } = req.body;

    if (!smartcardNumber) {
      return res.status(400).json({ error: 'Smartcard number is required' });
    }

    const verificationResult = await vtpassService.verifyStartimesCustomer({
      serviceId: 'startimes',
      customerId: smartcardNumber
    });

    res.json(verificationResult);
  } catch (error: any) {
    logger.error('Startimes customer verification failed:', error);
    res.status(400).json({ 
      error: 'Startimes customer verification failed',
      message: error.response?.data?.response_description || error.message
    });
  }
});

// Purchase TV subscription
router.post('/purchase', async (req: AuthRequest, res, next) => {
  try {
    const { error, value } = tvPurchaseSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    const userId = req.user!.id;
    const { 
      provider, 
      variation_code, 
      amount, 
      recipient, 
      biller_code, 
      subscription_type, 
      quantity, 
      metadata 
    } = value;
    
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
        type: 'tv',
        amount: amount || 0, // Amount might be optional for renewal
        recipient,
        provider,
        variationCode: variation_code,
        billerCode: biller_code,
        metadata: {
          ...metadata,
          subscription_type,
          quantity
        }
      });
      
      // Process with payment provider
      const paymentProvider = paymentServiceManager.getProvider();
      
      try {
        const transactionResponse = await paymentProvider.purchaseTVSubscription({
          serviceId: provider,
          billerCode: biller_code,
          variationCode: variation_code,
          amount: amount!,
          phone: recipient,
          requestId: externalReference,
          subscriptionType: subscription_type as 'change' | 'renew',
          quantity
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
          type: 'tv'
        });
        
        logger.info('TV subscription purchase processed successfully', { 
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
          type: 'tv',
          error: providerError
        });
        
        throw providerError;
      }
      
      // Get updated transaction
      const updatedTransaction = await findTransactionById(transactionId);
      
      return res.status(201).json({
        message: 'TV subscription purchase processed successfully',
        transaction: updatedTransaction
      });
      
    } catch (error: any) {
      logger.error('Error in TV subscription purchase', {
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
        error: 'Failed to process TV subscription purchase',
        message: error.message
      });
    }
  } catch (error) {
    next(error);
  }
});

export { router as tvRoutes };