import React from 'react';
import { Phone, User, Car, Hash, Calendar, MapPin, Mail } from 'lucide-react';
import { InsuranceFormProps } from './FormProps';

export const InsuranceForm: React.FC<InsuranceFormProps> = ({
  register,
  setValue,
  watch,
  errors,
  selectedProvider,
  insuranceData,
  fetchLGAs,
  fetchVehicleModels
}) => {
  const watchedFields = watch();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Insured Name
          </label>
          <div className="relative">
            <input
              {...register('Insured_Name', { required: 'Insured name is required' })}
              type="text"
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter insured name"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <User className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          {errors.Insured_Name && (
            <p className="mt-1 text-sm text-red-600">{errors.Insured_Name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <input
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              type="email"
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter email address"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Mail className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            Vehicle Type
          </label>
          <select
            {...register('variation_code', { required: 'Vehicle type is required' })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select vehicle type</option>
            <option value="1">Private Vehicle (₦3,000)</option>
            <option value="2">Commercial Vehicle (₦5,000)</option>
            <option value="3">Tricycle (₦1,500)</option>
            <option value="4">Motorcycle (₦3,000)</option>
          </select>
          {errors.variation_code && (
            <p className="mt-1 text-sm text-red-600">{errors.variation_code.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Plate Number
          </label>
          <div className="relative">
            <input
              {...register('Plate_Number', { required: 'Plate number is required' })}
              type="text"
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter plate number"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Hash className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          {errors.Plate_Number && (
            <p className="mt-1 text-sm text-red-600">{errors.Plate_Number.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chassis Number
          </label>
          <div className="relative">
            <input
              {...register('Chasis_Number', { required: 'Chassis number is required' })}
              type="text"
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter chassis number"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Hash className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          {errors.Chasis_Number && (
            <p className="mt-1 text-sm text-red-600">{errors.Chasis_Number.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vehicle Make
          </label>
          <select
            {...register('vehicle_make', { required: 'Vehicle make is required' })}
            onChange={(e) => {
              setValue('vehicle_make', e.target.value);
              if (e.target.value) {
                fetchVehicleModels(e.target.value);
              }
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select vehicle make</option>
            {insuranceData.vehicleMakes.map((make: any) => (
              <option key={make.VehicleMakeCode} value={make.VehicleMakeCode}>
                {make.VehicleMakeName}
              </option>
            ))}
          </select>
          {errors.vehicle_make && (
            <p className="mt-1 text-sm text-red-600">{errors.vehicle_make.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vehicle Model
          </label>
          <select
            {...register('vehicle_model', { required: 'Vehicle model is required' })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select vehicle model</option>
            {insuranceData.vehicleModels.map((model: any) => (
              <option key={model.VehicleModelCode} value={model.VehicleModelCode}>
                {model.VehicleModelName}
              </option>
            ))}
          </select>
          {errors.vehicle_model && (
            <p className="mt-1 text-sm text-red-600">{errors.vehicle_model.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vehicle Color
          </label>
          <select
            {...register('vehicle_color', { required: 'Vehicle color is required' })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select color</option>
            {insuranceData.vehicleColors.map((color: any) => (
              <option key={color.ColourCode} value={color.ColourCode}>
                {color.ColourName}
              </option>
            ))}
          </select>
          {errors.vehicle_color && (
            <p className="mt-1 text-sm text-red-600">{errors.vehicle_color.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Engine Capacity
          </label>
          <select
            {...register('engine_capacity', { required: 'Engine capacity is required' })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select capacity</option>
            {insuranceData.engineCapacities.map((capacity: any) => (
              <option key={capacity.CapacityCode} value={capacity.CapacityCode}>
                {capacity.CapacityName}
              </option>
            ))}
          </select>
          {errors.engine_capacity && (
            <p className="mt-1 text-sm text-red-600">{errors.engine_capacity.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Year of Make
          </label>
          <div className="relative">
            <input
              {...register('YearofMake', { 
                required: 'Year of make is required',
                pattern: {
                  value: /^\d{4}$/,
                  message: 'Enter a valid year (YYYY)'
                }
              })}
              type="text"
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 2020"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Calendar className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          {errors.YearofMake && (
            <p className="mt-1 text-sm text-red-600">{errors.YearofMake.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State
          </label>
          <div className="relative">
            <select
              {...register('state', { required: 'State is required' })}
              onChange={(e) => {
                setValue('state', e.target.value);
                if (e.target.value) {
                  fetchLGAs(e.target.value);
                }
              }}
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select state</option>
              {insuranceData.states.map((state: any) => (
                <option key={state.StateCode} value={state.StateCode}>
                  {state.StateName}
                </option>
              ))}
            </select>
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <MapPin className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          {errors.state && (
            <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            LGA
          </label>
          <div className="relative">
            <select
              {...register('lga', { required: 'LGA is required' })}
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select LGA</option>
              {insuranceData.lgas.map((lga: any) => (
                <option key={lga.LGACode} value={lga.LGACode}>
                  {lga.LGAName}
                </option>
              ))}
            </select>
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <MapPin className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          {errors.lga && (
            <p className="mt-1 text-sm text-red-600">{errors.lga.message}</p>
          )}
        </div>
      </div>
    </div>
  );
};