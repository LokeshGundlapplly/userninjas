import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, Bot, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NinjaLogo from '@/components/NinjaLogo';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';

type Msg = { role: 'user' | 'assistant' | 'agent'; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-widget`;

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: "Hi! 👋 I'm the User Ninjas assistant. Ask me anything about UX testing, pricing, or how our platform works. Type **\"talk to a human\"** anytime to connect with our team."
      }]);
    }
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const ensureConversation = async () => {
    if (conversationId) return conversationId;
    const { data } = await supabase.from('chat_conversations').insert({}).select('id').single();
    if (data) {
      setConversationId(data.id);
      return data.id;
    }
    return null;
  };

  const saveMessage = async (convId: string, role: string, content: string) => {
    await supabase.from('chat_messages').insert({ conversation_id: convId, role, content });
  };

  const handleEscalate = async () => {
    const convId = await ensureConversation();
    if (convId) {
      await supabase.from('chat_conversations').update({ status: 'escalated', escalated_at: new Date().toISOString() }).eq('id', convId);
    }
    setEscalated(true);
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: "I've escalated this to our team! 🙋 A human agent will review your messages and get back to you. You can also reach us at **contact@userninjas.in** or visit our [Contact page](/contact)."
    }]);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    if (text.toLowerCase().includes('talk to a human') || text.toLowerCase().includes('speak to a human')) {
      setInput('');
      setMessages(prev => [...prev, { role: 'user', content: text }]);
      await handleEscalate();
      return;
    }

    const userMsg: Msg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const convId = await ensureConversation();
    if (convId) saveMessage(convId, 'user', text);

    let assistantSoFar = '';
    const chatMessages = [...messages.filter(m => m.role !== 'agent'), userMsg].map(m => ({
      role: m.role === 'agent' ? 'assistant' : m.role,
      content: m.content
    }));

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: chatMessages }),
      });

      if (!resp.ok || !resp.body) throw new Error('Stream failed');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
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
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: 'assistant', content: assistantSoFar }];
              });
            }
          } catch {}
        }
      }

      if (convId && assistantSoFar) saveMessage(convId, 'assistant', assistantSoFar);
    } catch (e) {
      console.error('Chat error:', e);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting. Please try again or [contact us](/contact)." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-xl shadow-primary/25 flex items-center justify-center hover:scale-110 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 group"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-background animate-pulse" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-4rem)] rounded-2xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl shadow-primary/10 flex flex-col overflow-hidden animate-fade-in">
          {/* Header with gradient */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border-b border-border/40">
            <div className="flex items-center gap-2.5">
              <NinjaLogo showText={false} className="scale-75 origin-left" />
              <div>
                <p className="text-sm font-display font-bold tracking-tight">User Ninjas</p>
                <p className="text-[10px] text-muted-foreground font-medium">
                  {escalated ? '🟡 Waiting for agent' : '🟢 AI Assistant'}
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-secondary/80 transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-background to-secondary/10">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role !== 'user' && (
                  <div className="flex-shrink-0 mt-0.5">
                    <NinjaLogo showText={false} className="scale-[0.55] origin-top-left" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-primary to-primary/85 text-primary-foreground shadow-sm shadow-primary/20'
                    : 'bg-secondary/60 text-foreground border border-border/30'
                }`}>
                  <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:m-0 [&_a]:text-primary [&_a]:underline [&_strong]:font-semibold">
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
            {loading && (
              <div className="flex gap-2">
                <div className="flex-shrink-0">
                  <NinjaLogo showText={false} className="scale-[0.55] origin-top-left" />
                </div>
                <div className="bg-secondary/60 border border-border/30 rounded-2xl px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Escalate button */}
          {!escalated && messages.length > 2 && (
            <div className="px-4 pb-1">
              <button
                onClick={handleEscalate}
                className="w-full text-xs text-muted-foreground hover:text-accent py-1.5 flex items-center justify-center gap-1.5 transition-colors font-medium"
              >
                <ArrowRight className="w-3 h-3" />
                Talk to a human
              </button>
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-border/40 bg-background/80">
            <form
              onSubmit={(e) => { e.preventDefault(); send(); }}
              className="flex gap-2"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={escalated ? "Leave a message for our team..." : "Ask me anything..."}
                className="flex-1 bg-secondary/50 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:bg-secondary/70 placeholder:text-muted-foreground/60 transition-all"
                disabled={loading}
              />
              <Button type="submit" size="icon" className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-sm shadow-primary/20" disabled={loading || !input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
            <p className="text-[9px] text-muted-foreground/50 text-center mt-2 font-medium">Powered by User Ninjas AI</p>
          </div>
        </div>
      )}
    </>
  );
}
