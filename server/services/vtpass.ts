import axios from 'axios';
import { logger } from '../utils/logger.js';
import { 
  IPaymentProvider, 
  TransactionResponse,
  AirtimePurchaseParams,
  DataPurchaseParams,
  GloSmeDataPurchaseParams,
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
  VehicleModel,
  mapProviderResponse
} from './paymentProvider.js';

const VTPASS_BASE_URL = process.env.VTPASS_BASE_URL || 'https://sandbox.vtpass.com/api';
const VTPASS_API_KEY = process.env.VTPASS_API_KEY || '';
const VTPASS_PUBLIC_KEY = process.env.VTPASS_PUBLIC_KEY || '';
const VTPASS_SECRET_KEY = process.env.VTPASS_SECRET_KEY || '';

export class VTPassService implements IPaymentProvider {
  private async makeRequest(endpoint: string, data?: any, method: 'GET' | 'POST' = 'POST') {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'api-key': VTPASS_API_KEY,
        'public-key': VTPASS_PUBLIC_KEY
      };

      // Add secret key for authenticated endpoints
      if (method === 'POST') {
        headers['secret-key'] = VTPASS_SECRET_KEY;
      }

      const config = {
        method,
        url: `${VTPASS_BASE_URL}${endpoint}`,
        headers,
        ...(data && { data })
      };

      logger.info('VTPass API Request', {
        url: config.url,
        method: config.method,
        endpoint
      });

      const response = await axios(config);
      
      logger.info('VTPass API Response', {
        endpoint,
        status: response.status,
        responseCode: response.data?.code
      });

      return response.data;
    } catch (error: any) {
      logger.error('VTPass API error:', {
        endpoint,
        error: error.response?.data || error.message,
        status: error.response?.status
      });
      throw error;
    }
  }

  async purchaseAirtime(params: AirtimePurchaseParams): Promise<TransactionResponse> {
    try {
      const payload = {
        request_id: params.requestId,
        serviceID: params.serviceId,
        amount: params.amount,
        phone: params.phone
      };

      const response = await this.makeRequest('/pay', payload);
      const mapped = mapProviderResponse(response.code, response.content?.transactions?.status, response.response_description);

      // Extract commission earned from VTPass response
      const commissionEarned = this.extractCommissionEarned(params.serviceId, params.amount, response);

      return {
        requestId: params.requestId,
        providerReference: response.content?.transactions?.transactionId,
        commission_earned: commissionEarned,
        status: mapped.status,
        message: mapped.message,
        data: response
      };
    } catch (error: any) {
      logger.error('VTPass airtime purchase failed:', error);
      throw new Error(error.response?.data?.response_description || 'Airtime purchase failed');
    }
  }

  async purchaseData(params: DataPurchaseParams): Promise<TransactionResponse> {
    try {
      const payload = {
        request_id: params.requestId,
        serviceID: params.serviceId,
        billersCode: params.billerCode,
        variation_code: params.variationCode,
        amount: params.amount,
        phone: params.phone
      };

      const response = await this.makeRequest('/pay', payload);
      const mapped = mapProviderResponse(response.code, response.content?.transactions?.status, response.response_description);

      // Extract commission earned from VTPass response
      const commissionEarned = this.extractCommissionEarned(params.serviceId, params.amount, response);

      return {
        requestId: params.requestId,
        providerReference: response.content?.transactions?.transactionId,
        commission_earned: commissionEarned,
        status: mapped.status,
        message: mapped.message,
        data: response
      };
    } catch (error: any) {
      logger.error('VTPass data purchase failed:', error);
      throw new Error(error.response?.data?.response_description || 'Data purchase failed');
    }
  }

  async purchaseTVSubscription(params: TVSubscriptionParams): Promise<TransactionResponse> {
    try {
      const payload: any = {
        request_id: params.requestId,
        serviceID: params.serviceId,
        billersCode: params.billerCode,
        phone: params.phone,
        subscription_type: params.subscriptionType || 'change'
      };

      // For bouquet change, include variation_code and amount
      if (params.subscriptionType === 'change' && params.variationCode) {
        payload.variation_code = params.variationCode;
        payload.amount = params.amount;
      } else if (params.subscriptionType === 'renew') {
        // For renewal, only include amount (from verification)
        payload.amount = params.amount;
      }

      // Include quantity if provided
      if (params.quantity) {
        payload.quantity = params.quantity;
      }

      const response = await this.makeRequest('/pay', payload);
      const mapped = mapProviderResponse(response.code, response.content?.transactions?.status, response.response_description);

      // Extract commission earned from VTPass response
      const commissionEarned = this.extractCommissionEarned(params.serviceId, params.amount, response);

      return {
        requestId: params.requestId,
        providerReference: response.content?.transactions?.transactionId,
        commission_earned: commissionEarned,
        status: mapped.status,
        message: mapped.message,
        data: response
      };
    } catch (error: any) {
      logger.error('VTPass TV subscription failed:', error);
      throw new Error(error.response?.data?.response_description || 'TV subscription failed');
    }
  }

  async payElectricityBill(params: ElectricityBillParams): Promise<TransactionResponse> {
    return this.purchaseElectricity({
      ...params,
      meterType: params.variationCode as 'prepaid' | 'postpaid'
    });
  }

  async purchaseElectricity(params: ElectricityPurchaseParams): Promise<TransactionResponse> {
    try {
      const payload = {
        request_id: params.requestId,
        serviceID: params.serviceId,
        billersCode: params.billerCode,
        variation_code: params.meterType,
        amount: params.amount,
        phone: params.phone
      };

      const response = await this.makeRequest('/pay', payload);
      const mapped = mapProviderResponse(response.code, response.content?.transactions?.status, response.response_description);

      // Extract commission earned from VTPass response
      const commissionEarned = this.extractCommissionEarned(params.serviceId, params.amount, response);
      
      // Extract purchase token/code if available - typically for electricity transactions
      let purchasedCode = '';
      if (response.purchased_code) {
        // Direct from response for newer API versions
        purchasedCode = response.purchased_code;
      } else if (response.content?.transactions?.extras && typeof response.content.transactions.extras === 'string') {
        // From extras field for some providers
        purchasedCode = response.content.transactions.extras;
      } else if (response.mainToken) {
        // From mainToken field for some electricity providers
        purchasedCode = response.mainToken;
      }

      return {
        requestId: params.requestId,
        providerReference: response.content?.transactions?.transactionId,
        purchased_code: purchasedCode,
        commission_earned: commissionEarned,
        status: mapped.status,
        message: mapped.message,
        data: response
      };
    } catch (error: any) {
      logger.error('VTPass electricity purchase failed:', error);
      throw new Error(error.response?.data?.response_description || 'Electricity payment failed');
    }
  }

  async payEducationBill(params: EducationBillParams): Promise<TransactionResponse> {
    try {
      const payload: any = {
        request_id: params.requestId,
        serviceID: params.serviceId,
        billersCode: params.billerCode,
        variation_code: params.variationCode,
        amount: params.amount,
        phone: params.phone
      };

      // Include quantity if provided (for JAMB)
      if (params.quantity) {
        payload.quantity = params.quantity;
      }

      const response = await this.makeRequest('/pay', payload);
      const mapped = mapProviderResponse(response.code, response.content?.transactions?.status, response.response_description);

      // Extract commission earned from VTPass response
      const commissionEarned = this.extractCommissionEarned(params.serviceId, params.amount, response);

      return {
        requestId: params.requestId,
        providerReference: response.content?.transactions?.transactionId,
        commission_earned: commissionEarned,
        status: mapped.status,
        message: mapped.message,
        data: response
      };
    } catch (error: any) {
      logger.error('VTPass education payment failed:', error);
      throw new Error(error.response?.data?.response_description || 'Education payment failed');
    }
  }

  async purchaseJambPin(params: JambPurchaseParams): Promise<TransactionResponse> {
    return this.payEducationBill(params);
  }

  async payInsuranceBill(params: InsuranceBillParams): Promise<TransactionResponse> {
    try {
      const payload = {
        request_id: params.requestId,
        serviceID: params.serviceId,
        billersCode: params.billerCode,
        variation_code: params.variationCode,
        amount: params.amount,
        phone: params.phone
      };

      const response = await this.makeRequest('/pay', payload);
      const mapped = mapProviderResponse(response.code, response.content?.transactions?.status, response.response_description);

      // Extract commission earned from VTPass response
      const commissionEarned = this.extractCommissionEarned(params.serviceId, params.amount, response);

      return {
        requestId: params.requestId,
        providerReference: response.content?.transactions?.transactionId,
        commission_earned: commissionEarned,
        status: mapped.status,
        message: mapped.message,
        data: response
      };
    } catch (error: any) {
      logger.error('VTPass insurance payment failed:', error);
      throw new Error(error.response?.data?.response_description || 'Insurance payment failed');
    }
  }

  async purchaseThirdPartyInsurance(params: ThirdPartyInsurancePurchaseParams): Promise<TransactionResponse> {
    try {
      const payload = {
        request_id: params.requestId,
        serviceID: params.serviceId,
        billersCode: params.billerCode,
        variation_code: params.variationCode,
        amount: params.amount,
        phone: params.phone,
        Insured_Name: params.Insured_Name,
        engine_capacity: params.engine_capacity,
        Chasis_Number: params.Chasis_Number,
        Plate_Number: params.Plate_Number,
        vehicle_make: params.vehicle_make,
        vehicle_color: params.vehicle_color,
        vehicle_model: params.vehicle_model,
        YearofMake: params.YearofMake,
        state: params.state,
        lga: params.lga,
        email: params.email
      };

      const response = await this.makeRequest('/pay', payload);
      const mapped = mapProviderResponse(response.code, response.content?.transactions?.status, response.response_description);

      // Extract commission earned from VTPass response
      const commissionEarned = this.extractCommissionEarned(params.serviceId, params.amount, response);

      return {
        requestId: params.requestId,
        providerReference: response.content?.transactions?.transactionId,
        commission_earned: commissionEarned,
        status: mapped.status,
        message: mapped.message,
        data: response
      };
    } catch (error: any) {
      logger.error('VTPass third party insurance purchase failed:', error);
      throw new Error(error.response?.data?.response_description || 'Third party insurance purchase failed');
    }
  }

  // Customer verification methods
  async verifyCustomer(params: CustomerVerificationParams): Promise<any> {
    try {
      const payload = {
        billersCode: params.customerId,
        serviceID: params.serviceId,
        type: params.type
      };

      const response = await this.makeRequest('/merchant-verify', payload);
      
      if (response.code !== '000') {
        throw new Error(response.response_description || 'Customer verification failed');
      }

      return response.content;
    } catch (error: any) {
      logger.error('VTPass customer verification failed:', error);
      throw new Error(error.response?.data?.response_description || 'Customer verification failed');
    }
  }

  async verifyElectricityCustomer(params: ElectricityVerificationParams): Promise<any> {
    return this.verifyCustomer({
      serviceId: params.serviceId,
      customerId: params.customerId,
      type: params.meterType
    });
  }

  async verifyJambCustomer(params: JambVerificationParams): Promise<any> {
    return this.verifyCustomer(params);
  }

  // TV-specific verification methods
  async verifyDSTVCustomer(params: { serviceId: string; customerId: string }): Promise<any> {
    return this.verifyCustomer(params);
  }

  async verifyGOTVCustomer(params: { serviceId: string; customerId: string }): Promise<any> {
    return this.verifyCustomer(params);
  }

  async verifyStartimesCustomer(params: { serviceId: string; customerId: string }): Promise<any> {
    return this.verifyCustomer(params);
  }

  // Service variations and information
  async getServiceVariations(serviceId: string): Promise<any> {
    try {
      const response = await this.makeRequest(`/service-variations?serviceID=${serviceId}`, null, 'GET');
      return response;
    } catch (error: any) {
      logger.error('VTPass get service variations failed:', error);
      throw new Error('Failed to get service variations');
    }
  }

  async getGloSmeDataVariations(): Promise<any> {
    try {
      const response = await this.makeRequest('/service-variations?serviceID=glo-sme-data', null, 'GET');
      return response;
    } catch (error: any) {
      logger.error('VTPass get GLO SME data variations failed:', error);
      throw new Error('Failed to get GLO SME data variations');
    }
  }

  // Spectranet purchase method
  async purchaseSpectranet(params: any): Promise<TransactionResponse> {
    try {
      const payload = {
        request_id: params.requestId,
        serviceID: params.serviceId,
        billersCode: params.billerCode,
        variation_code: params.variationCode,
        amount: params.amount,
        phone: params.phone,
        quantity: params.quantity || 1
      };

      const response = await this.makeRequest('/pay', payload);
      const mapped = mapProviderResponse(response.code, response.content?.transactions?.status, response.response_description);

      // Extract commission earned from VTPass response
      const commissionEarned = this.extractCommissionEarned(params.serviceId, params.amount, response);

      return {
        requestId: params.requestId,
        providerReference: response.content?.transactions?.transactionId,
        commission_earned: commissionEarned,
        status: mapped.status,
        message: mapped.message,
        data: response
      };
    } catch (error: any) {
      logger.error('VTPass Spectranet purchase failed:', error);
      throw new Error(error.response?.data?.response_description || 'Spectranet purchase failed');
    }
  }

  // GLO SME Data purchase method
  async purchaseGloSmeData(params: GloSmeDataPurchaseParams): Promise<TransactionResponse> {
    try {
      const payload: {
        request_id: string;
        serviceID: string;
        billersCode: string;
        variation_code: string;
        phone: string;
        amount?: number;
      } = {
        request_id: params.requestId,
        serviceID: params.serviceId,
        billersCode: params.billerCode,
        variation_code: params.variationCode,
        phone: params.phone
      };

      // Amount is optional for GLO SME Data
      if (params.amount !== undefined) {
        payload.amount = params.amount;
      }

      const response = await this.makeRequest('/pay', payload);
      const mapped = mapProviderResponse(response.code, response.content?.transactions?.status, response.response_description);

      // Extract commission earned from VTPass response
      const commissionEarned = this.extractCommissionEarned(params.serviceId, params.amount, response);

      return {
        requestId: params.requestId,
        providerReference: response.content?.transactions?.transactionId,
        commission_earned: commissionEarned,
        status: mapped.status,
        message: mapped.message,
        data: response
      };
    } catch (error: any) {
      logger.error('VTPass GLO SME data purchase failed:', error);
      throw new Error(error.response?.data?.response_description || 'GLO SME data purchase failed');
    }
  }

  // Insurance auxiliary data methods
  async getVehicleColors(): Promise<VehicleColor[]> {
    try {
      const response = await this.makeRequest('/auxiliary/colours', null, 'GET');
      if (response.code === '000' && response.content) {
        return response.content;
      }
      return [];
    } catch (error: any) {
      logger.error('VTPass get vehicle colors failed:', error);
      throw new Error('Failed to get vehicle colors');
    }
  }

  async getEngineCapacities(): Promise<EngineCapacity[]> {
    try {
      const response = await this.makeRequest('/auxiliary/capacity', null, 'GET');
      if (response.code === '000' && response.content) {
        return response.content;
      }
      return [];
    } catch (error: any) {
      logger.error('VTPass get engine capacities failed:', error);
      throw new Error('Failed to get engine capacities');
    }
  }

  async getStates(): Promise<State[]> {
    try {
      const response = await this.makeRequest('/auxiliary/state', null, 'GET');
      if (response.code === '000' && response.content) {
        return response.content;
      }
      return [];
    } catch (error: any) {
      logger.error('VTPass get states failed:', error);
      throw new Error('Failed to get states');
    }
  }

  async getLGAs(stateCode: string): Promise<LGA[]> {
    try {
      const response = await this.makeRequest(`/auxiliary/lga/${stateCode}`, null, 'GET');
      if (response.code === '000' && response.content) {
        return response.content;
      }
      return [];
    } catch (error: any) {
      logger.error('VTPass get LGAs failed:', error);
      throw new Error('Failed to get LGAs');
    }
  }

  async getVehicleMakes(): Promise<VehicleMake[]> {
    try {
      const response = await this.makeRequest('/auxiliary/make', null, 'GET');
      if (response.code === '000' && response.content) {
        return response.content;
      }
      return [];
    } catch (error: any) {
      logger.error('VTPass get vehicle makes failed:', error);
      throw new Error('Failed to get vehicle makes');
    }
  }

  async getVehicleModels(vehicleMakeCode: string): Promise<VehicleModel[]> {
    try {
      const response = await this.makeRequest(`/auxiliary/model/${vehicleMakeCode}`, null, 'GET');
      if (response.code === '000' && response.content) {
        return response.content;
      }
      return [];
    } catch (error: any) {
      logger.error('VTPass get vehicle models failed:', error);
      throw new Error('Failed to get vehicle models');
    }
  }

  async checkTransactionStatus(requestId: string): Promise<TransactionResponse> {
    try {
      const payload = {
        request_id: requestId
      };

      const response = await this.makeRequest('/requery', payload);
      const mapped = mapProviderResponse(response.code, response.content?.transactions?.status, response.response_description);

      return {
        requestId,
        providerReference: response.content?.transactions?.transactionId,
        status: mapped.status,
        message: mapped.message,
        data: response
      };
    } catch (error: any) {
      logger.error('VTPass status check failed:', error);
      return {
        requestId,
        status: 'failed',
        message: 'Status check failed',
        data: error.response?.data
      };
    }
  }

  async getWalletBalance(): Promise<any> {
    try {
      const response = await this.makeRequest('/balance', null, 'GET');
      return response;
    } catch (error: any) {
      logger.error('VTPass wallet balance check failed:', error);
      throw new Error('Failed to get wallet balance');
    }
  }

  // Extract commission earned from VTPass response or calculate based on rates
  private extractCommissionEarned(serviceId: string, amount: number | undefined, response: any): number {
    // First try to get commission from VTPass response
    if (response.content?.commission) {
      return parseFloat(response.content.commission);
    }

    // Handle undefined amount
    if (amount === undefined) {
      return 0;
    }

    // If not available in response, calculate based on known rates
    const commissionRates: { [key: string]: number } = {
      // Airtime services (API column from the rates table)
      'mtn': 3.00,
      'airtel': 3.40,
      'glo': 4.00,
      'etisalat': 4.00,
      '9mobile': 4.00,
      
      // Data services
      'mtn-data': 3.00,
      'airtel-data': 3.40,
      'glo-data': 4.00,
      'glo-sme-data': 4.00,
      'etisalat-data': 4.00,
      'smile-direct': 5.00,
      'spectranet': 5.00,
      
      // TV subscriptions
      'dstv': 1.50,
      'gotv': 1.50,
      'startimes': 2.00,
      'showmax': 1.50,
      
      // Electricity
      'ikeja-electric': 1.00,
      'eko-electric': 1.00,
      'kano-electric': 1.00,
      'abuja-electric': 1.20,
      'portharcourt-electric': 2.00,
      'jos-electric': 0.90,
      'ibadan-electric': 1.10,
      'kaduna-electric': 1.50,
      'enugu-electric': 1.40,
      'benin-electric': 1.50,
      'aba-electric': 1.50,
      'yola-electric': 1.20,
      
      // Education (fixed amounts in NGN)
      'waec-registration': 150, // Fixed ₦150
      'waec': 250, // Fixed ₦250
      'jamb': 150, // Fixed ₦150
      'neco': 0, // Not specified
      
      // Insurance
      'ui-insure': 6.00
    };

    const rate = commissionRates[serviceId] || 0;
    
    // For education services with fixed rates
    if (['waec-registration', 'waec', 'jamb'].includes(serviceId)) {
      return rate; // Fixed amount
    }
    
    // For percentage-based services
    return (amount * rate) / 100;
  }
}

export const vtpassService = new VTPassService();