-- One-time cleanup of stale/erroneous positions for the affected user
-- Deletes positions linked to completed (win/lose) trades, expired trades, and orphaned positions with no trade

-- 1) Remove positions tied to trades that are already finished (win/lose) or completed
DELETE FROM public.positions_orders po
USING public.trades t
WHERE po.user_id = '6c73ea96-f490-4f51-b65f-13d821588602'
  AND po.trade_id = t.id
  AND (
    t.status IN ('win','lose')
    OR t.completed_at IS NOT NULL
  );

-- 2) Remove positions for trades whose scheduled end has already passed (expired)
DELETE FROM public.positions_orders po
USING public.trades t
WHERE po.user_id = '6c73ea96-f490-4f51-b65f-13d821588602'
  AND po.trade_id = t.id
  AND t.ends_at IS NOT NULL
  AND t.ends_at <= now();

-- 3) Remove orphan positions with no trade reference (defensive)
DELETE FROM public.positions_orders po
WHERE po.user_id = '6c73ea96-f490-4f51-b65f-13d821588602'
  AND po.trade_id IS NULL;