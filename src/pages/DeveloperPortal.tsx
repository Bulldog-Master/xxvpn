import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import {
  Code,
  Key,
  Book,
  Terminal,
  Copy,
  CheckCircle,
  ExternalLink,
  Shield,
  Zap,
} from 'lucide-react';

export default function DeveloperPortal() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('xxvpn_live_4f3b8e9a7c2d1e5f6g8h9i0j');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: 'Copied!',
      description: 'API key copied to clipboard',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const endpoints = [
    {
      method: 'POST',
      path: '/api/v1/vpn/connect',
      description: 'Initiate VPN connection',
      category: 'VPN Operations',
    },
    {
      method: 'POST',
      path: '/api/v1/vpn/disconnect',
      description: 'Disconnect active VPN session',
      category: 'VPN Operations',
    },
    {
      method: 'GET',
      path: '/api/v1/servers',
      description: 'List available VPN servers',
      category: 'Server Management',
    },
    {
      method: 'GET',
      path: '/api/v1/sessions',
      description: 'Get user session history',
      category: 'Analytics',
    },
    {
      method: 'GET',
      path: '/api/v1/bandwidth',
      description: 'Get bandwidth usage statistics',
      category: 'Analytics',
    },
  ];

  const codeExamples = {
    javascript: `// Initialize XX VPN SDK
import XXVPN from '@xxvpn/sdk';

const vpn = new XXVPN({
  apiKey: 'your-api-key',
  environment: 'production'
});

// Connect to VPN
const session = await vpn.connect({
  server: 'us-east-1',
  protocol: 'wireguard'
});

console.log('Connected:', session.id);`,
    python: `# XX VPN Python SDK
from xxvpn import Client

client = Client(api_key='your-api-key')

# Connect to VPN
session = client.connect(
    server='us-east-1',
    protocol='wireguard'
)

print(f'Connected: {session.id}')`,
    curl: `# Connect to VPN via REST API
curl -X POST https://api.xxvpn.app/v1/vpn/connect \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "server": "us-east-1",
    "protocol": "wireguard"
  }'`,
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Code className="w-8 h-8 text-primary" />
            Developer Portal
          </h1>
          <p className="text-muted-foreground mt-2">
            Build powerful integrations with XX VPN API
          </p>
        </div>

        {/* Quick Start */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Quick Start
            </CardTitle>
            <CardDescription>
              Get started with XX VPN API in minutes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Shield className="w-4 h-4" />
              <AlertDescription>
                All API requests must be authenticated with your API key. Keep it secure and never expose it in client-side code.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Your API Key</Label>
              <div className="flex gap-2">
                <Input
                  value={apiKey}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  onClick={() => copyToClipboard(apiKey)}
                  variant="outline"
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Use this key to authenticate your API requests
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="p-4 border rounded-lg">
                <Book className="w-6 h-6 mb-2 text-primary" />
                <h4 className="font-medium mb-1">Documentation</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Complete API reference and guides
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="w-3 h-3 mr-2" />
                  View Docs
                </Button>
              </div>

              <div className="p-4 border rounded-lg">
                <Terminal className="w-6 h-6 mb-2 text-primary" />
                <h4 className="font-medium mb-1">SDK Libraries</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Official SDKs for popular languages
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="w-3 h-3 mr-2" />
                  Download SDKs
                </Button>
              </div>

              <div className="p-4 border rounded-lg">
                <Key className="w-6 h-6 mb-2 text-primary" />
                <h4 className="font-medium mb-1">API Keys</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Manage your API keys and tokens
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Manage Keys
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="endpoints" className="w-full">
          <TabsList>
            <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
            <TabsTrigger value="examples">Code Examples</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          </TabsList>

          <TabsContent value="endpoints" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Available Endpoints</CardTitle>
                <CardDescription>
                  REST API endpoints for XX VPN integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {endpoints.map((endpoint, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <Badge
                          variant={
                            endpoint.method === 'GET' ? 'secondary' : 'default'
                          }
                        >
                          {endpoint.method}
                        </Badge>
                        <div className="flex-1">
                          <code className="text-sm font-mono">
                            {endpoint.path}
                          </code>
                          <p className="text-sm text-muted-foreground mt-1">
                            {endpoint.description}
                          </p>
                          <Badge variant="outline" className="mt-2">
                            {endpoint.category}
                          </Badge>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="examples" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Code Examples</CardTitle>
                <CardDescription>
                  Sample code for common integration scenarios
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(codeExamples).map(([lang, code]) => (
                  <div key={lang} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="capitalize">{lang}</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(code)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                    <pre className="p-4 bg-muted rounded-lg overflow-x-auto">
                      <code className="text-sm">{code}</code>
                    </pre>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Webhooks</CardTitle>
                <CardDescription>
                  Receive real-time notifications for events
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertDescription>
                    Configure webhooks to receive real-time updates about VPN sessions, security events, and more.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label>Webhook URL</Label>
                  <Input placeholder="https://your-server.com/webhooks/xxvpn" />
                </div>

                <div className="space-y-3">
                  <Label>Event Types</Label>
                  {[
                    'session.started',
                    'session.ended',
                    'security.alert',
                    'subscription.updated',
                  ].map((event) => (
                    <div key={event} className="flex items-center gap-2">
                      <input type="checkbox" id={event} />
                      <label htmlFor={event} className="text-sm font-mono">
                        {event}
                      </label>
                    </div>
                  ))}
                </div>

                <Button className="w-full">Save Webhook Configuration</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
