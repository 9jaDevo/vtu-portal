import React, { useState, useEffect } from 'react';
import { 
  Activity,
  Search,
  Filter,
  Download,
  Eye,
  Smartphone,
  Wifi,
  Tv,
  Zap,
  GraduationCap,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpDown,
  Loader2,
  Calendar,
  User
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { toast } from 'react-hot-toast';

interface Transaction {
  id: string;
  type: 'airtime' | 'data' | 'tv' | 'electricity' | 'education' | 'insurance';
  amount: number;
  user_discount: number;
  total_amount: number;
  recipient: string;
  provider: string;
  status: 'pending' | 'success' | 'failed' | 'reversed';
  user_email: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

interface TransactionsResponse {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<TransactionsResponse['pagination'] | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    success: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    reversed: 'bg-gray-100 text-gray-800'
  };

  const typeIcons = {
    airtime: Smartphone,
    data: Wifi,
    tv: Tv,
    electricity: Zap,
    education: GraduationCap,
    insurance: Shield
  };

  const fetchTransactions = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const response = await adminService.getTransactions(
        page,
        20,
        filters.status || undefined,
        filters.type || undefined,
        filters.search || undefined
      );
      setTransactions(response.transactions);
      setPagination(response.pagination);
    } catch (error) {
      toast.error('Failed to fetch transactions');
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(currentPage);
  }, [currentPage, filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTransactions(1);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ status: '', type: '', search: '' });
    setCurrentPage(1);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportTransactions = () => {
    // Implementation for exporting transactions
    toast.success('Export functionality coming soon');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <ArrowUpDown className="w-4 h-4 text-gray-600" />;
    }
  };

  const TransactionModal = ({ transaction, onClose }: { transaction: Transaction; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Transaction Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Transaction ID</label>
                <p className="text-sm text-gray-900 font-mono">{transaction.id}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Type</label>
                <div className="flex items-center gap-2 mt-1">
                  {React.createElement(typeIcons[transaction.type], { className: "w-4 h-4" })}
                  <span className="text-sm text-gray-900 capitalize">{transaction.type}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Customer</label>
                <p className="text-sm text-gray-900">{transaction.first_name} {transaction.last_name}</p>
                <p className="text-sm text-gray-600">{transaction.user_email}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Recipient</label>
                <p className="text-sm text-gray-900">{transaction.recipient}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Provider</label>
                <p className="text-sm text-gray-900">{transaction.provider}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon(transaction.status)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[transaction.status]}`}>
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Amount</label>
                <p className="text-sm text-gray-900">{formatCurrency(transaction.amount)}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Discount</label>
                <p className="text-sm text-gray-900">{formatCurrency(transaction.user_discount)}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Total Amount</label>
                <p className="text-sm text-gray-900 font-medium">{formatCurrency(transaction.total_amount)}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Created At</label>
                <p className="text-sm text-gray-900">{formatDate(transaction.created_at)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-1">Monitor and manage all platform transactions</p>
        </div>
        <button
          onClick={exportTransactions}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </form>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="reversed">Reversed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="airtime">Airtime</option>
                <option value="data">Data</option>
                <option value="tv">TV</option>
                <option value="electricity">Electricity</option>
                <option value="education">Education</option>
                <option value="insurance">Insurance</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={clearFilters}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{transaction.recipient}</div>
                        <div className="text-sm text-gray-500">{transaction.provider}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {transaction.first_name} {transaction.last_name}
                            </div>
                            <div className="text-sm text-gray-500">{transaction.user_email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {React.createElement(typeIcons[transaction.type], { className: "w-4 h-4 text-gray-400 mr-2" })}
                          <span className="text-sm text-gray-900 capitalize">{transaction.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(transaction.total_amount)}</div>
                        {transaction.user_discount > 0 && (
                          <div className="text-xs text-green-600">
                            -{formatCurrency(transaction.user_discount)} discount
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(transaction.status)}
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${statusColors[transaction.status]}`}>
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(transaction.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedTransaction(transaction)}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {transactions.length === 0 && (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={!pagination.hasPrev}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                      disabled={!pagination.hasNext}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{' '}
                        <span className="font-medium">{((currentPage - 1) * pagination.limit) + 1}</span>
                        {' '}to{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * pagination.limit, pagination.total)}
                        </span>
                        {' '}of{' '}
                        <span className="font-medium">{pagination.total}</span>
                        {' '}results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={!pagination.hasPrev}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                          const page = i + 1;
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === page
                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                          disabled={!pagination.hasNext}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Transaction Modal */}
      {selectedTransaction && (
        <TransactionModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </div>
  );
}