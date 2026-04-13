import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AdminRole = 'super_admin' | 'admin' | 'user';

interface AdminProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
  primary_invite_code: string | null;
  created_at: string;
  updated_at: string;
}

interface UseAdminRoleReturn {
  role: AdminRole;
  loading: boolean;
  adminProfile: AdminProfile | null;
}

export const useAdminRole = (): UseAdminRoleReturn => {
  const { user } = useAuth();
  const [role, setRole] = useState<AdminRole>('user');
  const [loading, setLoading] = useState(true);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);

  useEffect(() => {
    if (!user) {
      setRole('user');
      setAdminProfile(null);
      setLoading(false);
      return;
    }

    const checkRole = async () => {
      try {
        const { data, error } = await supabase
          .from('admin_profiles')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setAdminProfile(data);
          setRole(data.role === 'super_admin' ? 'super_admin' : 'admin');
        } else {
          setRole('user');
          setAdminProfile(null);
        }
      } catch (err) {
        console.error('Error checking admin role:', err);
        setRole('user');
        setAdminProfile(null);
      } finally {
        setLoading(false);
      }
    };

    checkRole();
  }, [user]);

  return { role, loading, adminProfile };
};
