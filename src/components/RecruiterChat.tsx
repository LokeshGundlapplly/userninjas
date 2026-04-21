import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Send,
  Sparkles,
  Loader2,
  Wand2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from 'lucide-react';
import type { TestSuggestion } from '@/components/AITestCreatorChat';

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
    "requirements": "string — what testers need (skills, devices, experience)",
    "category": "one of: Web App | Mobile App | E-commerce | SaaS | Landing Page | Game | Other",
    "estimated_duration": number (minutes, realistic for the scope),
    "recommended_reward": number (USD — fair market rate, typically $10-50),
    "tasks": [
      { "title": "string", "description": "string — clear scenario-based instruction" }
    ],
    "questions": [
      {
        "question_text": "string",
        "question_type": "open_text | mcq | rating | yes_no",
        "options": ["string"] (only for mcq),
        "required": boolean
      }
    ],
    "screener_questions": [
      {
        "question": "string — yes/no or short answer question",
        "expected_answer": "string — what the right answer should be"
      }
    ],
    "target_age": "string e.g. 25-45",
    "target_location": "string e.g. US, Global",
    "device_targeting": ["desktop", "mobile", "tablet"] (subset),
    "test_type": "one of: unmoderated | moderated | survey | usability | prototype | first_impression | ab_test | card_sort | tree_test | diary_study | ai_interview"
  }
}

Rules:
- If the user hasn't given enough information yet, set "ready": false and "test": null. Ask ONE focused clarifying question.
- If you have enough info to create a good test, set "ready": true and populate the full "test" object.
- Tasks should be realistic user scenarios, not instructions ("You're shopping for a gift under $50 — find something for your friend", NOT "Click on the product category").
- Screener questions should filter for the most relevant testers. Include 2-4 screeners.
- Questions should be post-session to capture reflections and specific UX moments.
- Keep tasks between 2-5, keep questions between 2-5.
- Be warm, professional, and encouraging in chat_response.`;

/** Extract the JSON object from potentially mixed AI output */
function extractJSON(raw: string): { chat_response: string; ready: boolean; test: TestSuggestion | null } {
  // Strip markdown code fences
  let cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();

  // Try direct parse first
  try { return JSON.parse(cleaned); } catch {}

  // Find the outermost { ... } containing "chat_response"
  const start = cleaned.indexOf('{');
  if (start !== -1) {
    let depth = 0;
    for (let i = start; i < cleaned.length; i++) {
      if (cleaned[i] === '{') depth++;
      else if (cleaned[i] === '}') { depth--; if (depth === 0) { try { return JSON.parse(cleaned.slice(start, i + 1)); } catch {} break; } }
    }
  }

  // Fallback: use whole text as chat_response
  return { chat_response: raw, ready: false, test: null };
}

/** Generic OpenAI-compatible chat completions call (works with OpenAI, Groq, etc.) */
async function callOpenAICompatible(
  apiMessages: { role: string; content: string }[],
  baseUrl: string,
  apiKey: string,
  model: string,
): Promise<{ chat_response: string; ready: boolean; test: TestSuggestion | null }> {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...apiMessages.slice(-12)],
      temperature: 0.4,
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`${model} error ${res.status}: ${errText.slice(0, 200)}`);
  }
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content ?? '';
  return extractJSON(raw);
}

/** Try Gemini REST API */
async function callGeminiDirect(
  apiMessages: { role: string; content: string }[],
  apiKey: string,
): Promise<{ chat_response: string; ready: boolean; test: TestSuggestion | null }> {
  const contents = [
    { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
    { role: 'model', parts: [{ text: 'Understood. I will respond with the JSON schema.' }] },
    ...apiMessages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
  ];

  for (const model of ['gemini-2.0-flash-lite', 'gemini-2.0-flash']) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents, generationConfig: { temperature: 0.4 } }),
      },
    );
    if (res.status === 429 || res.status === 404) continue;
    if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const data = await res.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    return extractJSON(raw);
  }
  throw new Error('Gemini models unavailable');
}

/** Tries all configured AI providers in order until one works */
async function callAIFallback(
  apiMessages: { role: string; content: string }[],
): Promise<{ chat_response: string; ready: boolean; test: TestSuggestion | null }> {
  const errors: string[] = [];

  // 1. Gemini (free tier)
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (geminiKey) {
    try { return await callGeminiDirect(apiMessages, geminiKey); }
    catch (e: any) { errors.push(e.message); }
  }

  // 2. OpenAI
  const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (openaiKey) {
    try { return await callOpenAICompatible(apiMessages, 'https://api.openai.com/v1', openaiKey, 'gpt-4o-mini'); }
    catch (e: any) { errors.push(e.message); }
  }

  // 3. Groq (free tier — get key at console.groq.com)
  const groqKey = import.meta.env.VITE_GROQ_API_KEY;
  if (groqKey) {
    try { return await callOpenAICompatible(apiMessages, 'https://api.groq.com/openai/v1', groqKey, 'llama-3.3-70b-versatile'); }
    catch (e: any) { errors.push(e.message); }
  }

  if (errors.length === 0) {
    throw new Error('No AI API key configured. Add VITE_GEMINI_API_KEY, VITE_OPENAI_API_KEY, or VITE_GROQ_API_KEY to your .env file.');
  }
  throw new Error(`All AI providers failed:\n${errors.join('\n')}`);
}

function NinjaAvatar({ size = 28 }: { size?: number }) {
  return (
    <div
      className="rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0 shadow-md ring-2 ring-primary/20"
      style={{ width: size, height: size }}
    >
      <svg width={Math.round(size * 0.6)} height={Math.round(size * 0.6)} viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" opacity="0.95" />
        <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" />
        <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
      </svg>
    </div>
  );
}

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

export default function RecruiterChat() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'ai',
      content:
        "Hi! I'm Alex, your UserNinjas AI research consultant. 👋\n\nTell me what you'd like to test — describe your product, your users, and what you want to learn. I'll design the complete study for you:\n\n• **Test structure** with scenario-based tasks\n• **Screener questions** to find the right testers\n• **Post-session questions** for deeper insights\n• **Targeting** by age, device, and location\n\nWhat are you working on?",
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
    setTimeout(() => inputRef.current?.focus(), 200);
  }, []);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const userMsg: ChatMessage = { role: 'user', content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setLoading(true);

    try {
      const apiMessages = nextMessages.map((m) => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.content,
      }));

      let parsed: { chat_response?: string; ready?: boolean; test?: TestSuggestion | null };

      // Try edge function first; fall back to direct Gemini API
      try {
        const { data, error } = await supabase.functions.invoke('ai-test-creator', {
          body: { messages: apiMessages },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        parsed = data;
      } catch (edgeErr) {
        console.warn('Edge function unavailable, trying client-side AI:', edgeErr);
        parsed = await callAIFallback(apiMessages);
      }

      const aiText = parsed?.chat_response ?? "I had trouble understanding — could you try rephrasing?";
      setMessages((prev) => [...prev, { role: 'ai', content: aiText }]);
      if (parsed?.ready && parsed?.test) {
        setSuggestion(parsed.test as TestSuggestion);
      }
    } catch (err: any) {
      console.error('ai-test-creator error:', err);
      const detail = err?.message || 'Unknown error';
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: `⚠️ **Something went wrong**\n\n${detail}\n\nThis usually means the AI service is temporarily unavailable. Please try again in a moment.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleApply = () => {
    if (!suggestion) return;
    try {
      sessionStorage.setItem('ai_test_suggestion', JSON.stringify(suggestion));
    } catch {}
    toast({ title: 'Test structure applied!', description: 'Review and publish when ready.' });
    navigate('/recruiter/create-test');
  };

  const reset = () => {
    setMessages([
      {
        role: 'ai',
        content:
          "Hi! I'm Alex, your UserNinjas AI research consultant. 👋\n\nTell me what you'd like to test — describe your product, your users, and what you want to learn. I'll design the complete study for you.\n\nWhat are you working on?",
      },
    ]);
    setSuggestion(null);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-border/60 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-3">
          <NinjaAvatar size={42} />
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold leading-tight">
              <span className="text-foreground">User</span>
              <span className="text-primary">Ninjas</span>
              <span className="text-muted-foreground font-normal"> · Alex AI</span>
            </h2>
            <p className="text-xs text-muted-foreground">Your AI research consultant — describe what you need</p>
          </div>
          {messages.length > 1 && (
            <Button size="icon" variant="ghost" onClick={reset} title="Start over" className="h-9 w-9">
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 min-h-0">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            {msg.role === 'ai' && <NinjaAvatar size={32} />}
            {msg.role === 'user' && (
              <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 text-xs font-semibold text-muted-foreground">
                You
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'ai'
                  ? 'bg-muted/70 text-foreground rounded-tl-sm'
                  : 'bg-primary text-primary-foreground rounded-tr-sm'
              }`}
              dangerouslySetInnerHTML={{
                __html: msg.content
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\n/g, '<br/>'),
              }}
            />
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <NinjaAvatar size={32} />
            <div className="bg-muted/70 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <span key={i} className="h-1.5 w-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* Test suggestion card */}
        {suggestion && (
          <div className="rounded-2xl border border-primary/30 bg-primary/5 overflow-hidden max-w-[85%]">
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
                          <span>{s.question} <span className="text-muted-foreground">(expect: {s.expected_answer})</span></span>
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
                <Wand2 className="h-4 w-4" /> Review & Publish Test
              </Button>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-border/60 px-6 py-4 bg-card/50">
        <div className="flex gap-3 items-end">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you want to test…"
            className="resize-none text-sm min-h-[48px] max-h-36 py-3"
            rows={1}
            disabled={loading}
          />
          <Button size="icon" onClick={sendMessage} disabled={!input.trim() || loading} className="h-12 w-12 flex-shrink-0">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          Powered by <span className="text-primary font-medium">UserNinjas AI</span> · Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
