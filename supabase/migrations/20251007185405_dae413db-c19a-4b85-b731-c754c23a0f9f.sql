-- Enforce rate limiting and add sanitization (fixed)

-- 1. Add trigger to enforce beta signup rate limiting at database level
CREATE OR REPLACE FUNCTION public.check_beta_signup_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Call the validation function which will throw exception if rate limit exceeded
  PERFORM public.validate_beta_signup(NEW.email);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_beta_rate_limit ON public.beta_waitlist;
CREATE TRIGGER enforce_beta_rate_limit
  BEFORE INSERT ON public.beta_waitlist
  FOR EACH ROW
  EXECUTE FUNCTION public.check_beta_signup_rate_limit();

-- 2. Add sanitization for error logs context field
CREATE OR REPLACE FUNCTION public.sanitize_error_context()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Remove sensitive fields from context if present
  IF NEW.context IS NOT NULL THEN
    NEW.context := public.sanitize_sensitive_data(NEW.context);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sanitize_error_log_context ON public.error_logs;
CREATE TRIGGER sanitize_error_log_context
  BEFORE INSERT ON public.error_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.sanitize_error_context();

-- 3. Update comments
COMMENT ON TRIGGER enforce_beta_rate_limit ON public.beta_waitlist IS
  'SECURITY: Enforces rate limiting (3 signups per email per 24h) via trigger.
   Prevents spam and email harvesting by blocking excessive signup attempts.';

COMMENT ON TRIGGER sanitize_error_log_context ON public.error_logs IS
  'SECURITY: Automatically sanitizes error context before insertion.
   Removes passwords, tokens, secrets, IPs, and other sensitive data.
   Enforced via trigger on every insert.';