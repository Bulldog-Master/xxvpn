-- Fix function search path security warnings

-- Fix cleanup_old_device_ips function
CREATE OR REPLACE FUNCTION public.cleanup_old_device_ips()
RETURNS void AS $$
BEGIN
  -- Clear IP addresses from devices not seen in 30 days
  UPDATE public.devices 
  SET ip_address = NULL 
  WHERE last_seen < now() - INTERVAL '30 days' 
    AND ip_address IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Fix update_device_timestamp function  
CREATE OR REPLACE FUNCTION public.update_device_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  -- Clear IP if device hasn't been seen in 7 days
  IF OLD.last_seen < now() - INTERVAL '7 days' THEN
    NEW.ip_address = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';