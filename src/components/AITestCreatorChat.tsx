import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Send,
  Sparkles,
  Loader2,
  Wand2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  X,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// UserNinjas Ninja SVG Avatar — inline so it works without import
function NinjaAvatar({ size = 28 }: { size?: number }) {
  return (
    <div
      className="rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0 shadow-md ring-2 ring-primary/20"
      style={{ width: size, height: size }}
    >
      <svg
        width={Math.round(size * 0.6)}
        height={Math.round(size * 0.6)}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 2L2 7L12 12L22 7L12 2Z"
          fill="white"
          opacity="0.95"
        />
        <path
          d="M2 17L12 22L22 17"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.75"
        />
        <path
          d="M2 12L12 17L22 12"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.9"
        />
      </svg>
    </div>
  );
}

interface TaskItem {
  title: string;
  description: string;
}

interface QuestionItem {
  question_text: string;
  question_type: 'open_text' | 'mcq' | 'rating' | 'yes_no';
  options: string[];
  required: boolean;
}

interface ScreenerItem {
  question: string;
  expected_answer: string;
}

export interface TestSuggestion {
  title: string;
  description: string;
  requirements: string;
  category: string;
  estimated_duration: number;
  recommended_reward: number;
  tasks: TaskItem[];
  questions: QuestionItem[];
  screener_questions: ScreenerItem[];
  target_age: string;
  target_location: string;
  device_targeting: string[];
  test_type: string;
}

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

interface AITestCreatorChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (suggestion: TestSuggestion) => void;
}

export default function AITestCreatorChat({ open, onOpenChange, onApply }: AITestCreatorChatProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'ai',
      content: "Hi! I'm Alex, your UserNinjas AI research consultant. Tell me what you'd like to test — describe your product, who your users are, and what you want to learn. I'll build the whole test for you. ✨",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<TestSuggestion | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');

    const userMsg: ChatMessage = { role: 'user', content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setLoading(true);

    try {
      // Build message array for API (exclude the initial AI greeting from context)
      const apiMessages = nextMessages.map((m) => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.content,
      }));

      const { data, error } = await supabase.functions.invoke('ai-test-creator', {
        body: { messages: apiMessages },
      });

      if (error) throw error;

      const aiText = data?.chat_response ?? 'I had trouble understanding — could you try rephrasing?';
      setMessages((prev) => [...prev, { role: 'ai', content: aiText }]);

      if (data?.ready && data?.test) {
        setSuggestion(data.test as TestSuggestion);
      }
    } catch (err) {
      console.error('ai-test-creator error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: "Sorry, I hit an error. Please try again — I'm here to help!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleApply = () => {
    if (!suggestion) return;
    onApply(suggestion);
    toast({
      title: 'Test structure applied!',
      description: 'All fields have been populated. Review and publish when ready.',
    });
    onOpenChange(false);
  };

  const reset = () => {
    setMessages([
      {
        role: 'ai',
        content: "Hi! I'm Alex, your UserNinjas AI research consultant. Tell me what you'd like to test — describe your product, who your users are, and what you want to learn. I'll build the whole test for you. ✨",
      },
    ]);
    setSuggestion(null);
    setInput('');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:w-[460px] p-0 flex flex-col gap-0 overflow-hidden"
      >
        {/* Header */}
        <SheetHeader className="flex-shrink-0 px-5 pt-5 pb-4 border-b border-border/60 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-3">
            <NinjaAvatar size={38} />
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-base font-semibold leading-tight">
                <span className="text-foreground">User</span>
                <span className="text-primary">Ninjas</span>
                <span className="text-muted-foreground font-normal"> · Alex AI</span>
              </SheetTitle>
              <p className="text-xs text-muted-foreground">Your AI research consultant</p>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 1 && (
                <Button size="icon" variant="ghost" onClick={reset} title="Start over" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </SheetHeader>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {msg.role === 'ai' && <NinjaAvatar size={28} />}
              {msg.role === 'user' && (
                <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 text-xs font-semibold text-muted-foreground">
                  You
                </div>
              )}
              <div
                className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'ai'
                    ? 'bg-muted/70 text-foreground rounded-tl-sm'
                    : 'bg-primary text-primary-foreground rounded-tr-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-2.5">
              <NinjaAvatar size={28} />
              <div className="bg-muted/70 rounded-2xl rounded-tl-sm px-3.5 py-2.5 flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-primary/50 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Generated suggestion card */}
          {suggestion && (
            <div className="rounded-2xl border border-primary/30 bg-primary/5 overflow-hidden">
              <div className="px-4 py-3 bg-primary/10 border-b border-primary/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">Test Ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs text-primary border-primary/30">
                    {suggestion.tasks.length} tasks · {suggestion.questions.length} questions · {suggestion.screener_questions.length} screeners
                  </Badge>
                  <button
                    onClick={() => setShowDetails((v) => !v)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="px-4 py-3">
                <p className="font-semibold text-sm text-foreground mb-0.5 truncate">{suggestion.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{suggestion.description}</p>
              </div>

              {showDetails && (
                <div className="px-4 pb-3 space-y-3 border-t border-primary/10 pt-3">
                  {suggestion.tasks.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Tasks</p>
                      <ul className="space-y-1">
                        {suggestion.tasks.map((t, i) => (
                          <li key={i} className="text-xs flex gap-1.5">
                            <span className="text-primary font-semibold flex-shrink-0">{i + 1}.</span>
                            <span className="text-foreground">{t.title}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {suggestion.screener_questions.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Screener Questions</p>
                      <ul className="space-y-1">
                        {suggestion.screener_questions.map((s, i) => (
                          <li key={i} className="text-xs flex gap-1.5 items-start">
                            <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-foreground">{s.question} <span className="text-muted-foreground">(expect: {s.expected_answer})</span></span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className="text-xs">{suggestion.estimated_duration} min</Badge>
                    <Badge variant="secondary" className="text-xs">${suggestion.recommended_reward} reward</Badge>
                    <Badge variant="secondary" className="text-xs capitalize">{suggestion.test_type?.replace('_', ' ') || 'unmoderated'}</Badge>
                    {suggestion.category && <Badge variant="secondary" className="text-xs">{suggestion.category}</Badge>}
                  </div>
                </div>
              )}

              <div className="px-4 pb-4 pt-1">
                <Button onClick={handleApply} className="w-full gap-2 btn-shimmer">
                  <Wand2 className="h-4 w-4" />
                  Apply to Test Form
                </Button>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0 border-t border-border/60 px-4 py-3 bg-card/50">
          <div className="flex gap-2 items-end">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe what you want to test…"
              className="resize-none text-sm min-h-[42px] max-h-28 py-2.5"
              rows={1}
              disabled={loading}
            />
            <Button
              size="icon"
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="h-10 w-10 flex-shrink-0"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
            Powered by <span className="text-primary font-medium">UserNinjas AI</span> · Enter to send
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
