import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuditLogDashboard } from '@/components/admin/AuditLogDashboard';
import { BetaMonitoring } from '@/components/admin/BetaMonitoring';
import { UserManagement } from '@/components/admin/UserManagement';
import { SecurityDashboard } from '@/components/admin/SecurityDashboard';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAdmin, loading } = useAdminCheck();

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have permission to access this page. Admin privileges required.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Monitor beta signups, security events, and analytics
          </p>
        </div>

        <Tabs defaultValue="beta" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="beta">Beta Monitoring</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="beta" className="space-y-4">
            <BetaMonitoring />
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <UserManagement />
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <SecurityDashboard />
          </TabsContent>
          
          <TabsContent value="audit" className="space-y-4">
            <AuditLogDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
