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

// Module-scope cache so multiple components hitting useAdminRole during the
// same session don't each fire their own admin_profiles query.
type CacheEntry = { role: AdminRole; profile: AdminProfile | null };
const roleCache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<CacheEntry>>();

async function loadRole(userId: string): Promise<CacheEntry> {
  if (roleCache.has(userId)) return roleCache.get(userId)!;
  if (inflight.has(userId)) return inflight.get(userId)!;

  const promise = (async () => {
    const { data, error } = await supabase
      .from('admin_profiles')
      .select('id, user_id, email, full_name, role, is_active, primary_invite_code, created_at, updated_at')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;

    const entry: CacheEntry = data
      ? { role: data.role === 'super_admin' ? 'super_admin' : 'admin', profile: data as AdminProfile }
      : { role: 'user', profile: null };
    roleCache.set(userId, entry);
    return entry;
  })().finally(() => inflight.delete(userId));

  inflight.set(userId, promise);
  return promise;
}

export const useAdminRole = (): UseAdminRoleReturn => {
  const { user } = useAuth();
  const cached = user ? roleCache.get(user.id) : undefined;
  const [role, setRole] = useState<AdminRole>(cached?.role ?? 'user');
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(cached?.profile ?? null);
  const [loading, setLoading] = useState(!cached && !!user);

  useEffect(() => {
    if (!user) {
      setRole('user');
      setAdminProfile(null);
      setLoading(false);
      return;
    }

    const cachedEntry = roleCache.get(user.id);
    if (cachedEntry) {
      setRole(cachedEntry.role);
      setAdminProfile(cachedEntry.profile);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    loadRole(user.id)
      .then(({ role, profile }) => {
        if (cancelled) return;
        setRole(role);
        setAdminProfile(profile);
      })
      .catch((err) => {
        console.error('Error checking admin role:', err);
        if (!cancelled) {
          setRole('user');
          setAdminProfile(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  return { role, loading, adminProfile };
};
