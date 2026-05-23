import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminRole, AdminRole } from '@/hooks/useAdminRole';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader } from '@/components/ui/page-loader';
import { supabase } from '@/integrations/supabase/client';

interface AdminRouteProps {
  children: React.ReactNode;
  requiredRole: AdminRole;
}

export const AdminRoute = ({ children, requiredRole }: AdminRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useAdminRole();
  const [superAdminAllowed, setSuperAdminAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (requiredRole !== 'super_admin') return;
    if (authLoading) return;

    if (!user) {
      setSuperAdminAllowed(false);
      return;
    }

    let cancelled = false;
    setSuperAdminAllowed(null);

    supabase.rpc('is_super_admin')
      .then(({ data, error }) => {
        if (cancelled) return;
        setSuperAdminAllowed(!error && data === true);
      })
      .catch(() => {
        if (!cancelled) setSuperAdminAllowed(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, requiredRole, user]);

  if (authLoading || (requiredRole !== 'super_admin' && roleLoading)) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === 'super_admin') {
    if (superAdminAllowed === null) {
      return <PageLoader />;
    }

    if (!superAdminAllowed) {
      return <Navigate to="/" replace />;
    }

    return <>{children}</>;
  }

  if (requiredRole === 'super_admin' && role !== 'super_admin') {
    return <Navigate to="/" replace />;
  }

  if (requiredRole === 'admin' && role !== 'admin' && role !== 'super_admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
