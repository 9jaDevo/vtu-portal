import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '../../components/AdminLayout';
import { AdminDashboardPage } from './AdminDashboardPage';
import { AdminUsersPage } from './AdminUsersPage';
import { AdminTransactionsPage } from './AdminTransactionsPage';
import { AdminServicesPage } from './AdminServicesPage';
import { AdminSettingsPage } from './AdminSettingsPage';

export default function AdminPage() {
  return (
    <AdminLayout>
      <Routes>
        <Route index element={<AdminDashboardPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="transactions" element={<AdminTransactionsPage />} />
        <Route path="analytics" element={<div className="text-center py-12"><h2 className="text-2xl font-bold text-gray-900">Analytics</h2><p className="text-gray-600 mt-2">Analytics dashboard coming soon</p></div>} />
        <Route path="services" element={<AdminServicesPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
}