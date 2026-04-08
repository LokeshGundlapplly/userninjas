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
      content: "I've escalated this to our team! 🙋 A human agent will review your messages and get back to you. You can also reach us at **contact@userninjas.com** or visit our [Contact page](/contact)."
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
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-105 transition-transform"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-4rem)] rounded-2xl border border-border bg-background shadow-2xl flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-primary/5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">User Ninjas</p>
                <p className="text-[10px] text-muted-foreground">
                  {escalated ? '🟡 Waiting for agent' : '🟢 AI Assistant'}
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role !== 'user' && (
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-3 h-3 text-primary" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary/80 text-foreground'
                }`}>
                  <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:m-0 [&_a]:text-primary [&_a]:underline">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
                {msg.role === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-3 h-3" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3 h-3 text-primary" />
                </div>
                <div className="bg-secondary/80 rounded-xl px-3 py-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
                className="w-full text-xs text-muted-foreground hover:text-primary py-1.5 flex items-center justify-center gap-1 transition-colors"
              >
                <ArrowRight className="w-3 h-3" />
                Talk to a human
              </button>
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-border/60">
            <form
              onSubmit={(e) => { e.preventDefault(); send(); }}
              className="flex gap-2"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={escalated ? "Leave a message for our team..." : "Ask me anything..."}
                className="flex-1 bg-secondary/60 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/40 placeholder:text-muted-foreground"
                disabled={loading}
              />
              <Button type="submit" size="icon" className="h-9 w-9 rounded-lg" disabled={loading || !input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
