-- Security Enhancement: Automated Audit Log Cleanup
-- Set up cron job to automatically clean up old audit logs

-- Create cron schedule to run cleanup daily at 2 AM UTC
SELECT cron.schedule(
  'cleanup-audit-logs-daily',
  '0 2 * * *', -- Daily at 2 AM
  $$
  SELECT public.cleanup_old_audit_logs();
  $$
);

-- Create cron schedule for VPN session cleanup
SELECT cron.schedule(
  'cleanup-vpn-sessions-daily',
  '0 3 * * *', -- Daily at 3 AM
  $$
  SELECT public.cleanup_old_vpn_sessions();
  $$
);

-- Create cron schedule for device data cleanup  
SELECT cron.schedule(
  'cleanup-device-data-daily',
  '0 4 * * *', -- Daily at 4 AM
  $$
  SELECT public.cleanup_old_device_data();
  $$
);

-- Create cron schedule for device IP cleanup
SELECT cron.schedule(
  'cleanup-device-ips-daily',
  '0 5 * * *', -- Daily at 5 AM
  $$
  SELECT public.cleanup_old_device_ips();
  $$
);

-- Create cron schedule for VPN session IP cleanup
SELECT cron.schedule(
  'cleanup-vpn-session-ips-weekly',
  '0 6 * * 0', -- Weekly on Sunday at 6 AM
  $$
  SELECT public.cleanup_vpn_session_ips();
  $$
);

-- Create cron schedule for webhook log cleanup
SELECT cron.schedule(
  'cleanup-webhook-logs-monthly',
  '0 7 1 * *', -- Monthly on 1st at 7 AM
  $$
  SELECT public.cleanup_old_webhook_logs();
  $$
);

-- Create cron schedule for device access audit cleanup
SELECT cron.schedule(
  'cleanup-device-access-audit-quarterly',
  '0 8 1 1,4,7,10 *', -- Quarterly on Jan 1, Apr 1, Jul 1, Oct 1 at 8 AM
  $$
  SELECT public.cleanup_device_access_audit();
  $$
);

-- Add comment to document data retention policy
COMMENT ON FUNCTION public.cleanup_old_audit_logs() IS 
'Automatically deletes audit logs older than 90 days. Scheduled to run daily at 2 AM UTC via cron job.';

COMMENT ON FUNCTION public.cleanup_old_vpn_sessions() IS 
'Automatically deletes VPN sessions older than 30 days. Scheduled to run daily at 3 AM UTC via cron job.';

COMMENT ON FUNCTION public.cleanup_old_device_data() IS 
'Clears device metadata after 30 days of inactivity and deletes devices after 180 days. Scheduled to run daily at 4 AM UTC via cron job.';

COMMENT ON FUNCTION public.cleanup_old_device_ips() IS 
'Removes IP addresses from devices after 7 days of inactivity. Scheduled to run daily at 5 AM UTC via cron job.';