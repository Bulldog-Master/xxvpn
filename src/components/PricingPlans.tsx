import { Check, Zap, Shield, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PricingPlan {
  id: string;
  duration: string;
  price: string;
  originalPrice?: string;
  monthlyPrice: string;
  savings?: string;
  badge?: string;
  popular?: boolean;
  totalMonths: number;
}

const plans: PricingPlan[] = [
  {
    id: '1month',
    duration: '1 month',
    price: '$12.99',
    monthlyPrice: 'Month',
    totalMonths: 1
  },
  {
    id: '2years',
    duration: '2 years',
    price: '$2.59',
    originalPrice: '$310.80',
    monthlyPrice: 'Month',
    savings: '80%',
    badge: 'Early Bird Promo 80%',
    popular: true,
    totalMonths: 24
  },
  {
    id: '1year',
    duration: '1 year',
    price: '$3.65',
    originalPrice: '$162.22',
    monthlyPrice: 'Month',
    savings: '73%',
    badge: 'Early Bird Promo 73%',
    totalMonths: 12
  }
];

const features = [
  {
    icon: Zap,
    title: 'Quantum-resistant AmneziaWG',
    description: 'for daily browsing'
  },
  {
    icon: Shield,
    title: 'Anonymous cMixx mixnet',
    description: 'for advanced privacy'
  },
  {
    icon: Globe,
    title: '50+ entry and exit locations',
    description: 'worldwide'
  },
  {
    icon: Shield,
    title: 'Up to 10 devices per account',
    description: ''
  },
  {
    icon: Check,
    title: 'Payment and browsing data',
    description: 'cannot be linked'
  },
  {
    icon: Check,
    title: 'No centralized logs',
    description: ''
  },
  {
    icon: Check,
    title: 'Fully open source and audited',
    description: ''
  },
  {
    icon: Shield,
    title: 'Protected by quantum-resistant',
    description: 'encryption'
  }
];

const paymentMethods = [
  { name: 'Credit Card', icon: '💳' },
  { name: 'xx Coin', icon: '🪙' },
  { name: 'Apple Pay', icon: '🍎' },
  { name: 'Google Pay', icon: 'G' },
  { name: 'PayPal', icon: '💙' },
  { name: 'Cash', icon: '💵' }
];

interface PricingPlansProps {
  onPlanSelect: (planId: string) => void;
}

export default function PricingPlans({ onPlanSelect }: PricingPlansProps) {
  const calculateTotalPrice = (plan: PricingPlan) => {
    const monthlyPrice = parseFloat(plan.price.replace('$', ''));
    return (monthlyPrice * plan.totalMonths).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Choose Your xxVPN Plan
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Quantum-resistant privacy protection with dual-mode encryption. 
            Pay with traditional methods or xx Coin for maximum anonymity.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative border-2 transition-all duration-300 hover:shadow-xl ${
                plan.popular 
                  ? 'border-primary shadow-lg scale-105 bg-gradient-to-b from-primary/5 to-transparent' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    Most popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center space-y-4 pb-4">
                {plan.badge && (
                  <Badge variant="secondary" className="mx-auto">
                    <Zap className="w-3 h-3 mr-1" />
                    {plan.badge}
                  </Badge>
                )}
                
                <h3 className="text-2xl font-bold">{plan.duration}</h3>
                
                <div className="space-y-2">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/ {plan.monthlyPrice}</span>
                  </div>
                  
                  {plan.originalPrice && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground line-through">
                        {plan.originalPrice} ${calculateTotalPrice(plan)} for {plan.totalMonths} months
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Additional tax may apply
                      </p>
                    </div>
                  )}
                  
                  {!plan.originalPrice && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        For {plan.totalMonths} month{plan.totalMonths > 1 ? 's' : ''}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Additional tax may apply
                      </p>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <Button 
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-primary hover:bg-primary/90' 
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                  onClick={() => onPlanSelect(plan.id)}
                >
                  Get {plan.duration} plan
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <h2 className="text-2xl font-bold text-center">All xxVPN plans include</h2>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="font-medium">{feature.title}</p>
                    {feature.description && (
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <h2 className="text-2xl font-bold text-center">You can pay with</h2>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-center gap-6">
              {paymentMethods.map((method, index) => (
                <div key={index} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background/50">
                  <span className="text-lg">{method.icon}</span>
                  <span className="font-medium">{method.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}