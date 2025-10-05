-- Fix security issue: Restrict user_security_secrets policies to authenticated users only
-- Currently these policies use 'public' role which allows unauthenticated access attempts

-- Drop existing policies
DROP POLICY IF EXISTS "Users can only view their own security secrets" ON public.user_security_secrets;
DROP POLICY IF EXISTS "Users can only insert their own security secrets" ON public.user_security_secrets;
DROP POLICY IF EXISTS "Users can only update their own security secrets" ON public.user_security_secrets;

-- Recreate policies with 'authenticated' role restriction
CREATE POLICY "Users can only view their own security secrets"
ON public.user_security_secrets
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own security secrets"
ON public.user_security_secrets
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own security secrets"
ON public.user_security_secrets
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add DELETE policy for completeness (users should be able to disable 2FA)
CREATE POLICY "Users can only delete their own security secrets"
ON public.user_security_secrets
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);