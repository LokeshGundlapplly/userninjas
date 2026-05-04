import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import StarRating from '@/components/StarRating';
import {
  Play, FileText, Sparkles, ChevronDown, ChevronUp,
  Image, MessageSquare, HelpCircle, User, MapPin, Smartphone, Heart,
} from 'lucide-react';

interface QuestionAnswer {
  id: string;
  question_id: string;
  answer_text: string | null;
  selected_option: number | null;
  question: {
    question_text: string;
    question_type: string;
    options: any;
  } | null;
}

interface SubmissionDetailPanelProps {
  submission: {
    id: string;
    test_id: string;
    tester_id: string;
    status: string;
    feedback: string | null;
    rating: number | null;
    recording_url: string | null;
    transcript: string | null;
    transcript_summary: string | null;
    attachments: string[] | null;
    submitted_at: string | null;
    created_at: string;
  };
  testTitle: string;
  rewardAmount: number;
  onSummarize: () => void;
  isSummarizing?: boolean;
}

interface TesterProfileSummary {
  full_name: string | null;
  age: number | null;
  gender: string | null;
  location: string | null;
  bio: string | null;
  devices: string[] | null;
  interests: string[] | null;
  attachments: string[] | null;
}

export default function SubmissionDetailPanel({
  submission,
  testTitle,
  rewardAmount,
  onSummarize,
  isSummarizing,
}: SubmissionDetailPanelProps) {
  const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAnswers, setShowAnswers] = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);
  const [testerProfile, setTesterProfile] = useState<TesterProfileSummary | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, age, gender, location, bio, devices, interests, attachments')
        .eq('user_id', submission.tester_id)
        .maybeSingle();
      setTesterProfile((profileData as TesterProfileSummary) || null);

      // Fetch answers then their questions
      const { data: ansData } = await supabase
        .from('question_answers')
        .select('*')
        .eq('submission_id', submission.id);

      if (ansData && ansData.length > 0) {
        const questionIds = [...new Set(ansData.map(a => a.question_id))];
        const { data: questionData } = await supabase
          .from('test_questions')
          .select('id, question_text, question_type, options')
          .in('id', questionIds);

        const questionMap = new Map((questionData || []).map(q => [q.id, q]));
        setAnswers(
          ansData.map(a => ({
            ...a,
            question: questionMap.get(a.question_id) || null,
          }))
        );
      } else {
        setAnswers([]);
      }
      setLoading(false);
    })();
  }, [submission.id]);

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-4 pt-3">
      <Separator />

      {/* Tester profile summary */}
      {testerProfile && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">Tester Profile</p>
          </div>
          <div className="p-3 bg-secondary/30 rounded-lg border border-border/30 space-y-2">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <span className="font-medium">{testerProfile.full_name || 'Anonymous tester'}</span>
              {testerProfile.age && <span className="text-muted-foreground">Age {testerProfile.age}</span>}
              {testerProfile.gender && <span className="text-muted-foreground capitalize">{testerProfile.gender}</span>}
              {testerProfile.location && (
                <span className="text-muted-foreground inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {testerProfile.location}
                </span>
              )}
            </div>

            {testerProfile.devices && testerProfile.devices.length > 0 && (
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <Smartphone className="h-3.5 w-3.5 mt-0.5" />
                <div className="flex flex-wrap gap-1">
                  {testerProfile.devices.map((device) => (
                    <Badge key={device} variant="outline" className="text-[10px]">{device}</Badge>
                  ))}
                </div>
              </div>
            )}

            {testerProfile.interests && testerProfile.interests.length > 0 && (
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <Heart className="h-3.5 w-3.5 mt-0.5" />
                <div className="flex flex-wrap gap-1">
                  {testerProfile.interests.map((interest) => (
                    <Badge key={interest} variant="secondary" className="text-[10px]">{interest}</Badge>
                  ))}
                </div>
              </div>
            )}

            {testerProfile.bio && (
              <p className="text-xs text-muted-foreground italic">"{testerProfile.bio}"</p>
            )}

            {testerProfile.attachments && testerProfile.attachments.length > 0 && (
              <div className="flex items-start gap-2 text-xs text-muted-foreground mt-2 pt-2 border-t border-border/30">
                <FileText className="h-3.5 w-3.5 mt-0.5" />
                <div className="flex flex-wrap gap-2">
                  {testerProfile.attachments.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                      <span className="truncate max-w-[150px]">Attachment {i + 1}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Feedback */}
      {submission.feedback && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">Tester Feedback</p>
          </div>
          <div className="p-3 bg-secondary/40 rounded-lg border border-border/30">
            <p className="text-sm text-foreground leading-relaxed">{submission.feedback}</p>
          </div>
        </div>
      )}

      {/* Question Answers */}
      {!loading && answers.length > 0 && (
        <div>
          <button onClick={() => setShowAnswers(!showAnswers)} className="flex items-center gap-2 w-full text-left">
            <HelpCircle className="h-4 w-4 text-accent" />
            <span className="text-sm font-semibold flex-1">Question Responses ({answers.length})</span>
            {showAnswers ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>
          {showAnswers && (
            <div className="mt-2 space-y-2">
              {answers.map((ans, i) => (
                <div key={ans.id} className="p-3 rounded-lg bg-secondary/30 border border-border/30">
                  <p className="text-xs text-muted-foreground mb-1">
                    Q{i + 1}: {ans.question?.question_text || 'Unknown question'}
                    {ans.question?.question_type && (
                      <Badge variant="outline" className="ml-2 text-[10px] capitalize">{ans.question.question_type.replace('_', ' ')}</Badge>
                    )}
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {ans.answer_text
                      ? ans.answer_text
                      : ans.selected_option !== null
                        ? (Array.isArray(ans.question?.options) && ans.question.options[ans.selected_option]
                          ? `${ans.question.options[ans.selected_option]}`
                          : ans.question?.question_type === 'rating'
                            ? `${ans.selected_option} / 5`
                            : ans.question?.question_type === 'yes_no'
                              ? ans.selected_option === 0 ? 'Yes' : 'No'
                              : `Option ${ans.selected_option}`)
                        : '—'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Screen Recording */}
      {submission.recording_url && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Play className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">Screen Recording</p>
          </div>
          <video
            src={submission.recording_url}
            controls
            className="w-full rounded-lg border border-border max-h-80"
          />
        </div>
      )}

      {/* Attachments */}
      {submission.attachments && submission.attachments.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Image className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">Attachments ({submission.attachments.length})</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {submission.attachments.map((url, index) => {
              const isVideo = url.match(/\.(mp4|webm|mov)$/i);
              return (
                <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="block aspect-video bg-muted rounded-lg overflow-hidden hover:ring-2 ring-primary transition-all">
                  {isVideo ? (
                    <video src={url} className="w-full h-full object-cover" />
                  ) : (
                    <img src={url} alt={`Attachment ${index + 1}`} className="w-full h-full object-cover" />
                  )}
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Transcript */}
      {submission.transcript && (
        <div>
          <button onClick={() => setShowTranscript(!showTranscript)} className="flex items-center gap-2 w-full text-left">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold flex-1">Voice Transcript</span>
            {!submission.transcript_summary && (
              <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onSummarize(); }} disabled={isSummarizing} className="text-xs gap-1 h-7">
                <Sparkles className="h-3 w-3" /> {isSummarizing ? 'Summarizing…' : 'AI Summarize'}
              </Button>
            )}
            {showTranscript ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>
          {showTranscript && (
            <div className="mt-2 p-3 bg-secondary/30 rounded-lg border border-border/30 max-h-48 overflow-y-auto">
              <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">{submission.transcript}</p>
            </div>
          )}
        </div>
      )}

      {/* AI Transcript Summary */}
      {submission.transcript_summary && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">AI Summary</p>
          </div>
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {submission.transcript_summary.replace(/\*\*(.*?)\*\*/g, '$1')}
            </p>
          </div>
        </div>
      )}

      {/* Meta info */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-1">
        <span>Started: {formatDate(submission.created_at)}</span>
        {submission.submitted_at && <span>Submitted: {formatDate(submission.submitted_at)}</span>}
        <span>Tester: <code className="text-[11px]">{submission.tester_id.slice(0, 12)}…</code></span>
      </div>
    </div>
  );
}
