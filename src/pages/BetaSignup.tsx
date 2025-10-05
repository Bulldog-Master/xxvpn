import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Zap, Lock, Check, Rocket } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';

const betaSignupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
});

export default function BetaSignup() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    referralSource: '',
  });
  const [interestedFeatures, setInterestedFeatures] = useState<string[]>([]);

  const features = [
    {
      icon: Shield,
      title: 'Ultra-Secure Mode',
      description: 'Quantum-resistant P2P encryption via xx network cMixx',
    },
    {
      icon: Zap,
      title: 'Ultra-Fast Mode',
      description: 'Direct connections for maximum speed',
    },
    {
      icon: Lock,
      title: 'XX Token Payments',
      description: 'Pay with cryptocurrency for true privacy',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    try {
      betaSignupSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Validation Error',
          description: error.errors[0].message,
          variant: 'destructive',
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('beta_waitlist').insert({
        email: formData.email.toLowerCase().trim(),
        name: formData.name.trim(),
        referral_source: formData.referralSource.trim() || null,
        interested_features: interestedFeatures.length > 0 ? interestedFeatures : null,
      });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: 'Already Registered',
            description: 'This email is already on the waitlist!',
            variant: 'destructive',
          });
        } else {
          throw error;
        }
      } else {
        setIsSuccess(true);
        toast({
          title: 'Welcome to the Beta!',
          description: "You're on the list. We'll email you when it's your turn.",
        });
      }
    } catch (error) {
      console.error('Beta signup error:', error);
      toast({
        title: 'Signup Failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFeature = (feature: string) => {
    setInterestedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    );
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
        <Card className="max-w-md w-full glass-effect border-primary/20">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-success" />
            </div>
            <CardTitle className="text-2xl">You're In!</CardTitle>
            <CardDescription>
              Welcome to the future of quantum-secure VPN
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-center">
                We'll send you an invite to <strong>{formData.email}</strong> when we're ready to onboard the next batch of beta testers.
              </p>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-medium">What's Next?</p>
              <ul className="space-y-1 ml-4">
                <li>• We're onboarding in small batches</li>
                <li>• Expect your invite in 1-2 weeks</li>
                <li>• Get 30 days free + lifetime 20% discount</li>
              </ul>
            </div>
            <Button onClick={() => navigate('/')} className="w-full">
              <Rocket className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <Card className="max-w-2xl w-full glass-effect border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Join the Beta</CardTitle>
          <CardDescription className="text-base">
            Be among the first to experience quantum-resistant VPN technology
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="p-4 bg-muted/30 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => toggleFeature(feature.title)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={interestedFeatures.includes(feature.title)}
                      onCheckedChange={() => toggleFeature(feature.title)}
                    />
                    <div>
                      <feature.icon className="w-5 h-5 text-primary mb-2" />
                      <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="referral">How did you hear about us?</Label>
                <Input
                  id="referral"
                  type="text"
                  placeholder="Twitter, friend, etc."
                  value={formData.referralSource}
                  onChange={(e) =>
                    setFormData({ ...formData, referralSource: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Beta Perks */}
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Rocket className="w-4 h-4" />
                Beta Perks
              </h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>✓ 30-day free trial</li>
                <li>✓ Lifetime 20% discount</li>
                <li>✓ Direct access to development team</li>
                <li>✓ Influence product roadmap</li>
              </ul>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Joining...' : 'Join Beta Waitlist'}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Limited to first 100 users • We respect your privacy
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
