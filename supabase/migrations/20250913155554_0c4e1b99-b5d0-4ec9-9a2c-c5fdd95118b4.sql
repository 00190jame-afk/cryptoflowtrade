-- Ensure required extensions
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Recreate cron job to call auto-lose-trades every minute
select cron.unschedule('auto-lose-trades-every-minute');

select cron.schedule(
  'auto-lose-trades-every-minute',
  '* * * * *',
  $$
  select
    net.http_post(
      url := 'https://llvsxldpsdmhlzexioil.supabase.co/functions/v1/auto-lose-trades',
      headers := '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsdnN4bGRwc2RtaGx6ZXhpb2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NjEzMjcsImV4cCI6MjA3MjAzNzMyN30.4FLl8CFBCSc-doEzyIuXgR8P4vYbU-z8k3aTp48wm_I"}'::jsonb,
      body := jsonb_build_object('invoked_at', now())
    );
  $$
);
