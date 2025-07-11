import { IPaymentProvider } from './paymentProvider.js';
import { vtpassService } from './vtpass.js';
import { paystackService } from './paystack.js';
import { logger } from '../utils/logger.js';

export class PaymentServiceManager {
  private currentProvider: IPaymentProvider;
  private providerName: string;
  private fundingProvider: IPaymentProvider;
  private fundingProviderName: string;

  constructor() {
    // Default to VTPass for VTU services
    this.providerName = process.env.PAYMENT_PROVIDER || 'vtpass';
    this.currentProvider = this.initializeProvider(this.providerName);
    
    // Set funding provider based on environment variable
    this.fundingProviderName = process.env.ACTIVE_PAYMENT_GATEWAY || 'paystack';
    this.fundingProvider = this.initializeProvider(this.fundingProviderName);
  }

  private initializeProvider(providerName: string): IPaymentProvider {
    switch (providerName.toLowerCase()) {
      case 'vtpass':
        logger.info('Initializing VTPass payment provider');
        return vtpassService;
      
      case 'paystack':
        logger.info('Initializing Paystack payment provider');
        return paystackService;
      
      // Add other providers here in the future
      // case 'flutterwave':
      //   return new FlutterwaveService();
      
      default:
        logger.warn(`Unknown payment provider: ${providerName}, falling back to VTPass`);
        return vtpassService;
    }
  }

  // Get the current payment provider instance (for VTU services)
  getProvider(): IPaymentProvider {
    return this.currentProvider;
  }

  // Get the funding provider instance (for wallet funding)
  getFundingProvider(): IPaymentProvider {
    return this.fundingProvider;
  }

  // Get the current provider name
  getProviderName(): string {
    return this.providerName;
  }

  // Get the funding provider name
  getFundingProviderName(): string {
    return this.fundingProviderName;
  }

  // Switch to a different provider (useful for failover or A/B testing)
  switchProvider(providerName: string): void {
    logger.info(`Switching payment provider from ${this.providerName} to ${providerName}`);
    this.providerName = providerName;
    this.currentProvider = this.initializeProvider(providerName);
  }

  // Switch funding provider
  switchFundingProvider(providerName: string): void {
    logger.info(`Switching funding provider from ${this.fundingProviderName} to ${providerName}`);
    this.fundingProviderName = providerName;
    this.fundingProvider = this.initializeProvider(providerName);
  }

  // Health check for the current provider
  async healthCheck(): Promise<boolean> {
    try {
      // Try to get wallet balance as a health check for VTPass
      if (this.providerName === 'vtpass') {
        await this.currentProvider.getWalletBalance();
      }
      return true;
    } catch (error) {
      logger.error(`Health check failed for provider ${this.providerName}:`, error);
      return false;
    }
  }

  // Health check for funding provider
  async fundingHealthCheck(): Promise<boolean> {
    try {
      // For Paystack, we can't easily do a health check without making a real request
      // So we'll just return true if the provider is initialized
      return !!this.fundingProvider;
    } catch (error) {
      logger.error(`Health check failed for funding provider ${this.fundingProviderName}:`, error);
      return false;
    }
  }
}

// Singleton instance
export const paymentServiceManager = new PaymentServiceManager();