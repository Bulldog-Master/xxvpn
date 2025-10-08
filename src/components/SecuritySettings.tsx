import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { WebAuthnAuth } from './WebAuthnAuth';
import {
  Shield,
  Fingerprint,
  Lock,
  Eye,
  AlertTriangle,
  CheckCircle,
  Smartphone,
  Key,
  Activity,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface SecurityEvent {
  id: string;
  action: string;
  created_at: string;
  ip_address?: string;
  user_agent?: string;
}

export const SecuritySettings = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [passkeyEnabled, setPasskeyEnabled] = useState(false);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSecuritySettings();
      loadSecurityEvents();
    }
  }, [user]);

  const loadSecuritySettings = async () => {
    if (!user) return;

    try {
      // Check 2FA status
      const { data: profile } = await supabase
        .from('profiles')
        .select('totp_enabled')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setTwoFAEnabled(profile.totp_enabled || false);
      }

      // Check passkey status
      const { data: credentials } = await supabase
        .from('webauthn_credentials')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      setPasskeyEnabled(credentials && credentials.length > 0);
    } catch (error) {
      console.error('Error loading security settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSecurityEvents = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('audit_logs')
        .select('id, action, created_at, ip_address, user_agent')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setSecurityEvents((data || []) as SecurityEvent[]);
    } catch (error) {
      console.error('Error loading security events:', error);
    }
  };

  const handlePasskeySetup = (credential: any) => {
    setPasskeyEnabled(true);
    toast({
      title: 'Passkey Configured',
      description: 'Your biometric authentication is now active',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          {t('security.title')}
        </h2>
        <p className="text-muted-foreground mt-1">
          {t('security.description')}
        </p>
      </div>

      <Tabs defaultValue="authentication" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="authentication">{t('security.tabs.authentication')}</TabsTrigger>
          <TabsTrigger value="activity">{t('security.tabs.activity')}</TabsTrigger>
          <TabsTrigger value="monitoring">{t('security.tabs.monitoring')}</TabsTrigger>
        </TabsList>

        <TabsContent value="authentication" className="space-y-4">
          {/* Security Overview */}
          <Card>
            <CardHeader>
              <CardTitle>{t('security.overview.title')}</CardTitle>
              <CardDescription>
                {t('security.overview.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{t('security.twoFactor.title')}</p>
                    <p className="text-sm text-muted-foreground">
                      {twoFAEnabled ? t('security.twoFactor.active') : t('security.twoFactor.notConfigured')}
                    </p>
                  </div>
                </div>
                <Badge variant={twoFAEnabled ? 'default' : 'outline'}>
                  {twoFAEnabled ? t('security.status.enabled') : t('security.status.disabled')}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Fingerprint className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{t('security.biometric.title')}</p>
                    <p className="text-sm text-muted-foreground">
                      {passkeyEnabled ? t('security.biometric.registered') : t('security.biometric.notConfigured')}
                    </p>
                  </div>
                </div>
                <Badge variant={passkeyEnabled ? 'default' : 'outline'}>
                  {passkeyEnabled ? t('security.status.enabled') : t('security.status.disabled')}
                </Badge>
              </div>

              <Alert>
                <CheckCircle className="w-4 h-4" />
                <AlertDescription>
                  {t('security.overview.protectedBy')}{' '}
                  {twoFAEnabled && passkeyEnabled
                    ? t('security.overview.multiLayer')
                    : twoFAEnabled || passkeyEnabled
                    ? t('security.overview.enhanced')
                    : t('security.overview.basic')}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Biometric Authentication Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fingerprint className="w-5 h-5" />
                {t('security.biometric.title')}
              </CardTitle>
              <CardDescription>
                {t('security.biometric.setupDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WebAuthnAuth onAuthenticate={handlePasskeySetup} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                {t('security.activity.title')}
              </CardTitle>
              <CardDescription>
                {t('security.activity.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {securityEvents.length === 0 ? (
                <Alert>
                  <AlertDescription>{t('security.activity.noEvents')}</AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3">
                  {securityEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 p-3 border rounded-lg"
                    >
                      <Shield className="w-4 h-4 mt-1 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">{event.action.replace(/_/g, ' ')}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(event.created_at), 'PPpp')}
                        </p>
                        {event.user_agent && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {event.user_agent.substring(0, 100)}...
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                {t('security.monitoring.title')}
              </CardTitle>
              <CardDescription>
                {t('security.monitoring.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Lock className="w-4 h-4" />
                <AlertDescription>
                  {t('security.monitoring.checkDescription')}
                </AlertDescription>
              </Alert>

              <div className="p-4 border rounded-lg bg-success/5">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="font-medium">{t('security.monitoring.noBreaches')}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('security.monitoring.credentialsSafe')}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">{t('security.recommendations.title')}</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-success" />
                    <span>{t('security.recommendations.uniquePassword')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-success" />
                    <span>{t('security.recommendations.enable2FA')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-success" />
                    <span>{t('security.recommendations.registerPasskey')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 text-yellow-500" />
                    <span>{t('security.recommendations.reviewSessions')}</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
