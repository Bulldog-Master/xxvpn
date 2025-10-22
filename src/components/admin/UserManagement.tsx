import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Users, Search, Shield, Ban, CheckCircle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@/utils/numberFormat';

interface UserData {
  user_id: string;
  display_name: string | null;
  subscription_tier: string;
  xx_coin_balance: number;
  created_at: string;
  totp_enabled: boolean;
}

export const UserManagement = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .rpc('get_users_admin_safe', {
          limit_count: 50,
          offset_count: 0
        });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users');
      toast({
        title: t('admin.error'),
        description: t('admin.failedToLoad'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTierBadge = (tier: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      free: "secondary",
      premium: "default",
      business: "outline",
    };
    return <Badge variant={variants[tier] || "secondary"}>{tier}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {t('admin.userManagement')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('admin.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.user')}</TableHead>
                  <TableHead>{t('admin.subscription')}</TableHead>
                  <TableHead>{t('admin.xxCoins')}</TableHead>
                  <TableHead>{t('admin.twoFA')}</TableHead>
                  <TableHead>{t('admin.joined')}</TableHead>
                  <TableHead className="text-right">{t('admin.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      {t('admin.noUsersFound')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.user_id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.display_name || t('admin.unnamedUser')}</p>
                          <p className="text-xs text-muted-foreground">{user.user_id.slice(0, 8)}...</p>
                        </div>
                      </TableCell>
                      <TableCell>{getTierBadge(user.subscription_tier)}</TableCell>
                      <TableCell>{formatNumber(user.xx_coin_balance, i18n.language, 2)}</TableCell>
                      <TableCell>
                        {user.totp_enabled ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Ban className="w-4 h-4 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Shield className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>{t('admin.showing', { filtered: formatNumber(filteredUsers.length, i18n.language), total: formatNumber(users.length, i18n.language) })}</p>
            <Button variant="outline" size="sm" onClick={fetchUsers}>
              {t('admin.refresh')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
