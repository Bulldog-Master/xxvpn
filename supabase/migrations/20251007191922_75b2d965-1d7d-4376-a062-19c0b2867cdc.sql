-- Add audit logging for beta waitlist access

-- Safe function to access beta waitlist with audit logging
CREATE OR REPLACE FUNCTION public.get_beta_waitlist_safe(
  limit_count integer DEFAULT 100,
  offset_count integer DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  email text,
  name text,
  referral_source text,
  interested_features text[],
  status text,
  signup_date timestamptz,
  invite_sent_at timestamptz,
  notes text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only super admins can access beta waitlist
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Super admin access required';
  END IF;

  -- Audit log this access
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    new_values
  ) VALUES (
    auth.uid(),
    'ADMIN_VIEW_BETA_WAITLIST',
    'beta_waitlist',
    NULL,
    jsonb_build_object(
      'limit', limit_count,
      'offset', offset_count,
      'accessed_at', now()
    )
  );

  RETURN QUERY
  SELECT 
    bw.id,
    bw.email,
    bw.name,
    bw.referral_source,
    bw.interested_features,
    bw.status,
    bw.signup_date,
    bw.invite_sent_at,
    bw.notes,
    bw.created_at
  FROM public.beta_waitlist bw
  ORDER BY bw.signup_date DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;

COMMENT ON FUNCTION public.get_beta_waitlist_safe IS 
  'SECURITY: Safe access to beta waitlist with audit logging. 
   All super admin access is logged to audit_logs table.';
