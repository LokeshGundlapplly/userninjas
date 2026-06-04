import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const FAQ_ITEMS = [
  {
    question: "How fast can I get user research results?",
    answer: "Typically under 24 hours. Once you configure and publish a study, it matches with vetted testers in our global panel. Most researchers receive completed session recordings and AI reports by the next morning."
  },
  {
    question: "What are AI-Moderated Sessions?",
    answer: "AI-Moderated Sessions use conversational AI (powered by Gemini) to guide testers through your website or prototype. Rather than just recording screen activity, the AI moderator asks dynamic follow-up questions in real-time based on where the user hesitates, clicks, or expresses confusion."
  },
  {
    question: "Can I invite my team members to our workspace?",
    answer: "Yes! You can invite your design, product, and engineering teams. We support role-based permission controls, letting you specify who can edit studies, view reports, or manage billing configurations."
  },
  {
    question: "Is User Ninjas GDPR and SOC 2 compliant?",
    answer: "Absolutely. All video recordings, audio files, and user feedback transcripts are encrypted in transit via TLS 1.3 and at rest via AES-256. We support SCIM, single sign-on (SSO), and full audit logs for corporate safety."
  },
  {
    question: "How does wallet credit billing work?",
    answer: "We offer complete pay-as-you-go flexibility starting at ₹10 ($0.12). You load credits into your recruiter dashboard wallet using our secure Razorpay gateway and use them to launch studies only when you need them. No high-cost annual lock-in contracts required."
  }
];

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggleAccordion = (idx: number) => {
    setOpenIdx(prev => prev === idx ? null : idx);
  };

  return (
    <section className="py-24 relative overflow-hidden bg-[#050816] border-t border-border/25">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-4">FAQ</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-foreground">
              Frequently asked <br />
              <span className="text-gradient bg-gradient-to-r from-violet-400 to-indigo-400 text-glow">questions</span>
            </h2>
          </div>
        </ScrollReveal>

        {/* Accordions list */}
        <div className="max-w-2xl mx-auto space-y-3.5">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <ScrollReveal key={idx} animation="fade-up" delay={idx * 60}>
                <div 
                  className={`rounded-2xl border transition-all duration-300 ${
                    isOpen 
                      ? 'bg-[#0d1025] border-primary/30 shadow-md' 
                      : 'bg-card/40 border-border/30 hover:border-border/60 hover:bg-card/70'
                  }`}
                >
                  {/* Trigger Header */}
                  <button
                    onClick={() => toggleAccordion(idx)}
                    className="w-full flex items-center justify-between p-5 text-left text-xs font-bold gap-4 text-foreground"
                  >
                    <span className="flex items-center gap-2.5">
                      <HelpCircle className={`w-4.5 h-4.5 shrink-0 ${isOpen ? 'text-primary' : 'text-muted-foreground'}`} />
                      {item.question}
                    </span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-primary shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
                  </button>

                  {/* Collapsed content panel */}
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1.5 text-xs text-muted-foreground leading-relaxed border-t border-border/10 mt-1 animate-slide-down">
                      {item.answer}
                    </div>
                  )}
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
