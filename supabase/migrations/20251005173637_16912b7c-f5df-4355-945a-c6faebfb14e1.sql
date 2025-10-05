-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Function to cleanup old audit logs (90 day retention)
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Delete audit logs older than 90 days
  DELETE FROM public.audit_logs 
  WHERE created_at < (now() - INTERVAL '90 days');
  
  RAISE NOTICE 'Cleaned up audit logs older than 90 days';
END;
$$;

-- Schedule daily cleanup of old audit logs at 2 AM UTC
SELECT cron.schedule(
  'cleanup-old-audit-logs',
  '0 2 * * *',
  $$SELECT public.cleanup_old_audit_logs()$$
);

-- Schedule daily cleanup of device IPs at 3 AM UTC
SELECT cron.schedule(
  'cleanup-old-device-ips',
  '0 3 * * *',
  $$SELECT public.cleanup_old_device_ips()$$
);

-- Add configuration table for retention policies
CREATE TABLE IF NOT EXISTS public.security_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key text NOT NULL UNIQUE,
  config_value jsonb NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS on security_config
ALTER TABLE public.security_config ENABLE ROW LEVEL SECURITY;

-- Only admins can manage security config
CREATE POLICY "Only admins can manage security config"
  ON public.security_config
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Insert default retention policy
INSERT INTO public.security_config (config_key, config_value)
VALUES ('audit_log_retention_days', '90'::jsonb)
ON CONFLICT (config_key) DO NOTHING;

-- Create index for faster audit log cleanup
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at 
  ON public.audit_logs(created_at);

-- Add comment for documentation
COMMENT ON FUNCTION public.cleanup_old_audit_logs() IS 'Automatically deletes audit logs older than the configured retention period (default 90 days). Scheduled to run daily at 2 AM UTC.';