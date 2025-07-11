import React from 'react';
import { Hash, CheckCircle, Loader2, AlertCircle, Zap, MapPin, DollarSign, User, Info } from 'lucide-react';
import { VerificationFormProps } from './FormProps';

export const ElectricityForm: React.FC<VerificationFormProps> = ({
  register,
  watch,
  setValue,
  errors,
  customerInfo,
  isVerifying,
  verifyCustomer
}) => {
  const watchedFields = watch();

  // Get minimum purchase amount from verification response
  const minPurchaseAmount = React.useMemo(() => {
    if (!customerInfo) return 100; // Default minimum
    
    const minAmount = Number(customerInfo.Min_Purchase_Amount || customerInfo.Minimum_Amount || 100);
    return Math.max(minAmount, 100); // Ensure minimum is at least ₦100
  }, [customerInfo]);

  // Update amount field validation when minimum purchase amount changes
  React.useEffect(() => {
    if (customerInfo && minPurchaseAmount > 100) {
      // If current amount is less than minimum, update it
      const currentAmount = Number(watchedFields.amount || 0);
      if (currentAmount < minPurchaseAmount) {
        setValue('amount', minPurchaseAmount);
      }
    }
  }, [minPurchaseAmount, customerInfo, setValue, watchedFields.amount]);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Meter Number
        </label>
        <div className="relative">
          <input
            {...register('recipient', {
              required: 'Meter number is required'
            })}
            type="text"
            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter meter number"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Hash className="w-4 h-4 text-gray-400" />
          </div>
        </div>
        {errors.recipient && (
          <p className="mt-1 text-sm text-red-600">{errors.recipient.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Meter Type
        </label>
        <select
          {...register('variation_code', { required: 'Meter type is required' })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select meter type</option>
          <option value="prepaid">Prepaid</option>
          <option value="postpaid">Postpaid</option>
        </select>
        {errors.variation_code && (
          <p className="mt-1 text-sm text-red-600">{errors.variation_code.message}</p>
        )}
      </div>

      {/* Verify Button */}
      <div className="flex mt-2">
        {watchedFields.recipient && watchedFields.variation_code ? (
          <button
          type="button"
          onClick={verifyCustomer}
          disabled={isVerifying}
          className="flex items-center px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200 disabled:opacity-50"
          >
            {isVerifying ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 mr-2" />
            )}
            {isVerifying ? 'Verifying Meter...' : 'Verify Meter'}
          </button>
        ) : (
          <p className="text-xs text-gray-500 italic">
            Enter meter number and select meter type to verify
          </p>
        )}
      </div>

      {/* Customer Verification Result */}
      {customerInfo && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center mb-3">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <span className="font-medium text-green-900">Meter Verified Successfully</span>
          </div>
          <div className="space-y-3 text-sm">
            {customerInfo.Customer_Name && (
              <div className="flex items-start">
                <User className="w-4 h-4 text-green-700 mr-2 mt-0.5" />
                <div>
                  <p className="text-gray-500 font-medium">Customer Name</p>
                  <p className="text-green-800 font-semibold">{customerInfo.Customer_Name}</p>
                </div>
              </div>
            )}
            {customerInfo.Address && (
              <div className="flex items-start">
                <MapPin className="w-4 h-4 text-green-700 mr-2 mt-0.5" />
                <div>
                  <p className="text-gray-500 font-medium">Address</p>
                  <p className="text-green-800">{customerInfo.Address}</p>
                </div>
              </div>
            )}
            <div className="flex items-start">
              <Zap className="w-4 h-4 text-green-700 mr-2 mt-0.5" />
              <div>
                <p className="text-gray-500 font-medium">Meter Type</p>
                <p className="text-green-800">{customerInfo.Meter_Type || watchedFields.variation_code?.toUpperCase()}</p>
              </div>
            </div>
            {(customerInfo.Min_Purchase_Amount || customerInfo.Minimum_Amount) && (
              <div className="flex items-start">
                <DollarSign className="w-4 h-4 text-green-700 mr-2 mt-0.5" />
                <div>
                  <p className="text-gray-500 font-medium">Minimum Purchase Amount</p>
                  <p className="text-green-800">
                    ₦{Number(customerInfo.Min_Purchase_Amount || customerInfo.Minimum_Amount).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
            {customerInfo.Outstanding && Number(customerInfo.Outstanding) > 0 && (
              <div className="flex items-start">
                <AlertCircle className="w-4 h-4 text-amber-600 mr-2 mt-0.5" />
                <div>
                  <p className="text-gray-500 font-medium">Outstanding Balance</p>
                  <p className="text-amber-700 font-semibold">
                    ₦{Number(customerInfo.Outstanding).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Amount (NGN)
        </label>
        <input
          {...register('amount', {
            required: 'Amount is required',
            min: { 
              value: minPurchaseAmount, 
              message: `Minimum amount is ₦${minPurchaseAmount.toLocaleString()}` 
            },
            max: { value: 100000, message: 'Maximum amount is ₦100,000' }
          })}
          type="number"
          step="0.01"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter amount"
        />
        {errors.amount && (
          <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
        )}
        
        {customerInfo && minPurchaseAmount > 100 && (
          <div className="mt-2 flex items-center text-xs text-blue-600">
            <Info className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
            <span>This provider requires a minimum purchase of ₦{minPurchaseAmount.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Warning when meter verification is required */}
      {watchedFields.recipient &&
        watchedFields.variation_code && 
        !customerInfo && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Verification Required</p>
              <p>Please verify the meter details before proceeding with your payment.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};