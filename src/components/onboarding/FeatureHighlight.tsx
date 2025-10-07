import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Zap, 
  Globe, 
  Lock, 
  Server, 
  Settings,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  action?: {
    label: string;
    path: string;
  };
}

const features: Feature[] = [
  {
    id: 'quantum-security',
    title: 'Quantum-Resistant Security',
    description: 'Military-grade encryption that protects against future quantum computing threats',
    icon: <Shield className="w-6 h-6 text-primary" />,
    badge: 'New',
  },
  {
    id: 'fast-connection',
    title: 'Lightning Fast',
    description: 'Optimized servers providing blazing fast speeds without compromising security',
    icon: <Zap className="w-6 h-6 text-success" />,
  },
  {
    id: 'global-network',
    title: 'Global Network',
    description: 'Access content from anywhere with servers in 50+ countries worldwide',
    icon: <Globe className="w-6 h-6 text-blue-500" />,
    action: {
      label: 'View Servers',
      path: '/dashboard?tab=servers'
    }
  },
  {
    id: 'privacy-first',
    title: 'Zero-Log Policy',
    description: 'We never track, collect, or share your private data. Your privacy is guaranteed',
    icon: <Lock className="w-6 h-6 text-orange-500" />,
  },
  {
    id: 'xx-network',
    title: 'xx Network Integration',
    description: 'Powered by the decentralized xx network for maximum privacy and security',
    icon: <Server className="w-6 h-6 text-purple-500" />,
    badge: 'Beta',
  },
  {
    id: 'advanced-features',
    title: 'Advanced Control',
    description: 'Custom DNS, split tunneling, kill switch, and more advanced features',
    icon: <Settings className="w-6 h-6 text-gray-500" />,
    action: {
      label: 'Explore Settings',
      path: '/dashboard?tab=settings'
    }
  },
];

export const FeatureHighlight = () => {
  const navigate = useNavigate();

  const handleFeatureAction = (path: string) => {
    navigate(path);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Why Choose xxVPN?</h2>
        <p className="text-muted-foreground">
          Industry-leading features that put your privacy and security first
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <Card key={feature.id} className="glass-effect hover:border-primary/50 transition-all">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  {feature.icon}
                </div>
                {feature.badge && (
                  <Badge variant="outline" className="text-xs">
                    {feature.badge}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>

            {feature.action && (
              <CardContent>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full group"
                  onClick={() => handleFeatureAction(feature.action!.path)}
                >
                  {feature.action.label}
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <Card className="glass-effect border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg mb-1">Need Help Getting Started?</h3>
              <p className="text-sm text-muted-foreground">
                Check out our comprehensive guides and documentation
              </p>
            </div>
            <Button variant="outline" className="gap-2">
              View Guides
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
