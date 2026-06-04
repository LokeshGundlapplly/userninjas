import React, { useState, useEffect } from 'react';
import { Bot, Send, Sparkles, AlertCircle, Quote, BarChart2 } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const PROMPT_PRESETS = [
  {
    question: "Why are checkout drop-offs happening?",
    answer: "Our analysis shows that 73% of participants hesitated on the billing details page. 48% stated they could not see the tax rate details before inputting their credit card information, causing them to drop off due to pricing uncertainty.",
    metric: { label: "Checkout Hesitation", value: "73% of users", type: "error" }
  },
  {
    question: "What do users think of the new search bar?",
    answer: "User feedback is highly positive. 92% of testers remarked that the auto-suggestions were instantaneous. However, 15% requested a history recall feature so they could quickly re-run their last three queries.",
    metric: { label: "Positive Sentiment", value: "92% positive", type: "success" }
  },
  {
    question: "Give me a critical tester quote.",
    answer: "\"I tried clicking the billing button three times, but nothing happened because the error banner was placed at the top of the viewport where I couldn't see it without scrolling up.\"",
    metric: { label: "Friction Point", value: "Error placement", type: "warning" }
  }
];

export default function InsightsShowcase() {
  const [activePrompt, setActivePrompt] = useState<number | null>(null);
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: "Hello! I am your AI Research Assistant. Ask me questions about your active studies, participant video transcripts, or task metrics." }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState('');

  const handlePromptClick = (idx: number) => {
    if (isTyping) return;
    setActivePrompt(idx);
    
    // Add user question to history
    const userQ = PROMPT_PRESETS[idx].question;
    const aiA = PROMPT_PRESETS[idx].answer;
    
    setChatHistory(prev => [...prev, { sender: 'user', text: userQ }]);
    setIsTyping(true);
    setDisplayedText('');

    // Simulate typing effect
    let index = 0;
    setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayedText(prev => {
          const next = aiA.slice(0, index + 1);
          index++;
          if (index >= aiA.length) {
            clearInterval(interval);
            setIsTyping(false);
            setChatHistory(prevHistory => [...prevHistory, { sender: 'ai', text: aiA }]);
          }
          return next;
        });
      }, 15);
    }, 450);
  };

  return (
    <section className="py-24 relative overflow-hidden bg-[#050816] border-t border-border/20">
      {/* Aurora glow backlights */}
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-4">Instant Summaries</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-foreground">
              Talk directly with <br />
              <span className="text-gradient bg-gradient-to-r from-emerald-400 to-accent text-glow">your user data</span>
            </h2>
            <p className="text-muted-foreground text-sm mt-4">
              Stop watching 40 hours of test videos. Ask our research copilot to synthesize pain points, pull direct tester quotes, or compile task averages instantly.
            </p>
          </div>
        </ScrollReveal>

        {/* Chat Playground Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto items-stretch">
          
          {/* Left panel: Prompt selection */}
          <div className="lg:col-span-4 flex flex-col justify-center space-y-4">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Ask the Research Assistant
            </span>
            <div className="space-y-3">
              {PROMPT_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePromptClick(idx)}
                  disabled={isTyping}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all duration-300 flex items-center justify-between text-xs gap-3 ${
                    activePrompt === idx
                      ? 'bg-primary/10 border-primary/45 text-foreground shadow-md'
                      : 'bg-card/40 border-border/30 hover:border-border/60 hover:bg-card/65 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span>"{preset.question}"</span>
                  <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 opacity-60" />
                </button>
              ))}
            </div>

            {/* Active metric display widget */}
            {activePrompt !== null && !isTyping && (
              <div className="p-4 rounded-xl bg-secondary/20 border border-border/20 space-y-2 mt-4 animate-fade-in">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Extracted Statistic</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    PROMPT_PRESETS[activePrompt].metric.type === 'error'
                      ? 'bg-rose-500'
                      : PROMPT_PRESETS[activePrompt].metric.type === 'warning'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`} />
                  <span className="text-xs font-bold text-foreground">
                    {PROMPT_PRESETS[activePrompt].metric.label}: {PROMPT_PRESETS[activePrompt].metric.value}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right panel: Chat UI */}
          <div className="lg:col-span-8">
            <div className="relative rounded-2xl border border-border/40 bg-[#0d1025]/85 backdrop-blur-md flex flex-col justify-between h-[360px] shadow-2xl overflow-hidden">
              
              {/* Top Header status */}
              <div className="flex items-center gap-3 px-5 py-3 border-b border-border/20 bg-[#050715]/40">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Research Assistant Copilot</h4>
                  <span className="text-[9px] text-emerald-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active in checkout_study
                  </span>
                </div>
              </div>

              {/* Chat Messages scroll area */}
              <div className="flex-1 p-5 overflow-y-auto space-y-3.5 scrollbar-thin">
                {chatHistory.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-3 max-w-[85%] ${
                      msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[9px] font-bold ${
                      msg.sender === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary border border-border/40 text-muted-foreground'
                    }`}>
                      {msg.sender === 'user' ? 'U' : 'AI'}
                    </div>
                    <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-primary/20 border border-primary/25 text-foreground rounded-tr-none'
                        : 'bg-secondary/40 border border-border/20 text-muted-foreground rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}

                {/* Real-time Typing animation simulation */}
                {isTyping && (
                  <div className="flex gap-3 max-w-[85%] mr-auto">
                    <div className="w-6 h-6 rounded-full bg-secondary border border-border/40 shrink-0 flex items-center justify-center text-[9px] font-bold text-muted-foreground">
                      AI
                    </div>
                    <div className="p-3 rounded-2xl text-xs leading-relaxed bg-[#0f122f] border border-primary/30 text-foreground rounded-tl-none shadow-md">
                      {displayedText}
                      <span className="inline-block w-1 h-3.5 bg-primary ml-0.5 animate-pulse" />
                    </div>
                  </div>
                )}
              </div>

              {/* Input field mockup */}
              <div className="p-4 border-t border-border/20 bg-[#050715]/40 flex gap-2">
                <input
                  type="text"
                  placeholder="Ask a custom question... (or click preset questions on the left)"
                  disabled
                  className="flex-1 bg-secondary/20 border border-border/30 rounded-xl px-4 text-xs h-10 select-none opacity-60 cursor-not-allowed"
                />
                <button
                  disabled
                  className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
