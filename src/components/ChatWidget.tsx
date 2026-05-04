/**
 * ChatWidget — User Ninjas AI Support Assistant
 * -----------------------------------------------
 * Features:
 *  • Streaming AI responses via Groq/Llama
 *  • Structured escalation: collects name → email → issue
 *  • Detects ticket JSON signal from AI → calls create-support-ticket
 *  • Persists conversation in Supabase (chat_conversations + chat_messages)
 *  • Real-time "Talk to a human" shortcut
 *  • Polished UI with typing indicator, suggestions, markdown
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, User, ArrowRight, Ticket, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NinjaLogo from '@/components/NinjaLogo';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';

// ── Types ─────────────────────────────────────────────────────────────────────
type Role = 'user' | 'assistant' | 'agent' | 'system';

interface Msg {
  role: Role;
  content: string;
  isTicketForm?: boolean;
}

type EscalationStep =
  | 'none'
  | 'collecting_name'
  | 'collecting_email'
  | 'collecting_issue'
  | 'submitting'
  | 'done';

interface TicketForm {
  name: string;
  email: string;
  issue: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-widget`;
const TICKET_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-support-ticket`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const SUGGESTIONS = [
  'How does pricing work?',
  'What test types can I run?',
  'How fast are results?',
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── Ticket JSON detection ─────────────────────────────────────────────────────
function extractTicketAction(text: string): TicketForm | null {
  const match = text.match(/\{"action"\s*:\s*"create_ticket"[^}]+\}/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]);
    if (parsed.action === 'create_ticket' && parsed.name && parsed.email && parsed.issue) {
      return { name: parsed.name, email: parsed.email, issue: parsed.issue };
    }
  } catch { /* noop */ }
  return null;
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Escalation state
  const [escalationStep, setEscalationStep] = useState<EscalationStep>('none');
  const [ticketForm, setTicketForm] = useState<Partial<TicketForm>>({});
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [ticketError, setTicketError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const unresolved = useRef(0); // count of AI "I don't know" signals

  // ── Side effects ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: "Hi! 👋 I'm the User Ninjas AI assistant. Ask me anything about UX testing, pricing, or how our platform works.\n\nType **\"talk to a human\"** anytime to connect with our support team.",
      }]);
    }
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // ── Conversation management (non-blocking — DB may not exist yet) ───────────
  const ensureConversation = useCallback(async (): Promise<string | null> => {
    if (conversationId) return conversationId;
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .insert({ status: 'active' })
        .select('id')
        .single();
      if (error || !data) return null;
      setConversationId(data.id);
      return data.id;
    } catch (e) {
      console.warn('chat_conversations table not available:', e);
      return null;
    }
  }, [conversationId]);

  const saveMessage = useCallback(async (convId: string, role: string, content: string) => {
    try {
      await supabase.from('chat_messages').insert({ conversation_id: convId, role, content });
    } catch (e) {
      console.warn('chat_messages table not available:', e);
    }
  }, []);

  // ── Ticket creation ─────────────────────────────────────────────────────────
  const createTicket = useCallback(async (form: TicketForm) => {
    setEscalationStep('submitting');
    setTicketError(null);

    const convId = await ensureConversation();

    try {
      // Use Supabase client directly instead of Edge Function for better reliability
      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          name: form.name,
          email: form.email,
          issue: form.issue,
          conversation_id: convId,
          status: 'open',
          priority: 'normal'
        })
        .select('id')
        .single();

      if (error) throw error;

      setTicketId(data.id);
      setEscalationStep('done');

      const confirmMsg: Msg = {
        role: 'assistant',
        content: `✅ **Support ticket created!**\n\nTicket **#${data.id.slice(0, 8)}** has been submitted for **${form.name}** (${form.email}).\n\nOur team will get back to you at **${form.email}** within a few hours. You can also reach us at **contact@userninjas.in**.`,
      };
      setMessages(prev => [...prev, confirmMsg]);

      if (convId) {
        await saveMessage(convId, 'assistant', confirmMsg.content);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setTicketError(msg);
      setEscalationStep('collecting_issue');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ I couldn't submit the ticket (${msg}). Please try again or email us at **contact@userninjas.in**.`,
      }]);
    }
  }, [ensureConversation, saveMessage]);

  // ── Escalation trigger ──────────────────────────────────────────────────────
  const triggerEscalation = useCallback(async () => {
    setEscalationStep('collecting_name');
    const convId = await ensureConversation();
    if (convId) {
      try {
        await supabase
          .from('chat_conversations')
          .update({ status: 'escalated', escalated_at: new Date().toISOString() })
          .eq('id', convId);
      } catch (e) {
        console.warn('Could not update conversation status:', e);
      }
    }
    const msg: Msg = {
      role: 'assistant',
      content: "I'll connect you with our support team right away! 🙋\n\nFirst, could you share your **full name**?",
    };
    setMessages(prev => [...prev, msg]);
    if (convId) saveMessage(convId, 'assistant', msg.content);
  }, [ensureConversation, saveMessage]);

  // ── Handle escalation conversation steps ────────────────────────────────────
  const handleEscalationInput = useCallback(async (text: string): Promise<boolean> => {
    if (escalationStep === 'none' || escalationStep === 'done' || escalationStep === 'submitting') {
      return false;
    }

    const convId = await ensureConversation();
    if (convId) await saveMessage(convId, 'user', text);

    if (escalationStep === 'collecting_name') {
      if (text.trim().length < 2) {
        setMessages(prev => [...prev, { role: 'assistant', content: "Please enter your full name (at least 2 characters)." }]);
        return true;
      }
      setTicketForm(prev => ({ ...prev, name: text.trim() }));
      setEscalationStep('collecting_email');
      const msg: Msg = { role: 'assistant', content: `Thanks, **${text.trim()}**! 👍 What's your **email address**?` };
      setMessages(prev => [...prev, msg]);
      if (convId) await saveMessage(convId, 'assistant', msg.content);
      return true;
    }

    if (escalationStep === 'collecting_email') {
      if (!EMAIL_RE.test(text.trim())) {
        setMessages(prev => [...prev, { role: 'assistant', content: "That doesn't look like a valid email. Please enter a valid email address (e.g. you@example.com)." }]);
        return true;
      }
      setTicketForm(prev => ({ ...prev, email: text.trim().toLowerCase() }));
      setEscalationStep('collecting_issue');
      const msg: Msg = { role: 'assistant', content: "Got it! Please describe your issue or question in as much detail as possible." };
      setMessages(prev => [...prev, msg]);
      if (convId) await saveMessage(convId, 'assistant', msg.content);
      return true;
    }

    if (escalationStep === 'collecting_issue') {
      if (text.trim().length < 10) {
        setMessages(prev => [...prev, { role: 'assistant', content: "Please provide a bit more detail (at least 10 characters) so our team can help effectively." }]);
        return true;
      }
      const finalForm: TicketForm = {
        name: ticketForm.name!,
        email: ticketForm.email!,
        issue: text.trim(),
      };
      setTicketForm(finalForm);
      await createTicket(finalForm);
      return true;
    }

    return false;
  }, [escalationStep, ticketForm, ensureConversation, saveMessage, createTicket]);

  // ── Main send handler ───────────────────────────────────────────────────────
  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setShowSuggestions(false);
    setMessages(prev => [...prev, { role: 'user', content: text }]);

    // Check for "talk to human" trigger
    const humanTriggers = ['talk to a human', 'speak to a human', 'human agent', 'speak to someone', 'real person'];
    if (humanTriggers.some(t => text.toLowerCase().includes(t))) {
      await triggerEscalation();
      return;
    }

    // Handle ongoing escalation steps
    if (escalationStep !== 'none' && escalationStep !== 'done') {
      await handleEscalationInput(text);
      return;
    }

    // Normal AI chat
    setLoading(true);
    const convId = await ensureConversation();
    if (convId) await saveMessage(convId, 'user', text);

    const chatMessages = messages
      .filter(m => m.role !== 'system')
      .concat({ role: 'user', content: text })
      .map(m => ({ role: m.role === 'agent' ? 'assistant' : m.role, content: m.content }));

    let assistantSoFar = '';

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ANON_KEY}`,
        },
        body: JSON.stringify({ messages: chatMessages }),
      });

      if (!resp.ok || !resp.body) {
        throw new Error(`HTTP ${resp.status}`);
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, idx).replace(/\r$/, '');
          buffer = buffer.slice(idx + 1);
          if (!line.startsWith('data: ')) continue;
          const json = line.slice(6).trim();
          if (json === '[DONE]') break;
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantSoFar += delta;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant' && prev.length > 1) {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
                  );
                }
                return [...prev, { role: 'assistant', content: assistantSoFar }];
              });
            }
          } catch { /* ignore parse errors */ }
        }
      }

      // ── Check if AI signaled ticket creation ──────────────────────────────
      const ticketAction = extractTicketAction(assistantSoFar);
      if (ticketAction) {
        const cleanContent = assistantSoFar.replace(/\{"action"\s*:\s*"create_ticket"[^}]+\}/, '').trim();
        setMessages(prev => {
          const updated = [...prev];
          // findLastIndex polyfill for older browsers
          let lastIdx = -1;
          for (let i = updated.length - 1; i >= 0; i--) {
            if (updated[i].role === 'assistant') { lastIdx = i; break; }
          }
          if (lastIdx >= 0) updated[lastIdx] = { ...updated[lastIdx], content: cleanContent || "I'll create a support ticket for you now." };
          return updated;
        });
        await createTicket(ticketAction);
      } else {
        // Check if AI expressed inability to help (for auto-escalation tracking)
        const lowerContent = assistantSoFar.toLowerCase();
        const cantHelp = lowerContent.includes("don't have") || lowerContent.includes("not sure") || lowerContent.includes("i cannot") || lowerContent.includes("let me connect");
        if (cantHelp) unresolved.current++;
        if (unresolved.current >= 2 && escalationStep === 'none') {
          await triggerEscalation();
          return;
        }
      }

      if (convId && assistantSoFar) await saveMessage(convId, 'assistant', assistantSoFar);
    } catch (e) {
      console.error('Chat error:', e);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again or reach us at **contact@userninjas.in**.",
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, escalationStep, ensureConversation, saveMessage, triggerEscalation, handleEscalationInput, createTicket]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const isEscalating = escalationStep !== 'none' && escalationStep !== 'done';
  const isSubmitting = escalationStep === 'submitting';

  // ── Status indicator ────────────────────────────────────────────────────────
  const statusLabel = () => {
    if (escalationStep === 'done') return '🟢 Ticket submitted';
    if (isEscalating) return '🟡 Connecting to support';
    return '🟢 AI Assistant';
  };

  const inputPlaceholder = () => {
    if (escalationStep === 'collecting_name') return 'Enter your full name...';
    if (escalationStep === 'collecting_email') return 'Enter your email address...';
    if (escalationStep === 'collecting_issue') return 'Describe your issue...';
    if (escalationStep === 'done') return 'Ticket submitted ✓';
    return 'Ask me anything...';
  };

  return (
    <>
      {/* ── Floating button ── */}
      {!open && (
        <button
          id="chat-widget-trigger"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-xl shadow-primary/25 flex items-center justify-center hover:scale-110 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 group"
          aria-label="Open chat assistant"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="group-hover:scale-110 transition-transform duration-300">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" opacity="0.9" />
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
          </svg>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-background animate-pulse" />
        </button>
      )}

      {/* ── Chat panel ── */}
      {open && (
        <div
          id="chat-widget-panel"
          className="fixed bottom-6 right-6 z-50 w-[390px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-4rem)] rounded-2xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl shadow-primary/10 flex flex-col overflow-hidden"
          style={{ animation: 'chat-panel-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border-b border-border/40 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <NinjaLogo showText={false} className="scale-75 origin-left" />
              <div>
                <p className="text-sm font-display font-bold tracking-tight">User Ninjas Support</p>
                <p className="text-[10px] text-muted-foreground font-medium">{statusLabel()}</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg hover:bg-secondary/80 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-background to-secondary/10 min-h-0">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role !== 'user' && (
                  <div className="flex-shrink-0 mt-0.5">
                    <NinjaLogo showText={false} className="scale-[0.55] origin-top-left" />
                  </div>
                )}
                <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-primary to-primary/85 text-primary-foreground shadow-sm shadow-primary/20'
                    : 'bg-secondary/60 text-foreground border border-border/30'
                }`}>
                  <div className={`prose prose-sm dark:prose-invert max-w-none [&_p]:m-0 [&_a]:text-primary [&_a]:underline [&_strong]:font-semibold ${
                    loading && msg.role === 'assistant' && i === messages.length - 1 ? 'ai-cursor' : ''
                  }`}>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
                {msg.role === 'user' && (
                  <div className="w-6 h-6 rounded-lg bg-foreground/8 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-3 h-3 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex gap-2">
                <div className="flex-shrink-0">
                  <NinjaLogo showText={false} className="scale-[0.55] origin-top-left" />
                </div>
                <div className="bg-secondary/60 border border-border/30 rounded-2xl px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-primary/50 rounded-full animate-typing-dots" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-primary/50 rounded-full animate-typing-dots" style={{ animationDelay: '200ms' }} />
                    <span className="w-2 h-2 bg-primary/50 rounded-full animate-typing-dots" style={{ animationDelay: '400ms' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Ticket submitted confirmation banner */}
            {escalationStep === 'done' && ticketId && (
              <div className="mx-1 p-3 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-green-700 dark:text-green-400">Ticket #{ticketId.slice(0, 8)}</p>
                  <p className="text-[10px] text-green-600/80">We'll email you when resolved</p>
                </div>
              </div>
            )}

            {/* Ticket error */}
            {ticketError && (
              <div className="mx-1 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-xs text-red-600">{ticketError}</p>
              </div>
            )}
          </div>

          {/* Escalation progress indicator */}
          {isEscalating && escalationStep !== 'submitting' && (
            <div className="px-4 pb-1 flex-shrink-0">
              <div className="flex items-center gap-2 py-1.5">
                <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                    style={{
                      width:
                        escalationStep === 'collecting_name' ? '33%' :
                        escalationStep === 'collecting_email' ? '66%' :
                        escalationStep === 'collecting_issue' ? '90%' : '0%'
                    }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">
                  {escalationStep === 'collecting_name' ? 'Step 1/3' :
                   escalationStep === 'collecting_email' ? 'Step 2/3' : 'Step 3/3'}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground text-center">
                <Ticket className="inline w-3 h-3 mr-1" />Creating support ticket
              </p>
            </div>
          )}

          {/* Escalate button (shown after some messages, before escalation) */}
          {escalationStep === 'none' && messages.length > 2 && (
            <div className="px-4 pb-1 flex-shrink-0">
              <button
                onClick={triggerEscalation}
                className="w-full text-xs text-muted-foreground hover:text-accent py-1.5 flex items-center justify-center gap-1.5 transition-colors font-medium"
              >
                <ArrowRight className="w-3 h-3" />
                Talk to a human
              </button>
            </div>
          )}

          {/* Suggestions */}
          {showSuggestions && messages.length <= 1 && !loading && (
            <div className="px-3 pb-1 flex flex-wrap gap-1.5 flex-shrink-0">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={s}
                  onClick={() => { setInput(s); setShowSuggestions(false); inputRef.current?.focus(); }}
                  className="suggestion-chip"
                  style={{ animation: `suggestion-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) ${i * 80}ms forwards`, opacity: 0 }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input bar */}
          <div className="p-3 border-t border-border/40 bg-background/80 flex-shrink-0">
            <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2">
              <input
                ref={inputRef}
                id="chat-widget-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={inputPlaceholder()}
                className="flex-1 bg-secondary/50 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:bg-secondary/70 placeholder:text-muted-foreground/60 transition-all"
                disabled={loading || isSubmitting || escalationStep === 'done'}
                autoComplete={escalationStep === 'collecting_email' ? 'email' : 'off'}
                type={escalationStep === 'collecting_email' ? 'email' : 'text'}
              />
              <Button
                type="submit"
                size="icon"
                id="chat-widget-send"
                className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-sm shadow-primary/20 flex-shrink-0"
                disabled={loading || isSubmitting || !input.trim() || escalationStep === 'done'}
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
            <p className="text-[9px] text-muted-foreground/50 text-center mt-2 font-medium">
              Powered by User Ninjas AI · <a href="/contact" className="underline hover:opacity-80">Contact us</a>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
