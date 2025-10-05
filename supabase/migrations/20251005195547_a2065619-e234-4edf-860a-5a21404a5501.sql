-- Security Fix: Replace subscription_monitoring view with secure function

-- 1. Drop the view (views cannot have RLS policies)
DROP VIEW IF EXISTS public.subscription_monitoring;

-- 2. Create a secure function with admin authorization
CREATE OR REPLACE FUNCTION public.get_subscription_monitoring(
  limit_count integer DEFAULT 100,
  offset_count integer DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  subscription_tier text,
  subscribed boolean,
  is_trial boolean,
  subscription_end timestamp with time zone,
  trial_end timestamp with time zone,
  stripe_customer_id text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only admins and super admins can access subscription monitoring
  IF NOT (public.has_role(auth.uid(), 'admin'::app_role) OR public.is_super_admin(auth.uid())) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required for subscription monitoring';
  END IF;

  RETURN QUERY
  SELECT 
    s.id,
    s.user_id,
    s.subscription_tier,
    s.subscribed,
    s.is_trial,
    s.subscription_end,
    s.trial_end,
    '[REDACTED]'::text as stripe_customer_id,
    s.created_at,
    s.updated_at
  FROM public.subscribers s
  ORDER BY s.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;

COMMENT ON FUNCTION public.get_subscription_monitoring(integer, integer) IS 
'Admin-only function to monitor subscriptions. Stripe customer IDs are redacted. Requires admin or super_admin role.';

-- 3. Create a companion function for admins to view specific user subscription (with full details for support)
CREATE OR REPLACE FUNCTION public.get_user_subscription_admin(target_user_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  subscription_tier text,
  subscribed boolean,
  is_trial boolean,
  subscription_end timestamp with time zone,
  trial_end timestamp with time zone,
  stripe_customer_id text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only super admins can view full subscription details including Stripe IDs
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Super admin access required to view Stripe customer IDs';
  END IF;

  -- Log this sensitive access
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    new_values
  ) VALUES (
    auth.uid(),
    'ADMIN_VIEW_STRIPE_ID',
    'subscribers',
    target_user_id,
    jsonb_build_object(
      'accessed_user', target_user_id,
      'reason', 'Admin support access'
    )
  );

  RETURN QUERY
  SELECT 
    s.id,
    s.user_id,
    s.subscription_tier,
    s.subscribed,
    s.is_trial,
    s.subscription_end,
    s.trial_end,
    s.stripe_customer_id, -- Full access for super admins
    s.created_at,
    s.updated_at
  FROM public.subscribers s
  WHERE s.user_id = target_user_id;
END;
$$;

COMMENT ON FUNCTION public.get_user_subscription_admin(uuid) IS 
'CRITICAL SECURITY: Super admin-only function to view complete subscription details including Stripe customer ID. All access is logged to audit_logs. Use only for customer support.';

-- 4. Add security documentation
COMMENT ON SCHEMA public IS 
'Public schema contains application tables. All tables with PII have RLS enabled. 
Direct access to subscribers table requires service role.
Use get_user_subscription_safe() for user self-service.
Use get_subscription_monitoring() for admin monitoring (no Stripe IDs).
Use get_user_subscription_admin() for support (logs all Stripe ID access).';