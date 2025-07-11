import { findAppSetting, updateAppSetting } from '../lib/supabase.js';
import { logger } from '../utils/logger.js';

export interface AppSetting {
  key_name: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export class AppSettingsService {
  /**
   * Get a specific setting by key
   */
  async getSetting(key: string): Promise<string | null> {
    try {
      const setting = await findAppSetting(key);
      return setting ? setting.value : null;
    } catch (error) {
      logger.error('Error fetching app setting:', { key, error });
      throw error;
    }
  }

  /**
   * Set a setting value
   */
  async setSetting(key: string, value: string): Promise<void> {
    try {
      await updateAppSetting(key, value);
      logger.info('App setting updated', { key, value });
    } catch (error) {
      logger.error('Error setting app setting:', { key, value, error });
      throw error;
    }
  }
}

export const appSettingsService = new AppSettingsService();