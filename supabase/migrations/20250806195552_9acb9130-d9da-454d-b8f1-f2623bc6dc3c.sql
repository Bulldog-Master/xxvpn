-- Create devices table to track user devices with 10 device limit
CREATE TABLE public.devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_name TEXT NOT NULL,
  device_type TEXT NOT NULL CHECK (device_type IN ('desktop', 'mobile', 'tablet', 'router', 'tv', 'other')),
  operating_system TEXT,
  ip_address INET,
  last_seen TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

-- Create policies for device access
CREATE POLICY "Users can view their own devices" 
ON public.devices 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own devices" 
ON public.devices 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own devices" 
ON public.devices 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own devices" 
ON public.devices 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to enforce 10 device limit
CREATE OR REPLACE FUNCTION check_device_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.devices WHERE user_id = NEW.user_id AND is_active = true) >= 10 THEN
    RAISE EXCEPTION 'Device limit exceeded. Maximum 10 devices allowed per user.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce device limit on insert
CREATE TRIGGER enforce_device_limit
  BEFORE INSERT ON public.devices
  FOR EACH ROW
  EXECUTE FUNCTION check_device_limit();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_device_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_devices_updated_at
  BEFORE UPDATE ON public.devices
  FOR EACH ROW
  EXECUTE FUNCTION update_device_updated_at();