-- Simple cron job to auto-lose expired trades
select cron.schedule(
  'auto-lose-trades',
  '* * * * *',
  $$
    UPDATE public.trades
    SET status = 'lose',
        completed_at = now(),
        result = 'loss',
        profit_loss_amount = -stake_amount
    WHERE status = 'pending'
      AND ends_at IS NOT NULL
      AND ends_at < now();
  $$
);