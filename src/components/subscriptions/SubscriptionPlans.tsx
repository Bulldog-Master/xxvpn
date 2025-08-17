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
      id: 'monthly',
      name: 'Monthly',
      duration: 'month',
      price: 999, // $9.99 in cents
      currency: 'USD',
      trialDays: 7,
      features: [
        'Unlimited bandwidth',
        'All server locations',
        'Gaming & Privacy modes',
        'XX Network integration',
        'Cross-platform support'
      ]
    },
    {
      id: '6-month',
      name: '6 Months',
      duration: '6 months',
      price: 4794, // $47.94 in cents ($7.99/month)
      originalPrice: 5994, // $59.94 original price
      currency: 'USD',
      savings: 'Save 20%',
      popular: true,
      trialDays: 7,
      features: [
        'Everything in Monthly',
        'Priority customer support',
        'Advanced security features',
        'Early access to new features'
      ]
    },
    {
      id: 'annual',
      name: 'Annual',
      duration: 'year',
      price: 7188, // $71.88 in cents ($5.99/month)
      originalPrice: 11988, // $119.88 original price
      currency: 'USD',
      savings: 'Save 40%',
      trialDays: 7,
      features: [
        'Everything in 6 Months',
        'Dedicated account manager',
        'Custom configuration options',
        'Premium support'
      ]
    },
    {
      id: '2-year',
      name: '2 Years',
      duration: '2 years',
      price: 11976, // $119.76 in cents ($4.99/month)
      originalPrice: 23976, // $239.76 original price
      currency: 'USD',
      savings: 'Save 50%',
      trialDays: 7,
      features: [
        'Everything in Annual',
        'Lifetime price guarantee',
        'VIP support',
        'Exclusive beta features'
      ]
    }
  ];

  const getMonthlyPrice = (plan: SubscriptionPlan) => {
    switch (plan.id) {
      case 'monthly':
        return plan.price / 100;
      case '6-month':
        return (plan.price / 6) / 100;
      case 'annual':
        return (plan.price / 12) / 100;
      case '2-year':
        return (plan.price / 24) / 100;
      default:
        return plan.price / 100;
    }
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