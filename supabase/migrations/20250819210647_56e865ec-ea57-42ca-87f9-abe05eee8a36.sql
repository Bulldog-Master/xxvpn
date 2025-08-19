-- Fix security vulnerability: Remove email-based access from subscribers table
-- Only allow access based on user_id to prevent email-based attacks

-- Drop the vulnerable policies
DROP POLICY IF EXISTS "select_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscribers;

-- Create secure policies that only use user_id for access control
CREATE POLICY "Users can view own subscription by user_id" ON public.subscribers
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own subscription by user_id" ON public.subscribers
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own subscription by user_id" ON public.subscribers
FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Keep service role policy for edge functions (secure backend operations)
-- This policy was already created in the previous migration and is secure