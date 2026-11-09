TRUNCATE cron.job_run_details;
TRUNCATE net._http_response;
SELECT cron.unschedule('cleanup-old-logs');
SELECT cron.schedule('cleanup-old-logs', '15 * * * *', $$
  DELETE FROM cron.job_run_details WHERE start_time < now() - interval '6 hours';
  DELETE FROM net._http_response WHERE created < now() - interval '1 hour';
$$);