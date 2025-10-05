import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Zap, Rocket, ArrowRight } from 'lucide-react';

export const BetaBanner = () => {
  const navigate = useNavigate();

  return (
    <Card className="glass-effect border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background mb-8">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
              <Shield className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Join the Quantum-Secure Beta</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Be among the first 100 users to experience the world's first quantum-resistant VPN powered by xx network's cMixx protocol.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-success" />
                <span>30-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Rocket className="w-4 h-4 text-success" />
                <span>Lifetime 20% discount</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-success" />
                <span>Post-quantum encryption</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => navigate('/beta')}
              size="lg"
              className="gap-2"
            >
              Join Beta Waitlist
              <ArrowRight className="w-4 h-4" />
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Limited to first 100 users
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
