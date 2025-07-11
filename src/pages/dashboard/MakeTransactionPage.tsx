import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { 
  Smartphone, 
  Wifi, 
  Tv, 
  Zap, 
  GraduationCap, 
  Shield,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  CreditCard
} from 'lucide-react';
import { transactionService } from '../../services/transactionService';
import { walletService } from '../../services/walletService';
import { 
  ServiceProvider, 
  ServicePlan, 
  TransactionFormData, 
  CustomerVerification,
  InsuranceData,
  CalculatedTotal
} from '../../types';

// Import service form components
import { AirtimeForm } from '../../components/forms/AirtimeForm';
import { DataForm } from '../../components/forms/DataForm';
import { TvForm } from '../../components/forms/TvForm';
import { ElectricityForm } from '../../components/forms/ElectricityForm';
import { EducationForm } from '../../components/forms/EducationForm';
import { InsuranceForm } from '../../components/forms/InsuranceForm';

export function MakeTransactionPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<'service' | 'provider' | 'details'>('service');
  const [selectedService, setSelectedService] = useState<string>('');
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [plans, setPlans] = useState<ServicePlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<ServicePlan | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerVerification | null>(null);
  const [isJambVerified, setIsJambVerified] = useState(false);
  const [isDynamicPlanProvider, setIsDynamicPlanProvider] = useState(false);
  const [insuranceData, setInsuranceData] = useState<InsuranceData>({
    vehicleColors: [],
    engineCapacities: [],
    states: [],
    lgas: [],
    vehicleMakes: [],
    vehicleModels: []
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<TransactionFormData>();

  const watchedFields = watch();

  const services = [
    { 
      id: 'airtime', 
      name: 'Airtime Top-up', 
      icon: Smartphone, 
      color: 'bg-blue-500',
      description: 'Buy airtime for all networks'
    },
    { 
      id: 'data', 
      name: 'Data Bundles', 
      icon: Wifi, 
      color: 'bg-green-500',
      description: 'Purchase data plans'
    },
    { 
      id: 'tv', 
      name: 'TV Subscription', 
      icon: Tv, 
      color: 'bg-purple-500',
      description: 'DSTV, GOtv, Startimes'
    },
    { 
      id: 'electricity', 
      name: 'Electricity Bills', 
      icon: Zap, 
      color: 'bg-yellow-500',
      description: 'Pay electricity bills'
    },
    { 
      id: 'education', 
      name: 'Education Payments', 
      icon: GraduationCap, 
      color: 'bg-indigo-500',
      description: 'WAEC, JAMB, NECO'
    },
    { 
      id: 'insurance', 
      name: 'Insurance', 
      icon: Shield, 
      color: 'bg-red-500',
      description: 'Vehicle insurance'
    }
  ];

  useEffect(() => {
    fetchWalletBalance();
  }, []);

  useEffect(() => {
    if (selectedService) {
      fetchProviders();
    }
  }, [selectedService]);

  useEffect(() => {
    if (selectedProvider) {
      fetchPlans();
      
      // Reset form values when provider changes
      setValue('plan_id', '');
      setValue('amount', 0);
      setValue('variation_code', '');
      setSelectedPlan(null);
      
      // Reset verification state
      setIsJambVerified(false);
      setCustomerInfo(null);
    }
  }, [selectedProvider]);

  useEffect(() => {
    if (selectedService === 'insurance') {
      fetchInsuranceData();
    }
  }, [selectedService]);

  const fetchWalletBalance = async () => {
    try {
      const balance = await walletService.getBalance();
      setWalletBalance(balance.balance);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }
  };

  const fetchProviders = async () => {
    try {
      setIsLoading(true);
      const data = await transactionService.getProviders();
      const filteredProviders = data.filter((provider: ServiceProvider) => provider.type === selectedService);
      setProviders(filteredProviders);
    } catch (error: any) {
      console.error('Error fetching providers:', error);
      toast.error('Failed to load service providers');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlans = async () => {
    if (!selectedProvider) return;
    
    try {
      setIsLoading(true);
      
      // Check if this provider uses dynamic plans
      if (selectedProvider.code === 'glo-sme-data' || selectedProvider.type === 'tv') {
        setIsDynamicPlanProvider(true);
        const dynamicPlans = await transactionService.getDynamicPlans(selectedProvider.id);
        setPlans(dynamicPlans);
      } else {
        setIsDynamicPlanProvider(false);
        const staticPlans = await transactionService.getPlans(selectedProvider.id);
        setPlans(staticPlans);
      }
    } catch (error: any) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to load service plans');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInsuranceData = async () => {
    try {
      const [colors, capacities, states, makes] = await Promise.all([
        transactionService.getVehicleColors(),
        transactionService.getEngineCapacities(),
        transactionService.getStates(),
        transactionService.getVehicleMakes()
      ]);
      
      setInsuranceData(prev => ({
        ...prev,
        vehicleColors: colors,
        engineCapacities: capacities,
        states: states,
        vehicleMakes: makes
      }));
    } catch (error) {
      console.error('Error fetching insurance data:', error);
    }
  };

  const fetchLGAs = async (stateCode: string) => {
    try {
      const lgas = await transactionService.getLGAs(stateCode);
      setInsuranceData(prev => ({ ...prev, lgas }));
    } catch (error) {
      console.error('Error fetching LGAs:', error);
    }
  };

  const fetchVehicleModels = async (vehicleMakeCode: string) => {
    try {
      const models = await transactionService.getVehicleModels(vehicleMakeCode);
      setInsuranceData(prev => ({ ...prev, vehicleModels: models }));
    } catch (error) {
      console.error('Error fetching vehicle models:', error);
    }
  };

  const verifyCustomer = async () => {
    if (!selectedProvider || !watchedFields.recipient) return;

    // Clear previous verification data
    setCustomerInfo(null);
    
    try {
      setIsVerifying(true);
      let verificationData;

      if (selectedService === 'tv') {
        if (selectedProvider.code === 'dstv') {
          verificationData = await transactionService.verifyDSTVCustomer(watchedFields.recipient);
        } else if (selectedProvider.code === 'gotv') {
          verificationData = await transactionService.verifyGOTVCustomer(watchedFields.recipient);
        } else if (selectedProvider.code === 'startimes') {
          verificationData = await transactionService.verifyStartimesCustomer(watchedFields.recipient);
        }
      } else if (selectedService === 'electricity') {
        verificationData = await transactionService.verifyElectricityCustomer(
          selectedProvider.code,
          watchedFields.recipient.trim(),
          watchedFields.variation_code as 'prepaid' | 'postpaid'
        );
      } else if (selectedService === 'education' && selectedProvider.code === 'jamb') {
        if (!watchedFields.variation_code) {
          toast.error('Please select JAMB service type first');
          return;
        }
        verificationData = await transactionService.verifyJambCustomer(
          watchedFields.recipient,
          watchedFields.variation_code
        );
        setIsJambVerified(true);
      }

      if (verificationData) {
        setCustomerInfo(verificationData);
        toast.success('Customer verified successfully!');
      }
    } catch (error: any) {
      console.error('Customer verification failed:', error);
      toast.error(error.response?.data?.message || error.response?.data?.error || error.message || 'Customer verification failed');
      setCustomerInfo(null);
      if (selectedService === 'education' && selectedProvider?.code === 'jamb') {
        setIsJambVerified(false);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const calculateTotal = () => {
    // Ensure amount is treated as a number
    const amount = Number(selectedPlan?.amount || watchedFields.amount || 0);
    let discount = 0;

    // Calculate discount based on commission type and rate
    if (selectedProvider) {
      if (selectedProvider.commission_type === 'percentage') {
        discount = (amount * selectedProvider.commission_rate) / 100;
      } else {
        discount = selectedProvider.flat_fee_amount;
      }
    }

    // Ensure discount doesn't exceed the amount
    discount = Math.min(discount, amount);
    
    // Total is amount minus discount
    const total = amount - discount;

    return { amount, discount, total } as CalculatedTotal;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const onSubmit = async (data: TransactionFormData) => {
    try {
      setIsSubmitting(true);
      
      const { total } = calculateTotal();
      
      if (walletBalance < total) {
        toast.error('Insufficient wallet balance');
        return;
      }

      // Check JAMB verification requirement
      if (selectedService === 'education' && selectedProvider?.code === 'jamb' && !isJambVerified) {
        toast.error('Please verify the JAMB Profile ID first');
        return;
      }

      const transactionData = {
        ...data,
        type: selectedService,
        provider: selectedProvider?.code || '',
        plan_id: selectedPlan?.id,
        amount: selectedService === 'tv' && data.subscription_type === 'renew' 
          ? customerInfo?.Renewal_Amount || data.amount
          : selectedPlan?.amount || data.amount,
        // For data services, ensure variation_code is set from selected plan
        variation_code: selectedService === 'data' ? selectedPlan?.code : data.variation_code,
        // For JAMB education services, set biller_code to the recipient (Profile ID)
        // For TV services, set biller_code to the smartcard number
        biller_code: selectedService === 'education' && selectedProvider?.code === 'jamb' 
          ? data.recipient 
          : selectedService === 'tv'
            ? data.recipient
            : data.biller_code
      };

      const result = await transactionService.createTransaction(transactionData);
      
      toast.success('Transaction initiated successfully!');
      navigate('/dashboard/transactions');
    } catch (error: any) {
      console.error('Transaction failed:', error);
      toast.error(error.response?.data?.message || error.response?.data?.error || error.message || 'Transaction failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dynamic service form rendering
  const renderServiceForm = () => {
    const { total } = calculateTotal();
    
    switch (selectedService) {
      case 'airtime':
        return (
          <AirtimeForm
            register={register}
            watch={watch}
            setValue={setValue}
            errors={errors}
            selectedProvider={selectedProvider}
            walletBalance={walletBalance}
            isSubmitting={isSubmitting}
            formatCurrency={formatCurrency}
            calculateTotal={calculateTotal}
          />
        );
        
      case 'data':
        return (
          <DataForm
            register={register}
            watch={watch}
            setValue={setValue}
            errors={errors}
            selectedProvider={selectedProvider}
            plans={plans}
            selectedPlan={selectedPlan}
            setSelectedPlan={setSelectedPlan}
            isDynamicPlanProvider={isDynamicPlanProvider}
            walletBalance={walletBalance}
            isSubmitting={isSubmitting}
            formatCurrency={formatCurrency}
            calculateTotal={calculateTotal}
          />
        );
        
      case 'tv':
        return (
          <TvForm
            register={register}
            watch={watch}
            setValue={setValue}
            errors={errors}
            selectedProvider={selectedProvider}
            plans={plans}
            selectedPlan={selectedPlan}
            setSelectedPlan={setSelectedPlan}
            customerInfo={customerInfo}
            isVerifying={isVerifying}
            verifyCustomer={verifyCustomer}
            walletBalance={walletBalance}
            isSubmitting={isSubmitting}
            formatCurrency={formatCurrency}
            calculateTotal={calculateTotal}
          />
        );
        
      case 'electricity':
        return (
          <ElectricityForm
            register={register}
            watch={watch}
            setValue={setValue}
            errors={errors}
            selectedProvider={selectedProvider}
            customerInfo={customerInfo}
            isVerifying={isVerifying}
            verifyCustomer={verifyCustomer}
            walletBalance={walletBalance}
            isSubmitting={isSubmitting}
            formatCurrency={formatCurrency}
            calculateTotal={calculateTotal}
          />
        );
        
      case 'education':
        return (
          <EducationForm
            register={register}
            watch={watch}
            setValue={setValue}
            errors={errors}
            selectedProvider={selectedProvider}
            plans={plans}
            customerInfo={customerInfo}
            isVerifying={isVerifying}
            verifyCustomer={verifyCustomer}
            isJambVerified={isJambVerified}
            setIsJambVerified={setIsJambVerified}
            setCustomerInfo={setCustomerInfo}
            walletBalance={walletBalance}
            isSubmitting={isSubmitting}
            formatCurrency={formatCurrency}
            calculateTotal={calculateTotal}
          />
        );
        
      case 'insurance':
        return (
          <InsuranceForm
            register={register}
            watch={watch}
            setValue={setValue}
            errors={errors}
            selectedProvider={selectedProvider}
            insuranceData={insuranceData}
            fetchLGAs={fetchLGAs}
            fetchVehicleModels={fetchVehicleModels}
            walletBalance={walletBalance}
            isSubmitting={isSubmitting}
            formatCurrency={formatCurrency}
            calculateTotal={calculateTotal}
          />
        );
        
      default:
        return null;
    }
  };

  const renderServiceSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose a Service</h2>
        <p className="text-gray-600">Select the type of transaction you want to make</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => {
              setSelectedService(service.id);
              setCurrentStep('provider');
            }}
            className="p-6 bg-white border-2 border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-lg transition-all duration-200 text-left group"
          >
            <div className={`w-12 h-12 ${service.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
              <service.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h3>
            <p className="text-gray-600 text-sm">{service.description}</p>
          </button>
        ))}
      </div>
    </div>
  );

  const renderProviderSelection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Provider</h2>
          <p className="text-gray-600">Choose your service provider</p>
        </div>
        <button
          onClick={() => {
            setCurrentStep('service');
            setSelectedProvider(null);
            setSelectedPlan(null);
            setPlans([]);
            reset();
          }}
          className="flex items-center text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map((provider) => (
            <button
              key={provider.id}
              onClick={() => {
                setSelectedProvider(provider);
                setCurrentStep('details');
              }}
              className="p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                  <p className="text-sm text-gray-600">{provider.plan_count} plans available</p>
                  <p className="text-xs text-gray-500">
                    {provider.commission_type === 'percentage'
                      ? `${provider.commission_rate}% discount`
                      : `₦${provider.flat_fee_amount} discount`}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const renderTransactionDetails = () => {
    const { amount, discount, total } = calculateTotal();
    const isJambService = selectedService === 'education' && selectedProvider?.code === 'jamb';
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedProvider?.name}</h2>
            <p className="text-gray-600">Fill in the transaction information</p>
          </div>
          <button
            onClick={() => {
              setCurrentStep('provider');
              setSelectedPlan(null);
              setCustomerInfo(null);
              setIsJambVerified(false);
            }}
            className="flex items-center text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Dynamic Service Form */}
              {renderServiceForm()}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  walletBalance < total ||
                  (isJambService && !isJambVerified) ||
                  (selectedService === 'electricity' && !customerInfo) ||
                  (selectedService === 'tv' && watchedFields.subscription_type === 'renew' && 
                    (!watchedFields.amount || watchedFields.amount <= 0 || !watchedFields.variation_code)) ||
                  (selectedService === 'tv' && watchedFields.subscription_type === 'change' && 
                    (!selectedPlan || !watchedFields.variation_code))
                }
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Processing...
                  </div>
                ) : (
                  `Pay ${total > 0 ? formatCurrency(total) : ''}`
                )}
              </button>
            </form>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium capitalize">{selectedService}</span>
                </div>
                
                {selectedProvider && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Provider:</span>
                    <span className="font-medium">{selectedProvider.name}</span>
                  </div>
                )}
                
                {selectedPlan && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plan:</span>
                    <span className="font-medium text-sm">{selectedPlan.name}</span>
                  </div>
                )}

                {selectedService === 'tv' && watchedFields.subscription_type && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium text-sm capitalize">
                      {watchedFields.subscription_type === 'change' ? 'Change Bouquet' : 'Renew Subscription'}
                    </span>
                  </div>
                )}

                {isJambService && watchedFields.variation_code && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium text-sm">
                      {watchedFields.variation_code === 'utme-mock' ? 'UTME with Mock' : 'UTME without Mock'}
                    </span>
                  </div>
                )}
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">{formatCurrency(amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-medium text-green-600">-{formatCurrency(discount)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t border-gray-200 pt-2 mt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Wallet Balance:</span>
                    <span className={`font-medium ${walletBalance >= total ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(walletBalance)}
                    </span>
                  </div>
                  
                  {walletBalance < total && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center">
                        <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                        <span className="text-sm text-red-800">Insufficient balance</span>
                      </div>
                      <p className="text-xs text-red-700 mt-1">
                        You need {formatCurrency(total - walletBalance)} more
                      </p>
                    </div>
                  )}

                  {selectedService === 'tv' && (
                    <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center">
                        <Tv className="w-4 h-4 text-purple-600 mr-2" />
                        <span className="text-sm text-purple-800">
                          {watchedFields.subscription_type === 'renew' 
                            ? customerInfo?.Renewal_Amount 
                              ? 'Renewal amount verified ✓' 
                              : 'Verify smartcard for renewal amount'
                            : watchedFields.subscription_type === 'change'
                              ? selectedPlan
                                ? 'Bouquet selected ✓'
                                : 'Select a new bouquet'
                              : 'Select subscription type'
                          }
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {currentStep === 'service' && renderServiceSelection()}
        {currentStep === 'provider' && renderProviderSelection()}
        {currentStep === 'details' && renderTransactionDetails()}
      </div>
    </DashboardLayout>
  );
}