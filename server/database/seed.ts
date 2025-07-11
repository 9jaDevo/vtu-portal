import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { 
  findServiceProvider, 
  createServiceProvider, 
  countServiceProviders,
  getAllServiceProviders,
  findServicePlan,
  createServicePlan,
  countServicePlans,
  findUser,
  createUser,
  countUsers,
  findWallet,
  createWallet,
  findAppSetting,
  createAppSetting
} from '../lib/supabase.js';
import { logger } from '../utils/logger.js';
import { initDatabase } from './init.js';

// Import fs using ES module syntax
import fs from 'fs';

// Diagnostic console.log statements
console.log('=== ENVIRONMENT VARIABLES DIAGNOSTIC ===');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET (length: ' + process.env.SUPABASE_SERVICE_ROLE_KEY.length + ')' : 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Current working directory:', process.cwd());
console.log('Checking if .env file exists:', fs.existsSync('.env'));
console.log('=== END DIAGNOSTIC ===');

interface ServiceProvider {
  id: string;
  name: string;
  type: 'airtime' | 'data' | 'tv' | 'electricity' | 'education' | 'insurance';
  code: string;
  logo_url?: string;
  status: 'active' | 'inactive';
  commission_rate: number;
  commission_type: 'percentage' | 'flat_fee';
  flat_fee_amount: number;
  is_enabled: boolean;
}

interface ServicePlan {
  id: string;
  provider_id: string;
  name: string;
  code: string;
  amount: number;
  validity?: string | null;
  description?: string | null;
  status: 'active' | 'inactive';
}

// Service Providers Data (updated with commission structure)
const serviceProviders: Omit<ServiceProvider, 'id'>[] = [
  // Airtime Providers
  {
    name: 'MTN Nigeria',
    type: 'airtime',
    code: 'mtn',
    logo_url: 'https://images.pexels.com/photos/147413/twitter-facebook-together-exchange-147413.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    status: 'active',
    commission_rate: 3.0,
    commission_type: 'percentage',
    flat_fee_amount: 0.00,
    is_enabled: true
  },
  {
    name: 'Airtel Nigeria',
    type: 'airtime',
    code: 'airtel',
    logo_url: 'https://images.pexels.com/photos/147413/twitter-facebook-together-exchange-147413.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    status: 'active',
    commission_rate: 3.4,
    commission_type: 'percentage',
    flat_fee_amount: 0.00,
    is_enabled: true
  },
  {
    name: 'Glo Nigeria',
    type: 'airtime',
    code: 'glo',
    logo_url: 'https://images.pexels.com/photos/147413/twitter-facebook-together-exchange-147413.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    status: 'active',
    commission_rate: 4.0,
    commission_type: 'percentage',
    flat_fee_amount: 0.00,
    is_enabled: true
  },
  {
    name: '9mobile Nigeria',
    type: 'airtime',
    code: 'etisalat',
    logo_url: 'https://images.pexels.com/photos/147413/twitter-facebook-together-exchange-147413.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    status: 'active',
    commission_rate: 4.0,
    commission_type: 'percentage',
    flat_fee_amount: 0.00,
    is_enabled: true
  },

  // Data Providers
  {
    name: 'MTN Data',
    type: 'data',
    code: 'mtn-data',
    logo_url: 'https://images.pexels.com/photos/147413/twitter-facebook-together-exchange-147413.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    status: 'active',
    commission_rate: 3.0,
    commission_type: 'percentage',
    flat_fee_amount: 0.00,
    is_enabled: true
  },
  {
    name: 'Airtel Data',
    type: 'data',
    code: 'airtel-data',
    logo_url: 'https://images.pexels.com/photos/147413/twitter-facebook-together-exchange-147413.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    status: 'active',
    commission_rate: 3.4,
    commission_type: 'percentage',
    flat_fee_amount: 0.00,
    is_enabled: true
  },
  {
    name: 'Glo Data',
    type: 'data',
    code: 'glo-data',
    logo_url: 'https://images.pexels.com/photos/147413/twitter-facebook-together-exchange-147413.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    status: 'active',
    commission_rate: 4.0,
    commission_type: 'percentage',
    flat_fee_amount: 0.00,
    is_enabled: true
  },
  {
    name: '9mobile Data',
    type: 'data',
    code: 'etisalat-data',
    logo_url: 'https://images.pexels.com/photos/147413/twitter-facebook-together-exchange-147413.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    status: 'active',
    commission_rate: 4.0,
    commission_type: 'percentage',
    flat_fee_amount: 0.00,
    is_enabled: true
  },
  {
    name: 'Smile Network',
    type: 'data',
    code: 'smile-direct',
    logo_url: 'https://images.pexels.com/photos/147413/twitter-facebook-together-exchange-147413.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    status: 'active',
    commission_rate: 5.0,
    commission_type: 'percentage',
    flat_fee_amount: 0.00,
    is_enabled: true
  },
  {
    name: 'Spectranet',
    type: 'data',
    code: 'spectranet',
    logo_url: 'https://images.pexels.com/photos/147413/twitter-facebook-together-exchange-147413.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    status: 'active',
    commission_rate: 5.0,
    commission_type: 'percentage',
    flat_fee_amount: 0.00,
    is_enabled: true
  },
  {
    name: 'GLO SME Data',
    type: 'data',
    code: 'glo-sme-data',
    logo_url: 'https://images.pexels.com/photos/147413/twitter-facebook-together-exchange-147413.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    status: 'active',
    commission_rate: 4.0,
    commission_type: 'percentage',
    flat_fee_amount: 0.00,
    is_enabled: true
  },

  // TV Providers
  {
    name: 'DSTV',
    type: 'tv',
    code: 'dstv',
    logo_url: 'https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    status: 'active',
    commission_rate: 1.5,
    commission_type: 'percentage',
    flat_fee_amount: 0.00,
    is_enabled: true
  },
  {
    name: 'GOtv',
    type: 'tv',
    code: 'gotv',
    logo_url: 'https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    status: 'active',
    commission_rate: 1.5,
    commission_type: 'percentage',
    flat_fee_amount: 0.00,
    is_enabled: true
  },
  {
    name: 'Startimes',
    type: 'tv',
    code: 'startimes',
    logo_url: 'https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    status: 'active',
    commission_rate: 2.0,
    commission_type: 'percentage',
    flat_fee_amount: 0.00,
    is_enabled: true
  },
  {
    name: 'Showmax',
    type: 'tv',
    code: 'showmax',
    logo_url: 'https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    status: 'active',
    commission_rate: 1.5,
    commission_type: 'percentage',
    flat_fee_amount: 0.00,
    is_enabled: true
  },

  // Electricity Providers
  {
    name: 'Ikeja Electric',
    type: 'electricity',
    code: 'ikeja-electric',
    logo_url: 'https://images.pexels.com/photos/1036936/pexels-photo-1036936.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    status: 'active',
    commission_rate: 1.0,
    commission_type: 'percentage',
    flat_fee_amount: 0.00,
    is_enabled: true
  },
  {
    name: 'Eko Electric',
    type: 'electricity',
    code: 'eko-electric',
    logo_url: 'https://images.pexels.com/photos/1036936/pexels-photo-1036936.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    status: 'active',
    commission_rate: 0.8,
    commission_type: 'percentage',
    flat_fee_amount: 0.00,
    is_enabled: true
  },
  {
    name: 'Kano Electricity',
    type: 'electricity',
    code: 'kano-electric',
    logo_url: 'https://images.pexels.com/photos/1036936/pexels-photo-1036936.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    status: 'active',
    commission_rate: 1.0,
    commission_type: 'percentage',
    flat_fee_amount: 0.00,
    is_enabled: true
  },
  {
    name: 'Port Harcourt Electric',
    type: 'electricity',
    code: 'portharcourt-electric',
    logo_url: 'https://images.pexels.com/photos/1036936/pexels-photo-1036936.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    status: 'active',
    commission_rate: 2.0,
    commission_type: 'percentage',
    flat_fee_amount: 0.00,
    is_enabled: true
  },
  {
    name: 'Jos Electricity',
    type: 'electricity',
    code: 'jos-electric',
    logo_url: 'https://images.pexels.com/photos/1036936/pexels-photo-1036936.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    status: 'active',
    commission_rate: 0.9,
    commission_type: 'percentage',
    flat_fee_amount: 0.00,
    is_enabled: true
  },
  {
    name: 'Ibadan Electricity',
    type: 'electricity',
    code: 'ibadan-electric',
    logo_url: 'https://images.pexels.com/photos/1036936/pexels-photo-1036936.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    status: 'active',
    commission_rate: 1.1,
    commission_type: 'percentage',
    flat_fee_amount: 0.00,
    is_enabled: true
  },
  {
    name: 'Kaduna Electric',
    type: 'electricity',
    code: 'kaduna-electric',
    logo_url: 'https://images.pexels.com/photos/1036936/pexels-photo-1036936.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    status: 'active',
    commission_rate: 1.5,
    commission_type: 'percentage',
    flat_fee_amount: 0.00,
    is_enabled: true
  },
  {
    name: 'Abuja Electric',
    type: 'electricity',
    code: 'abuja-electric',
    logo_url: 'https://images.pexels.com/photos/1036936/pexels-photo-1036936.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    status: 'active',
    commission_rate: 1.2,
    commission_type: 'percentage',
    flat_fee_amount: 0.00,
    is_enabled: true
  },
  {
    name: 'Enugu Electric',
    type: 'electricity',
    code: 'enugu-electric',
    logo_url: 'https://images.pexels.com/photos/1036936/pexels-photo-1036936.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    status: 'active',
    commission_rate: 1.4,
    commission_type: 'percentage',
    flat_fee_amount: 0.00,
    is_enabled: true
  },
  {
    name: 'Benin Electric',
    type: 'electricity',
    code: 'benin-electric',
    logo_url: 'https://images.pexels.com/photos/1036936/pexels-photo-1036936.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    status: 'active',
    commission_rate: 1.5,
    commission_type: 'percentage',
    flat_fee_amount: 0.00,
    is_enabled: true
  },
  {
    name: 'ABA Electric',
    type: 'electricity',
    code: 'aba-electric',
    logo_url: 'https://images.pexels.com/photos/1036936/pexels-photo-1036936.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    status: 'active',
    commission_rate: 1.5,
    commission_type: 'percentage',
    flat_fee_amount: 0.00,
    is_enabled: true
  },
  {
    name: 'YOLA Electric',
    type: 'electricity',
    code: 'yola-electric',
    logo_url: 'https://images.pexels.com/photos/1036936/pexels-photo-1036936.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    status: 'active',
    commission_rate: 1.2,
    commission_type: 'percentage',
    flat_fee_amount: 0.00,
    is_enabled: true
  },

  // Education Providers (using flat fees)
  {
    name: 'WAEC Registration',
    type: 'education',
    code: 'waec-registration',
    logo_url: 'https://images.pexels.com/photos/159844/books-book-pages-read-159844.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    status: 'active',
    commission_rate: 0,
    commission_type: 'flat_fee',
    flat_fee_amount: 150.00,
    is_enabled: true
  },
  {
    name: 'WAEC Result Checker',
    type: 'education',
    code: 'waec',
    logo_url: 'https://images.pexels.com/photos/159844/books-book-pages-read-159844.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    status: 'active',
    commission_rate: 0,
    commission_type: 'flat_fee',
    flat_fee_amount: 250.00,
    is_enabled: true
  },
  {
    name: 'JAMB',
    type: 'education',
    code: 'jamb',
    logo_url: 'https://images.pexels.com/photos/159844/books-book-pages-read-159844.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    status: 'active',
    commission_rate: 0,
    commission_type: 'flat_fee',
    flat_fee_amount: 150.00,
    is_enabled: true
  },
  {
    name: 'NECO',
    type: 'education',
    code: 'neco',
    logo_url: 'https://images.pexels.com/photos/159844/books-book-pages-read-159844.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    status: 'active',
    commission_rate: 0,
    commission_type: 'percentage',
    flat_fee_amount: 0.00,
    is_enabled: true
  },

  // Insurance Providers
  {
    name: 'Universal Insurance',
    type: 'insurance',
    code: 'ui-insure',
    logo_url: 'https://images.pexels.com/photos/164527/pexels-photo-164527.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    status: 'active',
    commission_rate: 6.0,
    commission_type: 'percentage',
    flat_fee_amount: 0.00,
    is_enabled: true
  }
];

async function seedServiceProviders() {
  logger.info('Seeding service providers...');
  
  for (const provider of serviceProviders) {
    const providerId = uuidv4();
    
    // Check if provider already exists
    try {
      const existing = await findServiceProvider(provider.code, provider.type);

      if (!existing) {
        await createServiceProvider({
          id: providerId,
          name: provider.name,
          type: provider.type,
          code: provider.code,
          logo_url: provider.logo_url || null,
          status: provider.status,
          commission_rate: provider.commission_rate,
          commission_type: provider.commission_type,
          flat_fee_amount: provider.flat_fee_amount,
          is_enabled: provider.is_enabled
        });
        
        logger.info(`Created service provider: ${provider.name}`);
      } else {
        logger.info(`Service provider already exists: ${provider.name}`);
      }
    } catch (error) {
      logger.error('Error seeding service provider:', { provider: provider.name, error });
      throw error;
    }
  }
}

async function seedServicePlans() {
  logger.info('Seeding service plans...');

  // Get all providers to create plans for them
  const providers = await getAllServiceProviders();

  for (const provider of providers) {
    let plans: Omit<ServicePlan, 'id' | 'provider_id'>[] = [];

    switch (provider.type) {
      case 'data':
        if (provider.code === 'spectranet') {
          plans = [
            { name: 'Spectranet N1000', code: 'vt-1000', amount: 1000, validity: null, description: 'Spectranet N1000 bundle', status: 'active' },
            { name: 'Spectranet N2000', code: 'vt-2000', amount: 2000, validity: null, description: 'Spectranet N2000 bundle', status: 'active' },
            { name: 'Spectranet N5000', code: 'vt-5000', amount: 5000, validity: null, description: 'Spectranet N5000 bundle', status: 'active' },
            { name: 'Spectranet N7000', code: 'vt-7000', amount: 7000, validity: null, description: 'Spectranet N7000 bundle', status: 'active' },
            { name: 'Spectranet N10000', code: 'vt-10000', amount: 10000, validity: null, description: 'Spectranet N10000 bundle', status: 'active' }
          ];
        } else if (provider.code === 'smile-direct') {
          plans = [
            { name: '1GB Flexi for 1days - 300 Naira', code: '624', amount: 300, validity: '1 day', description: '1GB Flexi data bundle', status: 'active' },
            { name: '2.5GB Flexi for 2days - 500 Naira', code: '625', amount: 500, validity: '2 days', description: '2.5GB Flexi data bundle', status: 'active' },
            { name: '1GB Flexi-Weekly for 7days - 500 Naira', code: '626', amount: 500, validity: '7 days', description: '1GB Flexi-Weekly data bundle', status: 'active' },
            { name: '1.5GB Bigga for 30days - 1,000 Naira', code: '606', amount: 1000, validity: '30 days', description: '1.5GB Bigga data bundle', status: 'active' },
            { name: '2GB Bigga for 30days - 1,200 Naira', code: '607', amount: 1200, validity: '30 days', description: '2GB Bigga data bundle', status: 'active' }
          ];
        } else if (provider.code === 'mtn-data') {
          plans = [
            { name: 'N100 100MB - 24 hrs', code: 'mtn-10mb-100', amount: 100, validity: '24 hours', description: 'MTN 100MB data bundle', status: 'active' },
            { name: 'N200 200MB - 2 days', code: 'mtn-50mb-200', amount: 200, validity: '2 days', description: 'MTN 200MB data bundle', status: 'active' },
            { name: 'N1000 1.5GB - 30 days', code: 'mtn-100mb-1000', amount: 1000, validity: '30 days', description: 'MTN 1.5GB data bundle', status: 'active' },
            { name: 'N2000 4.5GB - 30 days', code: 'mtn-500mb-2000', amount: 2000, validity: '30 days', description: 'MTN 4.5GB data bundle', status: 'active' }
          ];
        } else if (provider.code === 'glo-sme-data') {
          // GLO SME Data plans will be fetched dynamically from VTpass API
          logger.info(`Skipping static plans for GLO SME Data provider: ${provider.code} - will be fetched dynamically`);
          continue;
        } else {
          plans = [
            { name: '1GB - 30 Days', code: '1gb-30days', amount: 1000, validity: '30 days', description: '1GB data bundle valid for 30 days', status: 'active' },
            { name: '2GB - 30 Days', code: '2gb-30days', amount: 2000, validity: '30 days', description: '2GB data bundle valid for 30 days', status: 'active' },
            { name: '5GB - 30 Days', code: '5gb-30days', amount: 4500, validity: '30 days', description: '5GB data bundle valid for 30 days', status: 'active' }
          ];
        }
        break;

      case 'tv':
        // TV plans will be dynamically fetched from VTpass API
        logger.info(`Skipping static plans for TV provider: ${provider.code} - will be fetched dynamically`);
        continue;

      case 'education':
        if (provider.code === 'jamb') {
          plans = [
            { name: 'JAMB UTME PIN (with mock)', code: 'utme-mock', amount: 7700, validity: null, description: 'JAMB UTME PIN with mock examination', status: 'active' },
            { name: 'JAMB UTME PIN (without mock)', code: 'utme-no-mock', amount: 6200, validity: null, description: 'JAMB UTME PIN without mock examination', status: 'active' }
          ];
        }
        break;

      case 'insurance':
        if (provider.code === 'ui-insure') {
          plans = [
            { name: 'Private Vehicle Insurance', code: '1', amount: 3000, validity: '365 days', description: 'Third party motor insurance for private vehicles', status: 'active' },
            { name: 'Commercial Vehicle Insurance', code: '2', amount: 5000, validity: '365 days', description: 'Third party motor insurance for commercial vehicles', status: 'active' },
            { name: 'Tricycle Insurance', code: '3', amount: 1500, validity: '365 days', description: 'Third party motor insurance for tricycles', status: 'active' },
            { name: 'Motorcycle Insurance', code: '4', amount: 3000, validity: '365 days', description: 'Third party motor insurance for motorcycles', status: 'active' }
          ];
        }
        break;
    }

    // Insert plans for this provider
    for (const plan of plans) {
      const planId = uuidv4();
      
      try {
        // Check if plan already exists
        const existingPlan = await findServicePlan(provider.id, plan.code);

        if (!existingPlan) {
          await createServicePlan({
            id: planId,
            provider_id: provider.id,
            name: plan.name,
            code: plan.code,
            amount: plan.amount,
            validity: plan.validity,
            description: plan.description,
            status: plan.status
          });
          
          logger.info(`Created service plan: ${plan.name} for ${provider.code}`);
        }
      } catch (error) {
        logger.error('Error seeding service plan:', { plan: plan.name, provider: provider.code, error });
      }
    }
  }
}

async function seedAdminUser() {
  logger.info('Seeding admin user...');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@vtuplatform.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

  try {
    // Check if admin user already exists
    const existingAdmin = await findUser(adminEmail);

    if (!existingAdmin || existingAdmin.role !== 'admin') {
      const adminId = uuidv4();
      const hashedPassword = await bcrypt.hash(adminPassword, 12);

      // Create admin user
      await createUser({
        id: adminId,
        email: adminEmail,
        password: hashedPassword,
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
        status: 'active',
        email_verified: true
      });

      // Create wallet for admin
      const walletId = uuidv4();
      await createWallet({
        id: walletId,
        user_id: adminId,
        balance: 100000.00 // Give admin 100,000 NGN starting balance
      });

      logger.info(`Created admin user: ${adminEmail}`);
      logger.info(`Admin password: ${adminPassword}`);
    } else {
      logger.info('Admin user already exists');
    }
  } catch (error) {
    logger.error('Error seeding admin user:', { error });
    throw error;
  }
}

async function seedTestUsers() {
  logger.info('Seeding test users...');

  const testUsers = [
    {
      email: 'user1@test.com',
      password: 'Test@123456',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+2348012345678'
    },
    {
      email: 'user2@test.com',
      password: 'Test@123456',
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+2348087654321'
    }
  ];

  for (const testUser of testUsers) {
    try {
      // Check if user already exists
      const existingUser = await findUser(testUser.email);

      if (!existingUser) {
        const userId = uuidv4();
        const hashedPassword = await bcrypt.hash(testUser.password, 12);

        // Create test user
        await createUser({
          id: userId,
          email: testUser.email,
          password: hashedPassword,
          first_name: testUser.firstName,
          last_name: testUser.lastName,
          phone: testUser.phone || null,
          status: 'active',
          email_verified: true
        });

        // Create wallet for test user
        const walletId = uuidv4();
        await createWallet({
          id: walletId,
          user_id: userId,
          balance: 10000.00 // Give test users 10,000 NGN starting balance
        });

        logger.info(`Created test user: ${testUser.email}`);
      }
    } catch (error) {
      logger.error('Error seeding test user:', { user: testUser.email, error });
    }
  }
}

async function runSeed() {
  try {
    logger.info('Starting database seeding...');
    
    // Initialize database connection
    await initDatabase();
    
    // Run seeding functions in order
    await seedAppSettings();
    await seedServiceProviders();
    await seedServicePlans();
    await seedAdminUser();
    
    // Only seed test users in development
    if (process.env.NODE_ENV === 'development') {
      await seedTestUsers();
    }
    
    logger.info('Database seeding completed successfully!');
    
    // Log summary
    const providerCount = await countServiceProviders();
    const planCount = await countServicePlans();
    const userCount = await countUsers();
    
    logger.info(`Seeding Summary:`);
    logger.info(`- Service Providers: ${providerCount}`);
    logger.info(`- Service Plans: ${planCount}`);
    logger.info(`- Users: ${userCount}`);
    
    process.exit(0);
  } catch (error) {
    logger.error('Database seeding failed:', error);
    process.exit(1);
  }
}

// Initialize default app settings
async function seedAppSettings() {
  logger.info('Seeding app settings...');

  const defaultSettings: any[] = [
    // No default settings needed for direct discount system
  ];

  for (const setting of defaultSettings) {
    try {
      const existingSetting = await findAppSetting(setting.key_name);
      
      if (!existingSetting) {
        await createAppSetting(setting);
        logger.info(`Created app setting: ${setting.key_name} = ${setting.value}`);
      }
    } catch (error) {
      logger.error('Error seeding app setting:', { setting: setting.key_name, error });
    }
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSeed();
}

export { runSeed };