-- Remove email column from subscribers table to fix security vulnerability
-- Emails are already stored in auth.users and should not be duplicated

-- Drop the email column from subscribers table
ALTER TABLE public.subscribers DROP COLUMN IF EXISTS email;

-- Add comment to document the change
COMMENT ON TABLE public.subscribers IS 
'Subscription data for users. Email addresses are stored in auth.users and profiles tables only - never duplicate sensitive PII here.';