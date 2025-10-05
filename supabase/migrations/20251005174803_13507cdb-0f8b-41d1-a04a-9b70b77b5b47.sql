-- Phase 1: Settings Privacy Enhancement
-- Create user_settings table to replace localStorage
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  setting_key TEXT NOT NULL,
  setting_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, setting_key)
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings"
  ON public.user_settings FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Deny anonymous access to user_settings"
  ON public.user_settings FOR ALL
  USING (false)
  WITH CHECK (false);

-- Add index for faster lookups
CREATE INDEX idx_user_settings_user_id_key ON public.user_settings(user_id, setting_key);

-- Add trigger for updated_at
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Phase 2: Audit Log Meta-Logging
-- Create audit_log_access_log table to track who accesses audit logs
CREATE TABLE public.audit_log_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  access_type TEXT NOT NULL, -- 'view', 'export', 'delete'
  filters_applied JSONB,
  record_count INTEGER,
  ip_address INET
);

ALTER TABLE public.audit_log_access_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only super admins can view audit log access logs"
  ON public.audit_log_access_log FOR SELECT
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Service role can insert audit log access logs"
  ON public.audit_log_access_log FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Deny updates to audit log access logs"
  ON public.audit_log_access_log FOR UPDATE
  USING (false);

CREATE POLICY "Only super admins can delete old access logs"
  ON public.audit_log_access_log FOR DELETE
  USING (public.has_role(auth.uid(), 'super_admin') AND accessed_at < now() - INTERVAL '180 days');

-- Add index for audit log access tracking
CREATE INDEX idx_audit_log_access_admin_user ON public.audit_log_access_log(admin_user_id, accessed_at DESC);

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'super_admin'
  )
$$;

-- Update audit_logs policy to be more granular
DROP POLICY IF EXISTS "Only admins can view audit logs" ON public.audit_logs;

CREATE POLICY "Admins can view recent audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') 
    AND created_at > now() - INTERVAL '30 days'
  );

CREATE POLICY "Super admins can view all audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.is_super_admin(auth.uid()));

-- Phase 3: Payment Security - Add webhook verification log
CREATE TABLE public.stripe_webhook_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  signature_verified BOOLEAN NOT NULL,
  processing_status TEXT NOT NULL, -- 'success', 'failed', 'rejected'
  error_message TEXT,
  received_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  ip_address INET
);

ALTER TABLE public.stripe_webhook_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only super admins can view webhook logs"
  ON public.stripe_webhook_log FOR SELECT
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Service role can insert webhook logs"
  ON public.stripe_webhook_log FOR INSERT
  WITH CHECK (true);

-- Add index for webhook log queries
CREATE INDEX idx_stripe_webhook_event_id ON public.stripe_webhook_log(event_id);
CREATE INDEX idx_stripe_webhook_received_at ON public.stripe_webhook_log(received_at DESC);

-- Function to cleanup old webhook logs (keep 90 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_webhook_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.stripe_webhook_log 
  WHERE received_at < now() - INTERVAL '90 days';
  
  RAISE NOTICE 'Cleaned up Stripe webhook logs older than 90 days';
END;
$$;

-- Schedule webhook log cleanup (daily at 4 AM UTC)
SELECT cron.schedule(
  'cleanup-webhook-logs',
  '0 4 * * *',
  $$
  SELECT public.cleanup_old_webhook_logs();
  $$
);