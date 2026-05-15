import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Send, Sparkles, Loader2, Wand2, RotateCcw,
  ChevronDown, ChevronUp, CheckCircle2, Clock, DollarSign,
  Layers, Target, X,
} from 'lucide-react';
import type { TestSuggestion } from '@/components/AITestCreatorChat';
import ReactMarkdown from 'react-markdown';

// ─── System prompt ───────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are Alex, a senior UX research consultant at UserNinjas. You help product teams and recruiters design effective user research studies.

When a recruiter describes what they want to test, you help them:
1. Craft a professional test structure
2. Write targeted screener questions to find the right testers
3. Build scenario-based tasks and post-task questions
4. Recommend targeting criteria (age, device, location)

Always respond with a JSON object matching this exact schema:
{
  "chat_response": "string — your conversational reply to show in chat",
  "ready": boolean — true only when you have enough info to generate the full test,
  "test": {
    "title": "string",
    "description": "string",
    "requirements": "string",
    "category": "one of: Web App | Mobile App | E-commerce | SaaS | Landing Page | Game | Other",
    "estimated_duration": number,
    "recommended_reward": number,
    "tasks": [{ "title": "string", "description": "string" }],
    "questions": [{ "question_text": "string", "question_type": "open_text | mcq | rating | yes_no", "options": ["string"], "required": boolean }],
    "screener_questions": [{ "question": "string", "expected_answer": "string" }],
    "target_age": "string",
    "target_location": "string",
    "device_targeting": ["desktop","mobile","tablet"],
    "test_type": "unmoderated | moderated | survey | usability | prototype | first_impression | ab_test | card_sort | tree_test | diary_study | ai_interview"
  }
}

Rules:
- If you don't have enough info yet, set "ready": false and "test": null. Ask ONE focused clarifying question.
- If you have enough info, set "ready": true and populate the full "test" object.
- Tasks should be realistic user scenarios, not instructions.
- Include 2-4 screener questions.
- Include 2-5 post-session questions.
- Be warm, professional, and encouraging in chat_response.
- NEVER output raw JSON in chat_response — only natural language.`;

// ─── JSON extractor ───────────────────────────────────────────────────────────
function extractJSON(raw: string): { chat_response: string; ready: boolean; test: TestSuggestion | null } {
  const text = raw.trim();
  try { return JSON.parse(text); } catch {}

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
            try { return JSON.parse(text.slice(start, i + 1)); } catch {}
          }
        }
      }
    }
  }
  // Fallback: treat everything as conversational text (never show raw JSON)
  return { chat_response: raw.replace(/```json[\s\S]*?```/g, '').replace(/\{[\s\S]*\}/g, '').trim() || raw, ready: false, test: null };
}

// ─── AI providers ─────────────────────────────────────────────────────────────
async function callOpenAICompatible(
  apiMessages: { role: string; content: string }[],
  baseUrl: string, apiKey: string, model: string,
): Promise<{ chat_response: string; ready: boolean; test: TestSuggestion | null }> {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...apiMessages.slice(-12)], temperature: 0.4 }),
  });
  if (!res.ok) throw new Error(`${model} ${res.status}`);
  const data = await res.json();
  return extractJSON(data.choices?.[0]?.message?.content ?? '');
}

async function callGeminiDirect(
  apiMessages: { role: string; content: string }[], apiKey: string,
): Promise<{ chat_response: string; ready: boolean; test: TestSuggestion | null }> {
  const contents = [
    { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
    { role: 'model', parts: [{ text: 'Understood. I will respond with the JSON schema.' }] },
    ...apiMessages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
  ];
  for (const model of ['gemini-2.0-flash-lite', 'gemini-2.0-flash']) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents, generationConfig: { temperature: 0.4 } }) },
    );
    if (res.status === 429 || res.status === 404) continue;
    if (!res.ok) throw new Error(`Gemini ${res.status}`);
    const data = await res.json();
    return extractJSON(data.candidates?.[0]?.content?.parts?.[0]?.text ?? '');
  }
  throw new Error('Gemini unavailable');
}

async function callAIFallback(
  apiMessages: { role: string; content: string }[],
): Promise<{ chat_response: string; ready: boolean; test: TestSuggestion | null }> {
  const errors: string[] = [];
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (geminiKey) { try { return await callGeminiDirect(apiMessages, geminiKey); } catch (e: any) { errors.push(e.message); } }
  const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (openaiKey) { try { return await callOpenAICompatible(apiMessages, 'https://api.openai.com/v1', openaiKey, 'gpt-4o-mini'); } catch (e: any) { errors.push(e.message); } }
  const groqKey = import.meta.env.VITE_GROQ_API_KEY;
  if (groqKey) { try { return await callOpenAICompatible(apiMessages, 'https://api.groq.com/openai/v1', groqKey, 'llama-3.3-70b-versatile'); } catch (e: any) { errors.push(e.message); } }
  throw new Error(errors.length ? `All AI providers failed: ${errors.join(', ')}` : 'No AI API key configured.');
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

// ─── Typing dots ─────────────────────────────────────────────────────────────
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
interface ChatMessage { role: 'user' | 'ai'; content: string; }

const QUICK_PROMPTS = [
  '🛒 E-commerce checkout test',
  '📱 Mobile app onboarding',
  '🎨 Landing page first impression',
  '🔍 Navigation tree test',
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function RecruiterChat() {
  const navigate = useNavigate();
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

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 200); }, []);

  const sendMessage = useCallback(async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;
    setInput('');
    setShowQuickPrompts(false);
    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setLoading(true);

    try {
      const apiMessages = nextMessages.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.content }));
      let parsed: { chat_response?: string; ready?: boolean; test?: TestSuggestion | null };

      try {
        const { data, error } = await supabase.functions.invoke('ai-test-creator', { body: { messages: apiMessages } });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        parsed = data;
      } catch {
        parsed = await callAIFallback(apiMessages);
      }

      // Always use chat_response only — never show raw JSON
      const aiText = parsed?.chat_response?.trim() || "I'm not sure I understood — could you rephrase that?";
      setMessages(prev => [...prev, { role: 'ai', content: aiText }]);
      if (parsed?.ready && parsed?.test) setSuggestion(parsed.test as TestSuggestion);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, something went wrong. Please try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleApply = () => {
    if (!suggestion) return;
    try { sessionStorage.setItem('ai_test_suggestion', JSON.stringify(suggestion)); } catch {}
    toast({ title: 'Test ready!', description: 'Review and publish your study.' });
    navigate('/recruiter/create-test');
  };

  const reset = () => {
    setMessages([{ role: 'ai', content: "Hi again! What would you like to research today?" }]);
    setSuggestion(null);
    setInput('');
    setShowQuickPrompts(true);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-background via-background to-violet-950/5">

      {/* ── Header ── */}
      <div className="flex-shrink-0 px-5 py-4 border-b border-border/40 bg-gradient-to-r from-violet-600/10 via-indigo-600/5 to-transparent backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <AlexAvatar size={40} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base text-foreground">Alex</h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500/15 text-green-500 border border-green-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Online
              </span>
            </div>
            <p className="text-xs text-muted-foreground">AI Research Consultant · UserNinjas</p>
          </div>
          {messages.length > 1 && (
            <button
              onClick={reset}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all"
              title="Start over"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 min-h-0 scroll-smooth">

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

            {/* Avatar */}
            {msg.role === 'ai' && <AlexAvatar size={30} />}
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white shadow-md">
                You
              </div>
            )}

            {/* Bubble */}
            <div
              className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
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

        {/* Typing indicator */}
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
          <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-600/8 to-indigo-600/5 overflow-hidden shadow-lg shadow-violet-500/10">
            {/* Card header */}
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
                {showDetails ? 'Hide' : 'Preview'}
                {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            </div>

            {/* Card body */}
            <div className="px-4 py-3">
              <p className="font-semibold text-sm text-foreground mb-1 truncate">{suggestion.title}</p>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{suggestion.description}</p>

              {/* Meta pills */}
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

            {/* Expanded details */}
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

            {/* CTA */}
            <div className="px-4 pb-4">
              <Button
                onClick={handleApply}
                className="w-full gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/25 rounded-xl h-10 font-semibold text-sm transition-all"
              >
                <Wand2 className="h-4 w-4" />
                Open in Test Builder
              </Button>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
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
          Powered by <span className="text-violet-400 font-semibold">UserNinjas AI</span> · Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
