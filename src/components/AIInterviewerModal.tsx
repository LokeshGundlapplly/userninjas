import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  Send,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Bot,
  User,
  ShieldCheck,
  ShieldX,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import type { InterviewPhase, TranscriptEntry, EligibilityResult } from '@/hooks/useAIInterviewer';

interface AIInterviewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testTitle: string;
  phase: InterviewPhase;
  eligibility: EligibilityResult | null;
  transcript: TranscriptEntry[];
  aiTyping: boolean;
  error: string | null;
  screenStream: MediaStream | null;
  exchangeCount: number;
  onCheckEligibility: () => void;
  onStartInterview: () => void;
  onSendMessage: (text: string) => void;
  onEndInterview: () => void;
  onReset: () => void;
}

export default function AIInterviewerModal({
  open,
  onOpenChange,
  testTitle,
  phase,
  eligibility,
  transcript,
  aiTyping,
  error,
  screenStream,
  exchangeCount,
  onCheckEligibility,
  onStartInterview,
  onSendMessage,
  onEndInterview,
  onReset,
}: AIInterviewerModalProps) {
  const [inputText, setInputText] = useState('');
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const screenPreviewRef = useRef<HTMLVideoElement>(null);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, aiTyping]);

  // Connect screen stream to preview
  useEffect(() => {
    if (screenPreviewRef.current && screenStream) {
      screenPreviewRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

  // Focus input when active
  useEffect(() => {
    if (phase === 'active') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [phase]);

  const handleSend = () => {
    const text = inputText.trim();
    if (!text || phase !== 'active') return;
    setInputText('');
    onSendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClose = () => {
    if (phase === 'active') {
      setShowEndConfirm(true);
    } else {
      onReset();
      onOpenChange(false);
    }
  };

  const phaseLabel: Record<InterviewPhase, string> = {
    idle: 'Ready',
    checking: 'Checking Eligibility…',
    ineligible: 'Not Eligible',
    ready: 'Eligible',
    starting: 'Starting Interview…',
    active: 'Interview Live',
    completing: 'Generating Report…',
    done: 'Session Complete',
    error: 'Error',
  };

  const phaseBadgeColor: Record<InterviewPhase, string> = {
    idle: 'bg-muted text-muted-foreground',
    checking: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    ineligible: 'bg-destructive/15 text-destructive border-destructive/30',
    ready: 'bg-green-500/15 text-green-400 border-green-500/30',
    starting: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    active: 'bg-primary/15 text-primary border-primary/30',
    completing: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    done: 'bg-green-500/15 text-green-400 border-green-500/30',
    error: 'bg-destructive/15 text-destructive border-destructive/30',
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-2xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden">
          {/* Header */}
          <DialogHeader className="px-5 pt-5 pb-3 border-b border-border/60 flex-shrink-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Bot className="h-4 w-4 text-primary flex-shrink-0" />
                  <DialogTitle className="text-base font-semibold truncate">AI Interview</DialogTitle>
                  <Badge className={`${phaseBadgeColor[phase]} border text-xs ${phase === 'active' ? 'animate-pulse' : ''}`}>
                    {phaseLabel[phase]}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">{testTitle}</p>
              </div>
              {phase === 'active' && (
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {screenStream ? (
                    <Badge variant="outline" className="text-xs text-green-500 border-green-500/40 gap-1">
                      <Monitor className="h-3 w-3" /> Screen shared
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs text-muted-foreground gap-1">
                      <MonitorOff className="h-3 w-3" /> No screen
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    {exchangeCount} exchanges
                  </Badge>
                </div>
              )}
            </div>
          </DialogHeader>

          {/* Body — changes by phase */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {/* ─── IDLE / CHECKING ── */}
            {(phase === 'idle' || phase === 'checking') && (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center gap-5">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center ring-4 ring-primary/10">
                  {phase === 'checking' ? (
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  ) : (
                    <Bot className="h-8 w-8 text-primary" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground mb-1">AI-Moderated Interview</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    {phase === 'checking'
                      ? 'Analyzing your profile against the study requirements…'
                      : 'A senior AI researcher will guide you through tasks and capture authentic insights from your screen.'}
                  </p>
                </div>
                {phase === 'idle' && (
                  <div className="grid grid-cols-3 gap-3 w-full max-w-xs text-xs text-muted-foreground">
                    {[
                      { icon: ShieldCheck, label: 'AI eligibility check' },
                      { icon: Monitor, label: 'Optional screen share' },
                      { icon: Sparkles, label: 'Auto UX report' },
                    ].map(({ icon: Icon, label }) => (
                      <div key={label} className="flex flex-col items-center gap-1.5 p-2.5 bg-muted/40 rounded-xl">
                        <Icon className="h-4 w-4 text-primary" />
                        <span className="leading-tight text-center">{label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── INELIGIBLE ─────── */}
            {phase === 'ineligible' && eligibility && (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center gap-4">
                <div className="h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center">
                  <ShieldX className="h-7 w-7 text-destructive" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-foreground mb-1">You don't qualify for this study</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">{eligibility.reason}</p>
                </div>
                {(eligibility.missing_criteria ?? []).length > 0 && (
                  <div className="w-full max-w-xs bg-muted/40 rounded-xl p-3 text-left">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Missing criteria</p>
                    <ul className="space-y-1">
                      {(eligibility.missing_criteria ?? []).map((c, i) => (
                        <li key={i} className="text-xs flex items-start gap-1.5">
                          <X className="h-3 w-3 text-destructive mt-0.5 flex-shrink-0" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>Match score: {eligibility.match_score}%</span>
                </div>
              </div>
            )}

            {/* ─── READY ──────────── */}
            {phase === 'ready' && eligibility && (
              <div className="flex flex-col items-center justify-center px-6 py-10 text-center gap-4">
                <div className="h-14 w-14 rounded-full bg-green-500/10 flex items-center justify-center ring-4 ring-green-500/10">
                  <CheckCircle2 className="h-7 w-7 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-foreground mb-1">You're a great fit!</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">{eligibility.reason}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-green-500">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Match score: {eligibility.match_score}%</span>
                </div>
                <div className="w-full max-w-sm bg-muted/40 rounded-xl p-3 text-left space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">What to expect</p>
                  {[
                    'You may be asked to share your screen (optional but recommended)',
                    'Think aloud as you complete tasks — there are no wrong answers',
                    'The session takes ~10-15 minutes and generates a UX report',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <ChevronRight className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── STARTING ───────── */}
            {phase === 'starting' && (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-foreground mb-1">Setting up your session…</h3>
                  <p className="text-sm text-muted-foreground">
                    Your AI researcher is preparing. A screen share prompt may appear.
                  </p>
                </div>
              </div>
            )}

            {/* ─── ACTIVE ─────────── */}
            {phase === 'active' && (
              <div className="flex flex-col h-full">
                {/* Screen preview (if available) */}
                {screenStream && (
                  <div className="px-4 pt-3">
                    <div className="relative rounded-xl overflow-hidden bg-black/60 border border-border/40" style={{ height: 120 }}>
                      <video
                        ref={screenPreviewRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-contain opacity-90"
                      />
                      <div className="absolute top-1.5 left-2 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[10px] text-white/70">Screen share active</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Transcript */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                  {transcript.map((entry, i) => (
                    <div
                      key={i}
                      className={`flex gap-2.5 ${entry.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <div
                        className={`h-7 w-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-semibold ${
                          entry.role === 'ai'
                            ? 'bg-primary/15 text-primary'
                            : 'bg-secondary text-muted-foreground'
                        }`}
                      >
                        {entry.role === 'ai' ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                      </div>
                      <div
                        className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                          entry.role === 'ai'
                            ? 'bg-muted/60 text-foreground rounded-tl-sm'
                            : 'bg-primary text-primary-foreground rounded-tr-sm'
                        }`}
                      >
                        {entry.content}
                        {entry.frame_captured && (
                          <span className="block text-[10px] opacity-60 mt-0.5">
                            <Monitor className="h-2.5 w-2.5 inline mr-0.5" />screen captured
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* AI typing indicator */}
                  {aiTyping && (
                    <div className="flex gap-2.5">
                      <div className="h-7 w-7 rounded-full flex-shrink-0 flex items-center justify-center bg-primary/15">
                        <Bot className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="bg-muted/60 rounded-2xl rounded-tl-sm px-3.5 py-2.5 flex items-center gap-1">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div ref={transcriptEndRef} />
                </div>
              </div>
            )}

            {/* ─── COMPLETING ─────── */}
            {phase === 'completing' && (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center gap-4">
                <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-purple-500 animate-spin" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-foreground mb-1">Generating your UX report…</h3>
                  <p className="text-sm text-muted-foreground">
                    Analyzing interview data for friction points and actionable insights.
                  </p>
                </div>
              </div>
            )}

            {/* ─── DONE ───────────── */}
            {phase === 'done' && (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center gap-4">
                <div className="h-14 w-14 rounded-full bg-green-500/10 flex items-center justify-center ring-4 ring-green-500/10">
                  <Sparkles className="h-7 w-7 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-foreground mb-1">Interview complete!</h3>
                  <p className="text-sm text-muted-foreground">
                    Your UX report has been generated. Close this window to view it.
                  </p>
                </div>
              </div>
            )}

            {/* ─── ERROR ──────────── */}
            {phase === 'error' && error && (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center gap-4">
                <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-foreground mb-1">Something went wrong</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="flex-shrink-0 border-t border-border/60 px-4 py-3">
            {phase === 'idle' && (
              <Button onClick={onCheckEligibility} className="w-full gap-2">
                <ShieldCheck className="h-4 w-4" />
                Check My Eligibility
              </Button>
            )}

            {phase === 'ready' && (
              <Button onClick={onStartInterview} className="w-full gap-2 btn-shimmer">
                <Bot className="h-4 w-4" />
                Start AI Interview
              </Button>
            )}

            {phase === 'active' && (
              <div className="flex gap-2">
                <Textarea
                  ref={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your response… (Enter to send)"
                  className="resize-none text-sm min-h-[42px] max-h-24 py-2.5"
                  rows={1}
                  disabled={aiTyping}
                />
                <div className="flex flex-col gap-1.5">
                  <Button
                    size="icon"
                    onClick={handleSend}
                    disabled={!inputText.trim() || aiTyping}
                    className="h-9 w-9 flex-shrink-0"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setShowEndConfirm(true)}
                    className="h-9 w-9 flex-shrink-0 text-destructive hover:text-destructive border-destructive/30"
                    title="End interview"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}

            {(phase === 'ineligible' || phase === 'error') && (
              <Button
                variant="outline"
                onClick={() => {
                  onReset();
                  onOpenChange(false);
                }}
                className="w-full"
              >
                Close
              </Button>
            )}

            {phase === 'done' && (
              <Button
                onClick={() => {
                  onOpenChange(false);
                }}
                className="w-full gap-2"
              >
                <Sparkles className="h-4 w-4" />
                View Report
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* End Interview Confirmation */}
      <AlertDialog open={showEndConfirm} onOpenChange={setShowEndConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End interview?</AlertDialogTitle>
            <AlertDialogDescription>
              {exchangeCount >= 3
                ? 'This will end the session and generate your UX report based on the conversation so far.'
                : "You've had fewer than 3 exchanges. Ending now will abandon the session without generating a report."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep going</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowEndConfirm(false);
                onEndInterview();
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              End session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
