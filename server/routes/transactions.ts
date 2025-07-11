import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';
import { 
  findWallet, 
  updateWallet, 
  createTransaction, 
  createWalletTransaction, 
  findServiceProvider, 
  findAppSetting, 
  updateTransaction,
  findTransactionById,
  getAllServiceProviders,
  getServicePlans,
  getAllTransactions,
  countTransactions,
  getUserTransactionStats
} from '../lib/supabase.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { paymentServiceManager } from '../services/paymentServiceManager.js';
import { vtpassService } from '../services/vtpass.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Helper function to generate VTPass compliant request ID
const generateRequestId = (): string => {
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

const transactionSchema = Joi.object({
  type: Joi.string().valid('airtime', 'data', 'tv', 'electricity', 'education', 'insurance', 'spectranet').required(),
  amount: Joi.when('type', {
    is: 'tv',
    then: Joi.when('subscription_type', {
      is: 'renew',
      then: Joi.number().positive().optional(), // Amount comes from verification for renewal
      otherwise: Joi.number().positive().required()
    }),
    otherwise: Joi.when('type', {
      is: 'data',
      then: Joi.when('provider', {
        is: 'glo-sme-data',
        then: Joi.number().positive().optional(), // Amount is optional for GLO SME Data
        otherwise: Joi.number().positive().required()
      }),
      otherwise: Joi.number().positive().required()
    })
  }),
  recipient: Joi.string().required(),
  provider: Joi.string().required(),
  plan_id: Joi.string().optional(),
  variation_code: Joi.when('type', {
    is: Joi.string().valid('data', 'tv'),
    then: Joi.when('type', {
      is: 'tv',
      then: Joi.when('subscription_type', {
        is: 'change',
        then: Joi.string().required(), // Required for bouquet change
        otherwise: Joi.string().optional() // Not required for renewal
      }),
      otherwise: Joi.string().required() // Required for data
    }),
    otherwise: Joi.when('type', {
      is: 'electricity',
      then: Joi.string().valid('prepaid', 'postpaid').required(),
      otherwise: Joi.when('type', {
        is: 'education',
        then: Joi.string().required(), // Make variation_code required for ALL education services
        otherwise: Joi.when('type', {
          is: 'insurance',
          then: Joi.when('provider', {
            is: 'ui-insure',
            then: Joi.string().required(), // Vehicle type for insurance
            otherwise: Joi.string().optional()
          }),
          otherwise: Joi.string().optional()
        })
      })
    })
  }),
  biller_code: Joi.when('type', {
    is: 'tv',
    then: Joi.string().required(), // Required for TV (smartcard number)
    otherwise: Joi.when('type', {
      is: 'education',
      then: Joi.when('provider', {
        is: 'jamb',
        then: Joi.string().required(),
        otherwise: Joi.string().optional()
      }),
      otherwise: Joi.when('type', {
        is: 'insurance',
        then: Joi.when('provider', {
          is: 'ui-insure',
          then: Joi.string().required(), // Plate number for insurance
          otherwise: Joi.string().optional()
        }),
        otherwise: Joi.string().optional()
      })
    })
  }),
  quantity: Joi.number().integer().min(1).optional(),
  subscription_type: Joi.when('type', {
    is: 'tv',
    then: Joi.string().valid('change', 'renew').required(),
    otherwise: Joi.string().valid('change', 'renew').optional()
  }),
  // Insurance-specific fields for ui-insure
  Insured_Name: Joi.when('type', {
    is: 'insurance',
    then: Joi.when('provider', {
      is: 'ui-insure',
      then: Joi.string().required(),
      otherwise: Joi.string().optional()
    }),
    otherwise: Joi.string().optional()
  }),
  engine_capacity: Joi.when('type', {
    is: 'insurance',
    then: Joi.when('provider', {
      is: 'ui-insure',
      then: Joi.string().required(),
      otherwise: Joi.string().optional()
    }),
    otherwise: Joi.string().optional()
  }),
  Chasis_Number: Joi.when('type', {
    is: 'insurance',
    then: Joi.when('provider', {
      is: 'ui-insure',
      then: Joi.string().required(),
      otherwise: Joi.string().optional()
    }),
    otherwise: Joi.string().optional()
  }),
  Plate_Number: Joi.when('type', {
    is: 'insurance',
    then: Joi.when('provider', {
      is: 'ui-insure',
      then: Joi.string().required(),
      otherwise: Joi.string().optional()
    }),
    otherwise: Joi.string().optional()
  }),
  vehicle_make: Joi.when('type', {
    is: 'insurance',
    then: Joi.when('provider', {
      is: 'ui-insure',
      then: Joi.string().required(),
      otherwise: Joi.string().optional()
    }),
    otherwise: Joi.string().optional()
  }),
  vehicle_color: Joi.when('type', {
    is: 'insurance',
    then: Joi.when('provider', {
      is: 'ui-insure',
      then: Joi.string().required(),
      otherwise: Joi.string().optional()
    }),
    otherwise: Joi.string().optional()
  }),
  vehicle_model: Joi.when('type', {
    is: 'insurance',
    then: Joi.when('provider', {
      is: 'ui-insure',
      then: Joi.string().required(),
      otherwise: Joi.string().optional()
    }),
    otherwise: Joi.string().optional()
  }),
  YearofMake: Joi.when('type', {
    is: 'insurance',
    then: Joi.when('provider', {
      is: 'ui-insure',
      then: Joi.string().required(),
      otherwise: Joi.string().optional()
    }),
    otherwise: Joi.string().optional()
  }),
  state: Joi.when('type', {
    is: 'insurance',
    then: Joi.when('provider', {
      is: 'ui-insure',
      then: Joi.string().required(),
      otherwise: Joi.string().optional()
    }),
    otherwise: Joi.string().optional()
  }),
  lga: Joi.when('type', {
    is: 'insurance',
    then: Joi.when('provider', {
      is: 'ui-insure',
      then: Joi.string().required(),
      otherwise: Joi.string().optional()
    }),
    otherwise: Joi.string().optional()
  }),
  email: Joi.when('type', {
    is: 'insurance',
    then: Joi.when('provider', {
      is: 'ui-insure',
      then: Joi.string().email().required(),
      otherwise: Joi.string().email().optional()
    }),
    otherwise: Joi.string().email().optional()
  }),
  metadata: Joi.object().optional()
});

// Get user transactions
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const transactions = await getAllTransactions(page, limit, { userId });
    const total = await countTransactions({ userId });
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

// Get transaction by ID
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const transactionId = req.params.id;

    const transaction = await findTransactionById(transactionId);

    if (!transaction || transaction.user_id !== userId) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    next(error);
  }
});

// Create new transaction
router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const { error, value } = transactionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const userId = req.user!.id;
    const { 
      type, 
      amount, 
      recipient, 
      provider, 
      plan_id, 
      biller_code, 
      variation_code, 
      quantity, 
      subscription_type, 
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
      email,
      metadata 
    } = value;

    // Check user wallet balance
    const wallet = await findWallet(userId);

    if (!wallet) {
      return res.status(400).json({ error: 'Wallet not found' });
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
      return res.status(400).json({ error: 'Insufficient wallet balance' });
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
      plan_id: plan_id || null,
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

    // Get payment provider and process transaction
    const paymentProvider = paymentServiceManager.getProvider();
    let transactionResponse;

    try {
      switch (type) {
        case 'airtime':
          transactionResponse = await paymentProvider.purchaseAirtime({
            serviceId: provider,
            amount,
            phone: recipient,
            requestId: externalReference
          });
          break;
        
        case 'data':
          // Special handling for GLO SME Data
          if (provider === 'glo-sme-data') {
            transactionResponse = await vtpassService.purchaseGloSmeData({
              serviceId: provider,
              billerCode: biller_code || recipient,
              variationCode: variation_code!,
              amount, // Optional for GLO SME Data
              phone: recipient,
              requestId: externalReference
            });
          } else {
            transactionResponse = await paymentProvider.purchaseData({
              serviceId: provider,
              billerCode: biller_code || recipient,
              variationCode: variation_code!,
              amount,
              phone: recipient,
              requestId: externalReference
            });
          }
          break;
        
        case 'spectranet':
          // Special handling for Spectranet
          if (vtpassService.purchaseSpectranet) {
            transactionResponse = await vtpassService.purchaseSpectranet({
              serviceId: provider,
              billerCode: biller_code || recipient,
              variationCode: variation_code || plan_id!,
              amount,
              phone: recipient,
              requestId: externalReference,
              quantity: quantity || 1
            });
          } else {
            // Fallback to data purchase method
            transactionResponse = await paymentProvider.purchaseData({
              serviceId: provider,
              billerCode: biller_code || recipient,
              variationCode: variation_code || plan_id!,
              amount,
              phone: recipient,
              requestId: externalReference
            });
          }
          break;
        
        case 'tv':
          transactionResponse = await paymentProvider.purchaseTVSubscription({
            serviceId: provider,
            billerCode: biller_code || recipient,
            variationCode: variation_code,
            amount,
            phone: recipient,
            requestId: externalReference,
            subscriptionType: subscription_type as 'change' | 'renew',
            quantity: quantity
          });
          break;
        
        case 'electricity':
          transactionResponse = await paymentProvider.purchaseElectricity({
            serviceId: provider,
            billerCode: biller_code || recipient,
            variationCode: variation_code!,
            meterType: variation_code as 'prepaid' | 'postpaid',
            amount,
            phone: recipient,
            requestId: externalReference
          });
          break;
        
        case 'education':
          transactionResponse = await paymentProvider.payEducationBill({
            serviceId: provider,
            billerCode: biller_code || recipient,
            variationCode: variation_code!,
            amount,
            phone: recipient,
            requestId: externalReference,
            quantity: quantity
          });
          break;
        
        case 'insurance':
          // For ui-insure (Universal Insurance), use the specialized method
          if (provider === 'ui-insure') {
            transactionResponse = await paymentProvider.purchaseThirdPartyInsurance({
              serviceId: provider,
              billerCode: biller_code || Plate_Number!,
              variationCode: variation_code!,
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
              variationCode: variation_code || plan_id!,
              amount,
              phone: recipient,
              requestId: externalReference
            });
          }
          break;
        
        default:
          throw new Error(`Transaction type ${type} not implemented`);
      }

      // Update transaction with provider response
      await updateTransaction(transactionId, {
        vtpass_reference: transactionResponse.providerReference || transactionResponse.requestId,
        status: transactionResponse.status,
        description: transactionResponse.message,
        user_discount: userDiscount,
        total_amount: finalAmount
      });

      logger.info('Transaction processed successfully', { 
        transactionId, 
        externalReference, 
        provider: paymentServiceManager.getProviderName(),
        status: transactionResponse.status 
      });

    } catch (providerError: any) {
      logger.error('Payment provider transaction failed', { 
        transactionId, 
        provider: paymentServiceManager.getProviderName(),
        error: providerError.message || 'Unknown error' 
      });
      
      // Mark transaction as failed
      await updateTransaction(transactionId, {
        status: 'failed',
        description: providerError.message || 'Payment processing failed'
      });

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
    }

    // Get updated transaction
    const updatedTransaction = await findTransactionById(transactionId);

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction: updatedTransaction
    });

  } catch (error) {
    next(error);
  }
});

// Get transaction statistics
router.get('/stats/summary', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const stats = await getUserTransactionStats(userId);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

// Get available services
router.get('/services/providers', async (req: AuthRequest, res, next) => {
  try {
    const providers = await getAllServiceProviders();
    res.json(providers);
  } catch (error) {
    next(error);
  }
});

// Get service plans for a provider
router.get('/services/providers/:providerId/plans', async (req: AuthRequest, res, next) => {
  try {
    const providerId = req.params.providerId;
    const plans = await getServicePlans(providerId);
    res.json(plans);
  } catch (error) {
    next(error);
  }
});

// Get dynamic plans for providers that fetch from external APIs
router.get('/services/providers/:providerId/dynamic-plans', async (req: AuthRequest, res, next) => {
   const providerId = req.params.providerId;
try {

    // Get provider details - we need to use direct Supabase query for this
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
    } else if (provider.type === 'tv') {
      // For TV providers, fetch dynamic plans from VTpass
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
      // For other providers, return empty array or error
      return res.status(400).json({
        error: 'Dynamic plans not supported for this provider',
        provider: provider.name,
        code: provider.code
      });
    }
  } catch (error) {
    logger.error('Dynamic plans fetch error', { providerId: providerId, error: error });
    next(error);
  }
});

// Verify customer (for TV, electricity, etc.)
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
    logger.error('Customer verification failed:', error);
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

// Verify electricity customer (Ikeja Electric specific)
router.post('/verify-electricity-customer', async (req: AuthRequest, res, next) => {
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

// Insurance auxiliary data endpoints
router.get('/insurance/vehicle-colors', async (req: AuthRequest, res, next) => {
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

router.get('/insurance/engine-capacities', async (req: AuthRequest, res, next) => {
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

router.get('/insurance/states', async (req: AuthRequest, res, next) => {
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

router.get('/insurance/lgas/:stateCode', async (req: AuthRequest, res, next) => {
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

router.get('/insurance/vehicle-makes', async (req: AuthRequest, res, next) => {
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

router.get('/insurance/vehicle-models/:vehicleMakeCode', async (req: AuthRequest, res, next) => {
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

// Check transaction status
router.get('/:id/status', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const transactionId = req.params.id;

    // Get transaction from database
    const transaction = await findTransactionById(transactionId);

    if (!transaction || transaction.user_id !== userId) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // If transaction is still pending, check with provider
    if (transaction.status === 'pending' && transaction.external_reference) {
      try {
        const paymentProvider = paymentServiceManager.getProvider();
        const statusResponse = await paymentProvider.checkTransactionStatus(transaction.external_reference);

        // Update transaction status if it has changed
        if (statusResponse.status !== transaction.status) {
          await updateTransaction(transactionId, {
            status: statusResponse.status,
            description: statusResponse.message
          });
          
          transaction.status = statusResponse.status;
        }
      } catch (error) {
        logger.error('Status check failed:', error);
      }
    }

    res.json({
      id: transactionId,
      status: transaction.status,
      provider_reference: transaction.vtpass_reference
    });
  } catch (error) {
    next(error);
  }
});

export { router as transactionRoutes };