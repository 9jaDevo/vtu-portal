import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { 
  Key,
  Plus,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  Edit3,
  Calendar,
  Activity,
  AlertCircle,
  CheckCircle,
  Loader2,
  Code,
  Shield,
  Clock,
  BarChart3
} from 'lucide-react';
import { apiKeyService } from '../../services/apiKeyService';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';

interface ApiKey {
  id: string;
  name: string;
  permissions: string[];
  usage_limit?: number;
  usage_count: number;
  last_used?: string;
  status: 'active' | 'suspended' | 'revoked';
  created_at: string;
  updated_at: string;
}

interface CreateApiKeyForm {
  name: string;
  usage_limit?: number;
}

interface EditApiKeyForm {
  name: string;
  usage_limit?: number;
}

export function APIPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [showNewKey, setShowNewKey] = useState(false);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  const {
    register: registerCreate,
    handleSubmit: handleCreateSubmit,
    reset: resetCreate,
    formState: { errors: createErrors }
  } = useForm<CreateApiKeyForm>();

  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    setValue: setEditValue,
    formState: { errors: editErrors }
  } = useForm<EditApiKeyForm>();

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setIsLoading(true);
      const keys = await apiKeyService.getApiKeys();
      setApiKeys(keys);
    } catch (error: any) {
      console.error('Error fetching API keys:', error);
      toast.error('Failed to load API keys');
    } finally {
      setIsLoading(false);
    }
  };

  const onCreateApiKey = async (data: CreateApiKeyForm) => {
    try {
      setIsCreating(true);
      const response = await apiKeyService.generateApiKey({
        name: data.name,
        usage_limit: data.usage_limit || undefined
      });
      
      setNewApiKey(response.apiKey.key);
      setShowNewKey(true);
      toast.success('API key created successfully!');
      resetCreate();
      await fetchApiKeys();
    } catch (error: any) {
      console.error('Error creating API key:', error);
      toast.error(error.response?.data?.error || 'Failed to create API key');
    } finally {
      setIsCreating(false);
    }
  };

  const onEditApiKey = async (data: EditApiKeyForm) => {
    if (!editingKey) return;

    try {
      setIsUpdating(true);
      await apiKeyService.updateApiKey(editingKey.id, {
        name: data.name,
        usage_limit: data.usage_limit || undefined
      });
      
      toast.success('API key updated successfully!');
      setShowEditModal(false);
      setEditingKey(null);
      resetEdit();
      await fetchApiKeys();
    } catch (error: any) {
      console.error('Error updating API key:', error);
      toast.error(error.response?.data?.error || 'Failed to update API key');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRevokeKey = async (keyId: string, keyName: string) => {
    if (!confirm(`Are you sure you want to revoke the API key "${keyName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiKeyService.revokeApiKey(keyId);
      toast.success('API key revoked successfully');
      await fetchApiKeys();
    } catch (error: any) {
      console.error('Error revoking API key:', error);
      toast.error(error.response?.data?.error || 'Failed to revoke API key');
    }
  };

  const handleEditKey = (key: ApiKey) => {
    setEditingKey(key);
    setEditValue('name', key.name);
    setEditValue('usage_limit', key.usage_limit);
    setShowEditModal(true);
  };

  const copyToClipboard = async (text: string, keyId?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
      if (keyId) {
        setCopiedKeyId(keyId);
        setTimeout(() => setCopiedKeyId(null), 2000);
      }
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'revoked':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'suspended':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'revoked':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const activeKeys = apiKeys.filter(key => key.status === 'active');
  const totalUsage = apiKeys.reduce((sum, key) => sum + key.usage_count, 0);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">API Keys</h1>
            <p className="text-gray-600 mt-2">
              Manage your API keys for third-party integrations
            </p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            disabled={activeKeys.length >= 5}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create API Key
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Key className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{activeKeys.length}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Active Keys</h3>
            <p className="text-gray-600 text-sm">Out of 5 maximum</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{totalUsage.toLocaleString()}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Total Requests</h3>
            <p className="text-gray-600 text-sm">Across all keys</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {apiKeys.filter(key => key.last_used).length}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Keys in Use</h3>
            <p className="text-gray-600 text-sm">Recently active</p>
          </div>
        </div>

        {/* API Keys List */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Your API Keys</h2>
            <p className="text-gray-600 text-sm mt-1">
              Manage and monitor your API keys for external integrations
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading API keys...</p>
              </div>
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-12">
              <Key className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No API keys yet</h3>
              <p className="text-gray-500 mb-6">
                Create your first API key to start integrating with our services
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
              >
                Create API Key
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {apiKeys.map((key) => (
                <div key={key.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{key.name}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(key.status)}`}>
                          {getStatusIcon(key.status)}
                          <span className="ml-1 capitalize">{key.status}</span>
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          Created: {formatDate(key.created_at)}
                        </div>
                        <div className="flex items-center">
                          <Activity className="w-4 h-4 mr-2" />
                          Usage: {key.usage_count.toLocaleString()}
                          {key.usage_limit && ` / ${key.usage_limit.toLocaleString()}`}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          Last used: {key.last_used ? formatDate(key.last_used) : 'Never'}
                        </div>
                      </div>

                      {key.usage_limit && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600">Usage Progress</span>
                            <span className="text-gray-900 font-medium">
                              {Math.round((key.usage_count / key.usage_limit) * 100)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                (key.usage_count / key.usage_limit) >= 0.9 
                                  ? 'bg-red-500' 
                                  : (key.usage_count / key.usage_limit) >= 0.7 
                                    ? 'bg-yellow-500' 
                                    : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min((key.usage_count / key.usage_limit) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {key.status === 'active' && (
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleEditKey(key)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                          title="Edit API key"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRevokeKey(key.id, key.name)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                          title="Revoke API key"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* API Documentation Link */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Code className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  API Documentation
                </h3>
                <p className="text-gray-600">
                  Learn how to integrate our VTU services into your application
                </p>
              </div>
            </div>
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-200 border border-blue-200">
              View Docs
            </button>
          </div>
        </div>
      </div>

      {/* Create API Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
              onClick={() => setShowCreateModal(false)}
            />
            
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Create New API Key</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateSubmit(onCreateApiKey)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key Name
                  </label>
                  <input
                    {...registerCreate('name', {
                      required: 'API key name is required',
                      minLength: { value: 3, message: 'Name must be at least 3 characters' },
                      maxLength: { value: 100, message: 'Name must be less than 100 characters' }
                    })}
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Production API, Mobile App"
                  />
                  {createErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{createErrors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usage Limit <span className="text-gray-400">(Optional)</span>
                  </label>
                  <input
                    {...registerCreate('usage_limit', {
                      min: { value: 1, message: 'Usage limit must be at least 1' }
                    })}
                    type="number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 10000"
                  />
                  {createErrors.usage_limit && (
                    <p className="mt-1 text-sm text-red-600">{createErrors.usage_limit.message}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Leave empty for unlimited usage
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Important Security Note</p>
                      <p>Your API key will only be shown once. Make sure to copy and store it securely.</p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreating ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Creating...
                      </div>
                    ) : (
                      'Create API Key'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit API Key Modal */}
      {showEditModal && editingKey && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
              onClick={() => setShowEditModal(false)}
            />
            
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Edit API Key</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleEditSubmit(onEditApiKey)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key Name
                  </label>
                  <input
                    {...registerEdit('name', {
                      required: 'API key name is required',
                      minLength: { value: 3, message: 'Name must be at least 3 characters' },
                      maxLength: { value: 100, message: 'Name must be less than 100 characters' }
                    })}
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Production API, Mobile App"
                  />
                  {editErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{editErrors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usage Limit <span className="text-gray-400">(Optional)</span>
                  </label>
                  <input
                    {...registerEdit('usage_limit', {
                      min: { value: 1, message: 'Usage limit must be at least 1' }
                    })}
                    type="number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 10000"
                  />
                  {editErrors.usage_limit && (
                    <p className="mt-1 text-sm text-red-600">{editErrors.usage_limit.message}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Leave empty for unlimited usage
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Updating...
                      </div>
                    ) : (
                      'Update API Key'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* New API Key Display Modal */}
      {newApiKey && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
            
            <div className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">API Key Created Successfully!</h3>
                <p className="text-gray-600">
                  Copy your API key now. For security reasons, it won't be shown again.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your API Key
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type={showNewKey ? 'text' : 'password'}
                    value={newApiKey}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg font-mono text-sm"
                  />
                  <button
                    onClick={() => setShowNewKey(!showNewKey)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showNewKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(newApiKey)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-red-50 rounded-lg p-4 border border-red-200 mb-6">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
                  <div className="text-sm text-red-800">
                    <p className="font-medium mb-1">Important Security Warning</p>
                    <ul className="space-y-1">
                      <li>• This is the only time your API key will be displayed</li>
                      <li>• Store it securely in your application</li>
                      <li>• Never share it publicly or commit it to version control</li>
                      <li>• If lost, you'll need to create a new one</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => copyToClipboard(newApiKey)}
                  className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy API Key
                </button>
                <button
                  onClick={() => {
                    setNewApiKey(null);
                    setShowNewKey(false);
                    setShowCreateModal(false);
                  }}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  I've Saved It
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}