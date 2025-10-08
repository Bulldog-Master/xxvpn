import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { 
  Activity, 
  Download, 
  Upload, 
  Zap, 
  Timer, 
  TrendingUp, 
  TrendingDown, 
  Play, 
  Square, 
  RotateCcw,
  Wifi,
  Globe
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';
import { formatNumber, formatSpeed } from '@/utils/numberFormat';

interface BandwidthData {
  time: string;
  download: number;
  upload: number;
  ping: number;
}

interface SpeedTestResult {
  id: string;
  timestamp: string;
  downloadSpeed: number;
  uploadSpeed: number;
  ping: number;
  server: string;
  status: 'completed' | 'failed';
}

const generateMockData = (): BandwidthData[] => {
  const data: BandwidthData[] = [];
  const now = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 2000);
    data.push({
      time: time.toLocaleTimeString(),
      download: Math.random() * 50 + 10,
      upload: Math.random() * 20 + 5,
      ping: Math.random() * 20 + 10
    });
  }
  
  return data;
};

const mockSpeedTests: SpeedTestResult[] = [
  {
    id: '1',
    timestamp: '2024-01-20 14:30:00',
    downloadSpeed: 87.5,
    uploadSpeed: 23.2,
    ping: 12,
    server: 'New York, US',
    status: 'completed'
  },
  {
    id: '2',
    timestamp: '2024-01-20 10:15:00',
    downloadSpeed: 92.1,
    uploadSpeed: 25.8,
    ping: 8,
    server: 'London, UK',
    status: 'completed'
  },
  {
    id: '3',
    timestamp: '2024-01-19 16:45:00',
    downloadSpeed: 0,
    uploadSpeed: 0,
    ping: 0,
    server: 'Tokyo, JP',
    status: 'failed'
  }
];

export const BandwidthMonitoring: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [bandwidthData, setBandwidthData] = useState<BandwidthData[]>(generateMockData());
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [isSpeedTesting, setIsSpeedTesting] = useState(false);
  const [speedTestProgress, setSpeedTestProgress] = useState(0);
  const [speedTestPhase, setSpeedTestPhase] = useState<'ping' | 'download' | 'upload' | 'complete'>('ping');
  const [currentSpeedTest, setCurrentSpeedTest] = useState<Partial<SpeedTestResult>>({});
  const [speedTestHistory, setSpeedTestHistory] = useState<SpeedTestResult[]>(mockSpeedTests);
  const { toast } = useToast();

  const currentDownload = bandwidthData[bandwidthData.length - 1]?.download || 0;
  const currentUpload = bandwidthData[bandwidthData.length - 1]?.upload || 0;
  const currentPing = bandwidthData[bandwidthData.length - 1]?.ping || 0;

  // Mock data streaming
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      setBandwidthData(prev => {
        const newData = [...prev];
        const now = new Date();
        newData.push({
          time: now.toLocaleTimeString(),
          download: Math.random() * 50 + 10,
          upload: Math.random() * 20 + 5,
          ping: Math.random() * 20 + 10
        });
        return newData.slice(-30); // Keep only last 30 data points
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const startSpeedTest = async () => {
    setIsSpeedTesting(true);
    setSpeedTestProgress(0);
    setCurrentSpeedTest({});

    // Simulate speed test phases
    const phases = [
      { phase: 'ping', duration: 2000, result: Math.random() * 20 + 5 },
      { phase: 'download', duration: 5000, result: Math.random() * 100 + 50 },
      { phase: 'upload', duration: 3000, result: Math.random() * 30 + 10 }
    ];

    for (let i = 0; i < phases.length; i++) {
      const { phase, duration, result } = phases[i];
      setSpeedTestPhase(phase as any);

      // Animate progress for this phase
      const phaseProgress = (i * 100) / phases.length;
      const phaseIncrement = 100 / phases.length;

      for (let progress = 0; progress <= 100; progress += 5) {
        await new Promise(resolve => setTimeout(resolve, duration / 20));
        setSpeedTestProgress(phaseProgress + (progress * phaseIncrement) / 100);
      }

      // Update result
      setCurrentSpeedTest(prev => ({
        ...prev,
        [phase === 'ping' ? 'ping' : phase === 'download' ? 'downloadSpeed' : 'uploadSpeed']: result
      }));
    }

    // Complete the test
    setSpeedTestPhase('complete');
    setSpeedTestProgress(100);

    const newResult: SpeedTestResult = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString(),
      downloadSpeed: currentSpeedTest.downloadSpeed || 0,
      uploadSpeed: currentSpeedTest.uploadSpeed || 0,
      ping: currentSpeedTest.ping || 0,
      server: 'Auto Selected',
      status: 'completed'
    };

    setSpeedTestHistory(prev => [newResult, ...prev.slice(0, 9)]); // Keep last 10 results
    setIsSpeedTesting(false);

    toast({
      title: t('bandwidth.complete'),
      description: `${t('bandwidth.download')}: ${newResult.downloadSpeed.toFixed(1)} ${t('bandwidth.mbps')}, ${t('bandwidth.upload')}: ${newResult.uploadSpeed.toFixed(1)} ${t('bandwidth.mbps')}`
    });
  };

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
    toast({
      title: isMonitoring ? t('bandwidth.pause') : t('bandwidth.resume'),
      description: isMonitoring ? t('bandwidth.pause') + " " + t('bandwidth.monitoring') : t('bandwidth.resume') + " " + t('bandwidth.monitoring')
    });
  };

  const getSpeedColor = (speed: number, type: 'download' | 'upload' | 'ping') => {
    if (type === 'ping') {
      if (speed < 20) return 'text-green-500';
      if (speed < 50) return 'text-yellow-500';
      return 'text-red-500';
    } else {
      if (speed > 50) return 'text-green-500';
      if (speed > 25) return 'text-yellow-500';
      return 'text-red-500';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="monitoring" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="monitoring">Real-time Monitoring</TabsTrigger>
          <TabsTrigger value="speedtest">Speed Test</TabsTrigger>
          <TabsTrigger value="history">Usage History</TabsTrigger>
        </TabsList>

        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Download className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">{t('bandwidth.download')}</span>
                </div>
                <div className="text-2xl font-bold">{formatNumber(currentDownload, i18n.language, 1)}</div>
                <div className="text-xs text-muted-foreground">{t('units.mbps')}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Upload className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">{t('bandwidth.upload')}</span>
                </div>
                <div className="text-2xl font-bold">{formatNumber(currentUpload, i18n.language, 1)}</div>
                <div className="text-xs text-muted-foreground">{t('units.mbps')}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Timer className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">{t('bandwidth.ping')}</span>
                </div>
                <div className="text-2xl font-bold">{formatNumber(currentPing, i18n.language, 0)}</div>
                <div className="text-xs text-muted-foreground">{t('units.ms')}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Real-time Bandwidth Usage
                  </CardTitle>
                  <CardDescription>
                    Live monitoring of your network performance
                  </CardDescription>
                </div>
                <Button
                  variant={isMonitoring ? "default" : "outline"}
                  size="sm"
                  onClick={toggleMonitoring}
                >
                  {isMonitoring ? <Square className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                  {isMonitoring ? 'Pause' : 'Start'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={bandwidthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="download" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    name="Download (Mbps)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="upload" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Upload (Mbps)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="speedtest" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Internet Speed Test
              </CardTitle>
              <CardDescription>
                Test your connection speed through the VPN
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isSpeedTesting ? (
                <div className="text-center space-y-4">
                  <Button onClick={startSpeedTest} size="lg" className="w-full">
                    <Play className="h-5 w-5 mr-2" />
                    Start Speed Test
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    This will test your download speed, upload speed, and ping latency
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-lg font-medium mb-2">
                      Testing {speedTestPhase === 'ping' ? 'Ping' : speedTestPhase === 'download' ? 'Download Speed' : speedTestPhase === 'upload' ? 'Upload Speed' : 'Complete'}
                    </div>
                    <Progress value={speedTestProgress} className="w-full mb-4" />
                    <div className="text-sm text-muted-foreground">
                      {speedTestProgress.toFixed(0)}% complete
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-accent/50 rounded-lg">
                      <div className="text-sm text-muted-foreground">{t('bandwidth.ping')}</div>
                      <div className="text-xl font-bold">
                        {currentSpeedTest.ping ? `${formatNumber(currentSpeedTest.ping, i18n.language, 0)} ${t('units.ms')}` : '--'}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-accent/50 rounded-lg">
                      <div className="text-sm text-muted-foreground">{t('bandwidth.download')}</div>
                      <div className="text-xl font-bold">
                        {currentSpeedTest.downloadSpeed ? formatSpeed(currentSpeedTest.downloadSpeed, i18n.language, t) : '--'}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-accent/50 rounded-lg">
                      <div className="text-sm text-muted-foreground">{t('bandwidth.upload')}</div>
                      <div className="text-xl font-bold">
                        {currentSpeedTest.uploadSpeed ? formatSpeed(currentSpeedTest.uploadSpeed, i18n.language, t) : '--'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {speedTestHistory.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">{t('bandwidth.recentTests')}</h4>
                  <div className="space-y-2">
                    {speedTestHistory.slice(0, 3).map((test) => (
                      <div key={test.id} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                        <div>
                          <div className="font-medium text-sm">{test.timestamp}</div>
                          <div className="text-xs text-muted-foreground">{test.server}</div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="text-center">
                            <div className={getSpeedColor(test.downloadSpeed, 'download')}>
                              ↓ {formatNumber(test.downloadSpeed, i18n.language, 1)}
                            </div>
                            <div className="text-xs text-muted-foreground">{t('units.mbps')}</div>
                          </div>
                          <div className="text-center">
                            <div className={getSpeedColor(test.uploadSpeed, 'upload')}>
                              ↑ {formatNumber(test.uploadSpeed, i18n.language, 1)}
                            </div>
                            <div className="text-xs text-muted-foreground">{t('units.mbps')}</div>
                          </div>
                          <div className="text-center">
                            <div className={getSpeedColor(test.ping, 'ping')}>
                              {formatNumber(test.ping, i18n.language, 0)}
                            </div>
                            <div className="text-xs text-muted-foreground">{t('units.ms')}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Download className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">{t('bandwidth.totalDownloaded')}</span>
                </div>
                <div className="text-2xl font-bold">2.4 GB</div>
                <div className="text-xs text-muted-foreground">{t('bandwidth.today')}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Upload className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">{t('bandwidth.totalUploaded')}</span>
                </div>
                <div className="text-2xl font-bold">487 MB</div>
                <div className="text-xs text-muted-foreground">{t('bandwidth.today')}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">{t('bandwidth.peakSpeed')}</span>
                </div>
                <div className="text-2xl font-bold">{formatSpeed(127, i18n.language, t)}</div>
                <div className="text-xs text-muted-foreground">{t('bandwidth.thisSession')}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Wifi className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">{t('bandwidth.avgLatency')}</span>
                </div>
                <div className="text-2xl font-bold">12 {t('units.ms')}</div>
                <div className="text-xs text-muted-foreground">{t('bandwidth.thisSession')}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Usage Overview</CardTitle>
              <CardDescription>
                Your bandwidth usage over the past 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={[
                  { day: 'Mon', download: 1.2, upload: 0.3 },
                  { day: 'Tue', download: 2.1, upload: 0.5 },
                  { day: 'Wed', download: 1.8, upload: 0.4 },
                  { day: 'Thu', download: 3.2, upload: 0.8 },
                  { day: 'Fri', download: 2.7, upload: 0.6 },
                  { day: 'Sat', download: 4.1, upload: 1.2 },
                  { day: 'Sun', download: 2.4, upload: 0.5 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value} GB`} />
                  <Area 
                    type="monotone" 
                    dataKey="download" 
                    stackId="1"
                    stroke="#22c55e" 
                    fill="#22c55e"
                    fillOpacity={0.6}
                    name="Download"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="upload" 
                    stackId="1"
                    stroke="#3b82f6" 
                    fill="#3b82f6"
                    fillOpacity={0.6}
                    name="Upload"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};