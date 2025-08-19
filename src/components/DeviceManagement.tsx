import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
import { useAuth } from '@/hooks/useAuth';

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
  const { t } = useTranslation();
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
    desktop: t('devices.types.desktop'),
    mobile: t('devices.types.mobile'),
    tablet: t('devices.types.tablet'),
    router: t('devices.types.router'),
    tv: t('devices.types.tv'),
    other: t('devices.types.other')
  };

  useEffect(() => {
    // Load user devices from backend
    setLoading(false);
  }, []);

  const addDevice = async () => {
    if (!newDevice.device_name.trim()) {
      toast({
        title: t('devices.toast.nameRequired'),
        description: t('devices.toast.nameRequiredDesc'),
        variant: "destructive"
      });
      return;
    }

    if (activeDevices.length >= deviceLimit) {
      toast({
        title: t('devices.toast.limitReached'),
        description: t('devices.toast.limitReachedDesc'),
        variant: "destructive"
      });
      return;
    }

    const newDeviceData: Device = {
      id: crypto.randomUUID(),
      device_name: newDevice.device_name,
      device_type: newDevice.device_type,
      operating_system: newDevice.operating_system || undefined,
      ip_address: '192.168.1.' + Math.floor(Math.random() * 200 + 100),
      last_seen: new Date().toISOString(),
      is_active: true,
      created_at: new Date().toISOString()
    };

    setDevices(prev => [...prev, newDeviceData]);

    toast({
      title: t('devices.toast.added'),
      description: t('devices.toast.addedDesc')
    });

    setNewDevice({
      device_name: '',
      device_type: 'desktop',
      operating_system: ''
    });
    setAddDeviceOpen(false);
  };

  const removeDevice = (deviceId: string, deviceName: string) => {
    setDevices(prev => prev.filter(device => device.id !== deviceId));

    toast({
      title: t('devices.toast.removed'),
      description: t('devices.toast.removedDesc', { deviceName })
    });
  };

  const activeDevices = devices.filter(d => d.is_active);
  const deviceLimit = 10;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{t('devices.title')}</h2>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">{t('common.loading')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('devices.title')}</h2>
          <p className="text-muted-foreground">
            {t('devices.description', { used: activeDevices.length, total: deviceLimit })}
          </p>
        </div>
        
        <Dialog open={addDeviceOpen} onOpenChange={setAddDeviceOpen}>
          <DialogTrigger asChild>
            <Button disabled={activeDevices.length >= deviceLimit}>
              <Plus className="w-4 h-4 mr-2" />
              {t('devices.addDevice')}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card/95 backdrop-blur-sm border-border">
            <DialogHeader>
              <DialogTitle>{t('devices.addNew')}</DialogTitle>
              <DialogDescription>
                {t('devices.addDescription', { limit: deviceLimit })}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="device_name">{t('devices.form.deviceName')}</Label>
                <Input
                  id="device_name"
                  placeholder={t('devices.form.deviceNamePlaceholder')}
                  value={newDevice.device_name}
                  onChange={(e) => setNewDevice(prev => ({ ...prev, device_name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="device_type">{t('devices.form.deviceType')}</Label>
                <Select 
                  value={newDevice.device_type} 
                  onValueChange={(value: Device['device_type']) => setNewDevice(prev => ({ ...prev, device_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desktop">{t('devices.types.desktop')}</SelectItem>
                    <SelectItem value="mobile">{t('devices.types.mobile')}</SelectItem>
                    <SelectItem value="tablet">{t('devices.types.tablet')}</SelectItem>
                    <SelectItem value="router">{t('devices.types.router')}</SelectItem>
                    <SelectItem value="tv">{t('devices.types.tv')}</SelectItem>
                    <SelectItem value="other">{t('devices.types.other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="operating_system">{t('devices.form.operatingSystem')}</Label>
                <Input
                  id="operating_system"
                  placeholder={t('devices.form.osPlaceholder')}
                  value={newDevice.operating_system}
                  onChange={(e) => setNewDevice(prev => ({ ...prev, operating_system: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setAddDeviceOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={addDevice}>{t('devices.addDevice')}</Button>
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
                  ? t('devices.limitReached') 
                  : t('devices.approachingLimit')
                }
              </p>
              <p className="text-sm text-muted-foreground">
                {activeDevices.length >= deviceLimit 
                  ? t('devices.removeToAdd') 
                  : t('devices.slotsRemaining', { count: deviceLimit - activeDevices.length })
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
              <h3 className="text-lg font-medium mb-2">{t('devices.noDevices')}</h3>
              <p className="text-muted-foreground mb-4">
                {t('devices.noDevicesDesc')}
              </p>
              <Button onClick={() => setAddDeviceOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {t('devices.addDevice')}
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
                          {t('devices.lastSeen')}: {lastSeen.toLocaleString()}
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