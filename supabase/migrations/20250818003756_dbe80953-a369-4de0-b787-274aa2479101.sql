-- Reset 2FA completely for debugging
UPDATE profiles 
SET totp_enabled = false, totp_secret = NULL 
WHERE totp_enabled = true;