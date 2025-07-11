import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { TransactionsPage } from './pages/dashboard/TransactionsPage';
import { APIDocsLandingPage } from './pages/APIDocsLandingPage';
import { AirtimeDocsPage } from './components/api-docs/AirtimeDocsPage';
import { DataDocsPage } from './components/api-docs/DataDocsPage';
import { TvDocsPage } from './components/api-docs/TvDocsPage';
import { ElectricityDocsPage } from './components/api-docs/ElectricityDocsPage';
import { EducationDocsPage } from './components/api-docs/EducationDocsPage';
import { InsuranceDocsPage } from './components/api-docs/InsuranceDocsPage';
import { APIDocsPage } from './pages/APIDocsPage';
import { MakeTransactionPage } from './pages/dashboard/MakeTransactionPage';
import { WalletPage } from './pages/dashboard/WalletPage';
import { APIPage } from './pages/dashboard/APIPage';
import AdminPage from './pages/admin/AdminPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/api-docs" element={<APIDocsLandingPage />} />
            <Route path="/api-docs/airtime" element={<AirtimeDocsPage />} />
            <Route path="/api-docs/data" element={<DataDocsPage />} />
            <Route path="/api-docs/tv" element={<TvDocsPage />} />
            <Route path="/api-docs/electricity" element={<ElectricityDocsPage />} />
            <Route path="/api-docs/education" element={<EducationDocsPage />} />
            <Route path="/api-docs/insurance" element={<InsuranceDocsPage />} />

            
            {/* Protected Dashboard Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/transactions" element={
              <ProtectedRoute>
                <TransactionsPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/make-transaction" element={
              <ProtectedRoute>
                <MakeTransactionPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/wallet" element={
              <ProtectedRoute>
                <WalletPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/api" element={
              <ProtectedRoute>
                <APIPage />
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin/*" element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            } />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;