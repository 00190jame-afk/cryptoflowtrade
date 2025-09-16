import React from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Shield, LogOut, Users, TrendingUp, Settings, FileText, UserCheck } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { adminProfile, signOut, isSuperAdmin } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: TrendingUp },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Trades', href: '/trades', icon: TrendingUp },
    { name: 'Invite Codes', href: '/invite-codes', icon: FileText },
    ...(isSuperAdmin ? [
      { name: 'Admin Management', href: '/admin-management', icon: UserCheck },
      { name: 'Settings', href: '/settings', icon: Settings },
    ] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b">
            <Shield className="h-8 w-8 text-primary" />
            <span className="ml-2 text-xl font-semibold">Admin Panel</span>
          </div>

          {/* User Info */}
          <div className="px-6 py-4 border-b bg-gray-50">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                  {adminProfile?.full_name?.charAt(0) || adminProfile?.email.charAt(0)}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {adminProfile?.full_name || 'Admin'}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {adminProfile?.role.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.href)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </button>
              );
            })}
          </nav>

          {/* Sign Out */}
          <div className="p-4 border-t">
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
};