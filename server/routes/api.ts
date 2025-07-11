import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';
import bcrypt from 'bcryptjs';
import { 
  findWallet, 
  updateWallet, 
  createTransaction, 
  createWalletTransaction, 
  findTransactionByExternalReference,
  getAllServiceProviders,
  getServicePlans,
  findUser,
  createApiKey,
  updateApiKey,
  findApiKeysByUser,
  getAllActiveApiKeys,
  incrementApiKeyUsage
} from '../lib/supabase.js';
import { logger } from '../utils/logger.js';
import { paymentServiceManager } from '../services/paymentServiceManager.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

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

// Helper function to generate API key
const generateApiKey = (): string => {
  const prefix = 'vtu_';
  const randomBytes = Array.from({ length: 32 }, () => 
    Math.floor(Math.random() * 36).toString(36)
  ).join('');
  return prefix + randomBytes;
};

// API Key authentication middleware
const authenticateApiKey = async (req: any, res: any, next: any) => {
  try {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({ error: 'API key required' });
    }

    // Find API key by comparing hashes
    const apiKeys = await getAllActiveApiKeys();

    let validApiKey = null;
    for (const keyRecord of apiKeys) {
      if (bcrypt.compareSync(apiKey, keyRecord.key_hash)) {
        validApiKey = keyRecord;
        break;
      }
    }

    if (!validApiKey) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    // Check usage limit
    if (validApiKey.usage_limit && validApiKey.usage_count >= validApiKey.usage_limit) {
      return res.status(429).json({ error: 'API key usage limit exceeded' });
    }

    // Update usage count and last used
    await incrementApiKeyUsage(validApiKey.id);

    req.apiKey = validApiKey;
    req.user = {
      id: validApiKey.user_id,
      email: validApiKey.users?.email
    };

    next();
  } catch (error) {
    logger.error('API key authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

const purchaseSchema = Joi.object({
  type: Joi.string().valid('airtime', 'data', 'tv', 'electricity', 'education', 'insurance').required(),
  amount: Joi.number().positive().required(),
  recipient: Joi.string().required(),
  provider: Joi.string().required(),
  plan_id: Joi.string().optional(),
  variation_code: Joi.when('type', {
    is: Joi.string().valid('data', 'tv'),
    then: Joi.string().required(),
    otherwise: Joi.when('type', {
      is: 'electricity',
      then: Joi.string().valid('prepaid', 'postpaid').required(),
      otherwise: Joi.string().optional()
    })
  }),
  biller_code: Joi.string().optional(),
  callback_url: Joi.string().uri().optional()
});

const createApiKeySchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  permissions: Joi.array().items(Joi.string()).optional(),
  usage_limit: Joi.number().integer().min(1).optional()
});

// API Key Management Routes (for dashboard users)

// Get all API keys for the authenticated user
router.get('/keys', authenticateToken, async (req: any, res, next) => {
  try {
    const userId = req.user.id;
    const apiKeys = await findApiKeysByUser(userId);

    // Parse permissions JSON for each key
    const formattedKeys = apiKeys.map((key: any) => ({
      ...key,
      permissions: typeof key.permissions === 'string' ? JSON.parse(key.permissions || '[]') : key.permissions || []
    }));

    res.json(formattedKeys);
  } catch (error) {
    next(error);
  }
});

// Generate a new API key
router.post('/keys', authenticateToken, async (req: any, res, next) => {
  try {
    const { error, value } = createApiKeySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const userId = req.user.id;
    const { name, permissions = [], usage_limit } = value;

    // Check if user already has 5 API keys (limit)
    const existingKeys = await findApiKeysByUser(userId);

    if (existingKeys.length >= 5) {
      return res.status(400).json({ error: 'Maximum of 5 API keys allowed per user' });
    }

    // Generate API key and hash it
    const apiKey = generateApiKey();
    const keyHash = await bcrypt.hash(apiKey, 12);
    const keyId = uuidv4();

    // Store API key in database
    const apiKeyData = {
      id: keyId,
      user_id: userId,
      key_hash: keyHash,
      name,
      permissions: JSON.stringify(permissions),
      usage_limit: usage_limit || null,
      usage_count: 0,
      status: 'active'
    };

    await createApiKey(apiKeyData);

    logger.info('API key generated', { userId, keyId, name });

    // Return the plain text API key (only time it's shown)
    res.status(201).json({
      message: 'API key generated successfully',
      apiKey: {
        id: keyId,
        name,
        key: apiKey, // This is the only time the plain key is returned
        permissions,
        usage_limit,
        status: 'active',
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

// Update an API key
router.patch('/keys/:id', authenticateToken, async (req: any, res, next) => {
  try {
    const userId = req.user.id;
    const keyId = req.params.id;
    const { name, usage_limit } = req.body;

    // Verify the API key belongs to the user
    const userApiKeys = await findApiKeysByUser(userId);
    const apiKey = userApiKeys.find(k => k.id === keyId && k.status !== 'revoked');

    if (!apiKey) {
      return res.status(404).json({ error: 'API key not found' });
    }

    // Build update data
    const updateData: any = {};
    if (name) updateData.name = name;
    if (usage_limit !== undefined) updateData.usage_limit = usage_limit;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    await updateApiKey(keyId, updateData);

    logger.info('API key updated', { userId, keyId, updates: updateData });

    res.json({ message: 'API key updated successfully' });
  } catch (error) {
    next(error);
  }
});

// Revoke an API key
router.delete('/keys/:id', authenticateToken, async (req: any, res, next) => {
  try {
    const userId = req.user.id;
    const keyId = req.params.id;

    // Verify the API key belongs to the user
    const userApiKeys = await findApiKeysByUser(userId);
    const apiKey = userApiKeys.find(k => k.id === keyId && k.status !== 'revoked');

    if (!apiKey) {
      return res.status(404).json({ error: 'API key not found' });
    }

    // Revoke the API key
    await updateApiKey(keyId, { status: 'revoked' });

    logger.info('API key revoked', { userId, keyId, name: apiKey.name });

    res.json({ message: 'API key revoked successfully' });
  } catch (error) {
    next(error);
  }
});

// Public API Routes (for external integrations)

// Get account balance
router.get('/balance', authenticateApiKey, async (req: any, res, next) => {
  try {
    const userId = req.user.id;
    const wallet = await findWallet(userId);

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    res.json({
      balance: parseFloat(wallet.balance.toString()),
      currency: wallet.currency
    });
  } catch (error) {
    next(error);
  }
});

// Purchase service
router.post('/purchase', authenticateApiKey, async (req: any, res, next) => {
  try {
    const { error, value } = purchaseSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const userId = req.user.id;
    const { type, amount, recipient, provider, plan_id, biller_code, variation_code, callback_url } = value;

    // Check wallet balance
    const wallet = await findWallet(userId);

    if (!wallet) {
      return res.status(400).json({ error: 'Wallet not found' });
    }

    const walletBalance = parseFloat(wallet.balance.toString());
    const totalAmount = amount; // No fees, user pays the amount minus any discount

    if (walletBalance < totalAmount) {
      return res.status(400).json({ 
        error: 'Insufficient balance',
        required: totalAmount,
        available: walletBalance
      });
    }

    const transactionId = uuidv4();
    // Generate VTPass compliant request ID with YYYYMMDD prefix
    const externalReference = generateRequestId();

    // Create transaction
    const transactionData = {
      id: transactionId,
      user_id: userId,
      type,
      amount,
      user_discount: 0, // user_discount - will be updated after provider response
      total_amount: totalAmount,
      recipient,
      provider,
      plan_id: plan_id || null,
      external_reference: externalReference,
      status: 'pending',
      description: `API ${type} purchase for ${recipient}`,
      metadata: JSON.stringify({ 
        callback_url: callback_url || null, 
        api_key_id: req.apiKey.id,
        biller_code: biller_code || null,
        variation_code: variation_code || null
      })
    };

    await createTransaction(transactionData);

    // Deduct from wallet
    await updateWallet(userId, walletBalance - totalAmount);

    // Log wallet transaction
    const walletTransactionId = uuidv4();
    const walletTransactionData = {
      id: walletTransactionId,
      wallet_id: wallet.id,
      user_id: userId,
      type: 'debit',
      amount: totalAmount,
      balance_before: walletBalance,
      balance_after: walletBalance - totalAmount,
      reference: externalReference,
      description: `API payment for ${type} transaction`
    };

    await createWalletTransaction(walletTransactionData);

    // Process with payment provider
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
          transactionResponse = await paymentProvider.purchaseData({
            serviceId: provider,
            billerCode: biller_code || recipient,
            variationCode: variation_code!,
            amount,
            phone: recipient,
            requestId: externalReference
          });
          break;
        
        case 'tv':
          transactionResponse = await paymentProvider.purchaseTVSubscription({
            serviceId: provider,
            billerCode: biller_code || recipient,
            variationCode: variation_code!,
            amount,
            phone: recipient,
            requestId: externalReference
          });
          break;
        
        case 'electricity':
          transactionResponse = await paymentProvider.payElectricityBill({
            serviceId: provider,
            billerCode: biller_code || recipient,
            variationCode: variation_code!,
            amount,
            phone: recipient,
            requestId: externalReference
          });
          break;
        
        case 'education':
          transactionResponse = await paymentProvider.payEducationBill({
            serviceId: provider,
            billerCode: biller_code || recipient,
            variationCode: variation_code || plan_id!,
            amount,
            phone: recipient,
            requestId: externalReference
          });
          break;
        
        case 'insurance':
          transactionResponse = await paymentProvider.payInsuranceBill({
            serviceId: provider,
            billerCode: biller_code || recipient,
            variationCode: variation_code || plan_id!,
            amount,
            phone: recipient,
            requestId: externalReference
          });
          break;
        
        default:
          throw new Error(`Transaction type ${type} not implemented`);
      }

      // Update transaction with provider response
      const { supabase } = await import('../lib/supabase.js');
      if (supabase) {
        await supabase
          .from('transactions')
          .update({
            vtpass_reference: transactionResponse.providerReference || transactionResponse.requestId,
            status: transactionResponse.status,
            description: transactionResponse.message
          })
          .eq('id', transactionId);
      }

    } catch (providerError: any) {
      logger.error('API transaction provider error:', { transactionId, error: providerError });
      
      // Mark transaction as failed
      const { supabase } = await import('../lib/supabase.js');
      if (supabase) {
        await supabase
          .from('transactions')
          .update({
            status: 'failed',
            description: providerError.message || 'Payment processing failed'
          })
          .eq('id', transactionId);
      }

      // Refund wallet
      await updateWallet(userId, walletBalance);
    }

    logger.info('API transaction created', { 
      transactionId, 
      userId, 
      type, 
      amount, 
      apiKeyId: req.apiKey.id,
      provider: paymentServiceManager.getProviderName(),
      requestId: externalReference
    });

    res.status(201).json({
      transaction_id: transactionId,
      reference: externalReference,
      status: 'pending',
      amount,
      total_amount: totalAmount,
      message: 'Transaction initiated successfully'
    });

  } catch (error) {
    next(error);
  }
});

// Get transaction status
router.get('/transaction/:reference', authenticateApiKey, async (req: any, res, next) => {
  try {
    const userId = req.user.id;
    const reference = req.params.reference;

    const transaction = await findTransactionByExternalReference(reference);

    if (!transaction || transaction.user_id !== userId) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({
      id: transaction.id,
      external_reference: transaction.external_reference,
      type: transaction.type,
      amount: transaction.amount,
      user_discount: transaction.user_discount,
      total_amount: transaction.total_amount,
      recipient: transaction.recipient,
      provider: transaction.provider,
      status: transaction.status,
      created_at: transaction.created_at,
      updated_at: transaction.updated_at
    });
  } catch (error) {
    next(error);
  }
});

// Get transaction history
router.get('/transactions', authenticateApiKey, async (req: any, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100); // Max 100 per page

    // We need to use a direct Supabase query for API transactions since getAllTransactions returns admin format
    const { supabase } = await import('../lib/supabase.js');
    if (!supabase) {
      return res.status(503).json({ error: 'Database service not available' });
    }

    const offset = (page - 1) * limit;
    
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('id, external_reference, type, amount, user_discount, total_amount, recipient, provider, status, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    const { count: total, error: countError } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countError) {
      throw countError;
    }

    res.json({
      transactions: transactions || [],
      pagination: {
        page,
        limit,
        total: total || 0,
        total_pages: Math.ceil((total || 0) / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get available services
router.get('/services', async (req, res, next) => {
  try {
    const providers = await getAllServiceProviders();
    res.json(providers);
  } catch (error) {
    next(error);
  }
});

// Get service plans
router.get('/services/:provider_id/plans', async (req, res, next) => {
  try {
    const providerId = req.params.provider_id;
    const plans = await getServicePlans(providerId);
    res.json(plans);
  } catch (error) {
    next(error);
  }
});

// Verify customer
router.post('/verify-customer', authenticateApiKey, async (req: any, res, next) => {
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
    logger.error('API customer verification failed:', error);
    res.status(400).json({ 
      error: 'Customer verification failed',
      message: error.response?.data?.response_description || error.message
    });
  }
});

export { router as apiRoutes };