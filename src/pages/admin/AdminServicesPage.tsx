import React, { useState, useEffect } from 'react';
import { 
  Settings,
  ToggleLeft,
  ToggleRight,
  Edit3,
  Save,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Smartphone,
  Wifi,
  Tv,
  Zap,
  GraduationCap,
  Shield,
  Info,
  Percent,
  DollarSign
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';

interface ServiceProvider {
  id: string;
  name: string;
  type: 'airtime' | 'data' | 'tv' | 'electricity' | 'education' | 'insurance';
  code: string;
  logo_url?: string;
  status: 'active' | 'inactive';
  commission_rate: number;
  commission_type: 'percentage' | 'flat_fee';
  flat_fee_amount: number;
  is_enabled: boolean;
  plan_count: number;
  created_at: string;
  updated_at: string;
}

interface EditServiceForm {
  commission_rate: number;
  commission_type: 'percentage' | 'flat_fee';
  flat_fee_amount: number;
}

export function AdminServicesPage() {
  const [services, setServices] = useState<ServiceProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingService, setEditingService] = useState<ServiceProvider | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<EditServiceForm>();

  const commissionType = watch('commission_type');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const servicesData = await adminService.getServices();
      setServices(servicesData);
    } catch (error: any) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleService = async (serviceId: string, currentEnabled: boolean) => {
    try {
      await adminService.updateServiceCommission(serviceId, {
        is_enabled: !currentEnabled
      });
      
      toast.success(`Service ${!currentEnabled ? 'enabled' : 'disabled'} successfully`);
      await fetchServices();
    } catch (error: any) {
      console.error('Error toggling service:', error);
      toast.error('Failed to update service status');
    }
  };

  const handleEditService = (service: ServiceProvider) => {
    setEditingService(service);
    setValue('commission_rate', service.commission_rate);
    setValue('commission_type', service.commission_type);
    setValue('flat_fee_amount', service.flat_fee_amount);
  };

  const onSubmit = async (data: EditServiceForm) => {
    if (!editingService) return;

    try {
      setIsSaving(true);
      await adminService.updateServiceCommission(editingService.id, data);
      
      toast.success('Commission settings updated successfully');
      setEditingService(null);
      reset();
      await fetchServices();
    } catch (error: any) {
      console.error('Error updating commission:', error);
      toast.error('Failed to update commission settings');
    } finally {
      setIsSaving(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'airtime':
        return <Smartphone className="w-5 h-5 text-blue-600" />;
      case 'data':
        return <Wifi className="w-5 h-5 text-green-600" />;
      case 'tv':
        return <Tv className="w-5 h-5 text-purple-600" />;
      case 'electricity':
        return <Zap className="w-5 h-5 text-yellow-600" />;
      case 'education':
        return <GraduationCap className="w-5 h-5 text-indigo-600" />;
      case 'insurance':
        return <Shield className="w-5 h-5 text-red-600" />;
      default:
        return <Settings className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'airtime':
        return 'bg-blue-100 text-blue-800';
      case 'data':
        return 'bg-green-100 text-green-800';
      case 'tv':
        return 'bg-purple-100 text-purple-800';
      case 'electricity':
        return 'bg-yellow-100 text-yellow-800';
      case 'education':
        return 'bg-indigo-100 text-indigo-800';
      case 'insurance':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const calculateDiscount = (baseAmount: number, service: ServiceProvider) => {
    if (service.commission_type === 'percentage') {
      return (baseAmount * service.commission_rate) / 100;
    } else {
      return service.flat_fee_amount;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  const servicesByType = services.reduce((acc, service) => {
    if (!acc[service.type]) {
      acc[service.type] = [];
    }
    acc[service.type].push(service);
    return acc;
  }, {} as Record<string, ServiceProvider[]>);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Service Management</h1>
        <p className="text-gray-600 mt-2">Manage service providers and their commission settings</p>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
          <Info className="w-5 h-5 text-blue-600 mr-2" />
          How Commission Discounts Work
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
          <div>
            <h4 className="font-semibold mb-2 flex items-center">
              <Percent className="w-4 h-4 mr-2" />
              Percentage Discounts
            </h4>
            <p>Users pay less based on a percentage of the service cost. For example, if MTN airtime has a 3% commission rate, users pay ₦970 instead of ₦1000.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2 flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Flat Fee Discounts
            </h4>
            <p>Users pay a fixed amount less regardless of service cost. For example, WAEC with ₦150 flat fee means users always save ₦150 on any WAEC service.</p>
          </div>
        </div>
      </div>

      {/* Services by Category */}
      <div className="space-y-8">
        {Object.entries(servicesByType).map(([type, typeServices]) => (
          <div key={type} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                {getTypeIcon(type)}
                <h2 className="text-xl font-semibold text-gray-900 capitalize">{type} Services</h2>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(type)}`}>
                  {typeServices.length} provider{typeServices.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {typeServices.map((service) => (
                <div key={service.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                          {getTypeIcon(service.type)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                          <p className="text-gray-600 text-sm">Code: {service.code}</p>
                        </div>
                        <div className="flex items-center">
                          <button
                            onClick={() => handleToggleService(service.id, service.is_enabled)}
                            className={`p-1 rounded-lg transition-colors duration-200 ${
                              service.is_enabled 
                                ? 'text-green-600 hover:bg-green-50' 
                                : 'text-gray-400 hover:bg-gray-100'
                            }`}
                            title={service.is_enabled ? 'Disable service' : 'Enable service'}
                          >
                            {service.is_enabled ? (
                              <ToggleRight className="w-8 h-8" />
                            ) : (
                              <ToggleLeft className="w-8 h-8" />
                            )}
                          </button>
                          <span className={`ml-2 text-sm font-medium ${
                            service.is_enabled ? 'text-green-600' : 'text-gray-500'
                          }`}>
                            {service.is_enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Commission Type</h4>
                          <div className="flex items-center">
                            {service.commission_type === 'percentage' ? (
                              <Percent className="w-4 h-4 text-blue-600 mr-2" />
                            ) : (
                              <DollarSign className="w-4 h-4 text-green-600 mr-2" />
                            )}
                            <span className="text-sm font-semibold capitalize">
                              {service.commission_type === 'percentage' ? 'Percentage' : 'Flat Fee'}
                            </span>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Discount Rate</h4>
                          <p className="text-lg font-bold text-gray-900">
                            {service.commission_type === 'percentage' 
                              ? `${service.commission_rate}%`
                              : formatCurrency(service.flat_fee_amount)
                            }
                          </p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Example Discount</h4>
                          <p className="text-sm text-gray-600">₦1000 service</p>
                          <p className="text-lg font-bold text-green-600">
                            Save {formatCurrency(calculateDiscount(1000, service))}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="ml-6">
                      <button
                        onClick={() => handleEditService(service)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                        title="Edit commission settings"
                      >
                        <Edit3 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Service Modal */}
      {editingService && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
              onClick={() => setEditingService(null)}
            />
            
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Edit Commission Settings</h3>
                <button
                  onClick={() => setEditingService(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    {getTypeIcon(editingService.type)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{editingService.name}</h4>
                    <p className="text-sm text-gray-600">{editingService.code}</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commission Type
                  </label>
                  <select
                    {...register('commission_type', { required: 'Commission type is required' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="percentage">Percentage Discount</option>
                    <option value="flat_fee">Flat Fee Discount</option>
                  </select>
                  {errors.commission_type && (
                    <p className="mt-1 text-sm text-red-600">{errors.commission_type.message}</p>
                  )}
                </div>

                {commissionType === 'percentage' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Commission Rate (%)
                    </label>
                    <div className="relative">
                      <input
                        {...register('commission_rate', {
                          required: 'Commission rate is required',
                          min: { value: 0, message: 'Rate must be positive' },
                          max: { value: 50, message: 'Rate cannot exceed 50%' }
                        })}
                        type="number"
                        step="0.1"
                        min="0"
                        max="50"
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="3.0"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Percent className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    {errors.commission_rate && (
                      <p className="mt-1 text-sm text-red-600">{errors.commission_rate.message}</p>
                    )}
                    <p className="mt-2 text-sm text-gray-500">
                      Users will pay this percentage less than the service cost
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Flat Fee Amount (NGN)
                    </label>
                    <div className="relative">
                      <input
                        {...register('flat_fee_amount', {
                          required: 'Flat fee amount is required',
                          min: { value: 0, message: 'Amount must be positive' }
                        })}
                        type="number"
                        step="0.01"
                        min="0"
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="150.00"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <span className="text-gray-400 text-sm">NGN</span>
                      </div>
                    </div>
                    {errors.flat_fee_amount && (
                      <p className="mt-1 text-sm text-red-600">{errors.flat_fee_amount.message}</p>
                    )}
                    <p className="mt-2 text-sm text-gray-500">
                      Users will pay this fixed amount less for any service from this provider
                    </p>
                  </div>
                )}

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-start">
                    <Info className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Preview</p>
                      <p>
                        For a ₦1000 service, users will pay:{' '}
                        <span className="font-semibold">
                          {commissionType === 'percentage' 
                            ? `₦${(1000 - (1000 * (watch('commission_rate') || 0) / 100)).toFixed(2)}`
                            : `₦${(1000 - (watch('flat_fee_amount') || 0)).toFixed(2)}`
                          }
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setEditingService(null)}
                    className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-3 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Saving...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}