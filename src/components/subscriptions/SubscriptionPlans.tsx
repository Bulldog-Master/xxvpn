import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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

  const plans: SubscriptionPlan[] = [
    {
      id: 'personal',
      name: 'Personal',
      duration: 'month',
      price: 1299, // $12.99 in cents
      currency: 'USD',
      trialDays: 7,
      features: [
        'Up to 10 devices',
        'Unlimited bandwidth',
        'All server locations',
        'Advanced cMixx technology',
        'Gaming & Privacy modes',
        'Cross-platform support'
      ]
    },
    {
      id: 'business',
      name: 'Business',
      duration: 'month',
      price: 2999, // $29.99 in cents
      currency: 'USD',
      popular: true,
      trialDays: 7,
      features: [
        '11-25 devices',
        'Everything in Personal',
        'Priority customer support',
        'Advanced security features',
        'Team management dashboard',
        'Centralized billing'
      ]
    },
    {
      id: 'professional',
      name: 'Professional',
      duration: 'month',
      price: 5999, // $59.99 in cents
      currency: 'USD',
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
        'Everything in Professional',
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

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Choose Your Plan</h2>
        <p className="text-muted-foreground">
          Start with a <span className="text-primary font-medium">7-day free trial</span> on any plan
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
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

              <Button
                variant={selectedPlan?.id === plan.id ? "default" : "outline"}
                className="w-full"
                size="sm"
              >
                {selectedPlan?.id === plan.id ? 'Selected' : 'Select Plan'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>All plans include a 7-day free trial. Cancel anytime during the trial period without charge.</p>
      </div>
    </div>
  );
};

export default SubscriptionPlans;