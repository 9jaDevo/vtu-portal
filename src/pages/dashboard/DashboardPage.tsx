import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { 
  CreditCard, 
  TrendingUp, 
  Activity,
  Smartphone,
  Wifi,
  Tv,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Plus
} from 'lucide-react';
import { walletService } from '../../services/walletService';
import { transactionService } from '../../services/transactionService';
import { toast } from 'react-hot-toast';

interface DashboardStats {
  walletBalance: number;
  totalTransactions: number;
  monthlyAmount: number;
  totalDiscountsGiven: number;
  totalDiscountsGiven: number;
  successRate: number;
}

interface RecentTransaction {
  id: string;
  type: string;
  recipient: string;
  amount: number;
  status: string;
  created_at: string;
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const quickActions = [
    { name: 'Buy Airtime', icon: Smartphone, color: 'bg-blue-500', href: '/dashboard/make-transaction' },
    { name: 'Data Bundle', icon: Wifi, color: 'bg-green-500', href: '/dashboard/make-transaction' },
    { name: 'TV Subscription', icon: Tv, color: 'bg-purple-500', href: '/dashboard/make-transaction' },
    { name: 'Electricity', icon: Zap, color: 'bg-yellow-500', href: '/dashboard/make-transaction' }
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch wallet balance and transaction stats in parallel
        const [walletData, transactionStats, transactionsData] = await Promise.all([
          walletService.getBalance(),
          transactionService.getStats(),
          transactionService.getTransactions(1, 5) // Get 5 recent transactions
        ]);

        // Calculate success rate
        const successRate = transactionStats.total_transactions > 0 
          ? (transactionStats.successful_transactions / transactionStats.total_transactions) * 100 
          : 100;

        setStats({
          walletBalance: walletData.balance,
          totalTransactions: transactionStats.total_transactions,
          monthlyAmount: transactionStats.monthly_amount || 0, 
          totalDiscountsGiven: transactionStats.total_discounts_given || 0,
          successRate: Math.round(successRate * 10) / 10 // Round to 1 decimal place
        });

        setRecentTransactions(transactionsData.transactions);
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const dashboardStats = [
    {
      title: 'Wallet Balance',
      value: stats ? formatCurrency(stats.walletBalance) : '₦0.00', 
      icon: CreditCard,
      color: 'bg-blue-500',
      change: '+2.5%',
      changeType: 'positive' as const
    },
    {
      title: 'Total Transactions',
      value: stats ? stats.totalTransactions.toLocaleString() : '0',
      icon: Activity,
      color: 'bg-green-500',
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      title: 'This Month',
      value: stats ? formatCurrency(stats.monthlyAmount) : '₦0.00',
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: '+8.2%',
      changeType: 'positive' as const
    },
    {
      title: 'Average Savings',
      value: stats ? formatCurrency(stats.totalDiscountsGiven || 0) : '₦0.00',
      icon: CheckCircle,
      color: 'bg-emerald-500',
      change: 'instant savings',
      changeType: 'positive' as const
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
            <p className="text-gray-600 mt-2">Here's what's happening with your account today.</p>
          </div>
          <Link
            to="/dashboard/make-transaction"
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Transaction
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardStats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-gray-600 text-sm">{stat.title}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.href}
                className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
              >
                <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-900 text-center">{action.name}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
            <Link 
              to="/dashboard/transactions"
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              View All
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          {recentTransactions.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No transactions yet</p>
              <p className="text-sm text-gray-400 mt-1">Your recent transactions will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      {transaction.type === 'airtime' && <Smartphone className="w-5 h-5 text-blue-600" />}
                      {transaction.type === 'data' && <Wifi className="w-5 h-5 text-blue-600" />}
                      {transaction.type === 'tv' && <Tv className="w-5 h-5 text-blue-600" />}
                      {transaction.type === 'electricity' && <Zap className="w-5 h-5 text-blue-600" />}
                      {!['airtime', 'data', 'tv', 'electricity'].includes(transaction.type) && 
                        <Activity className="w-5 h-5 text-blue-600" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 capitalize">{transaction.type}</p>
                      <p className="text-sm text-gray-600">{transaction.recipient}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(transaction.amount)}</p>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                        {getStatusIcon(transaction.status)}
                        <span className="ml-1 capitalize">{transaction.status}</span>
                      </span>
                      <span className="text-xs text-gray-500">{formatDate(transaction.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}