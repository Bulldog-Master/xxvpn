import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Zap, Lock, Network, Cpu, Globe } from 'lucide-react';

export const XXNetworkInfoPanel = () => {
  const features = [
    {
      icon: Shield,
      title: 'Quantum-Resistant',
      description: 'Post-quantum cryptography protects against future quantum computer attacks',
      color: 'text-primary',
    },
    {
      icon: Lock,
      title: 'Metadata Shredding',
      description: 'cMixx protocol destroys metadata - what, when, where, and how you communicate',
      color: 'text-success',
    },
    {
      icon: Network,
      title: 'Decentralized Mixnet',
      description: 'P2P network of nodes routes traffic through multiple hops for privacy',
      color: 'text-secondary',
    },
    {
      icon: Zap,
      title: 'True P2P',
      description: 'Direct browser-to-mixnet connection - no backend sees your traffic',
      color: 'text-warning',
    },
    {
      icon: Cpu,
      title: 'WebAssembly',
      description: 'Full cMixx client runs in your browser using compiled Go code',
      color: 'text-accent',
    },
    {
      icon: Globe,
      title: 'DAO Governed',
      description: 'Community-owned network with decentralized governance via xxChain',
      color: 'text-primary',
    },
  ];

  return (
    <Card className="glass-effect">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>xx Network Technology</CardTitle>
            <CardDescription>
              Revolutionary quantum-resistant privacy platform
            </CardDescription>
          </div>
          <Badge className="bg-primary/20 text-primary border-primary/30">
            cMixx Protocol
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
            <span className="text-muted-foreground">Implementation Status</span>
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
              Phase 1: Foundation ✓
            </Badge>
          </div>
          
          <div className="bg-muted/50 rounded-md p-3 space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="font-medium">Edge Functions</span>
              <span className="text-muted-foreground">- NDF retrieval & health monitoring</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="font-medium">Client Interface</span>
              <span className="text-muted-foreground">- Mock WASM ready for real xxdk</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="font-medium">Keystore</span>
              <span className="text-muted-foreground">- Encrypted local storage in IndexedDB</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-warning" />
              <span className="font-medium">WASM Module</span>
              <span className="text-muted-foreground">- Needs build from xxdk-wasm repo</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-muted-foreground" />
              <span className="font-medium">DAO Contracts</span>
              <span className="text-muted-foreground">- Planned for Phase 3</span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground text-center pt-2">
            Learn more: <a href="https://xx.network" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">xx.network</a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
