import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Brain, 
  Sparkles, 
  AlertTriangle, 
  Tag, 
  TrendingUp, 
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Shuffle,
  Lightbulb,
  RefreshCw
} from 'lucide-react';

interface Test {
  id: string;
  title: string;
}

interface Submission {
  id: string;
  test_id: string;
  feedback: string | null;
  status: string;
  tester_id: string;
  created_at: string;
}

interface Insight {
  id: string;
  submission_id: string;
  test_id: string;
  summary: string;
  pain_points: string[];
  tags: string[];
  sentiment: string;
  key_findings: string[];
  created_at: string;
}

interface AIInsightsPanelProps {
  tests: Test[];
  userId: string;
}

export default function AIInsightsPanel({ tests, userId }: AIInsightsPanelProps) {
  const { toast } = useToast();
  const [selectedTestId, setSelectedTestId] = useState<string>('all');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [bulkAnalyzing, setBulkAnalyzing] = useState(false);

  useEffect(() => {
    fetchSubmissionsAndInsights();
  }, [selectedTestId]);

  const fetchSubmissionsAndInsights = async () => {
    setLoading(true);
    try {
      // Fetch submitted submissions
      let subQuery = supabase
        .from('test_submissions')
        .select('id, test_id, feedback, status, tester_id, created_at')
        .in('status', ['submitted', 'approved', 'rejected'])
        .not('feedback', 'is', null);

      if (selectedTestId !== 'all') {
        subQuery = subQuery.eq('test_id', selectedTestId);
      }

      const { data: subs } = await subQuery;
      setSubmissions(subs || []);

      // Fetch existing insights
      let insightQuery = supabase
        .from('submission_insights')
        .select('*');

      if (selectedTestId !== 'all') {
        insightQuery = insightQuery.eq('test_id', selectedTestId);
      }

      const { data: ins } = await insightQuery;
      setInsights((ins as Insight[]) || []);
    } catch (err) {
      console.error('Error fetching insights data:', err);
    } finally {
      setLoading(false);
    }
  };

  const analyzeSubmission = async (submissionId: string) => {
    setAnalyzing(submissionId);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-submission', {
        body: { submission_id: submissionId },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: 'Analysis complete', description: 'AI insights generated successfully.' });
      fetchSubmissionsAndInsights();
    } catch (err: any) {
      toast({
        title: 'Analysis failed',
        description: err.message || 'Failed to analyze submission.',
        variant: 'destructive',
      });
    } finally {
      setAnalyzing(null);
    }
  };

  const analyzeAll = async () => {
    const unanalyzed = submissions.filter(
      s => !insights.find(i => i.submission_id === s.id)
    );
    if (unanalyzed.length === 0) {
      toast({ title: 'All analyzed', description: 'All submissions already have insights.' });
      return;
    }

    setBulkAnalyzing(true);
    let done = 0;
    for (const sub of unanalyzed) {
      try {
        await supabase.functions.invoke('analyze-submission', {
          body: { submission_id: sub.id },
        });
        done++;
      } catch {
        // continue with next
      }
    }
    setBulkAnalyzing(false);
    toast({ title: 'Bulk analysis complete', description: `Analyzed ${done}/${unanalyzed.length} submissions.` });
    fetchSubmissionsAndInsights();
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <ThumbsUp className="h-4 w-4 text-green-500" />;
      case 'negative': return <ThumbsDown className="h-4 w-4 text-destructive" />;
      case 'mixed': return <Shuffle className="h-4 w-4 text-yellow-500" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-500 border-green-500';
      case 'negative': return 'text-destructive border-destructive';
      case 'mixed': return 'text-yellow-500 border-yellow-500';
      default: return 'text-muted-foreground border-muted-foreground';
    }
  };

  // Aggregate stats
  const totalInsights = insights.length;
  const allPainPoints = insights.flatMap(i => i.pain_points);
  const allTags = insights.flatMap(i => i.tags);
  const sentimentCounts = insights.reduce((acc, i) => {
    acc[i.sentiment] = (acc[i.sentiment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Top tags by frequency
  const tagFreq = allTags.reduce((acc, t) => {
    const key = t.toLowerCase();
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topTags = Object.entries(tagFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Top pain points
  const painFreq = allPainPoints.reduce((acc, p) => {
    const key = p.toLowerCase();
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topPainPoints = Object.entries(painFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const unanalyzedCount = submissions.filter(
    s => !insights.find(i => i.submission_id === s.id)
  ).length;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Brain className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">AI-Powered Insights</h3>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedTestId} onValueChange={setSelectedTestId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by test" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tests</SelectItem>
              {tests.map(t => (
                <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {unanalyzedCount > 0 && (
            <Button onClick={analyzeAll} disabled={bulkAnalyzing} size="sm">
              {bulkAnalyzing ? (
                <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Analyzing...</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-1" /> Analyze All ({unanalyzedCount})</>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Aggregate Stats */}
      {totalInsights > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="bg-card border border-border/60">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Analyzed</p>
                  <p className="text-2xl font-bold">{totalInsights}</p>
                </div>
                <Brain className="h-8 w-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border border-border/60">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pain Points</p>
                  <p className="text-2xl font-bold">{allPainPoints.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-500/60" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border border-border/60">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Positive</p>
                  <p className="text-2xl font-bold">{sentimentCounts['positive'] || 0}</p>
                </div>
                <ThumbsUp className="h-8 w-8 text-green-500/60" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border border-border/60">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Negative</p>
                  <p className="text-2xl font-bold">{sentimentCounts['negative'] || 0}</p>
                </div>
                <ThumbsDown className="h-8 w-8 text-destructive/60" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Tags & Pain Points */}
      {totalInsights > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-card border border-border/60">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Tag className="h-4 w-4" /> Top Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {topTags.map(([tag, count]) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag} ({count})
                  </Badge>
                ))}
                {topTags.length === 0 && (
                  <p className="text-sm text-muted-foreground">No tags yet</p>
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border border-border/60">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Top Pain Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topPainPoints.map(([point, count]) => (
                  <div key={point} className="flex items-center justify-between text-sm">
                    <span className="truncate flex-1">{point}</span>
                    <Badge variant="outline" className="ml-2 text-xs">{count}</Badge>
                  </div>
                ))}
                {topPainPoints.length === 0 && (
                  <p className="text-sm text-muted-foreground">No pain points detected yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Individual Insights */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : submissions.length === 0 ? (
        <Card className="bg-card border border-border/60">
          <CardContent className="pt-6 text-center">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No submissions with feedback to analyze.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map(sub => {
            const insight = insights.find(i => i.submission_id === sub.id);
            const testTitle = tests.find(t => t.id === sub.test_id)?.title || 'Unknown Test';

            return (
              <Card key={sub.id} className="bg-card border border-border/60">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{testTitle}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        Submitted {new Date(sub.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {insight && (
                        <Badge variant="outline" className={getSentimentColor(insight.sentiment)}>
                          {getSentimentIcon(insight.sentiment)}
                          <span className="ml-1 capitalize">{insight.sentiment}</span>
                        </Badge>
                      )}
                      {!insight ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => analyzeSubmission(sub.id)}
                          disabled={analyzing === sub.id}
                        >
                          {analyzing === sub.id ? (
                            <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Analyzing</>
                          ) : (
                            <><Sparkles className="h-3 w-3 mr-1" /> Analyze</>
                          )}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => analyzeSubmission(sub.id)}
                          disabled={analyzing === sub.id}
                        >
                          <RefreshCw className={`h-3 w-3 ${analyzing === sub.id ? 'animate-spin' : ''}`} />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                {insight && (
                  <CardContent className="space-y-3 pt-0">
                    {/* Summary */}
                    <div className="bg-muted/40 rounded-lg p-3">
                      <p className="text-sm">{insight.summary}</p>
                    </div>

                    {/* Key Findings */}
                    {insight.key_findings.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                          <Lightbulb className="h-3 w-3" /> Key Findings
                        </p>
                        <ul className="text-sm space-y-1">
                          {insight.key_findings.map((f, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <TrendingUp className="h-3 w-3 mt-1 text-primary flex-shrink-0" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Pain Points */}
                    {insight.pain_points.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> Pain Points
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {insight.pain_points.map((p, i) => (
                            <Badge key={i} variant="destructive" className="text-xs font-normal">
                              {p}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {insight.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {insight.tags.map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
