import React from 'react';
import { Star, Quote } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const TESTIMONIALS = [
  {
    quote: "User Ninjas saved us over 40 hours of manual video analysis on our checkout flow test. The AI transcripts are incredibly accurate.",
    author: "Sarah Jenkins",
    role: "Head of Product",
    company: "PayFlow SaaS",
    avatar: "S"
  },
  {
    quote: "We launched our unmoderated test at 9 PM and woke up to 10 HD recordings with full AI findings at 8 AM. Unreal turnaround speed.",
    author: "Marc K.",
    role: "Lead UX Researcher",
    company: "Mailbox Inc.",
    avatar: "M"
  },
  {
    quote: "The B2B demographic filters let us recruit SaaS owners within minutes. The pricing is transparent and highly affordable.",
    author: "Jessica Li",
    role: "Co-Founder",
    company: "SaaS Launchpad",
    avatar: "J"
  },
  {
    quote: "SSO provisioning, audit logs, and GDPR compliances made migrating our user research team seamless. Highly recommended.",
    author: "David Vance",
    role: "VP of Product",
    company: "Ledger Security",
    avatar: "D"
  }
];

export default function TestimonialsMarquee() {
  // Duplicate for seamless infinite marquee loop
  const doubleTestimonials = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section className="py-20 relative overflow-hidden bg-background border-t border-border/25">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 mb-12">
        <ScrollReveal animation="fade-up">
          <div className="text-center max-w-xl mx-auto">
            <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-4">Customer Stories</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              What researchers <span className="text-gradient bg-gradient-to-r from-violet-400 to-indigo-400">are saying</span>
            </h2>
          </div>
        </ScrollReveal>
      </div>

      {/* Infinite scrolling marquee wrapper */}
      <div className="relative flex overflow-x-hidden select-none py-4 border-y border-border/10 bg-secondary/40 backdrop-blur-sm">
        <div className="flex gap-6 animate-marquee whitespace-nowrap min-w-full">
          {doubleTestimonials.map((item, idx) => (
            <div
              key={idx}
              className="inline-block w-[320px] rounded-2xl border border-border/40 bg-card p-5 whitespace-normal shadow-lg flex flex-col justify-between shrink-0"
            >
              <div>
                <div className="flex gap-0.5 text-amber-500 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed italic">
                  "{item.quote}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border/10 mt-4">
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary">
                  {item.avatar}
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-foreground leading-none">{item.author}</h4>
                  <span className="text-[9px] text-muted-foreground mt-0.5 block">{item.role}, {item.company}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Embedded Marquee CSS Keyframes */}
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee 25s linear infinite;
          }
          .animate-marquee:hover {
            animation-play-state: paused;
          }
        `}</style>
      </div>
    </section>
  );
}
