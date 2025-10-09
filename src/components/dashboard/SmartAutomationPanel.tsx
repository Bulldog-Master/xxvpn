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
import { formatNumber } from '@/utils/numberFormat';

const SmartAutomationPanel: React.FC = () => {
  const { t, i18n } = useTranslation();
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
              <CardTitle className="text-lg">{t('smartAutomation.score')}</CardTitle>
            </div>
            <Badge variant="secondary" className="text-primary font-semibold">
              {formatNumber(automationScore, i18n.language)}%
            </Badge>
          </div>
          <CardDescription>
            {t('smartAutomation.scoreDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={automationScore} className="h-3 mb-4" />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('smartAutomation.activeFeatures')}:</span>
              <span className="font-medium">
                {formatNumber(Object.values(settings).filter(Boolean).length, i18n.language)}/{formatNumber(6, i18n.language)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('smartAutomation.optimizationsToday')}:</span>
              <span className="font-medium text-primary">+{formatNumber(23, i18n.language)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Smart Features Settings */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            {t('smartAutomation.smartFeatures')}
          </CardTitle>
          <CardDescription>
            {t('smartAutomation.smartFeaturesDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium">{t('smartAutomation.features.aiServerSelection')}</div>
                <div className="text-sm text-muted-foreground">
                  {t('smartAutomation.features.aiServerSelectionDesc')}
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
                <div className="font-medium">{t('smartAutomation.features.smartKillSwitch')}</div>
                <div className="text-sm text-muted-foreground">
                  {t('smartAutomation.features.smartKillSwitchDesc')}
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
                <div className="font-medium">{t('smartAutomation.features.adaptiveProtocol')}</div>
                <div className="text-sm text-muted-foreground">
                  {t('smartAutomation.features.adaptiveProtocolDesc')}
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
                <div className="font-medium">{t('smartAutomation.features.bandwidthOptimization')}</div>
                <div className="text-sm text-muted-foreground">
                  {t('smartAutomation.features.bandwidthOptimizationDesc')}
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
                <div className="font-medium">{t('smartAutomation.features.predictiveConnection')}</div>
                <div className="text-sm text-muted-foreground">
                  {t('smartAutomation.features.predictiveConnectionDesc')}
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
                <div className="font-medium">{t('smartAutomation.features.smartDNSRouting')}</div>
                <div className="text-sm text-muted-foreground">
                  {t('smartAutomation.features.smartDNSRoutingDesc')}
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
                <CardTitle>{t('smartAutomation.recommendations.title')}</CardTitle>
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
                {isAnalyzing ? t('smartAutomation.recommendations.analyzing') : t('smartAutomation.recommendations.refresh')}
              </Button>
            </div>
            <CardDescription>
              {t('smartAutomation.recommendations.description')}
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
                      {formatNumber(Math.round(rec.confidence * 100), i18n.language)}% match
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {rec.reason}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatNumber(rec.estimatedLatency, i18n.language)}ms
                      </span>
                      <span className="flex items-center gap-1">
                        <Wifi className="h-3 w-3" />
                        {formatNumber(rec.expectedSpeed, i18n.language)} {t('units.mbps')}
                      </span>
                    </div>
                    <Button size="sm" variant="outline" className="hover-scale">
                      {t('dashboard.connect')}
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
                <CardTitle>{t('smartAutomation.insights.title')}</CardTitle>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={optimizeBandwidth}
                className="hover-lift"
              >
                <Brain className="h-4 w-4 mr-2" />
                {t('smartAutomation.insights.optimizeNow')}
              </Button>
          </div>
            <CardDescription>
              {t('smartAutomation.insights.description')}
            </CardDescription>
        </CardHeader>
        <CardContent>
          {insights.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t('smartAutomation.insights.analyzing')}</p>
              <p className="text-sm">{t('smartAutomation.insights.willAppear')}</p>
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
                        <Badge variant="secondary" className="text-xs">{t('smartAutomation.insights.applied')}</Badge>
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