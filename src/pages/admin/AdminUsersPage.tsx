import React, { useState, useEffect } from 'react';
import { 
  Users,
  Search,
  Filter,
  Download,
  Eye,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Wallet,
  Loader2,
  CheckCircle,
  XCircle,
  Clock
  Key,
  CreditCard,
  DollarSign
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: string;
  status: 'active' | 'suspended' | 'pending';
  email_verified: boolean;
  created_at: string;
  wallet_balance: number;
}

interface ResetPasswordForm {
  newPassword: string;
  confirmPassword: string;
}

interface CreditWalletForm {
  amount: number;
}

interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<UsersResponse['pagination'] | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    role: '',
    search: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Password reset state and form
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors }
  } = useForm<ResetPasswordForm>();

  // Wallet credit state and form
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [isCreditingWallet, setIsCreditingWallet] = useState(false);
  const {
    register: registerCredit,
    handleSubmit: handleCreditSubmit,
    reset: resetCreditForm,
    formState: { errors: creditErrors }
  } = useForm<CreditWalletForm>();

  const limit = 20;

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const fetchUsers = async (page: number) => {
    const searchValue = filters.search.trim();
    try {
      setIsLoading(true);
      const data = await adminService.getUsers(
        page, 
        limit, 
        searchValue ? searchValue : undefined
      );
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserStatus = async (userId: string, newStatus: 'active' | 'suspended') => {
    try {
      setIsUpdating(true);
      await adminService.updateUserStatus(userId, newStatus);
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`);
      await fetchUsers(currentPage);
      setSelectedUser(null);
    } catch (error: any) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    } finally {
      setIsUpdating(false);
    }
  };

  const resetPassword = async (data: ResetPasswordForm) => {
    if (!selectedUser) return;
    
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setIsResettingPassword(true);
      await adminService.resetUserPassword(selectedUser.id, data.newPassword);
      toast.success('Password reset successfully');
      setShowPasswordModal(false);
      resetPasswordForm();
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast.error('Failed to reset password');
    } finally {
      setIsResettingPassword(false);
    }
  };

  const creditWallet = async (data: CreditWalletForm) => {
    if (!selectedUser) return;

    try {
      setIsCreditingWallet(true);
      const response = await adminService.creditUserWallet(selectedUser.id, data.amount);
      toast.success(`Wallet credited with ${formatCurrency(data.amount)}`);
      
      // Update the selected user's wallet balance
      if (selectedUser) {
        setSelectedUser({
          ...selectedUser,
          wallet_balance: response.newBalance
        });
      }
      
      // Refresh the users list to update the wallet balance
      await fetchUsers(currentPage);
      
      setShowCreditModal(false);
      resetCreditForm();
    } catch (error: any) {
      console.error('Error crediting wallet:', error);
      toast.error('Failed to credit wallet');
    } finally {
      setIsCreditingWallet(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(amount);
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
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'suspended':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  // Apply filters directly from the server response

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (pagination?.totalPages || 1)) {
      setCurrentPage(newPage);
    }
  };

  const exportUsers = () => {
    toast.success('Export feature coming soon!');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">
            Manage platform users and their accounts
            {pagination && (
              <span className="ml-2 text-sm">
                ({pagination.total} total users)
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-4 py-2 rounded-lg border transition-all duration-200 ${
              showFilters 
                ? 'bg-red-50 border-red-300 text-red-700' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
          <button
            onClick={exportUsers}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Users</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="user-search-input"
                  type="text"
                  placeholder="Search users..."
                  value={filters.search}
                  onChange={(e) => {
                    setFilters(prev => ({ ...prev, search: e.target.value }));
                    // Reload when search changes to empty
                    if (e.target.value.trim() === '' && filters.search.trim() !== '') {
                      fetchUsers(1);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      fetchUsers(1); // Fetch with current page 1 to reset pagination
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <button 
                  onClick={() => fetchUsers(1)} 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
                  title="Search"
                >
                  <Search className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={filters.role}
                onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          
          {(filters.search || filters.status || filters.role) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setFilters({ search: '', status: '', role: '' });
                  fetchUsers(1);
                }}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Reset Password Modal */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
              onClick={() => setShowPasswordModal(false)}
            />
            
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Reset User Password</h3>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handlePasswordSubmit(resetPassword)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User
                  </label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedUser.first_name} {selectedUser.last_name}</p>
                      <p className="text-sm text-gray-600">{selectedUser.email}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    {...registerPassword('newPassword', {
                      required: 'New password is required',
                      minLength: { value: 8, message: 'Password must be at least 8 characters' }
                    })}
                    type="password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter new password"
                  />
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    {...registerPassword('confirmPassword', {
                      required: 'Please confirm the new password',
                      validate: (value, formValues) => 
                        value === formValues.newPassword || 'Passwords do not match'
                    })}
                    type="password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Confirm new password"
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword.message}</p>
                  )}
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">Important</p>
                      <p>This action will reset the user's password. They will need to use this new password for their next login.</p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isResettingPassword}
                    className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isResettingPassword ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Resetting...
                      </div>
                    ) : (
                      'Reset Password'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Credit Wallet Modal */}
      {showCreditModal && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
              onClick={() => setShowCreditModal(false)}
            />
            
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Credit User Wallet</h3>
                <button
                  onClick={() => setShowCreditModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreditSubmit(creditWallet)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User
                  </label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedUser.first_name} {selectedUser.last_name}</p>
                      <p className="text-sm text-gray-600">{selectedUser.email}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Balance
                  </label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-gray-600 mr-2" />
                    <span className="font-medium text-gray-900">{formatCurrency(selectedUser.wallet_balance)}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount to Credit (NGN)
                  </label>
                  <input
                    {...registerCredit('amount', {
                      required: 'Amount is required',
                      min: { value: 1, message: 'Amount must be at least 1' },
                      max: { value: 1000000, message: 'Amount cannot exceed 1,000,000' }
                    })}
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter amount"
                  />
                  {creditErrors.amount && (
                    <p className="mt-1 text-sm text-red-600">{creditErrors.amount.message}</p>
                  )}
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                    <div className="text-sm text-green-800">
                      <p className="font-medium mb-1">Admin Credit</p>
                      <p>This action will immediately add funds to the user's wallet. This transaction will be recorded in the system.</p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreditModal(false)}
                    className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreditingWallet}
                    className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreditingWallet ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Processing...
                      </div>
                    ) : (
                      'Credit Wallet'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-red-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading users...</p>
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-500">
              {filters.search || filters.status || filters.role
                ? 'Try adjusting your filters to see more results.'
                : 'No users have registered yet.'
              }
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Wallet Balance
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                            <Users className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-sm text-gray-500 capitalize">
                              {user.role}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                        {user.phone && (
                          <div className="text-sm text-gray-500">{user.phone}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(user.status)}`}>
                          {getStatusIcon(user.status)}
                          <span className="ml-1 capitalize">{user.status}</span>
                        </span>
                        {user.email_verified && (
                          <div className="text-xs text-green-600 mt-1">Email verified</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(user.wallet_balance)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="text-red-600 hover:text-red-900 flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-gray-200">
              {users.map((user) => (
                <div key={user.id} className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                        <Users className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-gray-500 capitalize">
                          {user.role}
                        </div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(user.status)}`}>
                      {getStatusIcon(user.status)}
                      <span className="ml-1 capitalize">{user.status}</span>
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Email:</span>
                      <span className="text-sm text-gray-900">{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Phone:</span>
                        <span className="text-sm text-gray-900">{user.phone}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Wallet:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(user.wallet_balance)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Joined:</span>
                      <span className="text-sm text-gray-900">
                        {formatDate(user.created_at)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="w-full flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, pagination.total)} of {pagination.total} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!pagination.hasPrev}
                      className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      Previous
                    </button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                              currentPage === pageNum
                                ? 'bg-red-600 text-white'
                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!pagination.hasNext}
                      className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
              onClick={() => setSelectedUser(null)}
            />
            
            <div className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                    <Users className="w-10 h-10 text-gray-600" />
                  </div>
                </div>

                <div className="text-center mb-6">
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    {selectedUser.first_name} {selectedUser.last_name}
                  </h4>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedUser.status)}`}>
                    {getStatusIcon(selectedUser.status)}
                    <span className="ml-2 capitalize">{selectedUser.status}</span>
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-500">Email:</span>
                    </div>
                    <span className="text-sm text-gray-900">{selectedUser.email}</span>
                  </div>
                  
                  {selectedUser.phone && (
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-500">Phone:</span>
                      </div>
                      <span className="text-sm text-gray-900">{selectedUser.phone}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center">
                      <Wallet className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-500">Wallet Balance:</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(selectedUser.wallet_balance)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-500">Joined:</span>
                    </div>
                    <span className="text-sm text-gray-900">{formatDate(selectedUser.created_at)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Role:</span>
                    <span className="text-sm text-gray-900 capitalize">{selectedUser.role}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-gray-500">Email Verified:</span>
                    <span className={`text-sm font-medium ${selectedUser.email_verified ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedUser.email_verified ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                {selectedUser.role !== 'admin' && (
                  <div className="flex space-x-3 pt-6 border-t border-gray-200">
                    {selectedUser.status === 'active' ? (
                      <button
                        onClick={() => updateUserStatus(selectedUser.id, 'suspended')}
                        disabled={isUpdating}
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
                      >
                        {isUpdating ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <UserX className="w-4 h-4 mr-2" />
                        )}
                        Suspend User
                      </button>
                    ) : (
                      <button
                        onClick={() => updateUserStatus(selectedUser.id, 'active')}
                        disabled={isUpdating}
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
                      >
                        {isUpdating ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <UserCheck className="w-4 h-4 mr-2" />
                        )}
                        Activate User
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </div>
              <div className="grid grid-cols-2 gap-3 pt-6 border-t border-gray-200">
                {selectedUser.role !== 'admin' && (
                  <>
                    {selectedUser.status === 'active' ? (
                      <button
                        onClick={() => updateUserStatus(selectedUser.id, 'suspended')}
                        disabled={isUpdating}
                        className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
                      >
                        {isUpdating ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <UserX className="w-4 h-4 mr-2" />
                        )}
                        Suspend User
                      </button>
                    ) : (
                      <button
                        onClick={() => updateUserStatus(selectedUser.id, 'active')}
                        disabled={isUpdating}
                        className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
                      >
                        {isUpdating ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <UserCheck className="w-4 h-4 mr-2" />
                        )}
                        Activate User
                      </button>
                    )}
                  </>
                )}
                
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Reset Password
                </button>
                
                <button
                  onClick={() => setShowCreditModal(true)}
                  className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Credit Wallet
                </button>
                
                <button
                  onClick={() => setSelectedUser(null)}
                  className="col-span-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Close
                </button>
              </div>