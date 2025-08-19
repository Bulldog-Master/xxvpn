-- Fix security warnings: Add DELETE protection for sensitive tables

-- 1. Protect subscribers table from unauthorized deletions
-- Only allow service role (backend) to delete subscription records
CREATE POLICY "Only service role can delete subscriptions" ON public.subscribers
FOR DELETE 
USING (auth.role() = 'service_role');

-- 2. Protect vpn_sessions table from unauthorized deletions  
-- Prevent users from deleting their VPN session history
-- Only allow service role (backend) to delete session records for data retention/cleanup
CREATE POLICY "Only service role can delete vpn sessions" ON public.vpn_sessions
FOR DELETE 
USING (auth.role() = 'service_role');