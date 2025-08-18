import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, UserIcon, Shield, Server, Activity, Settings, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ServerSelector from '@/components/ServerSelector';
import NetworkStatus from '@/components/NetworkStatus';
import AppTunneling from '@/components/AppTunneling';
import PaymentsPage from '@/components/PaymentsPage';
import LanguageSelector from '@/components/LanguageSelector';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getCurrentUser();
  }, []);

  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Shield className="w-8 h-8 text-primary" />
                <h1 className="text-2xl font-bold">xxVPN</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSelector />
              <Button onClick={handleSignOut} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="servers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="servers" className="flex items-center gap-2">
              <Server className="w-4 h-4" />
              Servers
            </TabsTrigger>
            <TabsTrigger value="network" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Network
            </TabsTrigger>
            <TabsTrigger value="apps" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Apps
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="servers">
            <ServerSelector />
          </TabsContent>

          <TabsContent value="network">
            <NetworkStatus />
          </TabsContent>

          <TabsContent value="apps">
            <AppTunneling />
          </TabsContent>

          <TabsContent value="billing">
            <PaymentsPage />
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Your account details and settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="text-sm font-mono">{user?.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">User ID</label>
                      <p className="text-sm font-mono">{user?.id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Account Created</label>
                      <p className="text-sm">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Last Sign In</label>
                      <p className="text-sm">{user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}