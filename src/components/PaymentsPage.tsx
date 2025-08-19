import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { CreditCard, Download, HelpCircle, Shield, User, Smartphone } from 'lucide-react';
import PaymentMethodCard from './payments/PaymentMethodCard';
import SubscriptionPlans, { SubscriptionPlan } from './subscriptions/SubscriptionPlans';

interface PaymentOrder {
  id: string;
  date: string;
  subscription: string;
  status: 'Active' | 'Expired' | 'Pending';
  amount: string;
}

const PaymentsPage = () => {
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>();

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
  };

  // Sample data - in a real app this would come from an API
  const orders: PaymentOrder[] = [
    {
      id: "ORD-2024-001",
      date: "2024-01-15",
      subscription: t('payments.orders.table.xxVPNPremium'),
      status: "Active",
      amount: "$9.99"
    },
    {
      id: "ORD-2023-045",
      date: "2023-12-15",
      subscription: t('payments.orders.table.xxVPNBasic'),
      status: "Expired",
      amount: "$4.99"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'text-green-500';
      case 'Expired':
        return 'text-red-500';
      case 'Pending':
        return 'text-yellow-500';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="flex h-full">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-card/50 backdrop-blur-sm border-r border-border p-4 space-y-2">
        <div className="space-y-1">
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground">
            <User className="w-4 h-4" />
            {t('payments.sidebar.account')}
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground">
            <Smartphone className="w-4 h-4" />
            {t('payments.sidebar.devices')}
          </Button>
          <Button variant="secondary" className="w-full justify-start gap-3 bg-primary/10 text-primary">
            <CreditCard className="w-4 h-4" />
            {t('payments.sidebar.payments')}
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground">
            <Download className="w-4 h-4" />
            {t('payments.sidebar.download')}
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground">
            <HelpCircle className="w-4 h-4" />
            {t('payments.sidebar.support')}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6">
        <Card className="bg-card/95 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">{t('payments.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Subscription Plans Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-medium">Select Your Plan</h2>
              <SubscriptionPlans onPlanSelect={handlePlanSelect} selectedPlan={selectedPlan} />
            </div>

            {/* Payment Methods Section - Only show when plan is selected */}
            {selectedPlan && (
              <div className="space-y-6">
                <h2 className="text-xl font-medium">Payment Methods for {selectedPlan.name}</h2>
                
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Quick Payment Options */}
                  <PaymentMethodCard selectedPlan={{
                    id: selectedPlan.id,
                    name: selectedPlan.name,
                    price: selectedPlan.price,
                    currency: selectedPlan.currency,
                    duration: selectedPlan.duration
                  }} />
                
                  {/* Traditional Payment Methods */}
                  <div className="space-y-3">
                    <Card className="border-border hover:border-primary/50 transition-colors cursor-pointer">
                      <CardContent className="flex items-center gap-3 p-4">
                        <CreditCard className="w-6 h-6 text-primary" />
                        <div className="flex-1">
                          <h3 className="font-medium">{t('payments.methods.card.title')}</h3>
                          <p className="text-sm text-muted-foreground">{t('payments.methods.card.description')}</p>
                        </div>
                        <Button variant="outline" size="sm">{t('payments.methods.card.action')}</Button>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-border hover:border-primary/50 transition-colors cursor-pointer">
                      <CardContent className="flex items-center gap-3 p-4">
                        <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">
                          P
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{t('payments.methods.paypal.title')}</h3>
                          <p className="text-sm text-muted-foreground">{t('payments.methods.paypal.description')}</p>
                        </div>
                        <Button variant="outline" size="sm">{t('payments.methods.paypal.action')}</Button>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-border hover:border-primary/50 transition-colors cursor-pointer">
                      <CardContent className="flex items-center gap-3 p-4">
                        <div className="w-6 h-6 text-primary">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{t('payments.methods.crypto.title')}</h3>
                          <p className="text-sm text-muted-foreground">{t('payments.methods.crypto.description')}</p>
                        </div>
                        <Button variant="outline" size="sm">{t('payments.methods.crypto.action')}</Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* Your Orders Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-medium">{t('payments.orders.title')}</h2>
              
              {/* Privacy Description */}
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border border-border">
                <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('payments.orders.privacy')}
                </p>
              </div>

              {/* Orders Table */}
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-medium">{t('payments.orders.table.id')}</TableHead>
                      <TableHead className="font-medium">{t('payments.orders.table.date')}</TableHead>
                      <TableHead className="font-medium">{t('payments.orders.table.subscription')}</TableHead>
                      <TableHead className="font-medium">{t('payments.orders.table.status')}</TableHead>
                      <TableHead className="font-medium text-right">{t('payments.orders.table.amount')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.length > 0 ? (
                      orders.map((order) => (
                        <TableRow key={order.id} className="hover:bg-muted/30">
                          <TableCell className="font-mono text-sm">{order.id}</TableCell>
                          <TableCell>{order.date}</TableCell>
                          <TableCell>{order.subscription}</TableCell>
                          <TableCell>
                            <span className={`font-medium ${getStatusColor(order.status)}`}>
                              {t(`payments.orders.status.${order.status.toLowerCase()}`)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-medium">{order.amount}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          {t('payments.orders.noOrders')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Invoice Information */}
              <div className="text-sm text-muted-foreground">
                {t('payments.orders.invoice.text')}{' '}
                <Button variant="link" className="p-0 h-auto text-primary hover:underline">
                  {t('payments.orders.invoice.link')}
                </Button>
                .
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentsPage;