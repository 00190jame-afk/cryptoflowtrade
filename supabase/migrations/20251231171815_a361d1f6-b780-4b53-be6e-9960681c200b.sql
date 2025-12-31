-- Remove the broken cron job that calls non-existent execute-trades function
SELECT cron.unschedule('execute-pending-trades');

-- Create new cron job to call auto-lose-trades every minute
SELECT cron.schedule(
  'auto-lose-trades-scheduler',
  '* * * * *',
  $$
  SELECT
    net.http_post(
        url:='https://llvsxldpsdmhlzexioil.supabase.co/functions/v1/auto-lose-trades',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsdnN4bGRwc2RtaGx6ZXhpb2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NjEzMjcsImV4cCI6MjA3MjAzNzMyN30.4FLl8CFBCSc-doEzyIuXgR8P4vYbU-z8k3aTp48wm_I"}'::jsonb,
        body:='{"source": "cron"}'::jsonb
    ) as request_id;
  $$
);