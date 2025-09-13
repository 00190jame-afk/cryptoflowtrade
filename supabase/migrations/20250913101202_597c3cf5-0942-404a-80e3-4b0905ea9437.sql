-- Move pg_cron and pg_net extensions to proper schema
DROP EXTENSION IF EXISTS pg_cron CASCADE;
DROP EXTENSION IF EXISTS pg_net CASCADE;

-- Create extensions in extensions schema (if it doesn't exist)
CREATE SCHEMA IF NOT EXISTS extensions;

-- Install extensions in extensions schema
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Re-create cron job with correct extension reference
SELECT extensions.cron.schedule(
  'auto-lose-expired-trades',
  '* * * * *', -- every minute
  $$
  SELECT extensions.net.http_post(
    url := 'https://llvsxldpsdmhlzexioil.supabase.co/functions/v1/auto-lose-trades',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsdnN4bGRwc2RtaGx6ZXhpb2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NjEzMjcsImV4cCI6MjA3MjAzNzMyN30.4FLl8CFBCSc-doEzyIuXgR8P4vYbU-z8k3aTp48wm_I"}'::jsonb,
    body := '{"timestamp": "' || now() || '"}'::jsonb
  ) as request_id;
  $$
);