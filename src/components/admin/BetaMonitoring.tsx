import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  TrendingUp, 
  CheckCircle, 
  XCircle,
  Clock,
  Mail,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';

interface BetaSignup {
  id: string;
  email: string;
  name: string | null;
  referral_source: string | null;
  interested_features: string[] | null;
  signup_date: string;
  status: 'pending' | 'invited' | 'accepted' | 'rejected';
  invite_sent_at: string | null;
  notes: string | null;
  created_at: string;
}

export const BetaMonitoring = () => {
  const [signups, setSignups] = useState<BetaSignup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    invited: 0,
    accepted: 0,
    rejected: 0,
  });

  useEffect(() => {
    fetchSignups();
  }, []);

  const fetchSignups = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('beta_waitlist')
        .select('*')
        .order('signup_date', { ascending: false });

      if (error) throw error;

      if (data) {
        setSignups(data as BetaSignup[]);
        
        // Calculate stats
        const typedData = data as BetaSignup[];
        setStats({
          total: typedData.length,
          pending: typedData.filter(s => s.status === 'pending').length,
          invited: typedData.filter(s => s.status === 'invited').length,
          accepted: typedData.filter(s => s.status === 'accepted').length,
          rejected: typedData.filter(s => s.status === 'rejected').length,
        });
      }
    } catch (error) {
      console.error('Failed to fetch beta signups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: BetaSignup['status']) => {
    try {
      const { error } = await supabase
        .from('beta_waitlist')
        .update({ 
          status: newStatus,
          invite_sent_at: newStatus === 'invited' ? new Date().toISOString() : null,
        })
        .eq('id', id);

      if (error) throw error;
      
      await fetchSignups();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; label: string }> = {
      pending: { variant: 'secondary', icon: Clock, label: 'Pending' },
      invited: { variant: 'default', icon: Mail, label: 'Invited' },
      accepted: { variant: 'default', icon: CheckCircle, label: 'Accepted' },
      rejected: { variant: 'destructive', icon: XCircle, label: 'Rejected' },
    };
    
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant as any} className="gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading beta signups...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Signups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <div className="text-2xl font-bold">{stats.total}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-warning" />
              <div className="text-2xl font-bold">{stats.pending}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Invited</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              <div className="text-2xl font-bold">{stats.invited}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Accepted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <div className="text-2xl font-bold">{stats.accepted}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-success" />
              <div className="text-2xl font-bold">
                {stats.total > 0 ? ((stats.accepted / stats.total) * 100).toFixed(0) : 0}%
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Signups List */}
      <Card>
        <CardHeader>
          <CardTitle>Beta Waitlist</CardTitle>
          <CardDescription>
            Manage beta access invitations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {signups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No beta signups yet
              </div>
            ) : (
              signups.map((signup) => (
                <div 
                  key={signup.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-3">
                      <p className="font-medium">{signup.name || 'Anonymous'}</p>
                      {getStatusBadge(signup.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{signup.email}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(signup.signup_date), 'MMM dd, yyyy')}
                      </div>
                      {signup.referral_source && (
                        <div>Source: {signup.referral_source}</div>
                      )}
                      {signup.interested_features && signup.interested_features.length > 0 && (
                        <div>Interested: {signup.interested_features.join(', ')}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {signup.status === 'pending' && (
                      <Button 
                        size="sm" 
                        onClick={() => updateStatus(signup.id, 'invited')}
                      >
                        Invite
                      </Button>
                    )}
                    {signup.status === 'invited' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateStatus(signup.id, 'accepted')}
                      >
                        Mark Accepted
                      </Button>
                    )}
                    {signup.status !== 'rejected' && (
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => updateStatus(signup.id, 'rejected')}
                      >
                        Reject
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
