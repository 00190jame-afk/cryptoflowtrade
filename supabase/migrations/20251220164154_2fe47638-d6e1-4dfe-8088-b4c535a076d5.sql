-- Create a cron job to automatically clean up old cron logs and HTTP response cache daily
SELECT cron.schedule(
  'cleanup-old-logs',
  '0 3 * * *', -- Run at 3 AM UTC every day
  $$
    -- Delete cron job logs older than 3 days
    DELETE FROM cron.job_run_details 
    WHERE start_time < NOW() - INTERVAL '3 days';
    
    -- Clear HTTP response cache
    DELETE FROM net._http_response;
  $$
);