import React from 'react';
import { Hash, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { EducationFormProps } from './FormProps';

export const EducationForm: React.FC<EducationFormProps> = ({
  register,
  setValue,
  watch,
  errors,
  selectedProvider,
  plans,
  customerInfo,
  isVerifying,
  verifyCustomer,
  isJambVerified,
  formatCurrency
}) => {
  const watchedFields = watch();
  const isJambService = selectedProvider?.code === 'jamb';

  return (
    <div className="space-y-6">
      {/* JAMB Service Type - Show first for JAMB */}
      {isJambService && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            JAMB Service Type *
          </label>
          <select
            {...register('variation_code', { required: 'JAMB service type is required' })}
            onChange={(e) => {
              setValue('variation_code', e.target.value);
              // Auto-set amount based on selection
              if (e.target.value === 'utme-mock') {
                setValue('amount', 7700);
              } else if (e.target.value === 'utme-no-mock') {
                setValue('amount', 6200);
              }
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select JAMB service type</option>
            <option value="utme-mock">UTME with Mock (₦7,700)</option>
            <option value="utme-no-mock">UTME without Mock (₦6,200)</option>
          </select>
          {errors.variation_code && (
            <p className="mt-1 text-sm text-red-600">{errors.variation_code.message}</p>
          )}
        </div>
      )}

      {/* JAMB Profile ID / Recipient field */}
      {isJambService ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            JAMB Profile ID *
          </label>
          <div className="relative">
            <input
              {...register('recipient', {
                required: 'JAMB Profile ID is required'
              })}
              type="text"
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter JAMB Profile ID"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Hash className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          {errors.recipient && (
            <p className="mt-1 text-sm text-red-600">{errors.recipient.message}</p>
          )}
          
          {/* JAMB Verify Button */}
          {watchedFields.recipient && watchedFields.variation_code && (
            <button
              type="button"
              onClick={verifyCustomer}
              disabled={isVerifying || isJambVerified}
              className={`mt-2 flex items-center px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${
                isJambVerified 
                  ? 'bg-green-50 text-green-600 border border-green-200' 
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
              } disabled:opacity-50`}
            >
              {isVerifying ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : isJambVerified ? (
                <CheckCircle className="w-4 h-4 mr-1" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-1" />
              )}
              {isVerifying ? 'Verifying...' : isJambVerified ? 'Verified' : 'Verify Profile ID'}
            </button>
          )}
        </div>
      ) : (
        // For non-JAMB education services
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipient Information
          </label>
          <div className="relative">
            <input
              {...register('recipient', {
                required: 'Recipient information is required'
              })}
              type="text"
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter registration number or recipient info"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Hash className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          {errors.recipient && (
            <p className="mt-1 text-sm text-red-600">{errors.recipient.message}</p>
          )}
        </div>
      )}

      {/* Customer Verification Result */}
      {customerInfo && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center mb-2">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <span className="font-medium text-green-900">Profile Verified</span>
          </div>
          <div className="space-y-1 text-sm text-green-800">
            {customerInfo.Customer_Name && (
              <p><strong>Name:</strong> {customerInfo.Customer_Name}</p>
            )}
            {/* Display other verification fields if available */}
          </div>
        </div>
      )}

      {/* Service Plans - Show for non-JAMB education services */}
      {!isJambService && plans.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Service/Plan
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
            {plans.map((plan) => (
              <button
                key={plan.id}
                type="button"
                onClick={() => {
                  setValue('plan_id', plan.id);
                  setValue('amount', plan.amount);
                  setValue('variation_code', plan.code);
                }}
                className={`p-3 border-2 rounded-lg text-left transition-all duration-200 ${
                  watchedFields.plan_id === plan.id
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

      {/* JAMB Amount - Show as read-only for JAMB */}
      {isJambService && watchedFields.variation_code && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (NGN)
          </label>
          <input
            {...register('amount')}
            type="number"
            readOnly
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
            value={watchedFields.variation_code === 'utme-mock' ? 7700 : 6200}
          />
        </div>
      )}

      {/* JAMB Verification Warning */}
      {isJambService && !isJambVerified && watchedFields.recipient && watchedFields.variation_code && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            <span className="text-sm text-yellow-800">
              Please verify the JAMB Profile ID before proceeding with the payment.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};