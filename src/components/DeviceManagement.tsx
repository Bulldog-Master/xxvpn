import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  Router, 
  Tv, 
  MoreHorizontal,
  Plus,
  Trash2,
  Circle,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type Device = {
  id: string;
  device_name: string;
  device_type: 'desktop' | 'mobile' | 'tablet' | 'router' | 'tv' | 'other';
  operating_system?: string;
  ip_address?: string;
  last_seen: string;
  is_active: boolean;
  created_at: string;
};

const DeviceManagement = () => {
  const { user } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDeviceOpen, setAddDeviceOpen] = useState(false);
  const [newDevice, setNewDevice] = useState({
    device_name: '',
    device_type: 'desktop' as Device['device_type'],
    operating_system: ''
  });

  const deviceIcons = {
    desktop: Monitor,
    mobile: Smartphone,
    tablet: Tablet,
    router: Router,
    tv: Tv,
    other: MoreHorizontal
  };

  const deviceTypeLabels = {
    desktop: 'Desktop',
    mobile: 'Mobile',
    tablet: 'Tablet',
    router: 'Router',
    tv: 'TV',
    other: 'Other'
  };

  useEffect(() => {
    if (user) {
      fetchDevices();
    }
  }, [user]);

  const fetchDevices = async () => {
    try {
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .eq('user_id', user?.id)
        .order('last_seen', { ascending: false });

      if (error) throw error;
      setDevices((data || []) as Device[]);
    } catch (error) {
      console.error('Error fetching devices:', error);
      toast({
        title: "Error loading devices",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addDevice = async () => {
    if (!newDevice.device_name.trim()) {
      toast({
        title: "Device name required",
        description: "Please enter a name for your device.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('devices')
        .insert({
          user_id: user?.id,
          device_name: newDevice.device_name,
          device_type: newDevice.device_type,
          operating_system: newDevice.operating_system || null,
          ip_address: null, // Will be set when device connects
        });

      if (error) {
        if (error.message.includes('Device limit exceeded')) {
          toast({
            title: "Device limit reached",
            description: "You can only have 10 devices. Remove an old device first.",
            variant: "destructive"
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "Device added successfully",
        description: "Your new device has been registered."
      });

      setNewDevice({
        device_name: '',
        device_type: 'desktop',
        operating_system: ''
      });
      setAddDeviceOpen(false);
      fetchDevices();
    } catch (error) {
      console.error('Error adding device:', error);
      toast({
        title: "Error adding device",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const removeDevice = async (deviceId: string, deviceName: string) => {
    try {
      const { error } = await supabase
        .from('devices')
        .delete()
        .eq('id', deviceId);

      if (error) throw error;

      toast({
        title: "Device removed",
        description: `${deviceName} has been removed from your account.`
      });

      fetchDevices();
    } catch (error) {
      console.error('Error removing device:', error);
      toast({
        title: "Error removing device",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const activeDevices = devices.filter(d => d.is_active);
  const deviceLimit = 10;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Device Management</h2>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Loading devices...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Device Management</h2>
          <p className="text-muted-foreground">
            Manage your connected devices ({activeDevices.length}/{deviceLimit} devices used)
          </p>
        </div>
        
        <Dialog open={addDeviceOpen} onOpenChange={setAddDeviceOpen}>
          <DialogTrigger asChild>
            <Button disabled={activeDevices.length >= deviceLimit}>
              <Plus className="w-4 h-4 mr-2" />
              Add Device
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card/95 backdrop-blur-sm border-border">
            <DialogHeader>
              <DialogTitle>Add New Device</DialogTitle>
              <DialogDescription>
                Register a new device to use with xxVPN. You can have up to {deviceLimit} devices.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="device_name">Device Name</Label>
                <Input
                  id="device_name"
                  placeholder="My MacBook Pro"
                  value={newDevice.device_name}
                  onChange={(e) => setNewDevice(prev => ({ ...prev, device_name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="device_type">Device Type</Label>
                <Select 
                  value={newDevice.device_type} 
                  onValueChange={(value: Device['device_type']) => setNewDevice(prev => ({ ...prev, device_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desktop">Desktop</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                    <SelectItem value="tablet">Tablet</SelectItem>
                    <SelectItem value="router">Router</SelectItem>
                    <SelectItem value="tv">TV</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="operating_system">Operating System (Optional)</Label>
                <Input
                  id="operating_system"
                  placeholder="macOS 14.0, Windows 11, iOS 17.0, etc."
                  value={newDevice.operating_system}
                  onChange={(e) => setNewDevice(prev => ({ ...prev, operating_system: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setAddDeviceOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={addDevice}>Add Device</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Device Limit Warning */}
      {activeDevices.length >= deviceLimit - 2 && (
        <Card className="border-warning bg-warning/5">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <div>
              <p className="font-medium text-warning">
                {activeDevices.length >= deviceLimit 
                  ? "Device limit reached" 
                  : "Approaching device limit"
                }
              </p>
              <p className="text-sm text-muted-foreground">
                {activeDevices.length >= deviceLimit 
                  ? "Remove a device to add a new one." 
                  : `You have ${deviceLimit - activeDevices.length} device slots remaining.`
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Devices List */}
      <div className="grid gap-4">
        {devices.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <Monitor className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No devices registered</h3>
              <p className="text-muted-foreground mb-4">
                Add your first device to start using xxVPN
              </p>
              <Button onClick={() => setAddDeviceOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Device
              </Button>
            </CardContent>
          </Card>
        ) : (
          devices.map((device) => {
            const IconComponent = deviceIcons[device.device_type];
            const lastSeen = new Date(device.last_seen);
            const isOnline = Date.now() - lastSeen.getTime() < 5 * 60 * 1000; // 5 minutes

            return (
              <Card key={device.id} className="bg-card/80 backdrop-blur-sm">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{device.device_name}</h3>
                        <Circle className={`w-2 h-2 ${isOnline ? 'text-success fill-success' : 'text-muted-foreground'}`} />
                        <Badge variant="outline" className="text-xs">
                          {deviceTypeLabels[device.device_type]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {device.operating_system && (
                          <span>{device.operating_system}</span>
                        )}
                        <span>
                          Last seen: {lastSeen.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDevice(device.id, device.device_name)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DeviceManagement;