/**
 * TesterChat — AI assistant for testers
 * Helps testers find the right studies, understand requirements, and maximize earnings.
 * No JSON ever shown in UI — only clean natural language responses.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Loader2, Sparkles, RotateCcw, HelpCircle, DollarSign, Search, Star } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// ─── AI call ─────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are Ninja, a friendly AI assistant for UserNinjas testers. You help testers:
1. Find and understand available research studies
2. Understand what testers need to do in each test type (unmoderated, moderated, survey, etc.)
3. Maximize their earnings and improve their tester rating
4. Navigate the platform — how to submit feedback, upload files, use the screen recorder
5. Understand what screener questions are and how to answer them honestly

Rules:
- Be warm, encouraging, and concise.
- Give practical, actionable advice.
- If asked about a specific test type, explain what it involves step by step.
- Always respond in plain conversational English — NO JSON, NO code blocks unless showing an example.
- Keep answers short (2-4 sentences) unless a detailed explanation is truly needed.`;

async function callGroq(messages: { role: string; content: string }[]): Promise<string> {
  const groqKey = import.meta.env.VITE_GROQ_API_KEY;
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;

  // Try Groq first
  if (groqKey) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${groqKey}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages.slice(-10)],
        temperature: 0.5,
        max_tokens: 400,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.choices?.[0]?.message?.content ?? '';
    }
  }

  // Fallback: Gemini
  if (geminiKey) {
    const contents = [
      { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
      { role: 'model', parts: [{ text: 'Got it! I\'m Ninja, ready to help testers.' }] },
      ...messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
    ];
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${geminiKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents, generationConfig: { temperature: 0.5, maxOutputTokens: 400 } }) },
    );
    if (res.ok) {
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    }
  }

  throw new Error('No AI provider available');
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface ChatMessage { role: 'user' | 'ai'; content: string; }

const QUICK_PROMPTS = [
  { icon: <Search className="h-3 w-3" />, text: 'How do I find the best tests?' },
  { icon: <DollarSign className="h-3 w-3" />, text: 'How do I increase my earnings?' },
  { icon: <Star className="h-3 w-3" />, text: 'How is my rating calculated?' },
  { icon: <HelpCircle className="h-3 w-3" />, text: 'What is an unmoderated test?' },
];

// ─── Avatar ───────────────────────────────────────────────────────────────────
function NinjaAvatar({ size = 32 }: { size?: number }) {
  return (
    <div
      className="rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/30 ring-2 ring-white/10"
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
          className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"
          style={{ animationDelay: `${i * 150}ms`, animationDuration: '1s' }}
        />
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function TesterChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: 'ai',
    content: "Hi! I'm **Ninja**, your UserNinjas AI assistant. 👋\n\nI'm here to help you find the best tests, improve your rating, and maximize your earnings.\n\nWhat can I help you with today?",
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
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
      const response = await callGroq(apiMessages);
      // Strip any accidental JSON from the response
      const clean = response.replace(/```json[\s\S]*?```/g, '').replace(/\{[\s\S]*?"action"[\s\S]*?\}/g, '').trim();
      setMessages(prev => [...prev, { role: 'ai', content: clean || "I'm not sure about that — could you rephrase?" }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I'm having trouble connecting right now. Please try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const reset = () => {
    setMessages([{ role: 'ai', content: "Hi again! What can I help you with today? 😊" }]);
    setInput('');
    setShowQuickPrompts(true);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-background via-background to-emerald-950/5">

      {/* Header */}
      <div className="flex-shrink-0 px-5 py-4 border-b border-border/40 bg-gradient-to-r from-emerald-600/10 via-teal-600/5 to-transparent backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <NinjaAvatar size={40} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base text-foreground">Ninja</h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online
              </span>
            </div>
            <p className="text-xs text-muted-foreground">AI Tester Assistant · UserNinjas</p>
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 min-h-0">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            {msg.role === 'ai' && <NinjaAvatar size={30} />}
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white shadow-md">
                You
              </div>
            )}
            <div
              className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                msg.role === 'ai'
                  ? 'bg-card/80 border border-border/50 text-foreground rounded-tl-sm backdrop-blur-sm'
                  : 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-tr-sm shadow-lg shadow-emerald-500/20'
              }`}
            >
              {msg.role === 'ai' ? (
                <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0.5 [&_strong]:font-semibold">
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
            <NinjaAvatar size={30} />
            <div className="bg-card/80 border border-border/50 rounded-2xl rounded-tl-sm px-4 py-3 backdrop-blur-sm shadow-sm">
              <TypingDots />
            </div>
          </div>
        )}

        {/* Quick prompts */}
        {showQuickPrompts && messages.length <= 1 && !loading && (
          <div className="space-y-2 pt-2">
            <p className="text-xs text-muted-foreground text-center font-medium">Common questions:</p>
            <div className="grid grid-cols-1 gap-2">
              {QUICK_PROMPTS.map(p => (
                <button
                  key={p.text}
                  onClick={() => sendMessage(p.text)}
                  className="flex items-center gap-2.5 text-left text-xs px-3.5 py-2.5 rounded-xl border border-border/60 bg-card/60 hover:bg-card hover:border-emerald-500/40 hover:shadow-sm hover:shadow-emerald-500/10 transition-all text-foreground/80 hover:text-foreground font-medium backdrop-blur-sm"
                >
                  <span className="text-emerald-500">{p.icon}</span>
                  {p.text}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-border/40 px-4 py-3 bg-card/40 backdrop-blur-sm">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything…"
            className="flex-1 resize-none text-sm px-4 py-3 rounded-xl border border-border/60 bg-secondary/40 focus:bg-secondary/60 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 outline-none placeholder:text-muted-foreground/50 transition-all min-h-[46px] max-h-32 leading-relaxed"
            rows={1}
            disabled={loading}
            style={{ scrollbarWidth: 'none' }}
          />
          <Button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="h-11 w-11 flex-shrink-0 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-500/30 disabled:opacity-40 transition-all p-0"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground/50 text-center mt-2">
          Powered by <span className="text-emerald-400 font-semibold">UserNinjas AI</span> · Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
