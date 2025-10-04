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
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { subscription_tier, is_trial, subscribed, startTrial, loading } = useSubscription();
  const [cryptoModalOpen, setCryptoModalOpen] = useState(false);
  const [selectedCryptoPlan, setSelectedCryptoPlan] = useState<SubscriptionPlan | null>(null);

  const personalPlans: SubscriptionPlan[] = [
    {
      id: 'personal-basic',
      name: 'Personal',
      duration: 'month',
      price: 999, // $9.99 in cents
      currency: 'USD',
      trialDays: 7,
      features: [
        'Up to 5 devices',
        'Unlimited bandwidth',
        'All server locations',
        'Advanced cMixx technology',
        'Basic support'
      ]
    },
    {
      id: 'personal-pro',
      name: 'Personal Pro',
      duration: 'month',
      price: 1299, // $12.99 in cents
      currency: 'USD',
      popular: true,
      trialDays: 7,
      features: [
        'Up to 10 devices',
        'Everything in Personal',
        'Gaming & Privacy modes',
        'Priority support',
        'Cross-platform support'
      ]
    },
    {
      id: 'personal-premium',
      name: 'Personal Premium',
      duration: 'month',
      price: 1999, // $19.99 in cents
      currency: 'USD',
      trialDays: 7,
      features: [
        'Up to 15 devices',
        'Everything in Personal Pro',
        'Advanced security features',
        'Custom configurations',
        'Premium support'
      ]
    }
  ];

  const businessPlans: SubscriptionPlan[] = [
    {
      id: 'business',
      name: 'Business',
      duration: 'month',
      price: 2999, // $29.99 in cents
      currency: 'USD',
      trialDays: 7,
      features: [
        '11-25 devices',
        'Team management dashboard',
        'Centralized billing',
        'Priority customer support',
        'Advanced security features'
      ]
    },
    {
      id: 'business-plus',
      name: 'Business +',
      duration: 'month',
      price: 5999, // $59.99 in cents
      currency: 'USD',
      popular: true,
      trialDays: 7,
      features: [
        '26-100 devices',
        'Everything in Business',
        'Dedicated account manager',
        'Custom configuration options',
        'Advanced analytics',
        'SLA guarantee'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      duration: 'month',
      price: 9999, // $99.99 in cents
      currency: 'USD',
      trialDays: 7,
      features: [
        '101+ devices',
        'Everything in Business +',
        'Custom deployment options',
        'White-label solutions',
        'On-premise integration',
        '24/7 premium support',
        'Custom SLA'
      ]
    }
  ];

  const getMonthlyPrice = (plan: SubscriptionPlan) => {
    return plan.price / 100;
  };

  const handleStartTrial = async (plan: SubscriptionPlan) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to start your free trial.",
        variant: "destructive",
      });
      return;
    }

    if (subscribed && subscription_tier === plan.id) {
      toast({
        title: "Already Subscribed",
        description: `You already have an active ${is_trial ? 'trial' : 'subscription'} for this plan.`,
      });
      return;
    }

    try {
      const result = await startTrial(plan.id);
      if (result.success) {
        toast({
          title: "Trial Started!",
          description: `Your 7-day free trial for ${plan.name} has started. Enjoy full access to all VPN tiers!`,
        });
        onPlanSelect(plan);
      } else {
        throw result.error;
      }
    } catch (error) {
      console.error('Error starting trial:', error);
      toast({
        title: "Error",
        description: "Failed to start trial. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getButtonText = (plan: SubscriptionPlan) => {
    if (loading) return 'Loading...';
    if (subscription_tier === plan.id && subscribed) {
      return is_trial ? 'Active Trial' : 'Active Plan';
    }
    if (selectedPlan?.id === plan.id) return 'Selected';
    return 'Start Free Trial';
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
              Most Popular
            </Badge>
          )}

          <CardHeader className="text-center pb-4">
            <CardTitle className="text-lg font-semibold">{plan.name}</CardTitle>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-primary">
                ${getMonthlyPrice(plan).toFixed(2)}
                <span className="text-sm text-muted-foreground font-normal">/month</span>
              </div>
              {plan.originalPrice && (
                <div className="text-sm text-muted-foreground">
                  <span className="line-through">${(plan.originalPrice / 100).toFixed(2)}</span>
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {plan.savings}
                  </Badge>
                </div>
              )}
              <div className="text-sm text-muted-foreground">
                Billed ${(plan.price / 100).toFixed(2)} every {plan.duration}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="text-center">
              <Badge variant="outline" className="text-xs">
                {plan.trialDays}-day free trial
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
                  Pay with Crypto
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
        <h2 className="text-2xl font-bold">Choose Your Plan</h2>
        <p className="text-muted-foreground">
          Start with a <span className="text-primary font-medium">7-day free trial</span> on any plan
        </p>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal" className="space-y-4">
          {renderPlanCards(personalPlans)}
        </TabsContent>
        
        <TabsContent value="business" className="space-y-4">
          {renderPlanCards(businessPlans)}
        </TabsContent>
      </Tabs>

      <div className="text-center text-sm text-muted-foreground">
        <p>All plans include a 7-day free trial. Cancel anytime during the trial period without charge.</p>
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