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

const insurancePurchaseSchema = Joi.object({
  provider: Joi.string().required(),
  variation_code: Joi.string().required(),
  amount: Joi.number().positive().required(),
  recipient: Joi.string().required(),
  biller_code: Joi.when('provider', {
    is: 'ui-insure',
    then: Joi.string().required(), // Plate number for insurance
    otherwise: Joi.string().optional()
  }),
  metadata: Joi.object().optional(),
  // Insurance-specific fields for ui-insure
  Insured_Name: Joi.when('provider', {
    is: 'ui-insure',
    then: Joi.string().required(),
    otherwise: Joi.string().optional()
  }),
  engine_capacity: Joi.when('provider', {
    is: 'ui-insure',
    then: Joi.string().required(),
    otherwise: Joi.string().optional()
  }),
  Chasis_Number: Joi.when('provider', {
    is: 'ui-insure',
    then: Joi.string().required(),
    otherwise: Joi.string().optional()
  }),
  Plate_Number: Joi.when('provider', {
    is: 'ui-insure',
    then: Joi.string().required(),
    otherwise: Joi.string().optional()
  }),
  vehicle_make: Joi.when('provider', {
    is: 'ui-insure',
    then: Joi.string().required(),
    otherwise: Joi.string().optional()
  }),
  vehicle_color: Joi.when('provider', {
    is: 'ui-insure',
    then: Joi.string().required(),
    otherwise: Joi.string().optional()
  }),
  vehicle_model: Joi.when('provider', {
    is: 'ui-insure',
    then: Joi.string().required(),
    otherwise: Joi.string().optional()
  }),
  YearofMake: Joi.when('provider', {
    is: 'ui-insure',
    then: Joi.string().required(),
    otherwise: Joi.string().optional()
  }),
  state: Joi.when('provider', {
    is: 'ui-insure',
    then: Joi.string().required(),
    otherwise: Joi.string().optional()
  }),
  lga: Joi.when('provider', {
    is: 'ui-insure',
    then: Joi.string().required(),
    otherwise: Joi.string().optional()
  }),
  email: Joi.when('provider', {
    is: 'ui-insure',
    then: Joi.string().email().required(),
    otherwise: Joi.string().email().optional()
  })
});

// Get all insurance providers
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
      .eq('type', 'insurance')
      .eq('status', 'active')
      .eq('is_enabled', true)
      .order('name', { ascending: true });
      
    if (error) throw error;
    
    res.json(data || []);
  } catch (error) {
    next(error);
  }
});

// Get insurance plans for a provider
router.get('/providers/:providerId/plans', async (req, res, next) => {
  try {
    const providerId = req.params.providerId;
    const plans = await getServicePlans(providerId);
    res.json(plans);
  } catch (error) {
    next(error);
  }
});

// Insurance auxiliary data endpoints
router.get('/vehicle-colors', async (req: AuthRequest, res, next) => {
  try {
    const colors = await vtpassService.getVehicleColors();
    res.json(colors);
  } catch (error: any) {
    logger.error('Failed to fetch vehicle colors:', error);
    res.status(500).json({ 
      error: 'Failed to fetch vehicle colors',
      message: error.message
    });
  }
});

router.get('/engine-capacities', async (req: AuthRequest, res, next) => {
  try {
    const capacities = await vtpassService.getEngineCapacities();
    res.json(capacities);
  } catch (error: any) {
    logger.error('Failed to fetch engine capacities:', error);
    res.status(500).json({ 
      error: 'Failed to fetch engine capacities',
      message: error.message
    });
  }
});

router.get('/states', async (req: AuthRequest, res, next) => {
  try {
    const states = await vtpassService.getStates();
    res.json(states);
  } catch (error: any) {
    logger.error('Failed to fetch states:', error);
    res.status(500).json({ 
      error: 'Failed to fetch states',
      message: error.message
    });
  }
});

router.get('/lgas/:stateCode', async (req: AuthRequest, res, next) => {
  try {
    const stateCode = req.params.stateCode;
    const lgas = await vtpassService.getLGAs(stateCode);
    res.json(lgas);
  } catch (error: any) {
    logger.error('Failed to fetch LGAs:', error);
    res.status(500).json({ 
      error: 'Failed to fetch LGAs',
      message: error.message
    });
  }
});

router.get('/vehicle-makes', async (req: AuthRequest, res, next) => {
  try {
    const makes = await vtpassService.getVehicleMakes();
    res.json(makes);
  } catch (error: any) {
    logger.error('Failed to fetch vehicle makes:', error);
    res.status(500).json({ 
      error: 'Failed to fetch vehicle makes',
      message: error.message
    });
  }
});

router.get('/vehicle-models/:vehicleMakeCode', async (req: AuthRequest, res, next) => {
  try {
    const vehicleMakeCode = req.params.vehicleMakeCode;
    const models = await vtpassService.getVehicleModels(vehicleMakeCode);
    res.json(models);
  } catch (error: any) {
    logger.error('Failed to fetch vehicle models:', error);
    res.status(500).json({ 
      error: 'Failed to fetch vehicle models',
      message: error.message
    });
  }
});

// Purchase insurance
router.post('/purchase', async (req: AuthRequest, res, next) => {
  try {
    const { error, value } = insurancePurchaseSchema.validate(req.body);
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
      metadata,
      // Insurance-specific fields
      Insured_Name,
      engine_capacity,
      Chasis_Number,
      Plate_Number,
      vehicle_make,
      vehicle_color,
      vehicle_model,
      YearofMake,
      state,
      lga,
      email
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
        type: 'insurance',
        amount,
        recipient,
        provider,
        variationCode: variation_code,
        billerCode: biller_code,
        metadata: {
          ...metadata,
          Insured_Name,
          engine_capacity,
          Chasis_Number,
          Plate_Number,
          vehicle_make,
          vehicle_color,
          vehicle_model,
          YearofMake,
          state,
          lga,
          email
        }
      });
      
      // Process with payment provider
      const paymentProvider = paymentServiceManager.getProvider();
      
      try {
        let transactionResponse;
        
        // For ui-insure (Universal Insurance), use the specialized method
        if (provider === 'ui-insure') {
          transactionResponse = await paymentProvider.purchaseThirdPartyInsurance({
            serviceId: provider,
            billerCode: biller_code || Plate_Number!,
            variationCode: variation_code,
            amount,
            phone: recipient,
            requestId: externalReference,
            Insured_Name: Insured_Name!,
            engine_capacity: engine_capacity!,
            Chasis_Number: Chasis_Number!,
            Plate_Number: Plate_Number!,
            vehicle_make: vehicle_make!,
            vehicle_color: vehicle_color!,
            vehicle_model: vehicle_model!,
            YearofMake: YearofMake!,
            state: state!,
            lga: lga!,
            email: email!
          });
        } else {
          // For other insurance providers, use the standard method
          transactionResponse = await paymentProvider.payInsuranceBill({
            serviceId: provider,
            billerCode: biller_code || recipient,
            variationCode: variation_code,
            amount,
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
          type: 'insurance'
        });
        
        logger.info('Insurance purchase processed successfully', { 
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
          type: 'insurance',
          error: providerError
        });
        
        throw providerError;
      }
      
      // Get updated transaction
      const updatedTransaction = await findTransactionById(transactionId);
      
      return res.status(201).json({
        message: 'Insurance purchase processed successfully',
        transaction: updatedTransaction
      });
      
    } catch (error: any) {
      logger.error('Error in insurance purchase', {
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
        error: 'Failed to process insurance purchase',
        message: error.message
      });
    }
  } catch (error) {
    next(error);
  }
});

export { router as insuranceRoutes };