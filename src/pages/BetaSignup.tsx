import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Zap, Lock, Network, CheckCircle2, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const betaSignupSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  referralSource: z.string().optional(),
});

export default function BetaSignup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    referralSource: '',
  });
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const features = [
    { id: 'ultra-secure', label: 'Ultra-Secure Mode (Quantum-Resistant P2P)', icon: Shield },
    { id: 'xx-payments', label: 'XX Token Payments', icon: Zap },
    { id: 'dao-governance', label: 'DAO Governance', icon: Network },
    { id: 'privacy-features', label: 'Advanced Privacy Features', icon: Lock },
  ];

  const handleFeatureToggle = (featureId: string) => {
    setSelectedFeatures(prev =>
      prev.includes(featureId)
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
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
      const { error } = await supabase
        .from('beta_waitlist')
        .insert({
          email: formData.email.toLowerCase(),
          name: formData.name,
          referral_source: formData.referralSource || null,
          interested_features: selectedFeatures.length > 0 ? selectedFeatures : null,
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: 'Already Registered',
            description: 'This email is already on our waitlist!',
            variant: 'destructive',
          });
        } else {
          throw error;
        }
        return;
      }

      setSubmitted(true);
      toast({
        title: 'Welcome to the Beta!',
        description: "You're on the list! We'll send you an invite soon.",
      });
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

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
        <Card className="max-w-md w-full glass-effect border-primary/20">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <CardTitle className="text-2xl">You're In! 🎉</CardTitle>
            <CardDescription>
              Thanks for joining our beta waitlist. We'll send you an invite to {formData.email} soon.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h4 className="font-semibold mb-2">What's Next?</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Check your email for beta access (coming soon)</li>
                <li>✓ Join our Discord community</li>
                <li>✓ Get free XX tokens for early users</li>
                <li>✓ Lifetime 20% discount on subscriptions</li>
              </ul>
            </div>
            <Button onClick={() => navigate('/')} variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
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
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="text-sm font-semibold text-primary">QUANTUM-RESISTANT VPN</span>
          </div>
          <CardTitle className="text-3xl">Join the Beta Waitlist</CardTitle>
          <CardDescription className="text-base">
            Be among the first to experience the world's first quantum-resistant VPN powered by xx network's cMixx protocol.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  maxLength={100}
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  maxLength={255}
                />
              </div>

              <div>
                <Label htmlFor="referral">How did you hear about us?</Label>
                <Input
                  id="referral"
                  type="text"
                  placeholder="Twitter, Discord, Friend, etc."
                  value={formData.referralSource}
                  onChange={(e) => setFormData(prev => ({ ...prev, referralSource: e.target.value }))}
                  maxLength={200}
                />
              </div>
            </div>

            {/* Feature Interest */}
            <div className="space-y-3">
              <Label>What features interest you most?</Label>
              <div className="grid gap-3">
                {features.map(feature => (
                  <div
                    key={feature.id}
                    className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => handleFeatureToggle(feature.id)}
                  >
                    <Checkbox
                      id={feature.id}
                      checked={selectedFeatures.includes(feature.id)}
                      onCheckedChange={() => handleFeatureToggle(feature.id)}
                    />
                    <feature.icon className="w-4 h-4 text-primary" />
                    <label
                      htmlFor={feature.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                    >
                      {feature.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Beta Benefits */}
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-warning" />
                Beta Benefits
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Free 30-day trial of Ultra-Secure mode</li>
                <li>✓ 100 free XX tokens to get started</li>
                <li>✓ Lifetime 20% discount on all plans</li>
                <li>✓ Direct access to development team</li>
                <li>✓ Vote on new features via DAO</li>
              </ul>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? 'Joining Waitlist...' : 'Join Beta Waitlist'}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              By signing up, you agree to receive beta updates and early access invitations.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
