import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Zap, Lock, Network, Cpu, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const XXNetworkInfoPanel = () => {
  const { t } = useTranslation();
  
  const features = [
    {
      icon: Shield,
      title: t('xxNetworkTechnology.quantumResistant'),
      description: t('xxNetworkTechnology.quantumResistantDesc'),
      color: 'text-primary',
    },
    {
      icon: Lock,
      title: t('xxNetworkTechnology.metadataShredding'),
      description: t('xxNetworkTechnology.metadataShreddinDesc'),
      color: 'text-success',
    },
    {
      icon: Network,
      title: t('xxNetworkTechnology.decentralizedMixnet'),
      description: t('xxNetworkTechnology.decentralizedMixnetDesc'),
      color: 'text-secondary',
    },
    {
      icon: Zap,
      title: t('xxNetworkTechnology.trueP2P'),
      description: t('xxNetworkTechnology.trueP2PDesc'),
      color: 'text-warning',
    },
    {
      icon: Cpu,
      title: t('xxNetworkTechnology.webAssembly'),
      description: t('xxNetworkTechnology.webAssemblyDesc'),
      color: 'text-accent',
    },
    {
      icon: Globe,
      title: t('xxNetworkTechnology.daoGoverned'),
      description: t('xxNetworkTechnology.daoGovernedDesc'),
      color: 'text-primary',
    },
  ];

  return (
    <Card className="glass-effect">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('xxNetworkTechnology.title')}</CardTitle>
            <CardDescription>
              {t('xxNetworkTechnology.description')}
            </CardDescription>
          </div>
          <Badge className="bg-primary/20 text-primary border-primary/30">
            {t('xxNetworkTechnology.cMixxProtocol')}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="p-4 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-md bg-background/50 ${feature.color}`}>
                  <feature.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="font-semibold text-sm">{feature.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t('xxNetworkTechnology.implementationStatus')}</span>
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
              {t('xxNetworkTechnology.phase1Foundation')}
            </Badge>
          </div>
          
          <div className="bg-muted/50 rounded-md p-3 space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="font-medium">{t('xxNetworkTechnology.edgeFunctions')}</span>
              <span className="text-muted-foreground">- {t('xxNetworkTechnology.ndfRetrieval')}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="font-medium">{t('xxNetworkTechnology.clientInterface')}</span>
              <span className="text-muted-foreground">- {t('xxNetworkTechnology.mockWasm')}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="font-medium">{t('xxNetworkTechnology.keystore')}</span>
              <span className="text-muted-foreground">- {t('xxNetworkTechnology.encryptedStorage')}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-warning" />
              <span className="font-medium">{t('xxNetworkTechnology.wasmModule')}</span>
              <span className="text-muted-foreground">- {t('xxNetworkTechnology.needsBuild')}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-muted-foreground" />
              <span className="font-medium">{t('xxNetworkTechnology.daoContracts')}</span>
              <span className="text-muted-foreground">- {t('xxNetworkTechnology.plannedPhase3')}</span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground text-center pt-2">
            {t('xxNetworkTechnology.learnMore')} <a href="https://xx.network" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{t('common.xxNetwork')}</a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
