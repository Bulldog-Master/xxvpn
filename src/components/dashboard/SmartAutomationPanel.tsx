import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Brain, Zap, Shield, TrendingUp, Clock, Wifi, Loader2 } from 'lucide-react';
import { useSmartAutomation } from '@/hooks/useSmartAutomation';
import { useTranslation } from 'react-i18next';

const SmartAutomationPanel: React.FC = () => {
  const { t } = useTranslation();
  const {
    settings,
    recommendations,
    insights,
    isAnalyzing,
    automationScore,
    updateSetting,
    generateServerRecommendations,
    optimizeBandwidth
  } = useSmartAutomation();

  return (
    <div className="space-y-6">
      {/* Automation Score Card */}
      <Card className="glass-card border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">AI Automation Score</CardTitle>
            </div>
            <Badge variant="secondary" className="text-primary font-semibold">
              {automationScore}%
            </Badge>
          </div>
          <CardDescription>
            AI-powered optimization performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={automationScore} className="h-3 mb-4" />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active Features:</span>
              <span className="font-medium">
                {Object.values(settings).filter(Boolean).length}/6
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Optimizations Today:</span>
              <span className="font-medium text-primary">+23%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Smart Features Settings */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Smart Features
          </CardTitle>
          <CardDescription>
            Configure AI-powered automation settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium">AI Server Selection</div>
                <div className="text-sm text-muted-foreground">
                  Automatically choose optimal servers based on usage patterns
                </div>
              </div>
              <Switch
                checked={settings.aiServerSelection}
                onCheckedChange={(checked) => updateSetting('aiServerSelection', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium">Smart Kill Switch</div>
                <div className="text-sm text-muted-foreground">
                  Adapts to network conditions for intelligent protection
                </div>
              </div>
              <Switch
                checked={settings.smartKillSwitch}
                onCheckedChange={(checked) => updateSetting('smartKillSwitch', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium">Adaptive Protocol</div>
                <div className="text-sm text-muted-foreground">
                  Automatically switch protocols for optimal performance
                </div>
              </div>
              <Switch
                checked={settings.adaptiveProtocol}
                onCheckedChange={(checked) => updateSetting('adaptiveProtocol', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium">Bandwidth Optimization</div>
                <div className="text-sm text-muted-foreground">
                  AI-driven traffic management for maximum speeds
                </div>
              </div>
              <Switch
                checked={settings.bandwidthOptimization}
                onCheckedChange={(checked) => updateSetting('bandwidthOptimization', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium">Predictive Connection</div>
                <div className="text-sm text-muted-foreground">
                  Predict and prepare for your connection needs
                </div>
              </div>
              <Switch
                checked={settings.predictiveConnection}
                onCheckedChange={(checked) => updateSetting('predictiveConnection', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium">Smart DNS Routing</div>
                <div className="text-sm text-muted-foreground">
                  Optimize DNS routes based on application requirements
                </div>
              </div>
              <Switch
                checked={settings.smartDNSRouting}
                onCheckedChange={(checked) => updateSetting('smartDNSRouting', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <CardTitle>AI Server Recommendations</CardTitle>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={generateServerRecommendations}
                disabled={isAnalyzing}
                className="hover-lift"
              >
                {isAnalyzing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Brain className="h-4 w-4 mr-2" />
                )}
                {isAnalyzing ? 'Analyzing...' : 'Refresh'}
              </Button>
            </div>
            <CardDescription>
              Optimized server selection based on your usage patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div
                  key={rec.serverId}
                  className="p-4 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={index === 0 ? "default" : "secondary"}>
                        #{index + 1}
                      </Badge>
                      <span className="font-medium">{rec.serverName}</span>
                      <span className="text-sm text-muted-foreground">
                        {rec.location}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-primary">
                      {Math.round(rec.confidence * 100)}% match
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {rec.reason}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {rec.estimatedLatency}ms
                      </span>
                      <span className="flex items-center gap-1">
                        <Wifi className="h-3 w-3" />
                        {rec.expectedSpeed} Mbps
                      </span>
                    </div>
                    <Button size="sm" variant="outline" className="hover-scale">
                      Connect
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Insights */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Automation Insights</CardTitle>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={optimizeBandwidth}
              className="hover-lift"
            >
              <Brain className="h-4 w-4 mr-2" />
              Optimize Now
            </Button>
          </div>
          <CardDescription>
            Recent AI-powered optimizations and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {insights.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>AI is analyzing your patterns...</p>
              <p className="text-sm">Insights will appear as optimizations are discovered</p>
            </div>
          ) : (
            <div className="space-y-3">
              {insights.slice(0, 5).map((insight, index) => (
                <div
                  key={`${insight.type}-${index}`}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card/30 hover:bg-card/50 transition-colors"
                >
                  <div className={`rounded-full p-1 ${
                    insight.impact === 'high' ? 'bg-primary/20 text-primary' :
                    insight.impact === 'medium' ? 'bg-orange-500/20 text-orange-500' :
                    'bg-blue-500/20 text-blue-500'
                  }`}>
                    {insight.type === 'server_recommendation' && <TrendingUp className="h-3 w-3" />}
                    {insight.type === 'protocol_switch' && <Zap className="h-3 w-3" />}
                    {insight.type === 'bandwidth_optimization' && <Wifi className="h-3 w-3" />}
                    {insight.type === 'connection_prediction' && <Clock className="h-3 w-3" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                      {insight.applied && (
                        <Badge variant="secondary" className="text-xs">Applied</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {insight.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartAutomationPanel;