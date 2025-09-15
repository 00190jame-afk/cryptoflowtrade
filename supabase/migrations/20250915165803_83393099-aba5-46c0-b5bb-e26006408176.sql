-- Step 1: Remove all duplicates keeping only the first one by ID for each trade
WITH numbered_rows AS (
  SELECT id,
    ROW_NUMBER() OVER (PARTITION BY original_trade_id ORDER BY created_at, id) as rn
  FROM public.closing_orders
  WHERE original_trade_id IS NOT NULL
)
DELETE FROM public.closing_orders 
WHERE id IN (
  SELECT id FROM numbered_rows WHERE rn > 1
);

-- Step 2: Add unique constraint to prevent future duplicates
ALTER TABLE public.closing_orders 
ADD CONSTRAINT closing_orders_trade_unique 
UNIQUE (original_trade_id);

-- Step 3: Update the finalize_trade_positions function to be idempotent
CREATE OR REPLACE FUNCTION public.finalize_trade_positions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Only process LOSE trades immediately, not WIN trades
  -- WIN trades are processed by edge function after ends_at
  IF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status = 'lose' THEN
    
    -- Check if closing orders already exist for this trade (idempotency)
    IF NOT EXISTS (
      SELECT 1 FROM public.closing_orders 
      WHERE original_trade_id = NEW.id
    ) THEN
      -- Create closing orders from any open positions for LOSS
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
        ROUND((-COALESCE(po.stake, 0))::numeric, 2) AS realized_pnl, -- Loss = negative stake
        NEW.id AS original_trade_id,
        po.stake,
        po.scale
      FROM public.positions_orders po
      WHERE po.trade_id = NEW.id;
    END IF;

    -- Remove positions after creating closing orders for LOSS
    DELETE FROM public.positions_orders po WHERE po.trade_id = NEW.id;
  END IF;

  -- NOTE: WIN trades are NOT processed here - they are handled by edge function
  -- after ends_at time is reached to ensure proper timing

  RETURN NEW;
END;
$function$;