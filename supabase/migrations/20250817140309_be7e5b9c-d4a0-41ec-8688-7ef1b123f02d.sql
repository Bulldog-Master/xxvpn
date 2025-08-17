-- Add 2FA fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN totp_secret TEXT,
ADD COLUMN totp_enabled BOOLEAN DEFAULT false;

-- Create index for faster queries
CREATE INDEX idx_profiles_totp_enabled ON public.profiles(totp_enabled) WHERE totp_enabled = true;