import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
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
  Clock,
  DollarSign,
  Layers,
  Target,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';

// Helper to escape literal newlines in JSON values
function escapeJSONNewlines(jsonStr: string): string {
  let inString = false;
  let escaped = false;
  let result = '';
  for (let i = 0; i < jsonStr.length; i++) {
    const char = jsonStr[i];
    if (escaped) {
      result += char;
      escaped = false;
      continue;
    }
    if (char === '\\') {
      result += char;
      escaped = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
    }
    if (char === '\n' && inString) {
      result += '\\n';
    } else if (char === '\r' && inString) {
      result += '\\r';
    } else {
      result += char;
    }
  }
  return result;
}

// ─── JSON extractor fallback ──────────────────────────────────────────────────
function extractJSON(raw: string): { chat_response: string; ready: boolean; test: any | null } {
  const text = raw.trim();
  try { return JSON.parse(escapeJSONNewlines(text)); } catch { /* ignore */ }

  const start = text.indexOf('{');
  if (start !== -1) {
    let depth = 0, inString = false, escape = false;
    for (let i = start; i < text.length; i++) {
      const c = text[i];
      if (escape) { escape = false; continue; }
      if (c === '\\') { escape = true; continue; }
      if (c === '"') { inString = !inString; continue; }
      if (!inString) {
        if (c === '{') depth++;
        else if (c === '}') {
          depth--;
          if (depth === 0) {
            try { return JSON.parse(escapeJSONNewlines(text.slice(start, i + 1))); } catch { /* ignore */ }
          }
        }
      }
    }
  }
  
  // Fallback: strip JSON block robustly if parsing failed
  let cleanText = raw.replace(/```json[\s\S]*?```/g, '');
  const jsonStart = cleanText.indexOf('{');
  if (jsonStart !== -1 && (cleanText.includes('"chat_response"') || cleanText.includes('"ready"') || cleanText.includes('"test"'))) {
    cleanText = cleanText.substring(0, jsonStart).trim();
  } else {
    cleanText = cleanText.replace(/\{[\s\S]*\}/g, '').trim();
  }
  return { chat_response: cleanText || raw, ready: false, test: null };
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function AlexAvatar({ size = 32 }: { size?: number }) {
  return (
    <div
      className="rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/30 ring-2 ring-white/10"
      style={{ width: size, height: size }}
    >
      <Sparkles className="text-white" style={{ width: size * 0.45, height: size * 0.45 }} />
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-0.5">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"
          style={{ animationDelay: `${i * 150}ms`, animationDuration: '1s' }}
        />
      ))}
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface TaskItem { title: string; description: string; }
interface QuestionItem { question_text: string; question_type: 'open_text' | 'mcq' | 'rating' | 'yes_no'; options: string[]; required: boolean; }
interface ScreenerItem { question: string; expected_answer: string; }

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

const QUICK_PROMPTS = [
  '🛒 E-commerce checkout flow',
  '📱 Mobile onboarding UX',
  '🎨 Landing page impressions',
  '🔍 Navigation usability',
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function AITestCreatorChat({ open, onOpenChange, onApply }: AITestCreatorChatProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: 'ai',
    content: "Hi! I'm **Alex**, your UserNinjas AI research consultant. 👋\n\nDescribe your product and what you want to test — I'll design a complete, professional study for you including tasks, screener questions, and targeting.\n\nWhat are you working on?",
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<TestSuggestion | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading, suggestion]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 150); }, [open]);

  const sendMessage = useCallback(async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;
    setInput('');
    setShowQuickPrompts(false);

    const userMsg: ChatMessage = { role: 'user', content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setLoading(true);

    try {
      const apiMessages = nextMessages.map(m => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.content,
      }));

      const { data, error } = await supabase.functions.invoke('ai-test-creator', {
        body: { messages: apiMessages },
      });

      if (error) throw error;

      let parsed = data;
      if (typeof data === 'string') {
        parsed = extractJSON(data);
      } else if (data && !data.chat_response && data.candidates) {
          // Gemini raw format fallback
          parsed = extractJSON(data.candidates[0]?.content?.parts?.[0]?.text || '');
      }

      // Force strip any JSON stringified content out of chat_response
      let aiText = parsed?.chat_response || '';
      if (!aiText && parsed?.test) aiText = "I've generated a test for you based on your request!";
      aiText = aiText.replace(/```json[\s\S]*?```/g, '');
      const jsonStart = aiText.indexOf('{');
      if (jsonStart !== -1 && (aiText.includes('"chat_response"') || aiText.includes('"ready"') || aiText.includes('"test"'))) {
        aiText = aiText.substring(0, jsonStart).trim();
      } else {
        aiText = aiText.replace(/\{[\s\S]*\}/g, '').trim();
      }
      
      setMessages(prev => [...prev, { role: 'ai', content: aiText || "I had trouble understanding. Could you rephrase?" }]);

      if (parsed?.ready && parsed?.test) {
        setSuggestion(parsed.test as TestSuggestion);
      }
    } catch (err) {
      console.error('ai-test-creator error:', err);
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I hit an error. Please try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleApply = () => {
    if (!suggestion) return;
    onApply(suggestion);
    toast({ title: 'Test structure applied!', description: 'Review and publish your study.' });
    onOpenChange(false);
  };

  const reset = () => {
    setMessages([{ role: 'ai', content: "Hi again! What would you like to research today?" }]);
    setSuggestion(null);
    setInput('');
    setShowQuickPrompts(true);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[500px] sm:max-w-[500px] p-0 flex flex-col gap-0 overflow-hidden bg-gradient-to-b from-background via-background to-violet-950/5">
        
        {/* Header */}
        <SheetHeader className="flex-shrink-0 px-5 py-4 border-b border-border/40 bg-gradient-to-r from-violet-600/10 via-indigo-600/5 to-transparent backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <AlexAvatar size={40} />
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center gap-2">
                <SheetTitle className="font-bold text-base text-foreground m-0 p-0 leading-none">Alex</SheetTitle>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500/15 text-green-500 border border-green-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Online
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">AI Test Creator · UserNinjas</p>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 1 && (
                <button onClick={reset} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all" title="Start over">
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </SheetHeader>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 min-h-0 scroll-smooth">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {msg.role === 'ai' && <AlexAvatar size={30} />}
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white shadow-md">
                  You
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  msg.role === 'ai'
                    ? 'bg-card/80 border border-border/50 text-foreground rounded-tl-sm backdrop-blur-sm'
                    : 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-tr-sm shadow-lg shadow-violet-500/20'
                }`}
              >
                {msg.role === 'ai' ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0.5 [&_strong]:font-semibold [&_strong]:text-foreground">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <AlexAvatar size={30} />
              <div className="bg-card/80 border border-border/50 rounded-2xl rounded-tl-sm px-4 py-3 backdrop-blur-sm shadow-sm">
                <TypingDots />
              </div>
            </div>
          )}

          {/* Quick prompts */}
          {showQuickPrompts && messages.length <= 1 && !loading && (
            <div className="space-y-2 pt-2">
              <p className="text-xs text-muted-foreground text-center font-medium">Try a quick start:</p>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_PROMPTS.map(p => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    className="text-left text-xs px-3 py-2.5 rounded-xl border border-border/60 bg-card/60 hover:bg-card hover:border-violet-500/40 hover:shadow-sm hover:shadow-violet-500/10 transition-all text-foreground/80 hover:text-foreground font-medium backdrop-blur-sm"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Test suggestion card */}
          {suggestion && (
            <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-600/8 to-indigo-600/5 overflow-hidden shadow-lg shadow-violet-500/10 mt-4 ml-10">
              <div className="px-4 py-3 bg-violet-600/10 border-b border-violet-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-violet-600/20 flex items-center justify-center">
                    <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                  </div>
                  <span className="text-sm font-semibold text-violet-400">Study Ready</span>
                </div>
                <button
                  onClick={() => setShowDetails(v => !v)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showDetails ? 'Hide details' : 'View details'}
                  {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>
              </div>

              <div className="px-4 py-3">
                <p className="font-semibold text-sm text-foreground mb-1 truncate">{suggestion.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{suggestion.description}</p>

                <div className="flex flex-wrap gap-1.5">
                  {[
                    { icon: <Layers className="h-3 w-3" />, text: `${suggestion.tasks?.length || 0} tasks` },
                    { icon: <Target className="h-3 w-3" />, text: `${suggestion.questions?.length || 0} questions` },
                    { icon: <CheckCircle2 className="h-3 w-3" />, text: `${suggestion.screener_questions?.length || 0} screeners` },
                    { icon: <Clock className="h-3 w-3" />, text: `${suggestion.estimated_duration} min` },
                    { icon: <DollarSign className="h-3 w-3" />, text: `$${suggestion.recommended_reward}` },
                  ].map((pill, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                      {pill.icon} {pill.text}
                    </span>
                  ))}
                </div>
              </div>

              {showDetails && (
                <div className="px-4 pb-3 space-y-3 border-t border-violet-500/10 pt-3">
                  {suggestion.tasks?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Tasks</p>
                      <ul className="space-y-1.5">
                        {suggestion.tasks.map((t, i) => (
                          <li key={i} className="text-xs flex gap-2 items-start">
                            <span className="w-4 h-4 rounded-full bg-violet-600/20 text-violet-400 text-[9px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                            <span className="text-foreground/80">{t.title}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {suggestion.screener_questions?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Screeners</p>
                      <ul className="space-y-1.5">
                        {suggestion.screener_questions.map((s, i) => (
                          <li key={i} className="text-xs flex gap-2 items-start">
                            <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-foreground/80">
                              {s.question} <span className="text-muted-foreground">→ expect: "{s.expected_answer}"</span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="px-4 pb-4">
                <Button
                  onClick={handleApply}
                  className="w-full gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/25 rounded-xl h-10 font-semibold text-sm transition-all"
                >
                  <Wand2 className="h-4 w-4" />
                  Apply to Test Form
                </Button>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0 border-t border-border/40 px-4 py-3 bg-card/40 backdrop-blur-sm">
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe what you want to test…"
                className="w-full resize-none text-sm px-4 py-3 pr-10 rounded-xl border border-border/60 bg-secondary/40 focus:bg-secondary/60 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 outline-none placeholder:text-muted-foreground/50 transition-all min-h-[46px] max-h-32 leading-relaxed"
                rows={1}
                disabled={loading}
                style={{ scrollbarWidth: 'none' }}
              />
            </div>
            <Button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="h-11 w-11 flex-shrink-0 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-md shadow-violet-500/30 disabled:opacity-40 transition-all p-0"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground/50 text-center mt-2">
            Powered by <span className="text-violet-400 font-semibold">UserNinjas AI</span> · Enter to send
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
