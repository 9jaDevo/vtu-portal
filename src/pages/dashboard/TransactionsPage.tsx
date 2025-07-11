import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { 
  Activity,
  Smartphone,
  Wifi,
  Tv,
  Zap,
  GraduationCap,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Filter,
  Download,
  Search,
  Calendar,
  ArrowUpDown,
  Eye
} from 'lucide-react';
import { transactionService } from '../../services/transactionService';
import { toast } from 'react-hot-toast';

interface Transaction {
  id: string;
  type: 'airtime' | 'data' | 'tv' | 'electricity' | 'education' | 'insurance';
  amount: number;
  user_discount: number;
  total_amount: number;
  recipient: string;
  provider: string;
  plan_id?: string;
  status: 'pending' | 'success' | 'failed' | 'reversed';
  description: string;
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

export function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pagination, setPagination] = useState<TransactionsResponse['pagination'] | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    search: ''
  });

  const limit = 20;

  useEffect(() => {
    fetchTransactions(currentPage);
  }, [currentPage]);

  const fetchTransactions = async (page: number) => {
    try {
      setIsLoading(true);
      const data = await transactionService.getTransactions(page, limit);
      setTransactions(data.transactions);
      setPagination(data.pagination);
      setTotalPages(data.pagination.totalPages);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setIsLoading(false);
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
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'reversed':
        return <ArrowUpDown className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reversed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const filteredTransactions = transactions.filter(transaction => {
    const matchesStatus = !filters.status || transaction.status === filters.status;
    const matchesType = !filters.type || transaction.type === filters.type;
    const matchesSearch = !filters.search || 
      transaction.recipient.toLowerCase().includes(filters.search.toLowerCase()) ||
      transaction.provider.toLowerCase().includes(filters.search.toLowerCase()) ||
      transaction.description.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesStatus && matchesType && matchesSearch;
  });

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const exportTransactions = () => {
    // This would typically generate a CSV or PDF export
    toast.success('Export feature coming soon!');
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div> 
            <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
            <p className="text-gray-600 mt-2">
              View and manage all your transactions
              {pagination && (
                <span className="ml-2 text-sm">
                  ({pagination.total} total transactions)
                </span>
              )}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center px-4 py-2 rounded-lg border transition-all duration-200 ${
                showFilters 
                  ? 'bg-blue-50 border-blue-300 text-blue-700' 
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
            <button
              onClick={exportTransactions}
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Transactions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search recipient, provider..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  <option value="success">Success</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="reversed">Reversed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="airtime">Airtime</option>
                  <option value="data">Data</option>
                  <option value="tv">TV Subscription</option>
                  <option value="electricity">Electricity</option>
                  <option value="education">Education</option>
                  <option value="insurance">Insurance</option>
                </select>
              </div>
            </div>
            
            {(filters.search || filters.status || filters.type) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setFilters({ search: '', status: '', type: '' })}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading transactions...</p>
              </div>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-500">
                {filters.search || filters.status || filters.type
                  ? 'Try adjusting your filters to see more results.'
                  : 'Your transactions will appear here once you start making payments.'
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
                        Transaction
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Recipient
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                              {getTypeIcon(transaction.type)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 capitalize">
                                {transaction.type}
                              </div>
                              <div className="text-sm text-gray-500">
                                {transaction.provider}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{transaction.recipient}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(transaction.total_amount)}
                          </div>
                          {transaction.user_discount > 0 && (
                            <div className="text-xs text-green-600">
                              Discount: -{formatCurrency(transaction.user_discount)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(transaction.status)}`}>
                            {getStatusIcon(transaction.status)}
                            <span className="ml-1 capitalize">{transaction.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(transaction.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => setSelectedTransaction(transaction)}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
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
                {filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                          {getTypeIcon(transaction.type)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 capitalize">
                            {transaction.type}
                          </div>
                          <div className="text-sm text-gray-500">
                            {transaction.provider}
                          </div>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(transaction.status)}`}>
                        {getStatusIcon(transaction.status)}
                        <span className="ml-1 capitalize">{transaction.status}</span>
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Recipient:</span>
                        <span className="text-sm text-gray-900">{transaction.recipient}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Amount:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(transaction.total_amount)}
                        </span>
                      </div>
                      {transaction.user_discount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Discount:</span>
                          <span className="text-sm text-green-600">
                            -{formatCurrency(transaction.user_discount)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Date:</span>
                        <span className="text-sm text-gray-900">
                          {formatDate(transaction.created_at)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <button
                        onClick={() => setSelectedTransaction(transaction)}
                        className="w-full flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200"
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
                      
                      {/* Page Numbers */}
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                currentPage === pageNum
                                  ? 'bg-blue-600 text-white'
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
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
              onClick={() => setSelectedTransaction(null)}
            />
            
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Transaction Details</h3>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    {getTypeIcon(selectedTransaction.type)}
                  </div>
                </div>

                <div className="text-center mb-6">
                  <h4 className="text-xl font-semibold text-gray-900 capitalize mb-2">
                    {selectedTransaction.type} Purchase
                  </h4>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedTransaction.status)}`}>
                    {getStatusIcon(selectedTransaction.status)}
                    <span className="ml-2 capitalize">{selectedTransaction.status}</span>
                  </span>
                </div>

                <div className="space-y-3">
                  {selectedTransaction.purchased_code && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-500">Purchase Code/Token:</span>
                      <span className="text-sm font-mono bg-blue-50 px-2 py-1 rounded text-blue-700 select-all">
                        {selectedTransaction.purchased_code}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Transaction ID:</span>
                    <span className="text-sm text-gray-900 font-mono">{selectedTransaction.id.slice(0, 8)}...</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Provider:</span>
                    <span className="text-sm text-gray-900">{selectedTransaction.provider}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Recipient:</span>
                    <span className="text-sm text-gray-900">{selectedTransaction.recipient}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Amount:</span>
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(selectedTransaction.total_amount)}</span>
                  </div>
                  {selectedTransaction.user_discount > 0 && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-500">Discount:</span>
                      <span className="text-sm text-green-600">-{formatCurrency(selectedTransaction.user_discount || 0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Date:</span>
                    <span className="text-sm text-gray-900">{formatDate(selectedTransaction.created_at)}</span>
                  </div>
                  {selectedTransaction.description && (
                    <div className="py-2">
                      <span className="text-sm text-gray-500 block mb-1">Description:</span>
                      <span className="text-sm text-gray-900">{selectedTransaction.description}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Close
                </button>
                {selectedTransaction.purchased_code && (
                  <button
                    onClick={() => {
                      // Create a printable receipt
                      const printContent = `
                        <html>
                          <head>
                            <title>Transaction Receipt</title>
                            <style>
                              body {
                                font-family: Arial, sans-serif;
                                padding: 20px;
                                max-width: 400px;
                                margin: 0 auto;
                              }
                              h1 {
                                font-size: 18px;
                                text-align: center;
                                margin-bottom: 20px;
                              }
                              .logo {
                                text-align: center;
                                font-size: 24px;
                                font-weight: bold;
                                margin-bottom: 20px;
                              }
                              .info {
                                margin-bottom: 5px;
                                display: flex;
                                justify-content: space-between;
                              }
                              .info-label {
                                font-weight: bold;
                              }
                              .token {
                                text-align: center;
                                font-size: 18px;
                                font-weight: bold;
                                margin: 20px 0;
                                padding: 10px;
                                border: 1px dashed #000;
                              }
                              .footer {
                                text-align: center;
                                margin-top: 30px;
                                font-size: 12px;
                              }
                              @media print {
                                button {
                                  display: none;
                                }
                              }
                            </style>
                          </head>
                          <body>
                            <div class="logo">VTU Pro</div>
                            <h1>Transaction Receipt</h1>
                            <div class="info">
                              <span class="info-label">Transaction Type:</span>
                              <span>${selectedTransaction.type.toUpperCase()}</span>
                            </div>
                            <div class="info">
                              <span class="info-label">Provider:</span>
                              <span>${selectedTransaction.provider}</span>
                            </div>
                            <div class="info">
                              <span class="info-label">Recipient:</span>
                              <span>${selectedTransaction.recipient}</span>
                            </div>
                            <div class="info">
                              <span class="info-label">Amount:</span>
                              <span>${formatCurrency(selectedTransaction.total_amount)}</span>
                            </div>
                            <div class="info">
                              <span class="info-label">Status:</span>
                              <span>${selectedTransaction.status.toUpperCase()}</span>
                            </div>
                            <div class="info">
                              <span class="info-label">Date:</span>
                              <span>${formatDate(selectedTransaction.created_at)}</span>
                            </div>
                            <div class="token">
                              ${selectedTransaction.purchased_code}
                            </div>
                            <div class="footer">
                              Thank you for using VTU Pro. For any issues, please contact our support.
                            </div>
                            <div style="text-align: center; margin-top: 20px;">
                              <button onclick="window.print()" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer;">
                                Print Receipt
                              </button>
                            </div>
                          </body>
                        </html>
                      `;
                      
                      // Open print window
                      const printWindow = window.open('', '_blank');
                      if (printWindow) {
                        printWindow.document.write(printContent);
                        printWindow.document.close();
                        printWindow.focus();
                        // You can auto-print by uncommenting the next line
                        // printWindow.print();
                      } else {
                        toast.error('Please allow pop-ups to print receipts');
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Print Receipt
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}