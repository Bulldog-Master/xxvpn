-- Tighten security: Restrict sensitive data access to super admins only
-- This prevents regular admins from accessing highly sensitive user data

-- 1. Restrict audit logs to super admins only (contains IP addresses and detailed user activity)
DROP POLICY IF EXISTS "Admins can view recent audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Super admins can view all audit logs" ON public.audit_logs;

CREATE POLICY "Only super admins can view audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (public.is_super_admin(auth.uid()));

-- 2. Restrict error logs to super admins only (may contain sensitive data in context)
DROP POLICY IF EXISTS "Only admins can view error logs" ON public.error_logs;

CREATE POLICY "Only super admins can view error logs"
ON public.error_logs
FOR SELECT
TO authenticated
USING (public.is_super_admin(auth.uid()));

-- 3. Restrict beta waitlist to super admins only (contains email addresses)
DROP POLICY IF EXISTS "Only admins can view beta waitlist" ON public.beta_waitlist;
DROP POLICY IF EXISTS "Only admins can update beta waitlist" ON public.beta_waitlist;

CREATE POLICY "Only super admins can view beta waitlist"
ON public.beta_waitlist
FOR SELECT
TO authenticated
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Only super admins can update beta waitlist"
ON public.beta_waitlist
FOR UPDATE
TO authenticated
USING (public.is_super_admin(auth.uid()));

-- 4. Add comments explaining security model
COMMENT ON TABLE public.audit_logs IS 
  'SECURITY: Contains sensitive user activity data including IP addresses.
   Access restricted to super admins only to prevent unauthorized surveillance.
   All access is automatically logged via triggers.';

COMMENT ON TABLE public.error_logs IS 
  'SECURITY: May contain sensitive user data in error contexts.
   Access restricted to super admins only to prevent information disclosure.
   Context fields are sanitized before storage.';

COMMENT ON TABLE public.beta_waitlist IS 
  'SECURITY: Contains personal email addresses and contact information.
   Access restricted to super admins only to prevent email harvesting.
   Public INSERT allowed for signup but requires rate limiting at application level.';
