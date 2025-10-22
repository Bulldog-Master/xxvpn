import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Crown, Coins } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { CryptoPaymentModal } from './CryptoPaymentModal';
import { formatNumber } from '@/utils/numberFormat';

export interface SubscriptionPlan {
  id: string;
  name: string;
  duration: string;
  price: number;
  originalPrice?: number;
  currency: string;
  savings?: string;
  features: string[];
  popular?: boolean;
  trialDays: number;
}

interface SubscriptionPlansProps {
  onPlanSelect: (plan: SubscriptionPlan) => void;
  selectedPlan?: SubscriptionPlan;
}

const SubscriptionPlans = ({ onPlanSelect, selectedPlan }: SubscriptionPlansProps) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { subscription_tier, is_trial, subscribed, startTrial, loading } = useSubscription();
  const [cryptoModalOpen, setCryptoModalOpen] = useState(false);
  const [selectedCryptoPlan, setSelectedCryptoPlan] = useState<SubscriptionPlan | null>(null);

  const personalPlans: SubscriptionPlan[] = [
    {
      id: 'personal-single',
      name: t('plans.singleDevice'),
      duration: 'month',
      price: 499, // $4.99 in cents
      currency: 'USD',
      trialDays: 7,
      features: [
        t('planFeatures.oneDeviceOnly'),
        t('planFeatures.unlimitedBandwidth'),
        t('planFeatures.allServerLocations'),
        t('planFeatures.advancedCmixxTech'),
        t('planFeatures.emailSupport')
      ]
    },
    {
      id: 'personal-basic',
      name: t('plans.personal'),
      duration: 'month',
      price: 999, // $9.99 in cents
      currency: 'USD',
      trialDays: 7,
      features: [
        t('planFeatures.upTo5Devices'),
        t('planFeatures.unlimitedBandwidth'),
        t('planFeatures.allServerLocations'),
        t('planFeatures.advancedCmixxTech'),
        t('planFeatures.basicSupport')
      ]
    },
    {
      id: 'personal-pro',
      name: t('plans.personalPro'),
      duration: 'month',
      price: 1299, // $12.99 in cents
      currency: 'USD',
      popular: true,
      trialDays: 7,
      features: [
        t('planFeatures.upTo10Devices'),
        t('planFeatures.everythingInPersonal'),
        t('planFeatures.gamingPrivacyModes'),
        t('planFeatures.prioritySupport'),
        t('planFeatures.crossPlatformSupport')
      ]
    },
    {
      id: 'personal-premium',
      name: t('plans.personalPremium'),
      duration: 'month',
      price: 1999, // $19.99 in cents
      currency: 'USD',
      trialDays: 7,
      features: [
        t('planFeatures.upTo15Devices'),
        t('planFeatures.everythingInPersonalPro'),
        t('planFeatures.advancedSecurityFeatures'),
        t('planFeatures.customConfigurations'),
        t('planFeatures.premiumSupport')
      ]
    }
  ];

  const businessPlans: SubscriptionPlan[] = [
    {
      id: 'business',
      name: t('plans.business'),
      duration: 'month',
      price: 2999, // $29.99 in cents
      currency: 'USD',
      trialDays: 7,
      features: [
        t('planFeatures.devices11to25'),
        t('planFeatures.teamManagementDashboard'),
        t('planFeatures.centralizedBilling'),
        t('planFeatures.priorityCustomerSupport'),
        t('planFeatures.advancedSecurityFeatures')
      ]
    },
    {
      id: 'business-plus',
      name: t('plans.businessPlus'),
      duration: 'month',
      price: 5999, // $59.99 in cents
      currency: 'USD',
      popular: true,
      trialDays: 7,
      features: [
        t('planFeatures.devices26to100'),
        t('planFeatures.everythingInBusiness'),
        t('planFeatures.dedicatedAccountManager'),
        t('planFeatures.customConfigOptions'),
        t('planFeatures.advancedAnalytics'),
        t('planFeatures.slaGuarantee')
      ]
    },
    {
      id: 'enterprise',
      name: t('plans.enterprise'),
      duration: 'month',
      price: 9999, // $99.99 in cents
      currency: 'USD',
      trialDays: 7,
      features: [
        t('planFeatures.devices101plus'),
        t('planFeatures.everythingInBusinessPlus'),
        t('planFeatures.customDeploymentOptions'),
        t('planFeatures.whiteLabelSolutions'),
        t('planFeatures.onPremiseIntegration'),
        t('planFeatures.premiumSupport247'),
        t('planFeatures.customSLA')
      ]
    }
  ];

  const getMonthlyPrice = (plan: SubscriptionPlan) => {
    return plan.price / 100;
  };

  const handleStartTrial = async (plan: SubscriptionPlan) => {
    if (!user) {
      toast({
        title: t('subscriptionPlans.authRequired'),
        description: t('subscriptionPlans.signInToStart'),
        variant: "destructive",
      });
      return;
    }

    if (subscribed && subscription_tier === plan.id) {
      toast({
        title: t('subscriptionPlans.alreadySubscribed'),
        description: t('subscriptionPlans.alreadyHaveActive', { type: is_trial ? t('subscriptionPlans.trial') : t('subscriptionPlans.subscription') }),
      });
      return;
    }

    try {
      const result = await startTrial(plan.id);
      if (result.success) {
        toast({
          title: t('subscriptionPlans.trialStarted'),
          description: t('subscriptionPlans.trialStartedDesc', { name: plan.name }),
        });
        onPlanSelect(plan);
      } else {
        throw result.error;
      }
    } catch (error) {
      console.error('Error starting trial:', error);
      toast({
        title: t('subscriptionPlans.error'),
        description: t('subscriptionPlans.failedToStart'),
        variant: "destructive",
      });
    }
  };

  const getButtonText = (plan: SubscriptionPlan) => {
    if (loading) return t('subscriptionPlans.loading');
    if (subscription_tier === plan.id && subscribed) {
      return is_trial ? t('subscriptionPlans.activeTrial') : t('subscriptionPlans.activePlan');
    }
    if (selectedPlan?.id === plan.id) return t('subscriptionPlans.selected');
    return t('subscriptionPlans.startFreeTrial');
  };

  const isCurrentPlan = (plan: SubscriptionPlan) => {
    return subscription_tier === plan.id && subscribed;
  };

  const renderPlanCards = (plans: SubscriptionPlan[]) => (
    <div className="grid md:grid-cols-3 gap-4">
      {plans.map((plan) => (
        <Card
          key={plan.id}
          className={`relative cursor-pointer transition-all duration-200 ${
            selectedPlan?.id === plan.id
              ? 'border-primary bg-primary/5 scale-105'
              : 'border-border hover:border-primary/50 hover:scale-102'
          } ${plan.popular ? 'ring-2 ring-primary/20' : ''}`}
          onClick={() => onPlanSelect(plan)}
        >
          {plan.popular && (
            <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
              <Crown className="w-3 h-3 mr-1" />
              {t('subscriptionPlans.mostPopular')}
            </Badge>
          )}

          <CardHeader className="text-center pb-4">
            <CardTitle className="text-lg font-semibold">{plan.name}</CardTitle>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-primary">
                {i18n.language === 'ar' 
                  ? `${formatNumber(getMonthlyPrice(plan), i18n.language, 2)} ${t('common.currencySymbol')}`
                  : `${t('common.currencySymbol')}${formatNumber(getMonthlyPrice(plan), i18n.language, 2)}`
                }
                <span className="text-sm text-muted-foreground font-normal">{t('subscriptionPlans.perMonth')}</span>
              </div>
              {plan.originalPrice && (
                <div className="text-sm text-muted-foreground">
                  <span className="line-through">
                    {i18n.language === 'ar'
                      ? `${formatNumber(plan.originalPrice / 100, i18n.language, 2)} ${t('common.currencySymbol')}`
                      : `${t('common.currencySymbol')}${formatNumber(plan.originalPrice / 100, i18n.language, 2)}`
                    }
                  </span>
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {plan.savings}
                  </Badge>
                </div>
              )}
              <div className="text-sm text-muted-foreground">
                {t('subscriptionPlans.billed', { 
                  price: i18n.language === 'ar'
                    ? `${formatNumber(plan.price / 100, i18n.language, 2)} ${t('common.currencySymbol')}`
                    : `${t('common.currencySymbol')}${formatNumber(plan.price / 100, i18n.language, 2)}`,
                  duration: t(`subscriptionPlans.${plan.duration}`) 
                })}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="text-center">
              <Badge variant="outline" className="text-xs">
                {t('subscriptionPlans.dayFreeTrialBadge', { days: plan.trialDays })}
              </Badge>
            </div>

            <ul className="space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="space-y-2">
              <Button
                variant={isCurrentPlan(plan) ? "default" : "outline"}
                className="w-full"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartTrial(plan);
                }}
                disabled={loading || isCurrentPlan(plan)}
              >
                {getButtonText(plan)}
              </Button>
              
              {!isCurrentPlan(plan) && (
                <Button
                  variant="ghost"
                  className="w-full"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCryptoPlan(plan);
                    setCryptoModalOpen(true);
                  }}
                >
                  <Coins className="w-4 h-4 mr-2" />
                  {t('subscriptionPlans.payWithCrypto')}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">{t('subscriptionPlans.chooseYourPlan')}</h2>
        <p className="text-muted-foreground">
          {t('subscriptionPlans.startWithFreeTrial')} <span className="text-primary font-medium">{t('subscriptionPlans.dayFreeTrial')}</span> {t('subscriptionPlans.onAnyPlan')}
        </p>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="personal">{t('subscriptionPlans.personal')}</TabsTrigger>
          <TabsTrigger value="business">{t('subscriptionPlans.business')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal" className="space-y-4">
          {renderPlanCards(personalPlans)}
        </TabsContent>
        
        <TabsContent value="business" className="space-y-4">
          {renderPlanCards(businessPlans)}
        </TabsContent>
      </Tabs>

      <div className="text-center text-sm text-muted-foreground">
        <p>{t('subscriptionPlans.allPlansInclude')}</p>
      </div>

      {selectedCryptoPlan && (
        <CryptoPaymentModal
          open={cryptoModalOpen}
          onOpenChange={setCryptoModalOpen}
          plan={{
            name: selectedCryptoPlan.name,
            price: selectedCryptoPlan.price / 100,
            interval: selectedCryptoPlan.duration
          }}
        />
      )}
    </div>
  );
};

export default SubscriptionPlans;