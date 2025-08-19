import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Clock, CheckCircle } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

interface SubscriptionStatusProps {
  onManageSubscription?: () => void;
}

const SubscriptionStatus = ({ onManageSubscription }: SubscriptionStatusProps) => {
  const { 
    subscribed, 
    subscription_tier, 
    is_trial, 
    trial_end, 
    subscription_end, 
    loading 
  } = useSubscription();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysRemaining = (dateString: string | null) => {
    if (!dateString) return 0;
    const endDate = new Date(dateString);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const tierNames = {
    'personal': 'Personal',
    'personal-pro': 'Personal Pro',
    'personal-premium': 'Personal Premium',
    'business': 'Business',
    'business-plus': 'Business+',
    'enterprise': 'Enterprise'
  };

  if (loading) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm border-border">
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-sm text-muted-foreground">Loading subscription status...</div>
        </CardContent>
      </Card>
    );
  }

  if (!subscribed) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm border-border">
        <CardHeader className="text-center pb-3">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Crown className="w-5 h-5 text-muted-foreground" />
            <CardTitle className="text-lg">No Active Subscription</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Try our demo subscription to unlock all VPN modes and premium features
          </p>
          <Button onClick={onManageSubscription} className="w-full">
            Try Demo Subscription
          </Button>
        </CardContent>
      </Card>
    );
  }

  const endDate = is_trial ? trial_end : subscription_end;
  const daysRemaining = getDaysRemaining(endDate);
  const tierName = tierNames[subscription_tier as keyof typeof tierNames] || subscription_tier;

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border">
      <CardHeader className="text-center pb-3">
        <div className="flex items-center justify-center gap-2 mb-2">
          {is_trial ? (
            <Clock className="w-5 h-5 text-warning" />
          ) : (
            <CheckCircle className="w-5 h-5 text-success" />
          )}
          <CardTitle className="text-lg">
            {is_trial ? 'Free Trial Active' : 'Subscription Active'}
          </CardTitle>
        </div>
        <Badge 
          variant={is_trial ? "secondary" : "default"}
          className={is_trial ? "bg-warning/20 text-warning" : "bg-success/20 text-success"}
        >
          {tierName}
        </Badge>
      </CardHeader>
      <CardContent className="text-center space-y-3">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            {is_trial ? 'Trial' : 'Subscription'} ends on {formatDate(endDate)}
          </p>
          <p className="text-sm font-medium">
            {daysRemaining > 0 ? (
              `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining`
            ) : (
              'Expires today'
            )}
          </p>
        </div>
        
        {is_trial && daysRemaining <= 3 && (
          <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
            <p className="text-xs text-warning">
              Your trial is ending soon. Subscribe to continue enjoying all features.
            </p>
          </div>
        )}
        
        <Button 
          variant={is_trial ? "default" : "outline"} 
          onClick={onManageSubscription}
          className="w-full"
        >
          {is_trial ? 'Subscribe Now' : 'Manage Subscription'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SubscriptionStatus;