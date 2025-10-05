-- Create index for faster wallet lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_profiles_wallet_address ON public.profiles(wallet_address);

-- Create webhook_logs table for tracking payment events
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  wallet_address text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  data jsonb NOT NULL,
  status text NOT NULL CHECK (status IN ('success', 'user_not_found', 'error')),
  error_message text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS on webhook_logs
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- Only super admins can view webhook logs
DROP POLICY IF EXISTS "Only super admins can view webhook logs" ON public.webhook_logs;
CREATE POLICY "Only super admins can view webhook logs"
ON public.webhook_logs
FOR SELECT
USING (is_super_admin(auth.uid()));

-- Service role can insert webhook logs
DROP POLICY IF EXISTS "Service role can insert webhook logs" ON public.webhook_logs;
CREATE POLICY "Service role can insert webhook logs"
ON public.webhook_logs
FOR INSERT
WITH CHECK (true);

-- Create indexes for faster webhook log queries
CREATE INDEX IF NOT EXISTS idx_webhook_logs_wallet_address ON public.webhook_logs(wallet_address);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_user_id ON public.webhook_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON public.webhook_logs(created_at DESC);

-- Add audit logging trigger for wallet address changes
CREATE OR REPLACE FUNCTION audit_wallet_address_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.wallet_address IS DISTINCT FROM NEW.wallet_address THEN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      table_name,
      record_id,
      old_values,
      new_values
    ) VALUES (
      NEW.user_id,
      'WALLET_ADDRESS_UPDATED',
      'profiles',
      NEW.id,
      jsonb_build_object('wallet_address', OLD.wallet_address),
      jsonb_build_object('wallet_address', NEW.wallet_address)
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS audit_wallet_address_trigger ON public.profiles;
CREATE TRIGGER audit_wallet_address_trigger
AFTER UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION audit_wallet_address_change();

-- Create function to cleanup old webhook logs (90 days retention)
CREATE OR REPLACE FUNCTION cleanup_old_webhook_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.webhook_logs 
  WHERE created_at < (now() - INTERVAL '90 days');
  
  RAISE NOTICE 'Cleaned up webhook logs older than 90 days';
END;
$$;