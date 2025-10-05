-- Protect audit_logs table from tampering
-- Deny all UPDATE operations on audit_logs (logs should be immutable)
CREATE POLICY "Deny all updates to audit logs"
ON public.audit_logs
FOR UPDATE
USING (false);

-- Deny DELETE for non-admins (only admins can delete old logs for data retention)
CREATE POLICY "Only admins can delete old audit logs"
ON public.audit_logs
FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND created_at < now() - INTERVAL '365 days'
);

-- Comment explaining audit log security
COMMENT ON TABLE public.audit_logs IS 'Audit logs are immutable. Only admins can delete records older than 1 year for data retention.';