SELECT cron.unschedule('auto-lose-trades-scheduler');
SELECT cron.schedule(
  'auto-lose-trades-scheduler',
  '* * * * *',
  $$
  SELECT net.http_post(
    url:='https://llvsxldpsdmhlzexioil.supabase.co/functions/v1/auto-lose-trades',
    headers:='{"Content-Type": "application/json", "x-cron-secret": "beab087a61b3f4403b545f2348c16285636ad217a8657a86"}'::jsonb,
    body:='{"source": "cron"}'::jsonb
  ) as request_id;
  $$
);