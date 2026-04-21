import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  X, Clock, DollarSign, Users, CheckCircle, AlertCircle,
  Target, Monitor, Smartphone, Tablet, Globe, ListChecks,
  HelpCircle, ChevronDown, ChevronUp, Link as LinkIcon,
} from 'lucide-react';

interface TestTask {
  id: string;
  title: string;
  description: string | null;
  sort_order: number;
}

interface TestQuestion {
  id: string;
  question_text: string;
  question_type: string;
  options: any;
  required: boolean | null;
  task_id: string | null;
  sort_order: number;
}

interface TestDetailPanelProps {
  test: {
    id: string;
    title: string;
    description: string | null;
    requirements: string | null;
    reward_amount: number;
    estimated_duration: number;
    category: string | null;
    status: string;
    max_testers: number | null;
    current_testers: number | null;
    created_at: string;
    test_type?: string | null;
    prototype_url?: string | null;
    device_targeting?: string[] | null;
    browser_targeting?: string[] | null;
    target_audience?: any;
    screener_questions?: any;
  };
  submissionCount: number;
  approvedCount: number;
  pendingCount: number;
  onClose: () => void;
}

const deviceIcons: Record<string, typeof Monitor> = { desktop: Monitor, mobile: Smartphone, tablet: Tablet };

export default function TestDetailPanel({ test, submissionCount, approvedCount, pendingCount, onClose }: TestDetailPanelProps) {
  const [tasks, setTasks] = useState<TestTask[]>([]);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTasks, setShowTasks] = useState(true);
  const [showQuestions, setShowQuestions] = useState(true);
  const [showTargeting, setShowTargeting] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: t }, { data: q }] = await Promise.all([
        supabase.from('test_tasks').select('*').eq('test_id', test.id).order('sort_order'),
        supabase.from('test_questions').select('*').eq('test_id', test.id).order('sort_order'),
      ]);
      setTasks((t as TestTask[]) || []);
      setQuestions((q as TestQuestion[]) || []);
      setLoading(false);
    })();
  }, [test.id]);

  const fillRate = test.max_testers ? Math.round((submissionCount / test.max_testers) * 100) : 0;
  const audience = test.target_audience as Record<string, any> | null;
  const screeners = (test.screener_questions || []) as Array<{ question: string; expected_answer: string }>;

  return (
    <Card className="border border-primary/20 bg-card/95 backdrop-blur-sm shadow-xl">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <CardTitle className="text-lg truncate">{test.title}</CardTitle>
              <Badge className={test.status === 'active' ? 'bg-green-500/20 text-green-600 border-green-500/30' : 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30'}>
                {test.status}
              </Badge>
              {test.test_type && <Badge variant="outline" className="capitalize text-xs">{test.test_type.replace('_', ' ')}</Badge>}
              {test.category && <Badge variant="secondary" className="text-xs">{test.category}</Badge>}
            </div>
            {test.description && <p className="text-sm text-muted-foreground line-clamp-2">{test.description}</p>}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0 -mt-1 -mr-1">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Quick stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Reward', icon: DollarSign, value: `$${Number(test.reward_amount).toFixed(2)}`, color: 'text-green-600' },
            { label: 'Duration', icon: Clock, value: `${test.estimated_duration} min`, color: 'text-blue-500' },
            { label: 'Testers', icon: Users, value: `${submissionCount}/${test.max_testers || '∞'}`, color: 'text-primary' },
            { label: 'Approved', icon: CheckCircle, value: `${approvedCount}`, color: 'text-green-500' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2 p-2.5 rounded-lg bg-secondary/40 border border-border/30">
              <s.icon className={`h-4 w-4 ${s.color} shrink-0`} />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
                <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Fill rate */}
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>Fill rate</span>
            <span className="font-semibold">{fillRate}%</span>
          </div>
          <Progress value={fillRate} className="h-2" />
        </div>

        {pendingCount > 0 && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-sm">
            <AlertCircle className="h-4 w-4 text-yellow-500 shrink-0" />
            <span className="text-yellow-700 dark:text-yellow-400 font-medium">{pendingCount} submission{pendingCount !== 1 ? 's' : ''} pending review</span>
          </div>
        )}

        {/* Prototype URL */}
        {test.prototype_url && (
          <div className="flex items-center gap-2 text-sm">
            <LinkIcon className="h-4 w-4 text-primary shrink-0" />
            <a href={test.prototype_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
              {test.prototype_url}
            </a>
          </div>
        )}

        <Separator />

        {/* Tasks */}
        <div>
          <button onClick={() => setShowTasks(!showTasks)} className="flex items-center gap-2 w-full text-left">
            <ListChecks className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold flex-1">Tasks ({tasks.length})</span>
            {showTasks ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>
          {showTasks && (
            <div className="mt-3 space-y-2">
              {loading ? (
                <div className="space-y-2">{[1, 2].map(i => <div key={i} className="h-12 bg-muted/50 rounded-lg animate-pulse" />)}</div>
              ) : tasks.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-2">No tasks defined</p>
              ) : (
                tasks.map((task, i) => (
                  <div key={task.id} className="flex gap-3 p-3 rounded-lg bg-secondary/30 border border-border/30">
                    <span className="w-6 h-6 rounded-md bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{task.title}</p>
                      {task.description && <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Questions */}
        <div>
          <button onClick={() => setShowQuestions(!showQuestions)} className="flex items-center gap-2 w-full text-left">
            <HelpCircle className="h-4 w-4 text-accent" />
            <span className="text-sm font-semibold flex-1">Questions ({questions.length})</span>
            {showQuestions ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>
          {showQuestions && (
            <div className="mt-3 space-y-2">
              {loading ? (
                <div className="space-y-2">{[1, 2].map(i => <div key={i} className="h-12 bg-muted/50 rounded-lg animate-pulse" />)}</div>
              ) : questions.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-2">No questions defined</p>
              ) : (
                questions.map((q, i) => (
                  <div key={q.id} className="flex gap-3 p-3 rounded-lg bg-secondary/30 border border-border/30">
                    <span className="w-6 h-6 rounded-md bg-accent/10 text-accent text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium">{q.question_text}</p>
                        <Badge variant="outline" className="text-[10px] capitalize">{q.question_type.replace('_', ' ')}</Badge>
                        {q.required && <Badge className="text-[10px] bg-red-500/10 text-red-500 border-red-500/20">Required</Badge>}
                      </div>
                      {q.question_type === 'mcq' && Array.isArray(q.options) && q.options.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {q.options.map((opt: string, oi: number) => (
                            <span key={oi} className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{opt}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Targeting */}
        {(test.device_targeting?.length || audience?.location || audience?.age || screeners.length > 0) && (
          <>
            <Separator />
            <div>
              <button onClick={() => setShowTargeting(!showTargeting)} className="flex items-center gap-2 w-full text-left">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold flex-1">Targeting & Screening</span>
                {showTargeting ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </button>
              {showTargeting && (
                <div className="mt-3 space-y-3">
                  {test.device_targeting && test.device_targeting.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5">Devices</p>
                      <div className="flex gap-2">
                        {test.device_targeting.map(d => {
                          const Icon = deviceIcons[d] || Globe;
                          return (
                            <span key={d} className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                              <Icon className="h-3.5 w-3.5" /> {d}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {test.browser_targeting && test.browser_targeting.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5">Browsers</p>
                      <div className="flex gap-2 flex-wrap">
                        {test.browser_targeting.map(b => (
                          <span key={b} className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-secondary border border-border/50">
                            <Globe className="h-3.5 w-3.5" /> {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(audience?.age || audience?.location) && (
                    <div className="flex flex-wrap gap-4">
                      {audience?.age && <div><p className="text-xs text-muted-foreground">Age Range</p><p className="text-sm font-medium">{audience.age}</p></div>}
                      {audience?.location && <div><p className="text-xs text-muted-foreground">Location</p><p className="text-sm font-medium">{audience.location}</p></div>}
                    </div>
                  )}
                  {screeners.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5">Screener Questions</p>
                      {screeners.map((sq, i) => (
                        <div key={i} className="flex gap-2 text-xs p-2 rounded bg-muted/40">
                          <span className="text-muted-foreground shrink-0">Q{i + 1}:</span>
                          <span>{sq.question} <span className="text-primary font-medium">→ {sq.expected_answer}</span></span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Requirements */}
        {test.requirements && (
          <>
            <Separator />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Requirements</p>
              <p className="text-sm text-foreground">{test.requirements}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
