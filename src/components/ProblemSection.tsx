import React from 'react';
import { Timer, Skull, PiggyBank, Frown, Sparkles, CheckCircle2 } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

export default function ProblemSection() {
  return (
    <section className="py-24 relative overflow-hidden bg-background border-t border-border/25">
      {/* Aurora glow highlights */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-rose-500/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <p className="text-xs font-semibold text-rose-500 tracking-widest uppercase mb-4">The Status Quo</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-foreground">
              Traditional UX testing is <br />
              <span className="text-gradient bg-gradient-to-r from-rose-400 to-amber-500 text-glow">fundamentally broken</span>
            </h2>
            <p className="text-muted-foreground text-sm mt-4">
              Legacy platforms cost too much, take weeks to recruit, and force you to sit through hours of boring videos.
            </p>
          </div>
        </ScrollReveal>

        {/* Contrast comparison grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          
          {/* Legacy pain points */}
          <ScrollReveal animation="fade-up" delay={100}>
            <div className="p-6 rounded-2xl border border-red-500/10 bg-card backdrop-blur-sm space-y-6 h-full flex flex-col justify-between">
              <div>
                <h3 className="font-display font-bold text-base text-rose-600 flex items-center gap-2 mb-4">
                  <Frown className="w-5 h-5" /> Traditional Research Platforms
                </h3>
                
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <Timer className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-xs text-foreground block">Slow Recruitment</span>
                      <p className="text-xs text-muted-foreground mt-0.5">Finding specific B2B users or niches takes 7–14 days on average.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Skull className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-xs text-foreground block">Manual Analysis Nightmare</span>
                      <p className="text-xs text-muted-foreground mt-0.5">Watching 40 recorded sessions to tag clicks and hesitation points takes days.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <PiggyBank className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-xs text-foreground block">Bloated Budgets</span>
                      <p className="text-xs text-muted-foreground mt-0.5">Contracts starting at $15,000/year lock out smaller product teams entirely.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-muted-foreground font-mono pt-4 border-t border-border/10">
                ❌ High overhead · Delayed product releases · Guesswork
              </div>
            </div>
          </ScrollReveal>

          {/* User Ninjas solution */}
          <ScrollReveal animation="fade-up" delay={180}>
            <div className="p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm space-y-6 h-full flex flex-col justify-between">
              <div>
                <h3 className="font-display font-bold text-base text-emerald-600 flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-emerald-600" /> The Research OS
                </h3>
                
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-xs text-foreground block">Vetted Panel in Minutes</span>
                      <p className="text-xs text-muted-foreground mt-0.5">Reach 120,000+ global testers with automated screener filters instantly.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-xs text-foreground block">Automated AI Transcription & Summaries</span>
                      <p className="text-xs text-muted-foreground mt-0.5">AI parses recordings, highlights hesitation markers, and suggests fixes in minutes.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-xs text-foreground block">Pay-as-you-go Flexibility</span>
                      <p className="text-xs text-muted-foreground mt-0.5">Top-up wallet credits starting at $10. Buy only what you need, cancel anytime.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-emerald-600 font-mono pt-4 border-t border-emerald-500/10">
                ✅ Zero friction · Speed to insight · Data-backed shipping
              </div>
            </div>
          </ScrollReveal>

        </div>
      </div>
    </section>
  );
}
