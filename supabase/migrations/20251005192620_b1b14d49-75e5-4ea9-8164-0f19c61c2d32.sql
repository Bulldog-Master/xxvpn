-- Add explicit policy to block anonymous access to audit_logs
CREATE POLICY "Deny all anonymous access to audit_logs"
ON public.audit_logs
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Also ensure audit_log_access_log blocks anonymous access
CREATE POLICY "Deny all anonymous access to audit_log_access_log"
ON public.audit_log_access_log
FOR ALL
TO anon
USING (false)
WITH CHECK (false);