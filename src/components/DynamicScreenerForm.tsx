import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowRight, ArrowLeft, ShieldCheck, ShieldX, CheckCircle2,
  AlertTriangle, Star, Calendar, FileUp
} from 'lucide-react';

export interface ScreenerQuestionSchema {
  id: string;
  question_type:
    | 'text'
    | 'textarea'
    | 'multiple_choice'
    | 'checkbox'
    | 'dropdown'
    | 'rating'
    | 'yes_no'
    | 'date';
  question_text: string;
  options?: string[];
  conditional_logic?: {
    ifAnswer: string;
    action: 'reject_participant' | 'skip_to' | 'continue';
    skipTo?: number;
  } | null;
  sort_order: number;
}

interface DynamicScreenerFormProps {
  questions: ScreenerQuestionSchema[];
  testTitle: string;
  incentive?: string;
  duration?: number;
  onComplete: (answers: Record<string, any>) => void;
  onReject: (reason: string) => void;
  onCancel: () => void;
  previewMode?: boolean;
}

export default function DynamicScreenerForm({
  questions,
  testTitle,
  incentive,
  duration,
  onComplete,
  onReject,
  onCancel,
  previewMode = false,
}: DynamicScreenerFormProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentAnswer, setCurrentAnswer] = useState<any>('');
  const [checkboxSelections, setCheckboxSelections] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);

  const sortedQuestions = [...questions].sort((a, b) => a.sort_order - b.sort_order);
  const currentQ = sortedQuestions[currentIndex];
  const progress = sortedQuestions.length > 0
    ? Math.round(((currentIndex + 1) / sortedQuestions.length) * 100)
    : 100;

  // No screener questions — auto pass
  if (sortedQuestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-green-500/15 flex items-center justify-center">
          <ShieldCheck className="h-7 w-7 text-green-500" />
        </div>
        <div>
          <p className="font-semibold text-lg">No screener required</p>
          <p className="text-sm text-muted-foreground mt-1">
            This study has no eligibility questions. You may proceed.
          </p>
        </div>
        <Button onClick={() => onComplete({})} className="gap-2 mt-2">
          Start Study <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-green-500/15 flex items-center justify-center">
          <CheckCircle2 className="h-7 w-7 text-green-500" />
        </div>
        <div>
          <p className="font-bold text-lg text-foreground">You're eligible!</p>
          <p className="text-sm text-muted-foreground mt-1">
            You've answered all screening questions successfully.
          </p>
        </div>
        <Button onClick={() => onComplete(answers)} className="gap-2 mt-2">
          Continue to Study <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  const handleNext = () => {
    const answerValue = currentQ.question_type === 'checkbox'
      ? checkboxSelections
      : currentAnswer;

    // Save answer
    const newAnswers = { ...answers, [currentQ.id]: answerValue };
    setAnswers(newAnswers);

    // Evaluate conditional logic
    const logic = currentQ.conditional_logic;
    if (logic) {
      const answerStr = Array.isArray(answerValue)
        ? answerValue.join(',').toLowerCase()
        : String(answerValue ?? '').toLowerCase();
      const ifAnswerStr = logic.ifAnswer.toLowerCase();

      const triggered = answerStr === ifAnswerStr
        || answerStr.includes(ifAnswerStr)
        || ifAnswerStr.includes(answerStr);

      if (triggered) {
        if (logic.action === 'reject_participant') {
          if (!previewMode) {
            onReject(`Based on your answer to "${currentQ.question_text}", you do not meet the eligibility criteria for this study.`);
          } else {
            // In preview mode, just show rejection inline
            alert('[Preview] This answer would reject the participant.');
          }
          return;
        }
        if (logic.action === 'skip_to' && logic.skipTo !== undefined) {
          const target = Math.min(logic.skipTo, sortedQuestions.length - 1);
          setCurrentIndex(target);
          setCurrentAnswer('');
          setCheckboxSelections([]);
          return;
        }
      }
    }

    // Move to next question or finish
    if (currentIndex < sortedQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setCurrentAnswer('');
      setCheckboxSelections([]);
    } else {
      setCompleted(true);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      const prevQ = sortedQuestions[currentIndex - 1];
      const prevAnswer = answers[prevQ.id];
      if (Array.isArray(prevAnswer)) {
        setCheckboxSelections(prevAnswer);
        setCurrentAnswer('');
      } else {
        setCurrentAnswer(prevAnswer ?? '');
        setCheckboxSelections([]);
      }
    }
  };

  const toggleCheckbox = (option: string) => {
    setCheckboxSelections(prev =>
      prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
    );
  };

  const isAnswered = () => {
    if (currentQ.question_type === 'checkbox') return checkboxSelections.length > 0;
    return currentAnswer !== '' && currentAnswer !== null && currentAnswer !== undefined;
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">
            Eligibility Screener — Question {currentIndex + 1} of {sortedQuestions.length}
          </p>
          <Badge variant="outline" className="text-xs">{testTitle}</Badge>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* Study info pills */}
      {(incentive || duration) && (
        <div className="flex flex-wrap gap-2">
          {incentive && (
            <Badge className="bg-green-500/10 text-green-600 border border-green-500/20 text-xs px-2.5 py-0.5">
              💰 {incentive}
            </Badge>
          )}
          {duration && (
            <Badge variant="outline" className="text-xs px-2.5 py-0.5">
              ⏱ {duration} min
            </Badge>
          )}
          {previewMode && (
            <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-xs px-2.5 py-0.5">
              👁 Preview Mode
            </Badge>
          )}
        </div>
      )}

      {/* Question */}
      <div className="space-y-4 py-2">
        <Label className="text-base font-semibold leading-snug text-foreground">
          {currentQ.question_text}
        </Label>

        {/* Render by question type */}
        {currentQ.question_type === 'text' && (
          <Input
            value={currentAnswer}
            onChange={e => setCurrentAnswer(e.target.value)}
            placeholder="Type your answer…"
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter') handleNext(); }}
          />
        )}

        {currentQ.question_type === 'textarea' && (
          <Textarea
            value={currentAnswer}
            onChange={e => setCurrentAnswer(e.target.value)}
            placeholder="Describe your answer…"
            rows={4}
            autoFocus
          />
        )}

        {currentQ.question_type === 'multiple_choice' && (
          <RadioGroup
            value={currentAnswer}
            onValueChange={setCurrentAnswer}
            className="space-y-2"
          >
            {(currentQ.options || []).map(opt => (
              <label
                key={opt}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  currentAnswer === opt
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                    : 'border-border hover:border-primary/40 hover:bg-secondary/50'
                }`}
              >
                <RadioGroupItem value={opt} id={`mc-${currentQ.id}-${opt}`} />
                <span className="text-sm">{opt}</span>
              </label>
            ))}
          </RadioGroup>
        )}

        {currentQ.question_type === 'checkbox' && (
          <div className="space-y-2">
            {(currentQ.options || []).map(opt => (
              <label
                key={opt}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  checkboxSelections.includes(opt)
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                    : 'border-border hover:border-primary/40 hover:bg-secondary/50'
                }`}
              >
                <Checkbox
                  checked={checkboxSelections.includes(opt)}
                  onCheckedChange={() => toggleCheckbox(opt)}
                  id={`cb-${currentQ.id}-${opt}`}
                />
                <span className="text-sm">{opt}</span>
              </label>
            ))}
          </div>
        )}

        {currentQ.question_type === 'dropdown' && (
          <Select value={currentAnswer} onValueChange={setCurrentAnswer}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option…" />
            </SelectTrigger>
            <SelectContent>
              {(currentQ.options || []).map(opt => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {currentQ.question_type === 'rating' && (
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => setCurrentAnswer(n)}
                className={`flex items-center justify-center w-12 h-12 rounded-xl border text-sm font-bold transition-all ${
                  currentAnswer === n
                    ? 'border-amber-500 bg-amber-500/15 text-amber-600 scale-110'
                    : 'border-border hover:border-amber-500/50 hover:bg-amber-500/5 text-muted-foreground'
                }`}
              >
                <Star
                  className={`h-5 w-5 ${currentAnswer >= n ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`}
                />
              </button>
            ))}
          </div>
        )}

        {currentQ.question_type === 'yes_no' && (
          <div className="flex gap-3">
            {['Yes', 'No'].map(opt => (
              <button
                key={opt}
                onClick={() => setCurrentAnswer(opt)}
                className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-all ${
                  currentAnswer === opt
                    ? opt === 'Yes'
                      ? 'border-green-500 bg-green-500/10 text-green-600 ring-1 ring-green-500/30'
                      : 'border-destructive bg-destructive/10 text-destructive ring-1 ring-destructive/30'
                    : 'border-border hover:border-primary/40 hover:bg-secondary/50 text-muted-foreground'
                }`}
              >
                {opt === 'Yes' ? '✓ Yes' : '✗ No'}
              </button>
            ))}
          </div>
        )}

        {currentQ.question_type === 'date' && (
          <div className="relative">
            <Calendar className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              type="date"
              value={currentAnswer}
              onChange={e => setCurrentAnswer(e.target.value)}
              className="pl-9"
            />
          </div>
        )}

        {/* Conditional logic hint */}
        {currentQ.conditional_logic && (
          <p className="text-[11px] text-muted-foreground/70 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-amber-500" />
            Some answers may affect your eligibility.
          </p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2 border-t border-border/60">
        <div className="flex gap-2">
          {currentIndex > 0 && (
            <Button variant="ghost" size="sm" onClick={handleBack} className="gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onCancel} className="text-muted-foreground">
            Cancel
          </Button>
        </div>
        <Button
          size="sm"
          onClick={handleNext}
          disabled={!isAnswered()}
          className="gap-1.5 min-w-[100px]"
        >
          {currentIndex < sortedQuestions.length - 1 ? (
            <>Next <ArrowRight className="h-3.5 w-3.5" /></>
          ) : (
            <>Submit <CheckCircle2 className="h-3.5 w-3.5" /></>
          )}
        </Button>
      </div>
    </div>
  );
}
