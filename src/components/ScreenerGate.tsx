import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  ShieldCheck,
  ShieldX,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

interface ScreenerGateProps {
  testId: string;
  testTitle: string;
  onEligible: () => void;
  onCancel: () => void;
}

interface EligibilityResult {
  eligible: boolean;
  reason: string;
  match_score: number;
  missing_criteria: string[];
}

export default function ScreenerGate({ testId, testTitle, onEligible, onCancel }: ScreenerGateProps) {
  const { toast } = useToast();
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<EligibilityResult | null>(null);

  const check = async () => {
    setChecking(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('ai-eligibility-check', {
        body: { test_id: testId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data as EligibilityResult);
    } catch (err: any) {
      console.error('Eligibility check failed:', err);
      // On error, default to eligible so tester isn't blocked by service issues
      setResult({ eligible: true, reason: 'Eligibility check unavailable — you may proceed.', match_score: 50, missing_criteria: [] });
      toast({ title: 'Screener note', description: 'Could not run full eligibility check. You can still proceed.' });
    } finally {
      setChecking(false);
    }
  };

  // Auto-start check on first render
  if (!checking && !result) {
    check();
  }

  if (checking) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="relative">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <ShieldCheck className="h-5 w-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">Running eligibility screener…</p>
          <p className="text-xs text-muted-foreground mt-1">Checking your profile against test requirements</p>
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="space-y-4">
      <Card className={`border-2 ${result.eligible ? 'border-green-500/30 bg-green-500/5' : 'border-destructive/30 bg-destructive/5'}`}>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-3">
            {result.eligible ? (
              <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-green-500" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-destructive/15 flex items-center justify-center">
                <ShieldX className="h-5 w-5 text-destructive" />
              </div>
            )}
            <div>
              <p className="font-semibold text-foreground">
                {result.eligible ? "You're eligible!" : 'Not a match this time'}
              </p>
              <p className="text-xs text-muted-foreground">{testTitle}</p>
            </div>
            <Badge
              variant="outline"
              className={`ml-auto text-xs ${result.match_score >= 70 ? 'border-green-500/40 text-green-500' : result.match_score >= 40 ? 'border-yellow-500/40 text-yellow-500' : 'border-destructive/40 text-destructive'}`}
            >
              {result.match_score}% match
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">{result.reason}</p>

          {result.missing_criteria.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Missing Criteria</p>
              <ul className="space-y-1">
                {result.missing_criteria.map((c, i) => (
                  <li key={i} className="text-xs flex items-start gap-1.5 text-muted-foreground">
                    <AlertTriangle className="h-3 w-3 text-yellow-500 flex-shrink-0 mt-0.5" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between gap-3">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        {result.eligible ? (
          <Button size="sm" onClick={onEligible} className="gap-1.5">
            Continue to Test <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => { setResult(null); check(); }} className="gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" /> Re-check
          </Button>
        )}
      </div>
    </div>
  );
}
