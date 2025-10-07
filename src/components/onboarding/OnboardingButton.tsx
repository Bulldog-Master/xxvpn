import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Server, 
  Zap, 
  Settings, 
  ArrowRight, 
  CheckCircle2,
  X,
  HelpCircle
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  tips: string[];
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to xxVPN',
    description: 'Your quantum-resistant VPN powered by the xx network',
    icon: <Shield className="w-12 h-12 text-primary" />,
    tips: [
      'Military-grade quantum-resistant encryption',
      'Metadata shredding for complete privacy',
      'Decentralized mixnet architecture'
    ]
  },
  {
    id: 'server-selection',
    title: 'Choose Your Server',
    description: 'Select from our global network of secure servers',
    icon: <Server className="w-12 h-12 text-primary" />,
    tips: [
      'Servers across 50+ countries',
      'Smart routing for best performance',
      'Real-time server load indicators'
    ]
  },
  {
    id: 'connect',
    title: 'One-Click Connection',
    description: 'Connect to the VPN with a single click',
    icon: <Zap className="w-12 h-12 text-primary" />,
    tips: [
      'Quick connect to optimal server',
      'Auto-reconnect on disconnect',
      'Kill switch protection available'
    ]
  },
  {
    id: 'features',
    title: 'Advanced Features',
    description: 'Explore powerful privacy and security features',
    icon: <Settings className="w-12 h-12 text-primary" />,
    tips: [
      'Custom DNS configuration',
      'Split tunneling for apps',
      'Ad & malware blocking',
      'DNS leak protection'
    ]
  }
];

export const OnboardingButton = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsOpen(false);
    setCurrentStep(0);
  };

  const handleOpen = () => {
    setCurrentStep(0);
    setIsOpen(true);
  };

  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;
  const step = onboardingSteps[currentStep];

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleOpen}
        className="gap-2"
      >
        <HelpCircle className="w-4 h-4" />
        {t('tour')}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-4"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>

          <DialogHeader>
            <div className="flex items-center justify-between mb-4">
              <Badge variant="outline">
                Step {currentStep + 1} of {onboardingSteps.length}
              </Badge>
              <Progress value={progress} className="w-32 h-2" />
            </div>
            
            <div className="flex flex-col items-center text-center mb-4">
              <div className="p-4 rounded-full bg-primary/10 mb-4">
                {step.icon}
              </div>
              <DialogTitle className="text-2xl mb-2">{step.title}</DialogTitle>
              <DialogDescription className="text-base">
                {step.description}
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              {step.tips.map((tip, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{tip}</span>
                </div>
              ))}
            </div>

            {currentStep === onboardingSteps.length - 1 && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <p className="text-sm text-center">
                  🎉 You're all set! Start exploring xxVPN and enjoy complete privacy.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-between items-center">
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                >
                  Previous
                </Button>
              )}
              
              <Button
                onClick={handleNext}
                className="gap-2"
              >
                {currentStep === onboardingSteps.length - 1 ? (
                  <>
                    Finish
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
