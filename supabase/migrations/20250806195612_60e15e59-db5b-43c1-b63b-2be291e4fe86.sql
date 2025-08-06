-- Fix function security by setting search_path for better security
CREATE OR REPLACE FUNCTION check_device_limit()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.devices WHERE user_id = NEW.user_id AND is_active = true) >= 10 THEN
    RAISE EXCEPTION 'Device limit exceeded. Maximum 10 devices allowed per user.';
  END IF;
  RETURN NEW;
END;
$$;

-- Fix timestamp function security
CREATE OR REPLACE FUNCTION update_device_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;