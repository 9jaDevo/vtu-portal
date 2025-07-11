import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { 
  Wallet, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  CreditCard,
  TrendingUp,
  TrendingDown,
  Calendar,
  Loader2,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { walletService } from '../../services/walletService';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';

interface WalletBalance {
  id: string;
  balance: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  balance_before: number;
  balance_after: number;
  reference: string;
  description: string;
  created_at: string;
}

interface WalletStats {
  total_credited: number;
  total_debited: number;
  credit_count: number;
  debit_count: number;
  monthly_credited: number;
  monthly_debited: number;
}

interface FundWalletForm {
  amount: number;
  payment_method: 'paystack';
  reference?: string;
}

declare global {
  interface Window {
    PaystackPop: {
      setup(options: PaystackOptions): { open: () => void };
    };
  }
}

interface PaystackOptions {
  key: string;
  email: string;
  amount: number;
  currency?: string;
  ref?: string;
  callback: (response: PaystackResponse) => void;
  onClose?: () => void;
  metadata?: any;
}

interface PaystackResponse {
  reference: string;
  trans: string;
  status: string;
  message: string;
  transaction: string;
  trxref: string;
}

export function WalletPage() {
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [isFunding, setIsFunding] = useState(false);
  const [showFundModal, setShowFundModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isPaystackReady, setIsPaystackReady] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const paymentStatus = searchParams.get('payment');
  const paymentReference = searchParams.get('reference');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<FundWalletForm>();

  const watchedFields = watch();

  useEffect(() => {
    fetchWalletData();
  }, []);

  useEffect(() => {
    fetchTransactions(currentPage);
  }, [currentPage]);

  // Handle payment verification after redirect back from Paystack
  useEffect(() => {
    const verifyPayment = async () => {
      if (paymentStatus === 'success' && paymentReference) {
        try {
          setIsLoading(true);
          const response = await walletService.verifyPayment(paymentReference);
          
          if (response.status === 'success') {
            toast.success('Payment successful! Your wallet has been credited.');
            // Clear the URL parameters to prevent repeated verifications
            navigate('/dashboard/wallet', { replace: true });
          } else {
            toast.error('Payment verification failed');
          }
          
          // Refresh wallet data after verification
          await fetchWalletData();
          await fetchTransactions(1);
        } catch (error: any) {
          console.error('Payment verification error:', error);
          toast.error(error.response?.data?.message || 'Payment verification failed');
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    if (paymentStatus && paymentReference) {
      verifyPayment();
    }
  }, [paymentStatus, paymentReference, navigate]);

  const fetchWalletData = async () => {
    try {
      setIsLoading(true);
      const [balanceData, statsData] = await Promise.all([
        walletService.getBalance(),
        walletService.getStats()
      ]);
      
      setWalletBalance(balanceData);
      setStats(statsData);
    } catch (error: any) {
      console.error('Error fetching wallet data:', error);
      toast.error('Failed to load wallet data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactions = async (page: number) => {
    try {
      setIsLoadingTransactions(true);
      const data = await walletService.getTransactions(page, 10);
      setTransactions(data.transactions);
      setTotalPages(data.pagination.totalPages);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const onFundWallet = async (data: FundWalletForm) => {
    try {
      setIsFunding(true);
      const response = await walletService.fundWallet({
        amount: data.amount,
        payment_method: 'paystack',
        payment_gateway: 'paystack',
      });
      
      // If we have an authorization URL, redirect to it
      if (response.authorization_url) {
        window.location.href = response.authorization_url;
      } else {
        toast.error('Failed to initialize payment');
        setIsFunding(false);
      }
    } catch (error: any) {
      console.error('Error funding wallet:', error);
      toast.error(error.response?.data?.error || 'Failed to fund wallet');
      setIsFunding(false);
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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading wallet...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Wallet Management</h1>
            <p className="text-gray-600 mt-2">Manage your wallet balance and view transaction history</p>
          </div>
          <button
            onClick={() => setShowFundModal(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Fund Wallet
          </button>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Current Balance</h2>
                <p className="text-blue-100 text-sm">Available for transactions</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">
                {walletBalance ? formatCurrency(walletBalance.balance) : '₦0.00'}
              </p>
              <p className="text-blue-100 text-sm">{walletBalance?.currency || 'NGN'}</p>
            </div>
          </div>
          
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-white/20">
              <div className="text-center">
                <p className="text-2xl font-bold">{formatCurrency(stats.total_credited)}</p>
                <p className="text-blue-100 text-sm">Total Credited</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{formatCurrency(stats.total_debited)}</p>
                <p className="text-blue-100 text-sm">Total Debited</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.credit_count}</p>
                <p className="text-blue-100 text-sm">Credits</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.debit_count}</p>
                <p className="text-blue-100 text-sm">Debits</p>
              </div>
            </div>
          )}
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Monthly Credits</h3>
                    <p className="text-sm text-gray-600">Money added this month</p>
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.monthly_credited)}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Monthly Debits</h3>
                    <p className="text-sm text-gray-600">Money spent this month</p>
                  </div>
                </div>
                <ArrowDownRight className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.monthly_debited)}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
            <p className="text-gray-600 text-sm mt-1">All wallet credits and debits</p>
          </div>
          
          <div className="p-6">
            {isLoadingTransactions ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8">
                <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No transactions yet</p>
                <p className="text-sm text-gray-400 mt-1">Your wallet transactions will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {transaction.type === 'credit' ? (
                          <ArrowUpRight className="w-5 h-5 text-green-600" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 capitalize">
                          {transaction.type === 'credit' ? 'Credit' : 'Debit'}
                        </p>
                        <p className="text-sm text-gray-600">{transaction.description}</p>
                        <p className="text-xs text-gray-500">Ref: {transaction.reference}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${
                        transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Balance: {formatCurrency(transaction.balance_after)}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(transaction.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showFundModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowFundModal(false)} />
            
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Fund Wallet</h3>
                <button
                  onClick={() => setShowFundModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit(onFundWallet)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (NGN)
                  </label>
                  <input
                    {...register('amount', {
                      required: 'Amount is required',
                      min: { value: 100, message: 'Minimum amount is ₦100' },
                      max: { value: 1000000, message: 'Maximum amount is ₦1,000,000' }
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    {...register('payment_method', { required: 'Payment method is required' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select payment method</option>
                    <option value="paystack">
                      Paystack (Card, Transfer, USSD)
                    </option>
                  </select>
                  {errors.payment_method && (
                    <p className="mt-1 text-sm text-red-600">{errors.payment_method.message}</p>
                  )}
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="text-sm text-blue-800">
                    You'll be redirected to a secure payment page to complete your transaction.
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowFundModal(false)}
                    className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isFunding}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isFunding ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Processing...
                      </div>
                    ) : (
                      'Proceed to Payment'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}