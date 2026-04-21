import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Send,
  MessageSquare,
  Star,
} from 'lucide-react';

interface TestQuestion {
  id: string;
  question_text: string;
  question_type: string;
  options: string[] | null;
  required: boolean | null;
  sort_order: number;
}

interface TesterSurveyFlowProps {
  testId: string;
  submissionId: string;
  onComplete: () => void;
  onCancel: () => void;
}

export default function TesterSurveyFlow({
  testId,
  submissionId,
  onComplete,
  onCancel,
}: TesterSurveyFlowProps) {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, { text: string; option: number | null }>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [testId]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('test_questions')
        .select('*')
        .eq('test_id', testId)
        .order('sort_order', { ascending: true });
      if (error) throw error;

      const qs = (data || []).map((q) => ({
        ...q,
        options: Array.isArray(q.options) ? (q.options as string[]) : null,
      }));
      setQuestions(qs);

      // Init answers
      const init: Record<string, { text: string; option: number | null }> = {};
      qs.forEach((q) => {
        init[q.id] = { text: '', option: null };
      });
      setAnswers(init);
    } catch (err) {
      console.error('Failed to load questions:', err);
      toast({ title: 'Error', description: 'Could not load survey questions.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const currentQ = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const setAnswer = (text: string, option: number | null = null) => {
    if (!currentQ) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: { text, option },
    }));
  };

  const canGoNext = () => {
    if (!currentQ) return false;
    const a = answers[currentQ.id];
    if (!currentQ.required) return true;
    if (currentQ.question_type === 'mcq' || currentQ.question_type === 'yes_no') {
      return a.option !== null;
    }
    if (currentQ.question_type === 'rating') {
      return a.option !== null && a.option > 0;
    }
    return a.text.trim().length > 0;
  };

  const handleSubmitAll = async () => {
    // Validate required
    for (const q of questions) {
      const a = answers[q.id];
      if (q.required) {
        if (q.question_type === 'mcq' || q.question_type === 'yes_no') {
          if (a.option === null) {
            toast({ title: 'Missing answer', description: `Please answer: "${q.question_text}"`, variant: 'destructive' });
            return;
          }
        } else if (q.question_type === 'rating') {
          if (a.option === null || a.option === 0) {
            toast({ title: 'Missing answer', description: `Please rate: "${q.question_text}"`, variant: 'destructive' });
            return;
          }
        } else {
          if (!a.text.trim()) {
            toast({ title: 'Missing answer', description: `Please answer: "${q.question_text}"`, variant: 'destructive' });
            return;
          }
        }
      }
    }

    setSubmitting(true);
    try {
      const rows = questions.map((q) => ({
        submission_id: submissionId,
        question_id: q.id,
        answer_text: answers[q.id].text || null,
        selected_option: answers[q.id].option,
      }));

      const { error } = await supabase.from('question_answers').insert(rows);
      if (error) throw error;

      // Mark submission as submitted
      const { error: updateErr } = await supabase
        .from('test_submissions')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          feedback: 'Survey completed',
        } as any)
        .eq('id', submissionId);
      if (updateErr) throw updateErr;

      toast({ title: 'Survey submitted!', description: 'Thank you for your responses.' });
      onComplete();
    } catch (err) {
      console.error('Error submitting survey:', err);
      toast({ title: 'Error', description: 'Failed to submit answers.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading survey…</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12 space-y-3">
        <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto" />
        <p className="text-muted-foreground">No survey questions for this test.</p>
        <Button variant="outline" onClick={onCancel}>Go Back</Button>
      </div>
    );
  }

  const a = answers[currentQ.id];

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* Question Card */}
      <Card className="border-primary/20 bg-card">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start gap-2">
            <Badge variant="outline" className="text-xs flex-shrink-0 capitalize">
              {currentQ.question_type.replace('_', ' ')}
            </Badge>
            {currentQ.required && (
              <Badge variant="secondary" className="text-xs flex-shrink-0">Required</Badge>
            )}
          </div>
          <p className="text-base font-semibold text-foreground leading-relaxed">
            {currentQ.question_text}
          </p>

          {/* Answer Input by Type */}

          {currentQ.question_type === 'open_text' && (
            <Textarea
              placeholder="Type your answer…"
              value={a.text}
              onChange={(e) => setAnswer(e.target.value)}
              rows={4}
              className="resize-none"
            />
          )}

          {currentQ.question_type === 'mcq' && currentQ.options && (
            <div className="space-y-2">
              {currentQ.options.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAnswer(opt, idx)}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                    a.option === idx
                      ? 'border-primary bg-primary/10 text-foreground font-medium ring-1 ring-primary/30'
                      : 'border-border hover:border-primary/40 hover:bg-muted/50'
                  }`}
                >
                  <span className="mr-2 text-muted-foreground">{String.fromCharCode(65 + idx)}.</span>
                  {opt}
                </button>
              ))}
            </div>
          )}

          {currentQ.question_type === 'yes_no' && (
            <div className="flex gap-3">
              {['Yes', 'No'].map((opt, idx) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setAnswer(opt, idx)}
                  className={`flex-1 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    a.option === idx
                      ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/30'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {currentQ.question_type === 'rating' && (
            <div className="flex items-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setAnswer(String(v), v)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      a.option !== null && v <= a.option
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                </button>
              ))}
              {a.option !== null && a.option > 0 && (
                <span className="text-sm text-muted-foreground ml-2">{a.option}/5</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-2">
          {currentIndex > 0 && (
            <Button variant="outline" size="sm" onClick={() => setCurrentIndex((i) => i - 1)}>
              <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Previous
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        </div>

        {currentIndex < questions.length - 1 ? (
          <Button size="sm" onClick={() => setCurrentIndex((i) => i + 1)} disabled={!canGoNext()}>
            Next <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        ) : (
          <Button size="sm" onClick={handleSubmitAll} disabled={submitting || !canGoNext()}>
            {submitting ? (
              <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> Submitting…</>
            ) : (
              <><Send className="h-3.5 w-3.5 mr-1" /> Submit Survey</>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
