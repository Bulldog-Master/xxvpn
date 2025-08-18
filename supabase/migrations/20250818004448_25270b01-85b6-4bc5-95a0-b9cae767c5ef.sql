-- Disable 2FA for the specific user again
UPDATE profiles 
SET totp_enabled = false, totp_secret = NULL 
WHERE user_id = '4d0b76fb-aa5b-49c1-aba1-4c5d4ff292b3';