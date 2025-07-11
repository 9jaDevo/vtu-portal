import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { CreditCard, CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. No token provided.');
        return;
      }

      try {
        const response = await apiClient.post('/auth/verify-email', { token });
        setStatus('success');
        setMessage(response.data.message);
        toast.success('Email verified successfully!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.error || 'Email verification failed');
        toast.error('Email verification failed');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              VTU Pro
            </span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Email Verification
          </h2>
          <p className="text-gray-600">
            Verifying your email address
          </p>
        </div>

        {/* Verification Status */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <div className="text-center">
            {status === 'loading' && (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Verifying your email...
                </h3>
                <p className="text-gray-600">
                  Please wait while we verify your email address.
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-green-900">
                  Email Verified Successfully!
                </h3>
                <p className="text-green-700">
                  {message}
                </p>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="text-sm text-green-800">
                    You will be redirected to the login page in a few seconds, or you can click the button below.
                  </p>
                </div>
                <Link
                  to="/login"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Continue to Login
                </Link>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-red-900">
                  Verification Failed
                </h3>
                <p className="text-red-700">
                  {message}
                </p>
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <p className="text-sm text-red-800 mb-3">
                    This could happen if:
                  </p>
                  <ul className="text-sm text-red-700 space-y-1 text-left">
                    <li>• The verification link has expired</li>
                    <li>• The link has already been used</li>
                    <li>• The link is invalid or corrupted</li>
                  </ul>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    to="/register"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Register Again
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                  >
                    Back to Login
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
            <Mail className="w-5 h-5 text-blue-600 mr-2" />
            Need Help?
          </h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>If you're having trouble with email verification:</p>
            <ul className="space-y-1 ml-4">
              <li>• Check your spam/junk folder</li>
              <li>• Make sure you clicked the correct link</li>
              <li>• Try registering again if the link expired</li>
              <li>• Contact support if issues persist</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}