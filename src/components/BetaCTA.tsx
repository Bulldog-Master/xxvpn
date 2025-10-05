import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Rocket, Zap } from 'lucide-react';

export const BetaCTA = () => {
  const navigate = useNavigate();

  return (
    <Card className="glass-effect border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <Rocket className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Join the Beta</CardTitle>
            <CardDescription>
              Be among the first 100 users to try quantum-resistant VPN
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 bg-background/50 rounded-lg">
            <Shield className="w-5 h-5 text-primary mb-1" />
            <p className="text-xs font-medium">Post-Quantum Secure</p>
          </div>
          <div className="p-3 bg-background/50 rounded-lg">
            <Zap className="w-5 h-5 text-warning mb-1" />
            <p className="text-xs font-medium">30 Days Free</p>
          </div>
          <div className="p-3 bg-background/50 rounded-lg">
            <Rocket className="w-5 h-5 text-success mb-1" />
            <p className="text-xs font-medium">20% Lifetime Discount</p>
          </div>
        </div>
        
        <Button 
          onClick={() => navigate('/beta')} 
          className="w-full"
          size="lg"
        >
          <Rocket className="w-4 h-4 mr-2" />
          Join Beta Waitlist
        </Button>
        
        <p className="text-xs text-center text-muted-foreground">
          Limited to 100 early adopters • Closes soon
        </p>
      </CardContent>
    </Card>
  );
};
