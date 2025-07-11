import React, { useState, useEffect } from 'react';
import { 
  Users,
  Activity,
  CreditCard,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  Eye,
  UserCheck,
  UserX
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { toast } from 'react-hot-toast';

interface DashboardStats {
  users: {
    total_users: number;
    active_users: number;
    suspended_users: number;
    new_users_this_month: number;
  };
  transactions: {
    total_transactions: number;
    successful_transactions: number;
    failed_transactions: number;
    pending_transactions: number;
    total_volume: number;
    total_fees: number;
    transactions_this_month: number;
  };
  wallets: {
    total_wallet_balance: number;
    average_wallet_balance: number;
    total_wallets: number;
  };
}

interface RecentUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  status: string;
  created_at: string;
  wallet_balance: number;
}

interface RecentTransaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  user_email: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [statsData, usersData, transactionsData] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers(1, 5),
        adminService.getTransactions(1, 5)
      ]);

      setStats(statsData);
      setRecentUsers(usersData.users);
      setRecentTransactions(transactionsData.transactions);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'suspended':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'suspended':
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const dashboardCards = [
    {
      title: 'Total Users',
      value: stats?.users.total_users.toLocaleString() || '0',
      icon: Users,
      color: 'bg-blue-500',
      change: `+${stats?.users.new_users_this_month || 0} this month`,
      changeType: 'positive' as const
    },
    {
      title: 'Total Transactions',
      value: stats?.transactions.total_transactions.toLocaleString() || '0',
      icon: Activity,
      color: 'bg-green-500',
      change: `+${stats?.transactions.transactions_this_month || 0} this month`,
      changeType: 'positive' as const
    },
    {
      title: 'Transaction Volume',
      value: formatCurrency(stats?.transactions.total_volume || 0),
      icon: DollarSign,
      color: 'bg-purple-500',
      change: '+12.5% from last month',
      changeType: 'positive' as const
    },
    {
      title: 'Total Fees Collected',
      value: formatCurrency(stats?.transactions.total_fees || 0),
      icon: CreditCard,
      color: 'bg-yellow-500',
      change: '+8.3% from last month',
      changeType: 'positive' as const
    },
    {
      title: 'Success Rate',
      value: stats ? `${Math.round((stats.transactions.successful_transactions / stats.transactions.total_transactions) * 100)}%` : '100%',
      icon: CheckCircle,
      color: 'bg-emerald-500',
      change: '+0.2% from last month',
      changeType: 'positive' as const
    },
    {
      title: 'Wallet Balance',
      value: formatCurrency(stats?.wallets.total_wallet_balance || 0),
      icon: CreditCard,
      color: 'bg-indigo-500',
      change: '+15.2% from last month',
      changeType: 'positive' as const
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of platform performance and user activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <span className={`text-sm font-medium ${
                card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {card.changeType === 'positive' ? (
                  <TrendingUp className="w-4 h-4 inline mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 inline mr-1" />
                )}
                {card.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{card.value}</h3>
            <p className="text-gray-600 text-sm">{card.title}</p>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <UserCheck className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-gray-700">Active Users</span>
              </div>
              <span className="font-semibold text-green-600">
                {stats?.users.active_users.toLocaleString() || '0'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <UserX className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="text-gray-700">Suspended Users</span>
              </div>
              <span className="font-semibold text-yellow-600">
                {stats?.users.suspended_users.toLocaleString() || '0'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-gray-700">Successful</span>
              </div>
              <span className="font-semibold text-green-600">
                {stats?.transactions.successful_transactions.toLocaleString() || '0'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="text-gray-700">Pending</span>
              </div>
              <span className="font-semibold text-yellow-600">
                {stats?.transactions.pending_transactions.toLocaleString() || '0'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <XCircle className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-gray-700">Failed</span>
              </div>
              <span className="font-semibold text-red-600">
                {stats?.transactions.failed_transactions.toLocaleString() || '0'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Health</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">System Status</span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">API Response Time</span>
              <span className="font-semibold text-green-600">125ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Uptime</span>
              <span className="font-semibold text-green-600">99.9%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users */}
        <div className="bg-white rounded-2xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
              <button className="text-red-600 hover:text-red-700 font-medium flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                View All
              </button>
            </div>
          </div>
          <div className="p-6">
            {recentUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No recent users</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {getStatusIcon(user.status)}
                        <span className="ml-1 capitalize">{user.status}</span>
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(user.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
              <button className="text-red-600 hover:text-red-700 font-medium flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                View All
              </button>
            </div>
          </div>
          <div className="p-6">
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No recent transactions</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Activity className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 capitalize">{transaction.type}</p>
                        <p className="text-sm text-gray-600">
                          {transaction.first_name} {transaction.last_name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(transaction.amount)}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
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
      </div>

      {/* Alerts */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6">
        <div className="flex items-start">
          <AlertTriangle className="w-6 h-6 text-yellow-600 mr-3 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">System Alerts</h3>
            <div className="space-y-2">
              <p className="text-sm text-yellow-800">
                • High transaction volume detected - monitor system performance
              </p>
              <p className="text-sm text-yellow-800">
                • 3 users require manual verification review
              </p>
              <p className="text-sm text-yellow-800">
                • Scheduled maintenance window: Sunday 2:00 AM - 4:00 AM
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}