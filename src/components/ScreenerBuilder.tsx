import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Plus, Trash2, GripVertical, ChevronDown, ChevronUp,
  AlertTriangle, Settings2, Eye,
} from 'lucide-react';
import type { ScreenerQuestionSchema } from './DynamicScreenerForm';

const QUESTION_TYPE_LABELS: Record<string, string> = {
  text: 'Short Text',
  textarea: 'Long Text',
  multiple_choice: 'Multiple Choice',
  checkbox: 'Checkboxes',
  dropdown: 'Dropdown',
  rating: 'Rating Scale',
  yes_no: 'Yes / No',
  date: 'Date Picker',
};

interface ScreenerBuilderProps {
  questions: ScreenerQuestionSchema[];
  onChange: (questions: ScreenerQuestionSchema[]) => void;
}

function generateId() {
  return `q_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export default function ScreenerBuilder({ questions, onChange }: ScreenerBuilderProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addQuestion = () => {
    const newQ: ScreenerQuestionSchema = {
      id: generateId(),
      question_type: 'yes_no',
      question_text: '',
      options: [],
      conditional_logic: null,
      sort_order: questions.length,
    };
    const updated = [...questions, newQ];
    onChange(updated);
    setExpandedId(newQ.id);
  };

  const removeQuestion = (id: string) => {
    onChange(questions.filter(q => q.id !== id).map((q, i) => ({ ...q, sort_order: i })));
    if (expandedId === id) setExpandedId(null);
  };

  const updateQuestion = (id: string, patch: Partial<ScreenerQuestionSchema>) => {
    onChange(questions.map(q => q.id === id ? { ...q, ...patch } : q));
  };

  const moveQuestion = (id: string, dir: 'up' | 'down') => {
    const idx = questions.findIndex(q => q.id === id);
    if (dir === 'up' && idx === 0) return;
    if (dir === 'down' && idx === questions.length - 1) return;
    const newList = [...questions];
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    [newList[idx], newList[swapIdx]] = [newList[swapIdx], newList[idx]];
    onChange(newList.map((q, i) => ({ ...q, sort_order: i })));
  };

  const needsOptions = (type: string) =>
    ['multiple_choice', 'checkbox', 'dropdown'].includes(type);

  return (
    <div className="space-y-3">
      {questions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-border rounded-xl text-center">
          <Settings2 className="h-8 w-8 text-muted-foreground/50 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No screener questions yet</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Add questions to filter participants before they start the study.
          </p>
        </div>
      )}

      {questions.map((q, idx) => {
        const isExpanded = expandedId === q.id;
        const hasOptions = needsOptions(q.question_type);
        const hasLogic = !!q.conditional_logic;

        return (
          <div
            key={q.id}
            className={`border rounded-xl transition-all ${
              isExpanded ? 'border-primary/40 bg-primary/3 shadow-sm' : 'border-border/60 bg-card'
            }`}
          >
            {/* Row header */}
            <div
              className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none"
              onClick={() => setExpandedId(isExpanded ? null : q.id)}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
              <span className="text-xs font-mono text-muted-foreground/60 w-5 shrink-0">{idx + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {q.question_text || <span className="text-muted-foreground/50 italic">Untitled question</span>}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    {QUESTION_TYPE_LABELS[q.question_type] || q.question_type}
                  </Badge>
                  {hasLogic && (
                    <Badge className="text-[10px] px-1.5 py-0 bg-amber-500/10 text-amber-600 border border-amber-500/20">
                      <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                      Logic
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={e => { e.stopPropagation(); moveQuestion(q.id, 'up'); }}
                  className="p-1 rounded hover:bg-secondary/60 text-muted-foreground disabled:opacity-30"
                  disabled={idx === 0}
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); moveQuestion(q.id, 'down'); }}
                  className="p-1 rounded hover:bg-secondary/60 text-muted-foreground disabled:opacity-30"
                  disabled={idx === questions.length - 1}
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); removeQuestion(q.id); }}
                  className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                {isExpanded
                  ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  : <ChevronDown className="h-4 w-4 text-muted-foreground" />
                }
              </div>
            </div>

            {/* Expanded body */}
            {isExpanded && (
              <div className="px-4 pb-4 space-y-4 border-t border-border/60 pt-4">
                {/* Question text */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Question Text *</Label>
                  <Input
                    value={q.question_text}
                    onChange={e => updateQuestion(q.id, { question_text: e.target.value })}
                    placeholder="e.g. Do you use mobile banking apps weekly?"
                    autoFocus
                  />
                </div>

                {/* Question type */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Question Type</Label>
                  <Select
                    value={q.question_type}
                    onValueChange={v =>
                      updateQuestion(q.id, {
                        question_type: v as ScreenerQuestionSchema['question_type'],
                        options: needsOptions(v) ? (q.options?.length ? q.options : ['Option 1', 'Option 2']) : [],
                        conditional_logic: null,
                      })
                    }
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(QUESTION_TYPE_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Options (for choice-based types) */}
                {hasOptions && (
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Options</Label>
                    {(q.options || []).map((opt, oi) => (
                      <div key={oi} className="flex gap-2">
                        <Input
                          value={opt}
                          onChange={e => {
                            const newOpts = [...(q.options || [])];
                            newOpts[oi] = e.target.value;
                            updateQuestion(q.id, { options: newOpts });
                          }}
                          placeholder={`Option ${oi + 1}`}
                          className="text-sm"
                        />
                        {(q.options || []).length > 2 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0 text-destructive"
                            onClick={() =>
                              updateQuestion(q.id, {
                                options: (q.options || []).filter((_, i) => i !== oi),
                              })
                            }
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateQuestion(q.id, {
                          options: [...(q.options || []), `Option ${(q.options || []).length + 1}`],
                        })
                      }
                      className="gap-1.5 text-xs"
                    >
                      <Plus className="h-3 w-3" /> Add Option
                    </Button>
                  </div>
                )}

                <Separator className="my-1" />

                {/* Conditional Logic */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                      Conditional Logic
                    </Label>
                    <Switch
                      checked={hasLogic}
                      onCheckedChange={checked =>
                        updateQuestion(q.id, {
                          conditional_logic: checked
                            ? { ifAnswer: '', action: 'reject_participant' }
                            : null,
                        })
                      }
                    />
                  </div>

                  {hasLogic && q.conditional_logic && (
                    <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg space-y-3">
                      <p className="text-xs text-amber-700 dark:text-amber-400">
                        If the participant answers:
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-[11px] text-muted-foreground">Answer equals</Label>
                          {hasOptions ? (
                            <Select
                              value={q.conditional_logic.ifAnswer}
                              onValueChange={v =>
                                updateQuestion(q.id, {
                                  conditional_logic: { ...q.conditional_logic!, ifAnswer: v },
                                })
                              }
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Select option" />
                              </SelectTrigger>
                              <SelectContent>
                                {(q.options || []).map(opt => (
                                  <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
                                ))}
                                {q.question_type === 'yes_no' && (
                                  <>
                                    <SelectItem value="Yes" className="text-xs">Yes</SelectItem>
                                    <SelectItem value="No" className="text-xs">No</SelectItem>
                                  </>
                                )}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              className="h-8 text-xs"
                              value={q.conditional_logic.ifAnswer}
                              onChange={e =>
                                updateQuestion(q.id, {
                                  conditional_logic: { ...q.conditional_logic!, ifAnswer: e.target.value },
                                })
                              }
                              placeholder="e.g. No, Less than 18…"
                            />
                          )}
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[11px] text-muted-foreground">Then</Label>
                          <Select
                            value={q.conditional_logic.action}
                            onValueChange={v =>
                              updateQuestion(q.id, {
                                conditional_logic: {
                                  ...q.conditional_logic!,
                                  action: v as 'reject_participant' | 'skip_to' | 'continue',
                                },
                              })
                            }
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="reject_participant" className="text-xs">Reject participant</SelectItem>
                              <SelectItem value="skip_to" className="text-xs">Skip to question…</SelectItem>
                              <SelectItem value="continue" className="text-xs">Continue normally</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {q.conditional_logic.action === 'skip_to' && (
                        <div className="space-y-1">
                          <Label className="text-[11px] text-muted-foreground">Skip to question #</Label>
                          <Input
                            type="number"
                            className="h-8 text-xs w-28"
                            min={1}
                            max={questions.length}
                            value={q.conditional_logic.skipTo ?? ''}
                            onChange={e =>
                              updateQuestion(q.id, {
                                conditional_logic: {
                                  ...q.conditional_logic!,
                                  skipTo: Number(e.target.value) - 1,
                                },
                              })
                            }
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      <Button
        variant="outline"
        onClick={addQuestion}
        className="w-full gap-2 border-dashed border-primary/40 hover:border-primary hover:bg-primary/5 text-primary hover:text-primary"
      >
        <Plus className="h-4 w-4" /> Add Screener Question
      </Button>

      {questions.length > 0 && (
        <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
          <Eye className="h-3 w-3" />
          Participants will see these questions before starting the study.
        </p>
      )}
    </div>
  );
}
