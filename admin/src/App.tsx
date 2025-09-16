import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from '@/contexts/AdminAuthContext';
import { AuthPage } from '@/pages/AuthPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { UsersPage } from '@/pages/UsersPage';
import { TradesPage } from '@/pages/TradesPage';
import { InviteCodesPage } from '@/pages/InviteCodesPage';
import { AdminManagementPage } from '@/pages/AdminManagementPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { AdminLayout } from '@/components/AdminLayout';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, adminProfile, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !adminProfile) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, adminProfile, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (user && adminProfile) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route
        path="/auth"
        element={
          <PublicRoute>
            <AuthPage />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Navigate to="/dashboard" replace />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <DashboardPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <UsersPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/trades"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <TradesPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/invite-codes"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <InviteCodesPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-management"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <AdminManagementPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <SettingsPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <AdminAuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AdminAuthProvider>
  );
}

export default App;