-- Security Fix: Resolve Security Linter Errors

-- 1. Drop the unsafe audit_logs_safe view that exposes auth.users
-- This view was creating a security risk
DROP VIEW IF EXISTS public.audit_logs_safe;

-- 2. Instead, create a function (not a view) to safely query audit logs
-- Functions with SECURITY DEFINER are acceptable when properly scoped
CREATE OR REPLACE FUNCTION public.get_audit_logs_safe(
  limit_count integer DEFAULT 100,
  offset_count integer DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  action text,
  table_name text,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only admins and super admins can access audit logs
  IF NOT (public.has_role(auth.uid(), 'admin'::app_role) OR public.is_super_admin(auth.uid())) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  RETURN QUERY
  SELECT 
    al.id,
    al.user_id,
    al.action,
    al.table_name,
    al.record_id,
    al.old_values,
    al.new_values,
    '[REDACTED]'::text as ip_address,
    al.user_agent,
    al.created_at
  FROM public.audit_logs al
  ORDER BY al.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;

COMMENT ON FUNCTION public.get_audit_logs_safe(integer, integer) IS 
'Safely retrieves audit logs with IP addresses redacted. Only accessible to admins and super admins.';