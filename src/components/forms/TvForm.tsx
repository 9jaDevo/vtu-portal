import React from 'react';
import { Hash, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { TvFormProps } from './FormProps';

export const TvForm: React.FC<TvFormProps> = ({ 
  register,
  setValue,
  watch,
  errors,
  selectedProvider,
  plans,
  selectedPlan,
  setSelectedPlan,
  customerInfo,
  isVerifying,
  verifyCustomer,
  formatCurrency
}) => {
  const watchedFields = watch();
  const isShowmax = selectedProvider?.code === 'showmax';
  
  // Add useEffect to handle renewal amount and matching variation code
  React.useEffect(() => {
    // Skip for Showmax as it doesn't have renewal concept
    if (isShowmax) return;
    
    // Only execute for non-Showmax when subscription type is 'renew' and we have customer info
    if (!isShowmax && watchedFields.subscription_type === 'renew' && customerInfo) {
      // Case 1: Use Renewal_Amount if it exists in customerInfo
      if (customerInfo.Renewal_Amount && customerInfo.Renewal_Amount > 0) {
        setValue('amount', customerInfo.Renewal_Amount);
        
        // Try to find matching variation code based on Current_Bouquet
        if (customerInfo.Current_Bouquet && plans.length > 0) {
          const matchingPlan = plans.find(plan => 
            plan.name.toLowerCase().includes(customerInfo.Current_Bouquet?.toLowerCase() || '')
          );
          
          if (matchingPlan) {
            setValue('variation_code', matchingPlan.code);
          }
        }
      } 
      // Case 2: Renewal_Amount not available, try to find matching plan by Current_Bouquet
      else if (customerInfo.Current_Bouquet && plans.length > 0) {
        const matchingPlan = plans.find(plan => 
          plan.name.toLowerCase().includes(customerInfo.Current_Bouquet?.toLowerCase() || '')
        );
        
        if (matchingPlan) {
          setValue('amount', matchingPlan.amount);
          setValue('variation_code', matchingPlan.code);
        } else {
          // Reset amount if no matching plan found
          setValue('amount', 0);
          setValue('variation_code', '');
        }
      } else {
        // No Renewal_Amount and no Current_Bouquet
        setValue('amount', 0);
        setValue('variation_code', '');
      }
    }
  }, [watchedFields.subscription_type, customerInfo, plans, setValue, isShowmax]);
  
  // For Showmax, set default subscription type to 'change'
  React.useEffect(() => {
    if (isShowmax) {
      setValue('subscription_type', 'change');
    }
  }, [isShowmax, setValue]);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {isShowmax ? 'Phone Number' : 'Smartcard Number'}
        </label>
        <div className="relative">
          <input
            {...register('recipient', {
              required: isShowmax ? 'Phone number is required' : 'Smartcard number is required',
              pattern: isShowmax ? {
                value: /^(\+234|234|0)[789][01]\d{8}$/,
                message: 'Please enter a valid Nigerian phone number'
              } : undefined
            })}
            type="text"
            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={isShowmax ? "Enter phone number" : "Enter smartcard number"}
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Hash className="w-4 h-4 text-gray-400" />
          </div>
        </div>
        {errors.recipient && (
          <p className="mt-1 text-sm text-red-600">{errors.recipient.message}</p>
        )}
        
        {/* Verify Button - Hidden for Showmax */}
        {watchedFields.recipient && !isShowmax && (
          <button
            type="button"
            onClick={verifyCustomer}
            disabled={isVerifying}
            className="mt-2 flex items-center px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200 disabled:opacity-50"
          >
            {isVerifying ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-1" />
            )}
            {isVerifying ? 'Verifying...' : 'Verify Customer'}
          </button>
        )}
      </div>

      {/* Customer Verification Result */}
      {customerInfo && !isShowmax && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center mb-2">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <span className="font-medium text-green-900">Customer Verified</span>
          </div>
          <div className="space-y-1 text-sm text-green-800">
            {customerInfo.Customer_Name && ( 
              <p><strong>Name:</strong> {customerInfo.Customer_Name}</p>
            )}
            {customerInfo.Current_Bouquet && (
              <p><strong>Current Package:</strong> {customerInfo.Current_Bouquet}</p>
            )}
            {customerInfo.Due_Date && (
              <p><strong>Due Date:</strong> {customerInfo.Due_Date}</p>
            )}
            {customerInfo.Address && (
              <p><strong>Address:</strong> {customerInfo.Address}</p>
            )}
          </div>
        </div>
      )}

      {/* Subscription Type */}
      {!isShowmax && <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Subscription Type *
        </label>
        <select
          {...register('subscription_type', { required: 'Subscription type is required' })}
          onChange={(e) => {
            setValue('subscription_type', e.target.value as 'change' | 'renew');
            // Reset selected plan when subscription type changes
            setSelectedPlan(null);
            setValue('plan_id', '');
            setValue('variation_code', '');
            setValue('amount', 0);
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select subscription type</option>
          <option value="change">Change Bouquet</option>
          <option value="renew">Renew Current Bouquet</option>
        </select>
        {errors.subscription_type && (
          <p className="mt-1 text-sm text-red-600">{errors.subscription_type.message}</p>
        )}
      </div>}

      {/* TV Plans - Show only for "change" subscription type */}
      {/* For Showmax, show plans directly */}
      {isShowmax && plans.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Showmax Package
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
            {plans.map((plan) => (
              <button
                key={plan.id}
                type="button"
                onClick={() => {
                  setSelectedPlan(plan);
                  setValue('plan_id', plan.id);
                  setValue('amount', plan.amount);
                  setValue('variation_code', plan.code);
                  setValue('biller_code', watchedFields.recipient); // Set biller_code to phone number for Showmax
                }}
                className={`p-3 border-2 rounded-lg text-left transition-all duration-200 ${
                  selectedPlan?.id === plan.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-gray-900 text-sm">{plan.name}</div>
                <div className="text-blue-600 font-semibold">
                  {formatCurrency(plan.amount)}
                </div>
                {plan.validity && (
                  <div className="text-xs text-gray-500">{plan.validity}</div>
                )}
                {plan.description && (
                  <div className="text-xs text-gray-600 mt-1">{plan.description}</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* For other TV providers with "change" subscription type */}
      {!isShowmax && watchedFields.subscription_type === 'change' && plans.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select New Bouquet
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
            {plans.map((plan) => (
              <button
                key={plan.id}
                type="button"
                onClick={() => {
                  setSelectedPlan(plan);
                  setValue('plan_id', plan.id);
                  setValue('amount', plan.amount);
                  setValue('variation_code', plan.code);
                }}
                className={`p-3 border-2 rounded-lg text-left transition-all duration-200 ${
                  selectedPlan?.id === plan.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-gray-900 text-sm">{plan.name}</div>
                <div className="text-blue-600 font-semibold">
                  {formatCurrency(plan.amount)}
                </div>
                {plan.validity && (
                  <div className="text-xs text-gray-500">{plan.validity}</div>
                )}
                {plan.description && (
                  <div className="text-xs text-gray-600 mt-1">{plan.description}</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TV Renewal Amount - Show when renewal is selected and customer is verified */}
      {!isShowmax && watchedFields.subscription_type === 'renew' && 
        customerInfo && 
        (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Renewal Amount (NGN)
          </label>
          <input
            {...register('amount')}
            type="number"
            readOnly
            className={`w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 ${
              !watchedFields.amount ? 'text-red-500' : 'text-gray-700'
            }`}
          />
          <p className="mt-1 text-xs text-gray-500">
            {watchedFields.amount > 0 
              ? `This is the renewal amount for your current bouquet` 
              : `Unable to determine renewal amount. Please use Change Bouquet option instead.`}
          </p>
        </div>
      )}

      {/* Warning when renewal is selected but customer isn't verified */}
      {!isShowmax && watchedFields.subscription_type === 'renew' && 
        watchedFields.recipient && 
        !customerInfo && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            <span className="text-sm text-yellow-800">
              Please verify the smartcard number to get customer information before proceeding.
            </span>
          </div>
        </div>
      )}

      {/* Warning when renewal amount couldn't be determined */}
      {!isShowmax && watchedFields.subscription_type === 'renew' && 
        customerInfo && 
        (!watchedFields.amount || watchedFields.amount <= 0) && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-sm text-red-800">
              Could not determine renewal amount for your current bouquet. Please try the "Change Bouquet" option instead.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};