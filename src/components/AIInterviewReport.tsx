import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  Lightbulb,
  Quote,
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Shuffle,
  ChevronRight,
  BarChart3,
  Zap,
  BookOpen,
  Share2,
} from 'lucide-react';
import type { InterviewReport } from '@/hooks/useAIInterviewer';

interface AIInterviewReportProps {
  report: InterviewReport;
  testTitle: string;
  onClose?: () => void;
}

const severityConfig = {
  critical: {
    label: 'Critical',
    className: 'bg-destructive/15 text-destructive border-destructive/30',
    icon: AlertTriangle,
    iconClass: 'text-destructive',
  },
  major: {
    label: 'Major',
    className: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    icon: AlertTriangle,
    iconClass: 'text-orange-400',
  },
  minor: {
    label: 'Minor',
    className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    icon: AlertTriangle,
    iconClass: 'text-yellow-400',
  },
} as const;

const priorityConfig = {
  high: {
    label: 'High Priority',
    className: 'bg-primary/15 text-primary border-primary/30',
    dot: 'bg-primary',
  },
  medium: {
    label: 'Medium',
    className: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    dot: 'bg-blue-400',
  },
  low: {
    label: 'Low',
    className: 'bg-muted text-muted-foreground border-border',
    dot: 'bg-muted-foreground',
  },
} as const;

const sentimentConfig = {
  positive: {
    label: 'Positive experience',
    Icon: ThumbsUp,
    className: 'text-green-500 bg-green-500/10',
  },
  negative: {
    label: 'Negative experience',
    Icon: ThumbsDown,
    className: 'text-destructive bg-destructive/10',
  },
  neutral: {
    label: 'Neutral experience',
    Icon: Minus,
    className: 'text-muted-foreground bg-muted',
  },
  mixed: {
    label: 'Mixed experience',
    Icon: Shuffle,
    className: 'text-yellow-500 bg-yellow-500/10',
  },
} as const;

const categoryIcons: Record<string, React.ElementType> = {
  Navigation: ChevronRight,
  Onboarding: BookOpen,
  Copy: BookOpen,
  'Visual Design': BarChart3,
  'Feature Gap': Zap,
  Performance: TrendingUp,
  Accessibility: ChevronRight,
};

export default function AIInterviewReport({ report, testTitle, onClose }: AIInterviewReportProps) {
  const sentiment = sentimentConfig[report.sentiment] ?? sentimentConfig.neutral;
  const SentimentIcon = sentiment.Icon;

  const criticalCount = report.friction_points.filter((f) => f.severity === 'critical').length;
  const majorCount = report.friction_points.filter((f) => f.severity === 'major').length;
  const highPriorityInsights = report.insights.filter((i) => i.priority === 'high').length;

  return (
    <div className="space-y-4">
      {/* Report header */}
      <Card className="bg-card border border-border/60 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/60 to-transparent" />
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">AI Interview Report</p>
              <CardTitle className="text-base">{testTitle}</CardTitle>
            </div>
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${sentiment.className}`}>
              <SentimentIcon className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">{sentiment.label}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 pb-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{report.summary}</p>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[
              {
                value: report.friction_points.length,
                label: 'Friction points',
                sub: criticalCount > 0 ? `${criticalCount} critical` : majorCount > 0 ? `${majorCount} major` : 'all minor',
                color: criticalCount > 0 ? 'text-destructive' : majorCount > 0 ? 'text-orange-400' : 'text-muted-foreground',
              },
              {
                value: report.insights.length,
                label: 'Insights',
                sub: `${highPriorityInsights} high priority`,
                color: 'text-primary',
              },
              {
                value: report.key_quotes.length,
                label: 'Key quotes',
                sub: 'verbatim',
                color: 'text-muted-foreground',
              },
            ].map(({ value, label, sub, color }) => (
              <div key={label} className="bg-muted/40 rounded-xl p-2.5 text-center">
                <p className={`text-xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-muted-foreground font-medium">{label}</p>
                <p className="text-[10px] text-muted-foreground/70">{sub}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Friction Points */}
      {report.friction_points.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <AlertTriangle className="h-4 w-4 text-orange-400" />
            <h3 className="text-sm font-semibold text-foreground">Friction Points</h3>
            <span className="text-xs text-muted-foreground">({report.friction_points.length})</span>
          </div>
          <div className="space-y-2">
            {report.friction_points.map((fp, i) => {
              const cfg = severityConfig[fp.severity] ?? severityConfig.minor;
              const IconComp = cfg.icon;
              return (
                <Card key={i} className="bg-card border border-border/60 shadow-sm">
                  <CardContent className="p-3.5">
                    <div className="flex items-start gap-2.5">
                      <IconComp className={`h-4 w-4 mt-0.5 flex-shrink-0 ${cfg.iconClass}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-medium text-foreground">{fp.title}</span>
                          <Badge className={`${cfg.className} border text-[10px] px-1.5 py-0`}>{cfg.label}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{fp.description}</p>
                        {fp.quote && (
                          <blockquote className="mt-2 pl-2 border-l-2 border-muted-foreground/30 italic text-xs text-muted-foreground">
                            "{fp.quote}"
                          </blockquote>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Actionable Insights */}
      {report.insights.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <Lightbulb className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Actionable Insights</h3>
            <span className="text-xs text-muted-foreground">({report.insights.length})</span>
          </div>
          <div className="space-y-2">
            {report.insights.map((insight, i) => {
              const cfg = priorityConfig[insight.priority] ?? priorityConfig.low;
              const CategoryIcon = categoryIcons[insight.category] ?? Lightbulb;
              return (
                <Card key={i} className="bg-card border border-border/60 shadow-sm">
                  <CardContent className="p-3.5">
                    <div className="flex items-start gap-2.5">
                      <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CategoryIcon className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {insight.category}
                          </Badge>
                          <Badge className={`${cfg.className} border text-[10px] px-1.5 py-0`}>{cfg.label}</Badge>
                        </div>
                        <p className="text-xs text-foreground leading-relaxed font-medium">{insight.recommendation}</p>
                        {insight.evidence && (
                          <p className="mt-1.5 text-[11px] text-muted-foreground leading-relaxed">
                            <span className="font-medium">Evidence: </span>{insight.evidence}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Key Quotes */}
      {report.key_quotes.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <Quote className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Key Quotes</h3>
          </div>
          <div className="space-y-2">
            {report.key_quotes.map((quote, i) => (
              <Card key={i} className="bg-card border border-border/60 shadow-sm">
                <CardContent className="px-4 py-3">
                  <div className="flex gap-2.5">
                    <Quote className="h-3.5 w-3.5 text-primary/40 flex-shrink-0 mt-1" />
                    <p className="text-sm text-muted-foreground italic leading-relaxed">"{quote}"</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Close / share actions */}
      {onClose && (
        <div className="flex gap-2 pt-1 pb-2">
          <Button variant="outline" size="sm" className="flex-1 gap-1.5" disabled>
            <Share2 className="h-3.5 w-3.5" />
            Share Report
          </Button>
          <Button size="sm" className="flex-1" onClick={onClose}>
            Done
          </Button>
        </div>
      )}
    </div>
  );
}
