-- Fix governance_settings public exposure
-- Drop the overly permissive public read policy
DROP POLICY IF EXISTS "Everyone can read governance settings" ON public.governance_settings;

-- Create restricted policy for authenticated users only
CREATE POLICY "Authenticated users can read governance settings"
  ON public.governance_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Add comment documenting the security fix
COMMENT ON POLICY "Authenticated users can read governance settings" ON public.governance_settings IS 
  'Restricts governance settings access to authenticated users only to prevent anonymous users from studying governance rules for potential exploits. Updated from public access for security hardening.';