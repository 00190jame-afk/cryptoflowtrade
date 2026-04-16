
-- Fix admin_profiles sequential scans (16.6M scans on 3 rows)
CREATE INDEX IF NOT EXISTS idx_admin_profiles_user_id ON public.admin_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_user_role_active ON public.admin_profiles(user_id, role, is_active);

-- Fix trades performance
CREATE INDEX IF NOT EXISTS idx_trades_user_id_status ON public.trades(user_id, status);

-- Fix invite_codes performance
CREATE INDEX IF NOT EXISTS idx_invite_codes_created_by ON public.invite_codes(created_by);
CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON public.invite_codes(code);

-- Fix profiles performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- Fix user_balances performance
CREATE INDEX IF NOT EXISTS idx_user_balances_user_id ON public.user_balances(user_id);
