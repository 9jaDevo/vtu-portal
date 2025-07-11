import React from 'react';
import { Phone } from 'lucide-react';
import { BaseFormProps } from './FormProps';

export const AirtimeForm: React.FC<BaseFormProps> = ({ 
  register, 
  errors, 
  calculateTotal
}) => {
  const { amount, discount, total } = calculateTotal();

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
    </div>
  );
};