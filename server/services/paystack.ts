import axios from 'axios';
import crypto from 'crypto';
import { logger } from '../utils/logger.js';
import { 
  IPaymentProvider, 
  TransactionResponse,
  AirtimePurchaseParams,
  DataPurchaseParams,
  TVSubscriptionParams,
  ElectricityBillParams,
  ElectricityVerificationParams,
  ElectricityPurchaseParams,
  EducationBillParams,
  InsuranceBillParams,
  ThirdPartyInsurancePurchaseParams,
  CustomerVerificationParams,
  JambVerificationParams,
  JambPurchaseParams,
  VehicleColor,
  EngineCapacity,
  State,
  LGA,
  VehicleMake,
  VehicleModel
} from './paymentProvider.js';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: 'success' | 'failed' | 'abandoned';
    reference: string;
    amount: number;
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: any;
    log: any;
    fees: number;
    fees_split: any;
    authorization: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
      reusable: boolean;
      signature: string;
      account_name: string | null;
    };
    customer: {
      id: number;
      first_name: string | null;
      last_name: string | null;
      email: string;
      customer_code: string;
      phone: string | null;
      metadata: any;
      risk_action: string;
      international_format_phone: string | null;
    };
    plan: any;
    split: any;
    order_id: any;
    paidAt: string;
    createdAt: string;
    requested_amount: number;
    pos_transaction_data: any;
    source: any;
    fees_breakdown: any;
  };
}

interface PaystackInitializeParams {
  email: string;
  amount: number; // Amount in kobo (smallest currency unit)
  reference: string;
  callback_url?: string;
  metadata?: any;
  channels?: string[];
}

export class PaystackService implements IPaymentProvider {
  private async makeRequest(endpoint: string, data?: any, method: 'GET' | 'POST' = 'POST') {
    try {
      // Access environment variables directly within the method
      const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

      // Validate that the secret key exists and is properly formatted
      if (!PAYSTACK_SECRET_KEY) {
        throw new Error('PAYSTACK_SECRET_KEY is not configured in environment variables');
      }

      if (!PAYSTACK_SECRET_KEY.startsWith('sk_')) {
        throw new Error('PAYSTACK_SECRET_KEY must start with "sk_" - please check your Paystack dashboard for the correct secret key');
      }

      // Check for placeholder values
      if (PAYSTACK_SECRET_KEY.includes('your_actual_paystack_secret_key_here') || 
          PAYSTACK_SECRET_KEY.includes('your_paystack_secret_key_here')) {
        throw new Error('PAYSTACK_SECRET_KEY is still set to placeholder value. Please update with your actual Paystack secret key from https://dashboard.paystack.com/#/settings/developers');
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`
      };

      const config = {
        method,
        url: `${PAYSTACK_BASE_URL}${endpoint}`,
        headers,
        ...(data && { data })
      };

      logger.info('Paystack API Request', {
        url: config.url,
        method: config.method,
        hasSecretKey: !!PAYSTACK_SECRET_KEY,
        keyPrefix: PAYSTACK_SECRET_KEY.substring(0, 7) + '...'
      });

      const response = await axios(config);
      return response.data;
    } catch (error: any) {
      // Enhanced error logging for authentication issues
      if (error.response?.status === 401) {
        logger.error('Paystack Authentication Error - Invalid API Key:', {
          endpoint,
          status: error.response?.status,
          error: error.response?.data,
          message: 'Please verify your PAYSTACK_SECRET_KEY in the .env file. Get your keys from https://dashboard.paystack.com/#/settings/developers'
        });
      } else {
        logger.error('Paystack API error:', {
          endpoint,
          error: error.response?.data || error.message,
          status: error.response?.status
        });
      }
      throw error;
    }
  }

  // Initialize a payment transaction
  async initializeTransaction(params: PaystackInitializeParams): Promise<PaystackInitializeResponse> {
    try {
      const data = {
        email: params.email,
        amount: params.amount, // Amount should be in kobo
        reference: params.reference,
        callback_url: params.callback_url,
        metadata: params.metadata || {},
        channels: params.channels || ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer']
      };

      logger.info('Paystack Initialize Transaction', {
        email: params.email,
        amount: params.amount,
        reference: params.reference
      });

      const response = await this.makeRequest('/transaction/initialize', data);
      
      if (!response.status) {
        throw new Error(response.message || 'Failed to initialize transaction');
      }

      return response;
    } catch (error: any) {
      logger.error('Paystack transaction initialization failed:', error);
      
      // Provide more helpful error messages for common issues
      if (error.response?.status === 401) {
        throw new Error('Invalid Paystack API key. Please check your PAYSTACK_SECRET_KEY in the .env file and ensure it\'s a valid key from your Paystack dashboard.');
      }
      
      throw error;
    }
  }

  // Verify a payment transaction
  async verifyTransaction(reference: string): Promise<PaystackVerifyResponse> {
    try {
      logger.info('Paystack Verify Transaction', { reference });

      const response = await this.makeRequest(`/transaction/verify/${reference}`, null, 'GET');
      
      if (!response.status) {
        throw new Error(response.message || 'Failed to verify transaction');
      }

      return response;
    } catch (error: any) {
      logger.error('Paystack transaction verification failed:', error);
      throw error;
    }
  }

  // Verify webhook signature
  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      // Access environment variable directly within the method
      const PAYSTACK_WEBHOOK_SECRET = process.env.PAYSTACK_WEBHOOK_SECRET;

      if (!PAYSTACK_WEBHOOK_SECRET) {
        logger.error('PAYSTACK_WEBHOOK_SECRET is not configured');
        return false;
      }

      const hash = crypto
        .createHmac('sha512', PAYSTACK_WEBHOOK_SECRET)
        .update(payload)
        .digest('hex');
      
      return hash === signature;
    } catch (error) {
      logger.error('Webhook signature verification failed:', error);
      return false;
    }
  }

  // IPaymentProvider interface methods (Paystack is primarily for payment collection, not VTU services)
  async purchaseAirtime(params: AirtimePurchaseParams): Promise<TransactionResponse> {
    throw new Error('Airtime purchase not supported by Paystack. Use VTPass for VTU services.');
  }

  async purchaseData(params: DataPurchaseParams): Promise<TransactionResponse> {
    throw new Error('Data purchase not supported by Paystack. Use VTPass for VTU services.');
  }

  async purchaseTVSubscription(params: TVSubscriptionParams): Promise<TransactionResponse> {
    throw new Error('TV subscription not supported by Paystack. Use VTPass for VTU services.');
  }

  async payElectricityBill(params: ElectricityBillParams): Promise<TransactionResponse> {
    throw new Error('Electricity bill payment not supported by Paystack. Use VTPass for VTU services.');
  }

  async payEducationBill(params: EducationBillParams): Promise<TransactionResponse> {
    throw new Error('Education bill payment not supported by Paystack. Use VTPass for VTU services.');
  }

  async payInsuranceBill(params: InsuranceBillParams): Promise<TransactionResponse> {
    throw new Error('Insurance bill payment not supported by Paystack. Use VTPass for VTU services.');
  }

  async verifyCustomer(params: CustomerVerificationParams): Promise<any> {
    throw new Error('Customer verification not supported by Paystack. Use VTPass for VTU services.');
  }

  async verifyElectricityCustomer(params: ElectricityVerificationParams): Promise<any> {
    throw new Error('Electricity customer verification not supported by Paystack. Use VTPass for VTU services.');
  }

  async verifyJambCustomer(params: JambVerificationParams): Promise<any> {
    throw new Error('JAMB customer verification not supported by Paystack. Use VTPass for VTU services.');
  }

  async purchaseElectricity(params: ElectricityPurchaseParams): Promise<TransactionResponse> {
    throw new Error('Electricity purchase not supported by Paystack. Use VTPass for VTU services.');
  }

  async purchaseJambPin(params: JambPurchaseParams): Promise<TransactionResponse> {
    throw new Error('JAMB PIN purchase not supported by Paystack. Use VTPass for VTU services.');
  }

  async purchaseThirdPartyInsurance(params: ThirdPartyInsurancePurchaseParams): Promise<TransactionResponse> {
    throw new Error('Insurance purchase not supported by Paystack. Use VTPass for VTU services.');
  }

  async getVehicleColors(): Promise<VehicleColor[]> {
    throw new Error('Vehicle colors not supported by Paystack. Use VTPass for VTU services.');
  }

  async getEngineCapacities(): Promise<EngineCapacity[]> {
    throw new Error('Engine capacities not supported by Paystack. Use VTPass for VTU services.');
  }

  async getStates(): Promise<State[]> {
    throw new Error('States not supported by Paystack. Use VTPass for VTU services.');
  }

  async getLGAs(stateCode: string): Promise<LGA[]> {
    throw new Error('LGAs not supported by Paystack. Use VTPass for VTU services.');
  }

  async getVehicleMakes(): Promise<VehicleMake[]> {
    throw new Error('Vehicle makes not supported by Paystack. Use VTPass for VTU services.');
  }

  async getVehicleModels(vehicleMakeCode: string): Promise<VehicleModel[]> {
    throw new Error('Vehicle models not supported by Paystack. Use VTPass for VTU services.');
  }

  async checkTransactionStatus(requestId: string): Promise<TransactionResponse> {
    try {
      const verificationResult = await this.verifyTransaction(requestId);
      
      let status: 'success' | 'pending' | 'failed';
      let message: string;

      switch (verificationResult.data.status) {
        case 'success':
          status = 'success';
          message = 'Payment completed successfully';
          break;
        case 'failed':
          status = 'failed';
          message = verificationResult.data.gateway_response || 'Payment failed';
          break;
        default:
          status = 'pending';
          message = 'Payment is being processed';
          break;
      }

      return {
        requestId,
        providerReference: verificationResult.data.reference,
        status,
        message,
        data: verificationResult.data
      };
    } catch (error: any) {
      logger.error('Paystack status check failed:', error);
      return {
        requestId,
        status: 'failed',
        message: 'Status check failed',
        data: error.response?.data
      };
    }
  }

  async getServiceVariations(serviceId: string): Promise<any> {
    throw new Error('Service variations not supported by Paystack. Use VTPass for VTU services.');
  }

  async getWalletBalance(): Promise<any> {
    // Paystack doesn't have a wallet balance concept like VTPass
    // This could be used to get account balance if needed
    throw new Error('Wallet balance not applicable for Paystack. Use for payment collection only.');
  }
}

export const paystackService = new PaystackService();