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

const dataPurchaseSchema = Joi.object({
  provider: Joi.string().required(),
  variation_code: Joi.string().required(),
  amount: Joi.when('provider', {
    is: 'glo-sme-data',
    then: Joi.number().optional(),
    otherwise: Joi.number().positive().required()
  }),
  recipient: Joi.string().required(),
  biller_code: Joi.string().optional(),
  metadata: Joi.object().optional()
});

// Get all data providers
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
      .eq('type', 'data')
      .eq('status', 'active')
      .eq('is_enabled', true)
      .order('name', { ascending: true });
      
    if (error) throw error;
    
    res.json(data || []);
  } catch (error) {
    next(error);
  }
});

// Get data plans for a provider
router.get('/providers/:providerId/plans', async (req, res, next) => {
  try {
    const providerId = req.params.providerId;
    const plans = await getServicePlans(providerId);
    res.json(plans);
  } catch (error) {
    next(error);
  }
});

// Get dynamic plans (for GLO SME)
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

    // Check if this is GLO SME Data provider
    if (provider.code === 'glo-sme-data') {
      try {
        logger.info(`Fetching dynamic plans for GLO SME Data provider: ${provider.name}`);
        
        const variationsResponse = await vtpassService.getGloSmeDataVariations();
        
        if (!variationsResponse.content || !variationsResponse.content.varations) {
          return res.status(400).json({ 
            error: 'No variations found from VTpass API',
            details: variationsResponse
          });
        }

        const variations = variationsResponse.content.varations;
        
        // Map VTpass variations to our ServicePlan interface
        const dynamicPlans = variations.map((variation: any) => ({
          id: `dynamic-${variation.variation_code}`, // Temporary ID for dynamic plans
          name: variation.name,
          code: variation.variation_code,
          amount: parseFloat(variation.variation_amount),
          validity: null, // Not provided in VTpass response
          description: `${variation.name} - Dynamic plan from VTpass`
        }));

        logger.info('Successfully fetched GLO SME Data dynamic plans', {
          provider: provider.name,
          plansCount: dynamicPlans.length
        });

        res.json(dynamicPlans);
      } catch (vtpassError: any) {
        logger.error('VTpass API error during dynamic plan fetch', {
          provider: provider.name,
          serviceCode: provider.code,
          error: vtpassError.message,
          response: vtpassError.response?.data
        });

        return res.status(500).json({
          error: 'Failed to fetch dynamic plans from VTpass API',
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

// Purchase data bundle
router.post('/purchase', async (req: AuthRequest, res, next) => {
  try {
    const { error, value } = dataPurchaseSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    const userId = req.user!.id;
    const { provider, variation_code, amount, recipient, biller_code, metadata } = value;
    
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
        type: 'data',
        amount: amount || 0, // Handle optional amount for GLO SME
        recipient,
        provider,
        variationCode: variation_code,
        billerCode: biller_code,
        metadata
      });
      
      // Process with payment provider
      const paymentProvider = paymentServiceManager.getProvider();
      
      try {
        let transactionResponse;
        
        // Special handling for GLO SME Data
        if (provider === 'glo-sme-data') {
          transactionResponse = await vtpassService.purchaseGloSmeData({
            serviceId: provider,
            billerCode: biller_code || recipient,
            variationCode: variation_code,
            amount, // Optional for GLO SME Data
            phone: recipient,
            requestId: externalReference
          });
        } else {
          transactionResponse = await paymentProvider.purchaseData({
            serviceId: provider,
            billerCode: biller_code || recipient,
            variationCode: variation_code,
            amount: amount!,
            phone: recipient,
            requestId: externalReference
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
          type: 'data'
        });
        
        logger.info('Data purchase processed successfully', { 
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
          type: 'data',
          error: providerError
        });
        
        throw providerError;
      }
      
      // Get updated transaction
      const updatedTransaction = await findTransactionById(transactionId);
      
      return res.status(201).json({
        message: 'Data purchase processed successfully',
        transaction: updatedTransaction
      });
      
    } catch (error: any) {
      logger.error('Error in data purchase', {
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
        error: 'Failed to process data purchase',
        message: error.message
      });
    }
  } catch (error) {
    next(error);
  }
});

export { router as dataRoutes };