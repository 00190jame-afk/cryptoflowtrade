import { Navigate } from 'react-router-dom';
import { useAdminRole, AdminRole } from '@/hooks/useAdminRole';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader } from '@/components/ui/page-loader';

interface AdminRouteProps {
  children: React.ReactNode;
  requiredRole: AdminRole;
}

export const AdminRoute = ({ children, requiredRole }: AdminRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useAdminRole();

  if (authLoading || roleLoading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === 'super_admin' && role !== 'super_admin') {
    return <Navigate to="/" replace />;
  }

  if (requiredRole === 'admin' && role !== 'admin' && role !== 'super_admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
