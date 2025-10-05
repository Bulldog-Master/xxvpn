-- Create error_logs table for debugging WASM/wallet issues
CREATE TABLE IF NOT EXISTS public.error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  error_type text NOT NULL,
  error_message text NOT NULL,
  error_stack text,
  context jsonb,
  user_agent text,
  url text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS on error_logs
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Authenticated users can insert their own errors
DROP POLICY IF EXISTS "Users can log their own errors" ON public.error_logs;
CREATE POLICY "Users can log their own errors"
ON public.error_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Only admins can view error logs
DROP POLICY IF EXISTS "Only admins can view error logs" ON public.error_logs;
CREATE POLICY "Only admins can view error logs"
ON public.error_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid()));

-- Create indexes for error log queries
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON public.error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_error_type ON public.error_logs(error_type);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON public.error_logs(created_at DESC);

-- Create function to cleanup old error logs (30 days retention)
CREATE OR REPLACE FUNCTION cleanup_old_error_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.error_logs 
  WHERE created_at < (now() - INTERVAL '30 days');
  
  RAISE NOTICE 'Cleaned up error logs older than 30 days';
END;
$$;