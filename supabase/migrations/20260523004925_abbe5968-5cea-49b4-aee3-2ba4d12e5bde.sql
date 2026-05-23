CREATE INDEX IF NOT EXISTS idx_trades_status_created_at ON public.trades(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_withdraw_requests_status_created_at ON public.withdraw_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_withdraw_requests_user_id_created_at ON public.withdraw_requests(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_positions_orders_user_id ON public.positions_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_closing_orders_user_id ON public.closing_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id_created_at ON public.messages(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trades_execute_at_active ON public.trades(execute_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_trades_decision ON public.trades(decision) WHERE decision IS NOT NULL;