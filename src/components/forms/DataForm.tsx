import React from 'react';
import { Phone, AlertCircle, Loader2 } from 'lucide-react';
import { DataFormProps } from './FormProps';

export const DataForm: React.FC<DataFormProps> = ({
  register,
  watch,
  setValue,
  errors,
  selectedProvider,
  plans,
  selectedPlan,
  setSelectedPlan,
  isDynamicPlanProvider,
  formatCurrency
}) => {
  const isGloSmeData = selectedProvider?.code === 'glo-sme-data';

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number
        </label>
        <div className="relative">
          <input
            {...register('recipient', {
              required: 'Phone number is required',
              pattern: {
                value: /^(\+234|234|0)[789][01]\d{8}$/,
                message: 'Please enter a valid Nigerian phone number'
              }
            })}
            type="text"
            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter phone number"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Phone className="w-4 h-4 text-gray-400" />
          </div>
        </div>
        {errors.recipient && (
          <p className="mt-1 text-sm text-red-600">{errors.recipient.message}</p>
        )}
      </div>

      {/* Service Plans */}
      {plans.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Plan
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
                  // For data services, set variation_code from plan code
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

      {/* Amount field for GLO SME Data - Read-only when plan is selected */}
      {isGloSmeData && selectedPlan && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (NGN)
          </label>
          <input
            {...register('amount')}
            type="number"
            readOnly
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
            value={selectedPlan.amount}
          />
          <p className="mt-1 text-xs text-gray-500">
            Amount is fixed based on the selected plan
          </p>
        </div>
      )}

      {/* GLO SME Data Info */}
      {isGloSmeData && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-sm text-blue-800">
              GLO SME Data plans are fetched directly from VTPass. Select a plan to see its price.
            </span>
          </div>
        </div>
      )}

      {/* Custom Amount (for services without fixed plans) */}
      {plans.length === 0 && !isGloSmeData && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (NGN)
          </label>
          <input
            {...register('amount', {
              required: 'Amount is required',
              min: { value: 50, message: 'Minimum amount is ₦50' },
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
        </div>
      )}
    </div>
  );
};