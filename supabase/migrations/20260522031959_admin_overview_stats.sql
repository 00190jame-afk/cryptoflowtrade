-- Single-call overview stats so super admin doesn't download whole tables for counts
CREATE OR REPLACE FUNCTION public.admin_overview_stats()
RETURNS TABLE(
  total_users bigint,
  total_trades bigint,
  total_balance numeric,
  pending_withdrawals bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_any_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM public.profiles)::bigint,
    (SELECT COUNT(*) FROM public.trades WHERE status IN ('pending','active'))::bigint,
    COALESCE((SELECT SUM(balance) FROM public.user_balances), 0)::numeric,
    (SELECT COUNT(*) FROM public.withdraw_requests WHERE status = 'pending')::bigint;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_overview_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_overview_stats() TO authenticated;

-- Helpful additional indexes for the new query patterns
CREATE INDEX IF NOT EXISTS idx_trades_status_created_at ON public.trades(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_withdraw_requests_status_created_at ON public.withdraw_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_withdraw_requests_user_id_created_at ON public.withdraw_requests(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_positions_orders_user_id ON public.positions_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_closing_orders_user_id ON public.closing_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id_created_at ON public.messages(user_id, created_at DESC);
