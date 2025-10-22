import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Server, 
  Zap, 
  Settings, 
  ArrowRight, 
  CheckCircle2,
  X
} from 'lucide-react';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useTranslation } from 'react-i18next';

interface OnboardingStep {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: React.ReactNode;
  tipsKeys: string[];
}

export const OnboardingTour = () => {
  const { t } = useTranslation();
  const { settings, saveSettings, loading } = useUserSettings('onboarding', { completed: false });
  
  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      titleKey: 'onboarding.welcome.title',
      descriptionKey: 'onboarding.welcome.description',
      icon: <Shield className="w-12 h-12 text-primary" />,
      tipsKeys: [
        'onboarding.welcome.tip1',
        'onboarding.welcome.tip2',
        'onboarding.welcome.tip3'
      ]
    },
    {
      id: 'server-selection',
      titleKey: 'onboarding.servers.title',
      descriptionKey: 'onboarding.servers.description',
      icon: <Server className="w-12 h-12 text-primary" />,
      tipsKeys: [
        'onboarding.servers.tip1',
        'onboarding.servers.tip2',
        'onboarding.servers.tip3'
      ]
    },
    {
      id: 'connect',
      titleKey: 'onboarding.connect.title',
      descriptionKey: 'onboarding.connect.description',
      icon: <Zap className="w-12 h-12 text-primary" />,
      tipsKeys: [
        'onboarding.connect.tip1',
        'onboarding.connect.tip2',
        'onboarding.connect.tip3'
      ]
    },
    {
      id: 'features',
      titleKey: 'onboarding.features.title',
      descriptionKey: 'onboarding.features.description',
      icon: <Settings className="w-12 h-12 text-primary" />,
      tipsKeys: [
        'onboarding.features.tip1',
        'onboarding.features.tip2',
        'onboarding.features.tip3',
        'onboarding.features.tip4'
      ]
    }
  ];
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    if (!loading && !settings.completed) {
      // Show onboarding after a brief delay for better UX
      setTimeout(() => setIsOpen(true), 500);
    }
  }, [loading, settings.completed]);

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

  const handleSkip = async () => {
    await saveSettings({ completed: true });
    setIsOpen(false);
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    await saveSettings({ completed: true });
    setTimeout(() => {
      setIsOpen(false);
      setIsCompleting(false);
    }, 1000);
  };

  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;
  const step = onboardingSteps[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl">
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-4 top-4"
          onClick={handleSkip}
        >
          <X className="w-4 h-4" />
        </Button>

        <DialogHeader>
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline">
              {t('onboarding.step', { current: currentStep + 1, total: onboardingSteps.length })}
            </Badge>
            <Progress value={progress} className="w-32 h-2" />
          </div>
          
          <div className="flex flex-col items-center text-center mb-4">
            <div className="p-4 rounded-full bg-primary/10 mb-4">
              {step.icon}
            </div>
            <DialogTitle className="text-2xl mb-2">{t(step.titleKey)}</DialogTitle>
            <DialogDescription className="text-base">
              {t(step.descriptionKey)}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            {step.tipsKeys.map((tipKey, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                <span className="text-sm">{t(tipKey)}</span>
              </div>
            ))}
          </div>

          {currentStep === onboardingSteps.length - 1 && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <p className="text-sm text-center">
                {t('onboarding.complete')}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={handleSkip}
            disabled={isCompleting}
          >
            {t('onboarding.skipTour')}
          </Button>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={isCompleting}
              >
                {t('onboarding.previous')}
              </Button>
            )}
            
            <Button
              onClick={handleNext}
              disabled={isCompleting}
              className="gap-2"
            >
              {isCompleting ? (
                t('onboarding.completing')
              ) : currentStep === onboardingSteps.length - 1 ? (
                <>
                  {t('onboarding.getStarted')}
                  <CheckCircle2 className="w-4 h-4" />
                </>
              ) : (
                <>
                  {t('onboarding.next')}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
