import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Building2, Sparkles, Clock } from 'lucide-react';

interface ComingSoonFeature {
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  tier: 'Advanced Security' | 'Enterprise-Grade';
  estimatedDate: string;
}

const COMING_SOON_FEATURES: ComingSoonFeature[] = [
  {
    title: 'Advanced Security Suite',
    description: 'Military-grade security features for ultimate protection',
    icon: <Shield className="h-6 w-6" />,
    tier: 'Advanced Security',
    estimatedDate: 'Q2 2024',
    features: [
      'Multi-hop VPN chaining',
      'Advanced threat detection',
      'Quantum-resistant encryption',
      'Stealth mode protocols',
      'Advanced malware protection',
      'Network intrusion detection'
    ]
  },
  {
    title: 'Enterprise Management',
    description: 'Professional-grade management and deployment tools',
    icon: <Building2 className="h-6 w-6" />,
    tier: 'Enterprise-Grade',
    estimatedDate: 'Q3 2024',
    features: [
      'Centralized team management',
      'Advanced user provisioning',
      'Compliance reporting',
      'Custom branding options',
      'API access & integrations',
      'Advanced analytics dashboard'
    ]
  }
];

const ComingSoonPanel: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <Sparkles className="h-16 w-16 mx-auto mb-4 text-primary animate-float" />
        <h2 className="text-2xl font-bold mb-2">Exciting Features Coming Soon</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          We're working on advanced features that will take your VPN experience to the next level. 
          Get ready for military-grade security and enterprise-level management capabilities.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {COMING_SOON_FEATURES.map((feature, index) => (
          <Card key={feature.title} className="glass-card border-primary/20 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                <Clock className="h-3 w-3 mr-1" />
                {feature.estimatedDate}
              </Badge>
            </div>
            
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  {feature.icon}
                </div>
                <div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <Badge variant="outline" className="mt-1">
                    {feature.tier}
                  </Badge>
                </div>
              </div>
              <CardDescription className="text-base">
                {feature.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3 text-primary">Planned Features:</h4>
                  <div className="grid gap-2">
                    {feature.features.map((featureName, featureIndex) => (
                      <div 
                        key={featureIndex}
                        className="flex items-center gap-2 text-sm"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                        <span className="text-muted-foreground">{featureName}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Button 
                    variant="outline" 
                    className="w-full hover-lift" 
                    disabled
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Notify Me When Available
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Want Early Access?</h3>
            <p className="text-muted-foreground mb-4">
              Join our beta program to get exclusive early access to new features and help shape the future of xxVPN.
            </p>
            <Button className="hover-lift">
              <Sparkles className="h-4 w-4 mr-2" />
              Join Beta Program
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComingSoonPanel;