import React, { useState, useEffect } from 'react';
import { 
  Settings,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Info,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { toast } from 'react-hot-toast';

export function AdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize loading state
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
        <p className="text-gray-600 mt-2">Manage global platform configurations and discount settings</p>
      </div>

      {/* Direct Discount Information */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Direct Discount System</h2>
              <p className="text-gray-600 text-sm">Instant discounts applied at purchase time based on service provider commission</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-2">How Direct Discounts Work</p>
                <ul className="space-y-1">
                  <li>• Users get instant discounts at the time of purchase</li>
                  <li>• Discount amounts are based on service provider commission rates</li>
                  <li>• Users pay the reduced price immediately - no separate cashback process</li>
                  <li>• Configure discount rates in the Service Management section</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                  Discount Examples
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">MTN Airtime (₦1,000)</span>
                      <span className="text-sm text-gray-500">3.0% discount</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Original price:</span>
                        <span className="font-medium">₦1,000.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Instant discount:</span>
                        <span className="font-medium text-green-600">-₦30.00</span>
                      </div>
                      <div className="flex justify-between border-t pt-1">
                        <span className="text-gray-600">User pays:</span>
                        <span className="font-semibold">₦970.00</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">DSTV Compact (₦10,500)</span>
                      <span className="text-sm text-gray-500">1.5% discount</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Original price:</span>
                        <span className="font-medium">₦10,500.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Instant discount:</span>
                        <span className="font-medium text-green-600">-₦157.50</span>
                      </div>
                      <div className="flex justify-between border-t pt-1">
                        <span className="text-gray-600">User pays:</span>
                        <span className="font-semibold">₦10,342.50</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">WAEC Registration</span>
                      <span className="text-sm text-gray-500">₦150 flat discount</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Original price:</span>
                        <span className="font-medium">₦10,000.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Instant discount:</span>
                        <span className="font-medium text-green-600">-₦150.00</span>
                      </div>
                      <div className="flex justify-between border-t pt-1">
                        <span className="text-gray-600">User pays:</span>
                        <span className="font-semibold">₦9,850.00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Settings className="w-5 h-5 text-blue-600 mr-2" />
                  Configuration
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Percentage Discounts</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Discounts calculated as a percentage of the service cost. Perfect for airtime, data, and TV subscriptions.
                    </p>
                    <div className="text-xs text-gray-500">
                      <strong>Example:</strong> MTN airtime with 3% discount means users save ₦30 on every ₦1000 purchase.
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Flat Fee Discounts</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Fixed discount amounts regardless of service cost. Ideal for education and certification services.
                    </p>
                    <div className="text-xs text-gray-500">
                      <strong>Example:</strong> WAEC registration with ₦150 flat discount means users always save ₦150.
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-start">
                      <Info className="w-4 h-4 text-blue-600 mr-2 mt-0.5" />
                      <div className="text-xs text-blue-800">
                        <p className="font-medium mb-1">Configure Discounts</p>
                        <p>Visit the <strong>Service Management</strong> section to set up discount rates for each service provider.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Commission Rates Info */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <DollarSign className="w-5 h-5 text-blue-600 mr-2" />
          VTPass Commission Rates (API)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <h4 className="font-semibold text-gray-900 mb-2">Airtime Services</h4>
            <div className="space-y-1 text-gray-600">
              <div className="flex justify-between"><span>MTN:</span><span>3.00%</span></div>
              <div className="flex justify-between"><span>Airtel:</span><span>3.40%</span></div>
              <div className="flex justify-between"><span>Glo:</span><span>4.00%</span></div>
              <div className="flex justify-between"><span>9mobile:</span><span>4.00%</span></div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <h4 className="font-semibold text-gray-900 mb-2">Data Services</h4>
            <div className="space-y-1 text-gray-600">
              <div className="flex justify-between"><span>MTN Data:</span><span>3.00%</span></div>
              <div className="flex justify-between"><span>Airtel Data:</span><span>3.40%</span></div>
              <div className="flex justify-between"><span>Glo Data:</span><span>4.00%</span></div>
              <div className="flex justify-between"><span>Smile:</span><span>5.00%</span></div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <h4 className="font-semibold text-gray-900 mb-2">TV & Others</h4>
            <div className="space-y-1 text-gray-600">
              <div className="flex justify-between"><span>DSTV:</span><span>1.50%</span></div>
              <div className="flex justify-between"><span>GOtv:</span><span>1.50%</span></div>
              <div className="flex justify-between"><span>Electricity:</span><span>0.9-2.0%</span></div>
              <div className="flex justify-between"><span>Insurance:</span><span>6.00%</span></div>
            </div>
          </div>
        </div>
        
        <p className="text-xs text-blue-700 mt-4">
          These are the commission rates we earn from VTPass for successful transactions. The discount rates you configure in Service Management determine how much of this commission is shared with users as instant discounts.
        </p>
      </div>
    </div>
  );
}