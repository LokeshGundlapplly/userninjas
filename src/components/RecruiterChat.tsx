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

// ─── JSON extractor ───────────────────────────────────────────────────────────
function extractJSON(raw: string): { chat_response: string; ready: boolean; test: TestSuggestion | null } {
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

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading, suggestion]);
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
      let parsed: any = {};

      try {
        const { data, error } = await supabase.functions.invoke('ai-test-creator', { body: { messages: apiMessages } });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        parsed = data;
      } catch {
        parsed = await callAIFallback(apiMessages);
      }

      if (typeof parsed === 'string') {
        parsed = extractJSON(parsed);
      } else if (parsed && !parsed.chat_response && parsed.candidates) {
        // Gemini raw format fallback
        parsed = extractJSON(parsed.candidates[0]?.content?.parts?.[0]?.text || '');
      }

      // Force strip any JSON stringified content out of chat_response
      let aiText = parsed?.chat_response || '';
      if (!aiText && parsed?.test) {
        aiText = "I've generated a tailored user research study structure based on your details! Let's check out the details below. If it looks good, click **Open in Test Builder** to load and publish it.";
      }
      aiText = aiText.replace(/```json[\s\S]*?```/g, '');
      const jsonStart = aiText.indexOf('{');
      if (jsonStart !== -1 && (aiText.includes('"chat_response"') || aiText.includes('"ready"') || aiText.includes('"test"'))) {
        aiText = aiText.substring(0, jsonStart).trim();
      } else {
        aiText = aiText.replace(/\{[\s\S]*\}/g, '').trim();
      }

      setMessages(prev => [...prev, { role: 'ai', content: aiText || "I'm not sure I understood — could you rephrase that?" }]);
      if (parsed?.ready && parsed?.test) {
        setSuggestion(parsed.test as TestSuggestion);
      }
    } catch (err: any) {
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
    try { sessionStorage.setItem('ai_test_suggestion', JSON.stringify(suggestion)); } catch { /* ignore item set error */ }
    toast({ title: 'Test structure applied!', description: 'Review and publish your study.' });
    navigate('/recruiter/create-test');
  };

  const reset = () => {
    setMessages([{ role: 'ai', content: "Hi again! What would you like to research today?" }]);
    setSuggestion(null);
    setInput('');
    setShowQuickPrompts(true);
  };

  return (
    <div className="flex flex-col h-full bg-[#0F172A] text-slate-200">

      {/* ── Header ── */}
      <div className="flex-shrink-0 px-5 py-4 border-b border-slate-800/80 bg-gradient-to-r from-violet-600/15 via-indigo-600/10 to-transparent backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <AlexAvatar size={40} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base text-slate-100">Alex</h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Online
              </span>
            </div>
            <p className="text-xs text-slate-400">AI Research Consultant · UserNinjas</p>
          </div>
          {messages.length > 1 && (
            <button
              onClick={reset}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
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
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white shadow-md shadow-indigo-600/20">
                You
              </div>
            )}

            {/* Bubble */}
            <div
              className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                msg.role === 'ai'
                  ? 'bg-slate-900/90 border border-slate-800/80 text-slate-100 rounded-tl-sm backdrop-blur-sm'
                  : 'bg-gradient-to-br from-indigo-600 via-indigo-500 to-blue-600 text-white rounded-tr-sm shadow-lg shadow-indigo-500/25'
              }`}
            >
              {msg.role === 'ai' ? (
                <div className="prose prose-sm prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0.5 [&_strong]:font-semibold [&_strong]:text-white">
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
            <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl rounded-tl-sm px-4 py-3 backdrop-blur-sm shadow-sm">
              <TypingDots />
            </div>
          </div>
        )}

        {/* Quick prompts */}
        {showQuickPrompts && messages.length <= 1 && !loading && (
          <div className="space-y-2.5 pt-2">
            <p className="text-xs text-slate-400 text-center font-medium">Choose a testing area to begin:</p>
            <div className="grid grid-cols-2 gap-2.5">
              {QUICK_PROMPTS.map(p => (
                <button
                  key={p}
                  onClick={() => sendMessage(p)}
                  className="text-left text-xs px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900 hover:border-indigo-500/40 hover:shadow-md hover:shadow-indigo-500/10 transition-all text-slate-300 hover:text-white font-medium backdrop-blur-sm"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Test suggestion card */}
        {suggestion && (
          <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/20 overflow-hidden shadow-xl shadow-indigo-950/40">
            {/* Card header */}
            <div className="px-4 py-3 bg-indigo-950/60 border-b border-indigo-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                </div>
                <span className="text-sm font-semibold text-indigo-400">AI Design Ready</span>
              </div>
              <button
                onClick={() => setShowDetails(v => !v)}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
              >
                {showDetails ? 'Hide Details' : 'Preview Details'}
                {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            </div>

            {/* Card body */}
            <div className="px-4 py-4">
              <p className="font-semibold text-sm text-white mb-1.5 truncate">{suggestion.title}</p>
              <p className="text-xs text-slate-300 line-clamp-3 mb-4 leading-relaxed">{suggestion.description}</p>

              {/* Meta pills */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { icon: <Layers className="h-3 w-3" />, text: `${suggestion.tasks?.length || 0} tasks` },
                  { icon: <Target className="h-3 w-3" />, text: `${suggestion.questions?.length || 0} questions` },
                  { icon: <CheckCircle2 className="h-3 w-3" />, text: `${suggestion.screener_questions?.length || 0} screeners` },
                  { icon: <Clock className="h-3 w-3" />, text: `${suggestion.estimated_duration} min` },
                  { icon: <DollarSign className="h-3 w-3" />, text: `$${suggestion.recommended_reward}` },
                ].map((pill, i) => (
                  <span key={i} className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    {pill.icon} {pill.text}
                  </span>
                ))}
              </div>
            </div>

            {/* Expanded details */}
            {showDetails && (
              <div className="px-4 pb-4 space-y-4 border-t border-slate-800/80 pt-4 bg-slate-950/40">
                {suggestion.tasks?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Participant Tasks</p>
                    <ul className="space-y-2">
                      {suggestion.tasks.map((t, i) => (
                        <li key={i} className="text-xs flex gap-2 items-start">
                          <span className="w-4.5 h-4.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                          <span className="text-slate-300 leading-normal">{t.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {suggestion.screener_questions?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Screener Questions</p>
                    <ul className="space-y-2">
                      {suggestion.screener_questions.map((s, i) => (
                        <li key={i} className="text-xs flex gap-2 items-start">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-300 leading-normal">
                            {s.question} <span className="text-slate-400 italic">→ expected: "{s.expected_answer}"</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* CTA */}
            <div className="px-4 pb-4 pt-1">
              <Button
                onClick={handleApply}
                className="w-full gap-2 bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-lg shadow-indigo-600/30 rounded-xl h-11 font-semibold text-sm transition-all duration-200 border-t border-white/10"
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
      <div className="flex-shrink-0 border-t border-slate-800/80 px-4 py-3 bg-slate-950/80 backdrop-blur-md">
        <div className="flex gap-2.5 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe what you want to test…"
              className="w-full resize-none text-sm px-4 py-3 pr-10 rounded-xl border border-slate-800 bg-slate-900/60 focus:bg-slate-900 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 outline-none placeholder:text-slate-500 transition-all min-h-[46px] max-h-32 leading-relaxed text-slate-100"
              rows={1}
              disabled={loading}
              style={{ scrollbarWidth: 'none' }}
            />
          </div>
          <Button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="h-11 w-11 flex-shrink-0 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-lg shadow-indigo-600/30 disabled:opacity-40 transition-all p-0 border-t border-white/10"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-[10px] text-slate-500 text-center mt-2.5">
          Powered by <span className="text-indigo-400 font-semibold">UserNinjas AI</span> · Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
