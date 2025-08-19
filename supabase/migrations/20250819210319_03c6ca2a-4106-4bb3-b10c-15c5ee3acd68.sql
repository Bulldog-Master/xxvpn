-- Create VPN sessions table for connection history
CREATE TABLE public.vpn_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  server_location TEXT NOT NULL,
  server_name TEXT NOT NULL,
  device_id UUID REFERENCES public.devices(id),
  device_name TEXT NOT NULL,
  connected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  disconnected_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER, -- calculated when disconnected
  bytes_sent BIGINT DEFAULT 0,
  bytes_received BIGINT DEFAULT 0,
  connection_quality TEXT, -- excellent, good, fair, poor
  disconnect_reason TEXT, -- user, timeout, error, etc.
  status TEXT NOT NULL DEFAULT 'active', -- active, completed, failed
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.vpn_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own VPN sessions" 
ON public.vpn_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own VPN sessions" 
ON public.vpn_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own VPN sessions" 
ON public.vpn_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_vpn_sessions_updated_at
BEFORE UPDATE ON public.vpn_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to calculate session duration when disconnecting
CREATE OR REPLACE FUNCTION public.calculate_session_duration()
RETURNS TRIGGER AS $$
BEGIN
  -- Only calculate duration when disconnected_at is set and duration isn't already set
  IF NEW.disconnected_at IS NOT NULL AND OLD.disconnected_at IS NULL THEN
    NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.disconnected_at - NEW.connected_at))::INTEGER;
    NEW.status = 'completed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for duration calculation
CREATE TRIGGER calculate_vpn_session_duration
BEFORE UPDATE ON public.vpn_sessions
FOR EACH ROW
EXECUTE FUNCTION public.calculate_session_duration();

-- Enable realtime for the table
ALTER TABLE public.vpn_sessions REPLICA IDENTITY FULL;

-- Add the table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.vpn_sessions;

-- Create indexes for better performance
CREATE INDEX idx_vpn_sessions_user_id ON public.vpn_sessions(user_id);
CREATE INDEX idx_vpn_sessions_connected_at ON public.vpn_sessions(connected_at DESC);
CREATE INDEX idx_vpn_sessions_status ON public.vpn_sessions(status);