-- Move positions to closing orders when a trade is finalized (win/lose)
-- Creates a trigger that reacts to status changes, including those made by the cron job

create or replace function public.finalize_trade_positions()
returns trigger
language plpgsql
security definer
set search_path = 'public'
as $$
begin
  if tg_op = 'UPDATE' and OLD.status = 'pending' and NEW.status in ('win','lose') then
    -- Insert a closing order for each open position on this trade
    insert into public.closing_orders (
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
    select
      po.user_id,
      po.symbol,
      po.side,
      po.leverage,
      po.entry_price,
      coalesce(NEW.current_price, po.mark_price, po.entry_price) as exit_price,
      po.quantity,
      case
        when NEW.status = 'win' then round((coalesce(po.stake, 0) * NEW.profit_rate / 100.0)::numeric, 2)
        else round((-coalesce(po.stake, 0))::numeric, 2)
      end as realized_pnl,
      NEW.id as original_trade_id,
      po.stake,
      po.scale
    from public.positions_orders po
    where po.trade_id = NEW.id;

    -- Remove positions after creating closing orders
    delete from public.positions_orders po where po.trade_id = NEW.id;

    -- Mark the trade indicator as completed for clarity
    update public.trades t
      set status_indicator = '⚪️ COMPLETED'
    where t.id = NEW.id;
  end if;

  return NEW;
end;
$$;

-- Ensure a clean trigger creation (drop if exists, then create)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_trades_finalize_close_positions') THEN
    DROP TRIGGER trg_trades_finalize_close_positions ON public.trades;
  END IF;
END;$$;

create trigger trg_trades_finalize_close_positions
after update on public.trades
for each row
execute function public.finalize_trade_positions();