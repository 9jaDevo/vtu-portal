import axios from 'axios';
import { logger } from '../utils/logger.js';

export interface TransactionResponse {
  requestId: string;
  providerReference?: string;
  purchased_code?: string;
  commission_earned?: number;
  status: 'success' | 'pending' | 'failed';
  message: string;
  data?: any;
}

export interface AirtimePurchaseParams {
  serviceId: string;
  amount: number;
  phone: string;
  requestId: string;
}

export interface DataPurchaseParams {
  serviceId: string;
  billerCode: string;
  variationCode: string;
  amount: number;
  phone: string;
  requestId: string;
}

// New interface for GLO SME Data purchases where amount is optional
export interface GloSmeDataPurchaseParams {
  serviceId: string;
  billerCode: string;
  variationCode: string;
  amount?: number; // Optional for GLO SME Data
  phone: string;
  requestId: string;
}

export interface TVSubscriptionParams {
  serviceId: string;
  billerCode: string;
  variationCode?: string;
  amount: number;
  phone: string;
  requestId: string;
  subscriptionType?: 'change' | 'renew';
  quantity?: number;
}

export interface ElectricityBillParams {
  serviceId: string;
  billerCode: string;
  variationCode?: string;
  amount: number;
  phone: string;
  requestId: string;
}

// New interface for electricity verification
export interface ElectricityVerificationParams extends CustomerVerificationParams {
  meterType: 'prepaid' | 'postpaid';
}

// New interface for electricity purchases
export interface ElectricityPurchaseParams extends ElectricityBillParams {
  meterType: 'prepaid' | 'postpaid';
}

export interface EducationBillParams {
  serviceId: string;
  billerCode?: string;
  variationCode?: string;
  amount: number;
  phone: string;
  requestId: string;
  quantity?: number;
}

export interface InsuranceBillParams {
  serviceId: string;
  billerCode: string;
  variationCode: string;
  amount: number;
  phone: string;
  requestId: string;
}

// New interface for Third Party Insurance purchases
export interface ThirdPartyInsurancePurchaseParams extends InsuranceBillParams {
  Insured_Name: string;
  engine_capacity: string;
  Chasis_Number: string;
  Plate_Number: string;
  vehicle_make: string;
  vehicle_color: string;
  vehicle_model: string;
  YearofMake: string;
  state: string;
  lga: string;
  email: string;
}

export interface CustomerVerificationParams {
  serviceId: string;
  customerId: string;
  type?: string;
}

// New interface for JAMB verification
export interface JambVerificationParams extends CustomerVerificationParams {
  type: string; // variation code for JAMB
}

// New interface for JAMB purchases
export interface JambPurchaseParams extends EducationBillParams {
  billersCode: string; // Profile ID for JAMB
}

// Insurance auxiliary data interfaces
export interface VehicleColor {
  ColourCode: string;
  ColourName: string;
}

export interface EngineCapacity {
  CapacityCode: string;
  CapacityName: string;
}

export interface State {
  StateCode: string;
  StateName: string;
}

export interface LGA {
  LGACode: string;
  LGAName: string;
  StateCode: string;
}

export interface VehicleMake {
  VehicleMakeCode: string;
  VehicleMakeName: string;
}

export interface VehicleModel {
  VehicleModelCode: string;
  VehicleModelName: string;
  VehicleMakeCode: string;
}

export interface IPaymentProvider {
  // Core transaction methods
  purchaseAirtime(params: AirtimePurchaseParams): Promise<TransactionResponse>;
  purchaseData(params: DataPurchaseParams): Promise<TransactionResponse>;
  purchaseTVSubscription(params: TVSubscriptionParams): Promise<TransactionResponse>;
  payElectricityBill(params: ElectricityBillParams): Promise<TransactionResponse>;
  payEducationBill(params: EducationBillParams): Promise<TransactionResponse>;
  payInsuranceBill(params: InsuranceBillParams): Promise<TransactionResponse>;
  
  // Specialized methods
  verifyCustomer(params: CustomerVerificationParams): Promise<any>;
  verifyElectricityCustomer(params: ElectricityVerificationParams): Promise<any>;
  verifyJambCustomer(params: JambVerificationParams): Promise<any>;
  purchaseElectricity(params: ElectricityPurchaseParams): Promise<TransactionResponse>;
  purchaseJambPin(params: JambPurchaseParams): Promise<TransactionResponse>;
  purchaseThirdPartyInsurance(params: ThirdPartyInsurancePurchaseParams): Promise<TransactionResponse>;
  
  // Insurance auxiliary data methods
  getVehicleColors(): Promise<VehicleColor[]>;
  getEngineCapacities(): Promise<EngineCapacity[]>;
  getStates(): Promise<State[]>;
  getLGAs(stateCode: string): Promise<LGA[]>;
  getVehicleMakes(): Promise<VehicleMake[]>;
  getVehicleModels(vehicleMakeCode: string): Promise<VehicleModel[]>;
  
  // Utility methods
  checkTransactionStatus(requestId: string): Promise<TransactionResponse>;
  getServiceVariations(serviceId: string): Promise<any>;
  getWalletBalance(): Promise<any>;
}

// Standard response codes mapping
export const RESPONSE_CODES = {
  SUCCESS: 'success',
  PENDING: 'pending', 
  FAILED: 'failed'
} as const;

// VTPass specific response codes for reference
export const VTPASS_CODES = {
  PROCESSED: '000',
  PROCESSING: '099',
  INVALID_CREDENTIALS: '001',
  INSUFFICIENT_BALANCE: '002',
  INVALID_SERVICE: '003',
  INVALID_AMOUNT: '004',
  INVALID_PHONE: '005',
  NETWORK_ERROR: '006',
  SERVICE_UNAVAILABLE: '007',
  DUPLICATE_TRANSACTION: '008',
  TRANSACTION_FAILED: '009'
} as const;

// Helper function to map provider-specific codes to standard codes
export function mapProviderResponse(
  providerCode: string,
  providerStatus?: string,
  message?: string
): { status: 'success' | 'pending' | 'failed'; message: string } {
  // VTPass mapping
  if (providerCode === VTPASS_CODES.PROCESSED) {
    // Check internal status for more granular mapping
    if (providerStatus === 'delivered' || providerStatus === 'successful') {
      return { status: RESPONSE_CODES.SUCCESS, message: message || 'Transaction completed successfully' };
    } else if (providerStatus === 'pending' || providerStatus === 'processing') {
      return { status: RESPONSE_CODES.PENDING, message: message || 'Transaction is being processed' };
    } else {
      return { status: RESPONSE_CODES.SUCCESS, message: message || 'Transaction processed' };
    }
  }
  
  if (providerCode === VTPASS_CODES.PROCESSING) {
    return { status: RESPONSE_CODES.PENDING, message: message || 'Transaction is being processed' };
  }
  
  // All other codes are considered failures
  const errorMessages: Record<string, string> = {
    [VTPASS_CODES.INVALID_CREDENTIALS]: 'Invalid API credentials',
    [VTPASS_CODES.INSUFFICIENT_BALANCE]: 'Insufficient balance in provider account',
    [VTPASS_CODES.INVALID_SERVICE]: 'Invalid service selected',
    [VTPASS_CODES.INVALID_AMOUNT]: 'Invalid amount specified',
    [VTPASS_CODES.INVALID_PHONE]: 'Invalid phone number',
    [VTPASS_CODES.NETWORK_ERROR]: 'Network error occurred',
    [VTPASS_CODES.SERVICE_UNAVAILABLE]: 'Service temporarily unavailable',
    [VTPASS_CODES.DUPLICATE_TRANSACTION]: 'Duplicate transaction detected',
    [VTPASS_CODES.TRANSACTION_FAILED]: 'Transaction failed'
  };
  
  return {
    status: RESPONSE_CODES.FAILED,
    message: errorMessages[providerCode] || message || 'Transaction failed'
  };
}