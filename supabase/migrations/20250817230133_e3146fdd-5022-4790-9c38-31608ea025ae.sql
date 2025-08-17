-- Temporarily disable 2FA for debugging
UPDATE profiles SET totp_enabled = false WHERE totp_enabled = true;