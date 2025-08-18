-- Temporarily disable 2FA for user to reset the flow
UPDATE profiles 
SET totp_enabled = false, totp_secret = null 
WHERE user_id = '4d0b76fb-aa5b-49c1-aba1-4c5d4ff292b3';