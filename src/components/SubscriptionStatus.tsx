import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Clock, CheckCircle } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

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
    'personal': t('subscription.tiers.personal'),
    'personal-pro': t('subscription.tiers.personalPro'),
    'personal-premium': t('subscription.tiers.personalPremium'),
    'business': t('subscription.tiers.business'),
    'business-plus': t('subscription.tiers.businessPlus'),
    'enterprise': t('subscription.tiers.enterprise')
  };

  if (loading) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm border-border">
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-sm text-muted-foreground">{t('subscription.loadingStatus')}</div>
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
            <CardTitle className="text-lg">{t('subscription.noActive')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            {t('subscription.noActiveDesc')}
          </p>
          <Button onClick={onManageSubscription} className="w-full">
            {t('subscription.viewPlans')}
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
            {is_trial ? t('subscription.freeTrialActive') : t('subscription.subscriptionActive')}
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
            {is_trial ? t('subscription.trial') : t('subscription.subscription')} {t('subscription.endsOn')} {formatDate(endDate)}
          </p>
          <p className="text-sm font-medium">
            {daysRemaining > 0 ? (
              t('subscription.daysRemaining', { count: daysRemaining })
            ) : (
              t('subscription.expiresToday')
            )}
          </p>
        </div>
        
        {is_trial && daysRemaining <= 3 && (
          <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
            <p className="text-xs text-warning">
              {t('subscription.trialEndingSoon')}
            </p>
          </div>
        )}
        
        <Button 
          variant={is_trial ? "default" : "outline"} 
          onClick={onManageSubscription}
          className="w-full"
        >
          {is_trial ? t('subscription.subscribeNow') : t('subscription.manageSubscription')}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SubscriptionStatus;