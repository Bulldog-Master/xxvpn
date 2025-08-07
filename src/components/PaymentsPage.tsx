import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { CreditCard, Download, HelpCircle, Shield, User, Smartphone } from 'lucide-react';

interface PaymentOrder {
  id: string;
  date: string;
  subscription: string;
  status: 'Active' | 'Expired' | 'Pending';
  amount: string;
}

const PaymentsPage = () => {
  const { t } = useTranslation();

  // Sample data - in a real app this would come from an API
  const orders: PaymentOrder[] = [
    {
      id: "ORD-2024-001",
      date: "2024-01-15",
      subscription: "xxVPN Premium",
      status: "Active",
      amount: "$9.99"
    },
    {
      id: "ORD-2023-045",
      date: "2023-12-15",
      subscription: "xxVPN Basic",
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
            Account
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground">
            <Smartphone className="w-4 h-4" />
            Devices
          </Button>
          <Button variant="secondary" className="w-full justify-start gap-3 bg-primary/10 text-primary">
            <CreditCard className="w-4 h-4" />
            Payments
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground">
            <Download className="w-4 h-4" />
            Download
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground">
            <HelpCircle className="w-4 h-4" />
            Support
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6">
        <Card className="bg-card/95 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Payments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Your Orders Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-medium">Your orders</h2>
              
              {/* Privacy Description */}
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border border-border">
                <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  By design, xxVPN unlinks your payment information and identity from your online activity. 
                  This ensures a robust safeguard against unauthorized monitoring of your traffic and private data.
                </p>
              </div>

              {/* Orders Table */}
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-medium">ID</TableHead>
                      <TableHead className="font-medium">Date</TableHead>
                      <TableHead className="font-medium">Subscription</TableHead>
                      <TableHead className="font-medium">Status</TableHead>
                      <TableHead className="font-medium text-right">Amount</TableHead>
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
                              {order.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-medium">{order.amount}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No orders found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Invoice Information */}
              <div className="text-sm text-muted-foreground">
                If you need a professional invoice with your company name and address, please contact our{' '}
                <Button variant="link" className="p-0 h-auto text-primary hover:underline">
                  Support team
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