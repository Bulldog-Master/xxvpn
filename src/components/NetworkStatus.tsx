import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { formatNumber, formatSpeed } from '@/utils/numberFormat';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, Wifi, Shield, Zap, Globe } from 'lucide-react';

interface NetworkNode {
  id: string;
  location: string;
  status: 'active' | 'standby' | 'offline';
  latency: number;
  load: number;
}

const NetworkStatus = () => {
  const { t, i18n } = useTranslation();
  const [nodes] = useState<NetworkNode[]>([
    { id: '1', location: t('network.nodes.gateway'), status: 'active', latency: 12, load: 45 },
    { id: '2', location: t('network.nodes.mixNode1'), status: 'active', latency: 28, load: 62 },
    { id: '3', location: t('network.nodes.mixNode2'), status: 'active', latency: 34, load: 38 },
    { id: '4', location: t('network.nodes.mixNode3'), status: 'active', latency: 41, load: 71 },
    { id: '5', location: t('network.nodes.exitNode'), status: 'active', latency: 56, load: 29 }
  ]);

  const [throughput, setThroughput] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setThroughput(Math.random() * 100);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-success';
      case 'standby': return 'text-warning';
      case 'offline': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Network Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('network.health')}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{formatNumber(98.7, i18n.language, 1)}%</div>
            <p className="text-xs text-muted-foreground">
              {t('network.nodesOperational')}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('network.throughput')}</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatSpeed(throughput, i18n.language, t)}</div>
            <Progress value={throughput} className="h-2" />
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('network.protectionLevel')}</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{t('network.quantum')}</div>
            <p className="text-xs text-muted-foreground">
              {t('network.encryptionActive')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Node Status */}
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            {t('network.topology')}
          </CardTitle>
          <CardDescription>
            {t('network.topologyDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {nodes.map((node, index) => (
              <div key={node.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    node.status === 'active' ? 'bg-success animate-pulse' :
                    node.status === 'standby' ? 'bg-warning' : 'bg-destructive'
                  }`} />
                  <div>
                    <div className="font-medium">{node.location}</div>
                    <div className="text-sm text-muted-foreground">
                      {t('network.hop')} {formatNumber(index + 1, i18n.language)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">{formatNumber(node.latency, i18n.language)} {t('units.ms')}</div>
                    <div className="text-xs text-muted-foreground">{t('network.latency')}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{formatNumber(node.load, i18n.language)}{t('units.percent')}</div>
                    <div className="text-xs text-muted-foreground">{t('network.load')}</div>
                  </div>
                  <Badge variant={node.status === 'active' ? 'default' : 'secondary'}>
                    {t(`network.status.${node.status}`)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Features */}
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>{t('network.securityFeatures')}</CardTitle>
          <CardDescription>
            {t('network.securityFeaturesDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full" />
                  <span className="text-sm">{t('network.features.metadataShredding')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full" />
                  <span className="text-sm">{t('network.features.quantumEncryption')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full" />
                  <span className="text-sm">{t('network.features.trafficMixing')}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full" />
                  <span className="text-sm">{t('network.features.dpiBypass')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full" />
                  <span className="text-sm">{t('network.features.precomputation')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full" />
                  <span className="text-sm">{t('network.features.realtimeMixing')}</span>
                </div>
              </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NetworkStatus;