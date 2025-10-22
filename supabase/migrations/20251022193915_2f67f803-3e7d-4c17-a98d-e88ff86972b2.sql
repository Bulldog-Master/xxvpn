-- Schedule automated security tasks using pg_cron
-- All times are in UTC

-- 1. Daily security checks at 2 AM UTC
SELECT cron.schedule(
  'daily-security-checks',
  '0 2 * * *',
  $$
  SELECT public.run_security_checks();
  $$
);

-- 2. Cleanup old device IPs daily at 3 AM UTC (7 days retention)
SELECT cron.schedule(
  'cleanup-device-ips',
  '0 3 * * *',
  $$
  SELECT public.cleanup_old_device_ips();
  $$
);

-- 3. Cleanup old audit logs daily at 4 AM UTC (30 days retention)
SELECT cron.schedule(
  'cleanup-audit-logs',
  '0 4 * * *',
  $$
  SELECT public.cleanup_old_audit_logs();
  $$
);

-- 4. Cleanup old device data daily at 5 AM UTC (30 days for IP/OS, 180 days for inactive)
SELECT cron.schedule(
  'cleanup-device-data',
  '0 5 * * *',
  $$
  SELECT public.cleanup_old_device_data();
  $$
);

-- 5. Anonymize old VPN sessions daily at 6 AM UTC (30 days retention)
SELECT cron.schedule(
  'anonymize-vpn-sessions',
  '0 6 * * *',
  $$
  SELECT public.anonymize_old_vpn_sessions();
  $$
);

-- 6. Cleanup old webhook logs weekly on Sunday at 1 AM UTC (90 days retention)
SELECT cron.schedule(
  'cleanup-webhook-logs',
  '0 1 * * 0',
  $$
  SELECT public.cleanup_old_webhook_logs();
  $$
);

-- 7. Cleanup old error logs weekly on Sunday at 2 AM UTC (30 days retention)
SELECT cron.schedule(
  'cleanup-error-logs',
  '0 2 * * 0',
  $$
  SELECT public.cleanup_old_error_logs();
  $$
);

-- 8. Cleanup old analytics events monthly on 1st at 1 AM UTC (90 days retention)
SELECT cron.schedule(
  'cleanup-analytics-events',
  '0 1 1 * *',
  $$
  SELECT public.cleanup_old_analytics_events();
  $$
);

-- 9. Cleanup device access audit logs monthly on 1st at 2 AM UTC (90 days retention)
SELECT cron.schedule(
  'cleanup-device-access-audit',
  '0 2 1 * *',
  $$
  SELECT public.cleanup_device_access_audit();
  $$
);

-- 10. Cleanup old VPN sessions monthly on 1st at 3 AM UTC (30 days retention)
SELECT cron.schedule(
  'cleanup-vpn-sessions',
  '0 3 1 * *',
  $$
  SELECT public.cleanup_old_vpn_sessions();
  $$
);

-- Create a function to view scheduled jobs (super admin only)
CREATE OR REPLACE FUNCTION public.get_scheduled_security_jobs()
RETURNS TABLE(
  jobid bigint,
  schedule text,
  command text,
  nodename text,
  nodeport integer,
  database text,
  username text,
  active boolean,
  jobname text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only super admins can view scheduled jobs
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Super admin access required';
  END IF;

  RETURN QUERY
  SELECT 
    j.jobid,
    j.schedule,
    j.command,
    j.nodename,
    j.nodeport,
    j.database,
    j.username,
    j.active,
    j.jobname
  FROM cron.job j
  WHERE j.jobname IN (
    'daily-security-checks',
    'cleanup-device-ips',
    'cleanup-audit-logs',
    'cleanup-device-data',
    'anonymize-vpn-sessions',
    'cleanup-webhook-logs',
    'cleanup-error-logs',
    'cleanup-analytics-events',
    'cleanup-device-access-audit',
    'cleanup-vpn-sessions'
  );
END;
$$;