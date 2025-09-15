-- Fix cron job setup for auto-lose-trades
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