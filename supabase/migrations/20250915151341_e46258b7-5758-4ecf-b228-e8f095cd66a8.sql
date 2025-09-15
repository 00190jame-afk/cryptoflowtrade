-- Fix trading logic: auto-lose after duration, proper stake handling, win finalization

-- 1. Update trg_trades_set_duration to generate 3-5 minute random duration
CREATE OR REPLACE FUNCTION public.trg_trades_set_duration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  IF NEW.trade_duration IS NULL THEN
    NEW.trade_duration := 180 + (random() * 120)::integer; -- 3-5 minutes in seconds
  END IF;
  IF NEW.ends_at IS NULL THEN
    NEW.ends_at := COALESCE(NEW.created_at, now()) + (NEW.trade_duration || ' seconds')::interval;
  END IF;
  RETURN NEW;
END;
$function$;

-- 2. Update stake deduction trigger to run AFTER INSERT (already exists but ensure it's correct)
CREATE OR REPLACE FUNCTION public.trg_trades_after_insert_deduct_stake()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Deduct the stake upfront from user's available balance
  PERFORM public.update_user_balance(NEW.user_id, -NEW.stake_amount, 'system_trade', 'Trade stake deducted', NEW.id);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- If deduction fails (e.g., insufficient balance), raise to prevent creating the trade
  RAISE;
END;
$function$;

-- 3. Update finalize_trade_positions to only handle 'lose' immediately, 'win' waits for scheduler
CREATE OR REPLACE FUNCTION public.finalize_trade_positions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status IN ('win','lose') THEN
    -- For LOSE: create closing orders immediately and remove positions
    IF NEW.status = 'lose' THEN
      INSERT INTO public.closing_orders (
        user_id,
        symbol,
        side,
        leverage,
        entry_price,
        exit_price,
        quantity,
        realized_pnl,
        original_trade_id,
        stake,
        scale
      )
      SELECT
        po.user_id,
        po.symbol,
        po.side,
        po.leverage,
        po.entry_price,
        COALESCE(NEW.current_price, po.mark_price, po.entry_price) AS exit_price,
        po.quantity,
        ROUND((-COALESCE(po.stake, 0))::numeric, 2) AS realized_pnl,
        NEW.id AS original_trade_id,
        po.stake,
        po.scale
      FROM public.positions_orders po
      WHERE po.trade_id = NEW.id;

      -- Remove positions after creating closing orders
      DELETE FROM public.positions_orders po WHERE po.trade_id = NEW.id;
    END IF;
    
    -- For WIN: do nothing here, let edge function handle after ends_at
  END IF;

  RETURN NEW;
END;
$function$;

-- 4. Ensure triggers are properly attached
DROP TRIGGER IF EXISTS trg_trades_set_duration ON public.trades;
CREATE TRIGGER trg_trades_set_duration
  BEFORE INSERT ON public.trades
  FOR EACH ROW EXECUTE FUNCTION public.trg_trades_set_duration();

DROP TRIGGER IF EXISTS trg_trades_after_insert_deduct_stake ON public.trades;
CREATE TRIGGER trg_trades_after_insert_deduct_stake
  AFTER INSERT ON public.trades
  FOR EACH ROW EXECUTE FUNCTION public.trg_trades_after_insert_deduct_stake();

DROP TRIGGER IF EXISTS trg_trades_finalize_positions ON public.trades;
CREATE TRIGGER trg_trades_finalize_positions
  AFTER UPDATE ON public.trades
  FOR EACH ROW EXECUTE FUNCTION public.finalize_trade_positions();

-- 5. Set up cron job to call auto-lose-trades every minute
SELECT cron.unschedule('auto-lose-trades');
SELECT cron.schedule(
  'auto-lose-trades',
  '* * * * *', -- every minute
  $$
  SELECT net.http_post(
    url := 'https://llvsxldpsdmhlzexioil.supabase.co/functions/v1/auto-lose-trades',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsdnN4bGRwc2RtaGx6ZXhpb2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NjEzMjcsImV4cCI6MjA3MjAzNzMyN30.4FLl8CFBCSc-doEzyIuXgR8P4vYbU-z8k3aTp48wm_I"}'::jsonb,
    body := '{"scheduled": true}'::jsonb
  ) as request_id;
  $$
);