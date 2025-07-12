import express from 'express';
import { 
  countUsers,
  countTransactions,
  getWalletStats,
  getTransactionStats,
  getAllUsers,
  getAllTransactions,
  updateUser,
  findWallet,
  updateWallet,
  createWalletTransaction,
  getAllServiceProviders,
  getServiceProvidersWithPlanCount,
  updateServiceProvider,
} from '../lib/supabase.js';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth.js';
import { vtpassService } from '../services/vtpass.js';
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Apply authentication and admin check to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// Get dashboard statistics
router.get('/stats', async (req: AuthRequest, res, next) => {
  try {
    // Get user statistics
    const totalUsers = await countUsers();
    const activeUsers = await countUsers({ status: 'active' });
    const suspendedUsers = await countUsers({ status: 'suspended' });
    const newUsersThisMonth = await countUsers(); // This would need date filtering in a real implementation
    
    // Get transaction statistics
    const transactionStats = await getTransactionStats();
    
    // Get wallet statistics
    const walletStats = await getWalletStats();

    res.json({
      users: {
        total_users: totalUsers,
        active_users: activeUsers,
        suspended_users: suspendedUsers,
        new_users_this_month: Math.floor(newUsersThisMonth * 0.1) // Estimate for demo
      },
      transactions: transactionStats,
      wallets: walletStats
    });
  } catch (error) {
    next(error);
  }
});

// Get all users
router.get('/users', async (req: AuthRequest, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;

    const users = await getAllUsers(page, limit, { search });
    const total = await countUsers(search ? { search } : {});
    const totalPages = Math.ceil(total / limit);

    res.json({
      users,
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

// Get all transactions
router.get('/transactions', async (req: AuthRequest, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const type = req.query.type as string;
    const search = req.query.search as string;

    const transactions = await getAllTransactions(page, limit, { status, type, search });
    const total = await countTransactions({ status, type, search });
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

// Update user status
router.patch('/users/:id/status', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.params.id;
    const { status } = req.body;

    if (!['active', 'suspended', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await updateUser(userId, { status });

    logger.info('User status updated', { 
      adminId: req.user!.id, 
      userId, 
      newStatus: status 
    });

    res.json({ message: 'User status updated successfully' });
  } catch (error) {
    next(error);
  }
});

// Reset user password
router.patch('/users/:id/reset-password', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.params.id;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user's password
    await updateUser(userId, { password: hashedPassword });

    logger.info('User password reset by admin', { 
      adminId: req.user!.id, 
      userId
    });

    res.json({ message: 'User password reset successfully' });
  } catch (error) {
    next(error);
  }
});

// Credit user wallet
router.post('/users/:id/credit-wallet', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.params.id;
    const amount = parseFloat(req.body.amount);

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    // Get user wallet
    const wallet = await findWallet(userId);

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const currentBalance = Number(parseFloat(wallet.balance.toString()));
    // Ensure both values are treated as numbers
    const newBalance = currentBalance + Number(amount);

    // Update wallet balance
    await updateWallet(userId, newBalance);

    // Log wallet transaction
    const walletTransactionId = uuidv4();
    const reference = `ADMIN_CREDIT_${Date.now()}`;
    const walletTransactionData = {
      id: walletTransactionId,
      wallet_id: wallet.id,
      user_id: userId,
      type: 'credit',
      amount,
      balance_before: currentBalance,
      balance_after: newBalance,
      reference,
      description: `Wallet credited by admin (${req.user!.id})`
    };

    await createWalletTransaction(walletTransactionData);

    logger.info('User wallet credited by admin', { 
      adminId: req.user!.id, 
      userId,
      amount,
      newBalance
    });

    res.json({ 
      message: 'User wallet credited successfully',
      amount,
      newBalance
    });
  } catch (error) {
    next(error);
  }
});

// Get service providers
router.get('/providers', async (req: AuthRequest, res, next) => {
  try {
    const providers = await getServiceProvidersWithPlanCount();
    res.json(providers);
  } catch (error) {
    next(error);
  }
});

// Get service plans
router.get('/plans', async (req: AuthRequest, res, next) => {
  try {
    const providerId = req.query.provider_id as string;
    
    if (!providerId) {
      return res.status(400).json({ error: 'Provider ID is required' });
    }

    // We need to use direct Supabase query for plans with provider info
    const { supabase } = await import('../lib/supabase.js');
    if (!supabase) {
      return res.status(503).json({ error: 'Database service not available' });
    }

    const { data: plans, error } = await supabase
      .from('service_plans')
      .select(`
        *,
        service_providers(name, type)
      `)
      .eq('provider_id', providerId)
      .order('amount', { ascending: true });

    if (error) {
      throw error;
    }

    // Flatten the provider data
    const formattedPlans = plans?.map(plan => ({
      ...plan,
      provider_name: plan.service_providers?.name,
      provider_type: plan.service_providers?.type
    })) || [];

    res.json(formattedPlans);
  } catch (error) {
    next(error);
  }
});

// Get all services for admin management
router.get('/services', async (req: AuthRequest, res, next) => {
  try {
    const services = await getServiceProvidersWithPlanCount();
    res.json(services);
  } catch (error) {
    next(error);
  }
});

// Update service commission settings
router.patch('/services/:id', async (req: AuthRequest, res, next) => {
  try {
    const serviceId = req.params.id;
    const { commission_rate, commission_type, flat_fee_amount, is_enabled } = req.body;

    // Validate commission_type
    if (commission_type && !['percentage', 'flat_fee'].includes(commission_type)) {
      return res.status(400).json({ error: 'Invalid commission type' });
    }

    // Validate commission_rate
    if (commission_rate !== undefined && (commission_rate < 0 || commission_rate > 100)) {
      return res.status(400).json({ error: 'Commission rate must be between 0 and 100' });
    }

    // Validate flat_fee_amount
    if (flat_fee_amount !== undefined && flat_fee_amount < 0) {
      return res.status(400).json({ error: 'Flat fee amount must be positive' });
    }

    // Build update data
    const updateData: any = {};
    if (commission_rate !== undefined) updateData.commission_rate = commission_rate;
    if (commission_type !== undefined) updateData.commission_type = commission_type;
    if (flat_fee_amount !== undefined) updateData.flat_fee_amount = flat_fee_amount;
    if (is_enabled !== undefined) updateData.is_enabled = is_enabled;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    await updateServiceProvider(serviceId, updateData);

    logger.info('Service commission updated', { 
      adminId: req.user!.id, 
      serviceId, 
      updates: updateData
    });

    res.json({ message: 'Service commission updated successfully' });
  } catch (error) {
    next(error);
  }
});

// Sync service plans from VTpass API
router.post('/providers/:providerId/sync-plans', async (req: AuthRequest, res, next) => {
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

    // Only sync TV providers for now (can be extended to other services)
    if (provider.type !== 'tv') {
      return res.status(400).json({ 
        error: 'Plan synchronization is currently only supported for TV providers' 
      });
    }

    logger.info(`Starting plan sync for provider: ${provider.name} (${provider.code})`);

    try {
      // Fetch service variations from VTpass
      const variationsResponse = await vtpassService.getServiceVariations(provider.code);
      
      if (!variationsResponse.content || !variationsResponse.content.variations) {
        return res.status(400).json({ 
          error: 'No variations found from VTpass API',
          details: variationsResponse
        });
      }

      const variations = variationsResponse.content.variations;
      let updatedCount = 0;
      let createdCount = 0;
      const processedVariationCodes = new Set<string>();

      // Process each variation from VTpass
      for (const variation of variations) {
        const { variation_code, name, variation_amount, fixedPrice } = variation;
        
        if (!variation_code) {
          logger.warn('Variation missing variation_code', { variation });
          continue;
        }

        processedVariationCodes.add(variation_code);

        // Check if this plan already exists
        const { data: existingPlans, error: planError } = await supabase
          .from('service_plans')
          .select('id, name, amount')
          .eq('provider_id', providerId)
          .eq('code', variation_code);

        if (planError) {
          throw planError;
        }

        const planAmount = parseFloat(variation_amount);
        const planName = name;
        const planDescription = `${name} - Synced from VTpass API`;

        if (existingPlans && existingPlans.length > 0) {
          // Update existing plan
          const existingPlan = existingPlans[0];
          await supabase
            .from('service_plans')
            .update({
              name: planName,
              amount: planAmount,
              description: planDescription,
              status: 'active'
            })
            .eq('id', existingPlan.id);

          updatedCount++;
          logger.info('Updated service plan', {
            planId: existingPlan.id,
            serviceCode: provider.code,
            variation_code,
            oldName: existingPlan.name,
            newName: planName,
            oldAmount: existingPlan.amount,
            newAmount: planAmount
          });
        } else {
          // Create new plan
          const planId = uuidv4();
          await supabase
            .from('service_plans')
            .insert({
              id: planId,
              provider_id: providerId,
              name: planName,
              code: variation_code,
              amount: planAmount,
              validity: null, // validity not provided in VTpass response
              description: planDescription,
              status: 'active'
            });

          createdCount++;
          logger.info('Created new service plan', {
            planId,
            serviceCode: provider.code,
            variation_code,
            name: planName,
            amount: planAmount
          });
        }
      }

      // Mark plans as inactive if they weren't in the VTpass response
      const { data: allPlans, error: allPlansError } = await supabase
        .from('service_plans')
        .select('id, code, name')
        .eq('provider_id', providerId)
        .eq('status', 'active');

      if (allPlansError) {
        throw allPlansError;
      }

      let deactivatedCount = 0;
      for (const plan of allPlans || []) {
        if (!processedVariationCodes.has(plan.code)) {
          await supabase
            .from('service_plans')
            .update({ status: 'inactive' })
            .eq('id', plan.id);

          deactivatedCount++;
          logger.info('Deactivated service plan', {
            planId: plan.id,
            serviceCode: provider.code,
            variation_code: plan.code,
            name: plan.name,
            reason: 'Not present in VTpass API response'
          });
        }
      }

      logger.info('Plan synchronization completed', {
        provider: provider.name,
        serviceCode: provider.code,
        processedCount: processedVariationCodes.size,
        createdCount,
        updatedCount,
        deactivatedCount
      });

      res.json({
        message: 'Plans synchronized successfully',
        provider: {
          id: provider.id,
          name: provider.name,
          code: provider.code
        },
        summary: {
          total_processed: processedVariationCodes.size,
          created: createdCount,
          updated: updatedCount,
          deactivated: deactivatedCount
        }
      });

    } catch (vtpassError: any) {
      logger.error('VTpass API error during plan sync', {
        provider: provider.name,
        serviceCode: provider.code,
        error: vtpassError.message,
        response: vtpassError.response?.data
      });

      return res.status(500).json({
        error: 'Failed to fetch plans from VTpass API',
        message: vtpassError.message,
        provider: provider.name
      });
    }

  } catch (error) {
    logger.error('Plan synchronization error', { providerId, error });
    next(error);
  }
});

export { router as adminRoutes };