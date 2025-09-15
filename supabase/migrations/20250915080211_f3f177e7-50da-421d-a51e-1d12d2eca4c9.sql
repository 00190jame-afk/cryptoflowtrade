-- Move extensions to the recommended 'extensions' schema
CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION IF EXISTS pg_cron SET SCHEMA extensions;
ALTER EXTENSION IF EXISTS pg_net SET SCHEMA extensions;