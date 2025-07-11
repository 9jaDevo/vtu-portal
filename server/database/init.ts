import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger.js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if Supabase is configured
const isSupabaseConfigured = supabaseUrl && 
  supabaseServiceKey && 
  supabaseUrl !== 'your_supabase_project_url_here' &&
  supabaseServiceKey !== 'your_supabase_service_role_key_here';

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl!, supabaseServiceKey!)
  : null;

// Database initialization for Supabase
export async function initDatabase() {
  try {
    if (!isSupabaseConfigured) {
      logger.info('=== SUPABASE SETUP REQUIRED ===');
      logger.info('To enable database functionality, please configure Supabase:');
      logger.info('1. Create a Supabase project at https://supabase.com/dashboard');
      logger.info('2. Copy your project URL and service role key');
      logger.info('3. Update your .env file with:');
      logger.info('   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
      logger.info('   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
      logger.info('4. Restart the server');
      logger.info('=== SERVER WILL START WITHOUT DATABASE ===');
      return; // Skip database initialization if Supabase is not configured
    }

    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    logger.info('Checking Supabase database connection...');
    
    // Test the connection with a simple query
    let data, error;
    try {
      const result = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .limit(1);
      data = result.data;
      error = result.error;
    } catch (fetchError: any) {
      if (fetchError.message?.includes('fetch failed') || fetchError.message?.includes('Failed to fetch')) {
        logger.error('=== SUPABASE CONNECTION FAILED ===');
        logger.error('Failed to connect to Supabase. Please check:');
        logger.error('1. Your internet connection');
        logger.error('2. Your Supabase project URL is correct');
        logger.error('3. Your service role key is valid');
        logger.error('4. Your Supabase project is not paused');
        logger.error('Current URL:', supabaseUrl?.substring(0, 50) + '...');
        logger.error('=== SERVER WILL START WITHOUT DATABASE ===');
        return;
      }
      throw fetchError;
    }
    
    if (error) {
      logger.error('Supabase connection test failed:', error.message);
      logger.info('Database tables should be created through Supabase migrations');
      logger.info('Please run your migrations in the Supabase dashboard or use the Supabase CLI');
    } else {
      logger.info('Supabase database connection successful');
      
      // Check if our main tables exist
      const { data: userTableExists } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'users')
        .maybeSingle();
        
      if (!userTableExists) {
        logger.info('=== DATABASE SETUP REQUIRED ===');
        logger.info('Main tables not found. Please set up your database:');
        logger.info('1. Run migrations in your Supabase dashboard');
        logger.info('2. Or use the Supabase CLI to apply migrations');
        logger.info('3. Check the /supabase/migrations folder for SQL files');
        logger.info('=== SERVER WILL START WITHOUT FULL DATABASE ===');
        logger.info('You can run migrations through the Supabase dashboard or CLI');
      }
    }
    
  } catch (error) {
    logger.error('Database initialization failed:', error instanceof Error ? error.message : error);
    // Don't throw the error - let the server start without database
    logger.info('=== SERVER STARTING WITHOUT DATABASE ===');
    logger.info('Please configure Supabase to enable full functionality');
  }
}

// Helper function to execute queries using Supabase methods
export async function executeQuery(query: string, params: any[] = []): Promise<any> {
  if (!supabase) {
    throw new Error('Supabase not configured. Please set up your environment variables.');
  }

  try {
    // For now, we'll throw an error suggesting to use proper Supabase methods
    // This is a compatibility layer that should be replaced with proper Supabase queries
    throw new Error('Raw SQL execution not supported. Please use Supabase query methods instead.');
  } catch (error) {
    logger.error('Database query error:', error);
    throw error;
  }
}