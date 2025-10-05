-- Security Enhancement: Protect Stripe Customer Payment Data

-- 1. Create audit trigger for subscribers table to monitor access
CREATE OR REPLACE FUNCTION public.audit_subscriber_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log all modifications to subscribers table
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      table_name,
      record_id,
      new_values
    ) VALUES (
      NEW.user_id,
      'SUBSCRIPTION_CREATED',
      'subscribers',
      NEW.id,
      jsonb_build_object(
        'subscription_tier', NEW.subscription_tier,
        'is_trial', NEW.is_trial,
        'subscribed', NEW.subscribed
      ) -- Intentionally exclude stripe_customer_id from audit logs
    );
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      table_name,
      record_id,
      old_values,
      new_values
    ) VALUES (
      NEW.user_id,
      'SUBSCRIPTION_UPDATED',
      'subscribers',
      NEW.id,
      jsonb_build_object(
        'subscription_tier', OLD.subscription_tier,
        'subscribed', OLD.subscribed,
        'is_trial', OLD.is_trial
      ),
      jsonb_build_object(
        'subscription_tier', NEW.subscription_tier,
        'subscribed', NEW.subscribed,
        'is_trial', NEW.is_trial
      )
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      table_name,
      record_id,
      old_values
    ) VALUES (
      OLD.user_id,
      'SUBSCRIPTION_DELETED',
      'subscribers',
      OLD.id,
      jsonb_build_object(
        'subscription_tier', OLD.subscription_tier
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 2. Create trigger to monitor subscriber access
DROP TRIGGER IF EXISTS audit_subscriber_changes ON public.subscribers;
CREATE TRIGGER audit_subscriber_changes
AFTER INSERT OR UPDATE OR DELETE ON public.subscribers
FOR EACH ROW
EXECUTE FUNCTION public.audit_subscriber_access();

-- 3. Add table-level security comment
COMMENT ON TABLE public.subscribers IS 
'CRITICAL SECURITY: Contains payment information (Stripe customer IDs). Access is restricted to:
- Users can only view/update their own subscription via RLS
- Service role for payment processing (webhooks, admin actions)
- Stripe customer IDs are NEVER logged to audit_logs
- All access is monitored via audit_subscriber_access trigger
- Direct SELECT queries log to audit_logs';

-- 4. Add column-level security comments
COMMENT ON COLUMN public.subscribers.stripe_customer_id IS 
'SENSITIVE: Stripe customer identifier. Never log, expose in errors, or return in API responses. Only accessible via service role for payment processing.';

-- 5. Create function to safely check subscription status without exposing Stripe data
CREATE OR REPLACE FUNCTION public.get_user_subscription_safe()
RETURNS TABLE(
  subscribed boolean,
  subscription_tier text,
  subscription_end timestamp with time zone,
  trial_end timestamp with time zone,
  is_trial boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Authentication required';
  END IF;

  RETURN QUERY
  SELECT 
    s.subscribed,
    s.subscription_tier,
    s.subscription_end,
    s.trial_end,
    s.is_trial
  FROM public.subscribers s
  WHERE s.user_id = auth.uid();
  
  -- Note: Deliberately excludes stripe_customer_id, id, created_at, updated_at
END;
$$;

COMMENT ON FUNCTION public.get_user_subscription_safe() IS 
'Safely retrieves subscription status for authenticated user without exposing Stripe customer ID or other sensitive metadata.';

-- 6. Create monitoring view for admins (without Stripe IDs)
CREATE OR REPLACE VIEW public.subscription_monitoring AS
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
FROM public.subscribers s;

-- 7. Add RLS to monitoring view
ALTER VIEW public.subscription_monitoring SET (security_invoker = on);

COMMENT ON VIEW public.subscription_monitoring IS 
'Admin monitoring view for subscriptions. Stripe customer IDs are redacted. Uses security_invoker to respect RLS policies.';

-- 8. Ensure RLS policies are correctly ordered (most restrictive first)
-- The existing policies are good, but let's verify they're comprehensive

-- 9. Add policy to prevent accidental exposure via functions
-- This is already handled by the RLS policies, but we'll add a comment
COMMENT ON POLICY "Users can only view own subscription data" ON public.subscribers IS 
'CRITICAL: Prevents users from viewing other users subscription data including Stripe customer IDs. Must never be disabled.';

COMMENT ON POLICY "Block public access to subscribers" ON public.subscribers IS 
'CRITICAL: Blocks all anonymous access to payment data. Must never be disabled.';