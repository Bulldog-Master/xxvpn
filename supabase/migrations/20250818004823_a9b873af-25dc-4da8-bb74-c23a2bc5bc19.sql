-- Re-enable 2FA for testing
UPDATE profiles 
SET totp_enabled = true
WHERE user_id = '4d0b76fb-aa5b-49c1-aba1-4c5d4ff292b3';