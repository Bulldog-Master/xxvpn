import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, Zap } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';

interface SubscriptionGateProps {
  children: ReactNode;
  requiredTier: string;
  feature: string;
  onUpgrade?: () => void;
}

const SubscriptionGate = ({ children, requiredTier, feature, onUpgrade }: SubscriptionGateProps) => {
  const { user } = useAuth();
  const { subscribed, hasAccess, subscription_tier, is_trial, trial_end, subscription_end } = useSubscription();

  const tierNames = {
    'personal': 'Personal',
    'personal-pro': 'Personal Pro', 
    'personal-premium': 'Personal Premium',
    'business': 'Business',
    'business-plus': 'Business+',
    'enterprise': 'Enterprise'
  };

  const getFeatureIcon = () => {
    switch (feature.toLowerCase()) {
      case 'ultra-fast':
        return <Zap className="w-5 h-5 text-blue-500" />;
      case 'secure':
        return <Shield className="w-5 h-5 text-green-500" />;
      case 'ultra-secure':
        return <Lock className="w-5 h-5 text-purple-500" />;
      default:
        return <Shield className="w-5 h-5 text-primary" />;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  if (!user) {
    return (
      <Card className="border-dashed">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            {getFeatureIcon()}
            <CardTitle className="text-lg">{feature} VPN Mode</CardTitle>
          </div>
          <p className="text-muted-foreground">Sign in to access premium VPN features</p>
        </CardHeader>
        <CardContent className="text-center">
          <Button variant="outline" onClick={onUpgrade}>
            Sign In to Continue
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (hasAccess(requiredTier)) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getFeatureIcon()}
            <span className="font-medium">{feature} Mode</span>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {is_trial ? 'Trial Active' : 'Subscribed'}
            </Badge>
          </div>
          {is_trial && trial_end && (
            <Badge variant="outline" className="text-xs">
              Trial ends {formatDate(trial_end)}
            </Badge>
          )}
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="relative">
      <Card className="border-dashed border-muted-foreground/30">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            {getFeatureIcon()}
            <CardTitle className="text-lg">{feature} VPN Mode</CardTitle>
            <Lock className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">
            Requires {tierNames[requiredTier as keyof typeof tierNames] || requiredTier} plan or higher
          </p>
          {subscription_tier && subscribed && (
            <p className="text-sm text-muted-foreground">
              Current plan: {tierNames[subscription_tier as keyof typeof tierNames]}
            </p>
          )}
        </CardHeader>
        <CardContent className="text-center space-y-3">
          <div className="text-sm text-muted-foreground">
            Start your 7-day free trial to unlock this feature
          </div>
          <Button variant="default" onClick={onUpgrade}>
            Upgrade Plan
          </Button>
        </CardContent>
      </Card>
      
      {/* Render disabled children behind the gate */}
      <div className="absolute inset-0 pointer-events-none opacity-30 select-none">
        {children}
      </div>
    </div>
  );
};

export default SubscriptionGate;