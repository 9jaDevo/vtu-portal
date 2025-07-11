import { 
  UseFormRegister, 
  UseFormSetValue, 
  UseFormWatch, 
  FieldErrors 
} from 'react-hook-form';
import { 
  ServiceProvider, 
  ServicePlan, 
  TransactionFormData, 
  CustomerVerification,
  InsuranceData,
  CalculatedTotal
} from '../../types';

// Base props that all form components will receive
export interface BaseFormProps {
  register: UseFormRegister<TransactionFormData>;
  setValue: UseFormSetValue<TransactionFormData>;
  watch: UseFormWatch<TransactionFormData>;
  errors: FieldErrors<TransactionFormData>;
  selectedProvider: ServiceProvider | null;
  walletBalance: number;
  isSubmitting: boolean;
  formatCurrency: (amount: number) => string;
  calculateTotal: () => CalculatedTotal;
}

// Extended props for forms that need plans
export interface PlanFormProps extends BaseFormProps {
  plans: ServicePlan[];
  selectedPlan: ServicePlan | null;
  setSelectedPlan: (plan: ServicePlan | null) => void;
}

// Props for forms that need customer verification
export interface VerificationFormProps extends BaseFormProps {
  customerInfo: CustomerVerification | null;
  isVerifying: boolean;
  verifyCustomer: () => Promise<void>;
}

// Props specifically for Education (JAMB) form
export interface EducationFormProps extends BaseFormProps {
  plans: ServicePlan[];
  customerInfo: CustomerVerification | null;
  isVerifying: boolean;
  verifyCustomer: () => Promise<void>;
  isJambVerified: boolean;
  setIsJambVerified: React.Dispatch<React.SetStateAction<boolean>>;
  setCustomerInfo: React.Dispatch<React.SetStateAction<CustomerVerification | null>>;
}

// Props specifically for TV form
export interface TvFormProps extends PlanFormProps, VerificationFormProps {}

// Props specifically for Insurance form
export interface InsuranceFormProps extends BaseFormProps {
  insuranceData: InsuranceData;
  fetchLGAs: (stateCode: string) => Promise<void>;
  fetchVehicleModels: (vehicleMakeCode: string) => Promise<void>;
}

// Props for Data form which may have dynamic plans
export interface DataFormProps extends PlanFormProps {
  isDynamicPlanProvider: boolean;
}