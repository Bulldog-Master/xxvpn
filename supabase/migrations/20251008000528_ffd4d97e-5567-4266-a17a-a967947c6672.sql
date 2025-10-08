-- Priority 1: Create secure RPC function for admin user viewing with audit logging
CREATE OR REPLACE FUNCTION public.get_users_admin_safe(
  limit_count INTEGER DEFAULT 50,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE(
  user_id UUID,
  display_name TEXT,
  subscription_tier TEXT,
  xx_coin_balance NUMERIC,
  created_at TIMESTAMPTZ,
  totp_enabled BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins and super admins can view user list
  IF NOT (public.has_role(auth.uid(), 'admin'::app_role) OR public.is_super_admin(auth.uid())) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Log this PII access
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    new_values
  ) VALUES (
    auth.uid(),
    'ADMIN_VIEW_USER_LIST',
    'profiles',
    NULL,
    jsonb_build_object(
      'limit', limit_count,
      'offset', offset_count,
      'accessed_at', now()
    )
  );

  RETURN QUERY
  SELECT 
    p.user_id,
    p.display_name,
    p.subscription_tier,
    p.xx_coin_balance,
    p.created_at,
    p.totp_enabled
  FROM public.profiles p
  ORDER BY p.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;

-- Priority 2: Create trigger to log service role subscription updates
CREATE OR REPLACE FUNCTION public.audit_service_role_updates()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log when service role updates subscription tier
  IF OLD.subscription_tier IS DISTINCT FROM NEW.subscription_tier 
     AND auth.role() = 'service_role' THEN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      table_name,
      record_id,
      old_values,
      new_values
    ) VALUES (
      NEW.user_id,
      'SERVICE_ROLE_SUBSCRIPTION_UPDATE',
      'profiles',
      NEW.id,
      jsonb_build_object('subscription_tier', OLD.subscription_tier),
      jsonb_build_object('subscription_tier', NEW.subscription_tier)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER log_service_role_subscription_updates
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_service_role_updates();

-- Priority 4: Create sanitization trigger for webhook logs
CREATE OR REPLACE FUNCTION public.sanitize_webhook_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Sanitize sensitive fields in webhook data
  IF NEW.data IS NOT NULL THEN
    NEW.data := public.sanitize_sensitive_data(NEW.data);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER sanitize_webhook_data_trigger
  BEFORE INSERT ON public.webhook_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.sanitize_webhook_data();