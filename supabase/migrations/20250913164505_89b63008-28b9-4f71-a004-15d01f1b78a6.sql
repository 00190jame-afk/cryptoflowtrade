-- Modify the trigger to handle manual win differently
-- When manually set to win, schedule completion with random duration instead of immediate finalization

create or replace function public.finalize_trade_positions()
returns trigger
language plpgsql
security definer
set search_path = 'public'
as $$
begin
  if tg_op = 'UPDATE' and OLD.status = 'pending' and NEW.status in ('win','lose') then
    -- If manually set to win, schedule future completion instead of immediate finalization
    if NEW.status = 'win' and NEW.completed_at IS NULL then
      -- Set a random completion time between 1-5 minutes from now
      NEW.ends_at := now() + (60 + (random() * 240))::integer * interval '1 second';
      -- Don't finalize yet, let the cron job handle it when ends_at is reached
      return NEW;
    end if;
    
    -- For lose status or already completed wins, proceed with immediate finalization
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