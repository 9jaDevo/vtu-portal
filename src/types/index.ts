// Common interfaces for transaction services

export interface ServiceProvider {
  id: string;
  name: string;
  type: string;
  code: string;
  logo_url?: string;
  commission_rate: number;
  commission_type: 'percentage' | 'flat_fee';
  flat_fee_amount: number;
  is_enabled: boolean;
  plan_count: number;
}

export interface ServicePlan {
  id: string;
  name: string;
  code: string;
  amount: number;
  validity?: string;
  description?: string;
}

export interface TransactionFormData {
  type: string;
  provider: string;
  plan_id?: string;
  amount: number;
  recipient: string;
  biller_code?: string;
  variation_code?: string;
  quantity?: number;
  subscription_type?: 'change' | 'renew';
  // Insurance specific fields
  Insured_Name?: string;
  engine_capacity?: string;
  Chasis_Number?: string;
  Plate_Number?: string;
  vehicle_make?: string;
  vehicle_color?: string;
  vehicle_model?: string;
  YearofMake?: string;
  state?: string;
  lga?: string;
  email?: string;
}

export interface CustomerVerification {
  Customer_Name?: string;
  Status?: string;
  Due_Date?: string;
  Due_Date?: string;
  Customer_Number?: string;
  Customer_Type?: string;
  Current_Bouquet?: string;
  Renewal_Amount?: number;
  Address?: string;
  Meter_Number?: string;
  Account_Number?: string;
  Account_Number?: string;
  Customer_District?: string;
  Business_Unit?: string;
  Customer_District_Reference?: string;
  Customer_Arrears?: string;
  Minimum_Amount?: string | number;
  Min_Purchase_Amount?: string | number;
  Can_Vend?: string;
  Customer_Account_Type?: string;
  Meter_Type?: string;
  Balance?: number;
  Smartcard_Number?: string;
  WrongBillersCode?: boolean;
  Min_Purchase_Amount?: string | number;
  Can_Vend?: string;
  Customer_Account_Type?: string;
  Meter_Type?: string;
  Balance?: number;
  Smartcard_Number?: string;
  WrongBillersCode?: boolean;
}

export interface InsuranceData {
  vehicleColors: any[];
  engineCapacities: any[];
  states: any[];
  lgas: any[];
  vehicleMakes: any[];
  vehicleModels: any[];
}

export interface CalculatedTotal {
  amount: number;
  discount: number;
  total: number;
}