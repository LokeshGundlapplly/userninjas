import React, { useState } from 'react';
import { BarChart3, Clock, Star, TrendingUp, Sparkles, FolderKanban, ArrowUpRight } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

export default function DashboardPreview() {
  const [activeTab, setActiveTab] = useState<'research' | 'analytics'>('research');

  return (
    <section className="py-24 relative overflow-hidden bg-[#050816] border-t border-border/20">
      {/* Aurora glow backgrounds */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-accent/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-4">Command Center</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-foreground">
              A premium interface for <br />
              <span className="text-gradient bg-gradient-to-r from-primary via-violet-400 to-accent text-glow">premium insights</span>
            </h2>
            <p className="text-muted-foreground text-sm mt-4">
              Explore your research hub. Toggle below to preview the active studies tracker or the automated analytics command center.
            </p>
          </div>
        </ScrollReveal>

        {/* Interactive Tab Selectors */}
        <ScrollReveal animation="fade-up" delay={100}>
          <div className="flex justify-center mb-10">
            <div className="flex bg-[#0d1025]/60 p-1.5 rounded-2xl border border-border/40 backdrop-blur-md">
              <button
                onClick={() => setActiveTab('research')}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'research'
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <FolderKanban className="w-4 h-4" /> Research Hub
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'analytics'
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <BarChart3 className="w-4 h-4" /> Analytics Hub
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* Dashboard Mockup Display */}
        <ScrollReveal animation="zoom-up" delay={200}>
          <div className="max-w-4xl mx-auto relative group">
            {/* Ambient backlight glow */}
            <div className="absolute -inset-3 bg-gradient-to-r from-primary/5 via-violet-500/5 to-accent/5 rounded-3xl blur-2xl opacity-75 pointer-events-none group-hover:opacity-100 transition-opacity" />
            
            <div className="relative rounded-2xl border border-border/40 bg-[#0d1025]/85 backdrop-blur-md shadow-2xl p-6 overflow-hidden min-h-[380px]">
              
              {/* Window Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border/20 mb-6">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                </div>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {activeTab === 'research' ? 'recruiter.userninjas.in/dashboard/research' : 'recruiter.userninjas.in/dashboard/analytics'}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
              </div>

              {/* Research Hub Content */}
              {activeTab === 'research' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in select-none">
                  
                  {/* Card 1 */}
                  <div className="p-4 rounded-xl bg-secondary/20 border border-border/20 hover:border-primary/20 transition-all space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[9px] bg-primary/15 text-primary px-2 py-0.5 rounded-full font-bold">Unmoderated</span>
                        <span className="text-[9px] text-muted-foreground font-mono">8/10 done</span>
                      </div>
                      <h4 className="text-xs font-bold text-foreground">Checkout flow redesign</h4>
                      <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">Test friction on payment method dropdown options.</p>
                    </div>
                    <div className="pt-2 border-t border-border/10 flex justify-between items-center text-[10px]">
                      <span className="text-muted-foreground font-semibold">Duration: 15m</span>
                      <span className="text-emerald-500 font-bold">92% success</span>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="p-4 rounded-xl bg-secondary/20 border border-border/20 hover:border-primary/20 transition-all space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[9px] bg-violet-500/15 text-violet-400 px-2 py-0.5 rounded-full font-bold">AI Interview</span>
                        <span className="text-[9px] text-muted-foreground font-mono">15/20 done</span>
                      </div>
                      <h4 className="text-xs font-bold text-foreground">Onboarding pricing page</h4>
                      <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">Assess visual hierarchy of standard vs yearly cards.</p>
                    </div>
                    <div className="pt-2 border-t border-border/10 flex justify-between items-center text-[10px]">
                      <span className="text-muted-foreground font-semibold">Duration: 20m</span>
                      <span className="text-emerald-500 font-bold">81% success</span>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="p-4 rounded-xl bg-secondary/20 border border-border/20 hover:border-primary/20 transition-all space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[9px] bg-accent/15 text-accent px-2 py-0.5 rounded-full font-bold">Live Moderated</span>
                        <span className="text-[9px] text-muted-foreground font-mono">3/5 done</span>
                      </div>
                      <h4 className="text-xs font-bold text-foreground">B2B client invoices view</h4>
                      <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">Deep-dive interviews on invoicing pain points.</p>
                    </div>
                    <div className="pt-2 border-t border-border/10 flex justify-between items-center text-[10px]">
                      <span className="text-muted-foreground font-semibold">Duration: 45m</span>
                      <span className="text-emerald-500 font-bold">100% success</span>
                    </div>
                  </div>

                  {/* AI recommendation bar */}
                  <div className="md:col-span-3 p-3 rounded-xl bg-primary/5 border border-primary/25 flex items-center justify-between mt-2">
                    <p className="text-[10px] text-muted-foreground flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 animate-pulse" />
                      <strong>AI Suggestion:</strong> Upgrading payment form descriptors could improve Task success rate by 14% based on 8 recent sessions.
                    </p>
                    <span className="text-[9px] text-primary font-bold hover:underline cursor-pointer">Quick Apply</span>
                  </div>

                </div>
              )}

              {/* Analytics Hub Content */}
              {activeTab === 'analytics' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in select-none">
                  
                  {/* Chart block */}
                  <div className="md:col-span-7 space-y-4">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Task Completion Rate (Timeline)</span>
                    <div className="bg-[#050714] border border-border/30 rounded-xl p-4 h-48 flex flex-col justify-between">
                      {/* Bar graph */}
                      <div className="flex items-end gap-2.5 h-32 px-2">
                        {[45, 58, 42, 68, 55, 72, 60, 80, 74, 88, 82, 95].map((h, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                            <div className="w-full bg-[#10b981]/25 hover:bg-[#10b981] rounded-t-sm transition-all duration-300 relative" style={{ height: `${h}%` }}>
                              {/* Hover tooltip */}
                              <div className="absolute bottom-[calc(100%+0.25rem)] left-1/2 -translate-x-1/2 bg-[#0d1025] border border-border/40 text-[8px] font-bold text-white px-1.5 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                {h}%
                              </div>
                            </div>
                            <span className="text-[7px] text-muted-foreground font-mono">T{i+1}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center text-[8px] text-muted-foreground font-semibold pt-2 border-t border-border/10">
                        <span>Task 1 (Onboarding) to Task 12 (Checkout Form Complete)</span>
                        <span className="text-emerald-500 font-bold">+12.5% improvement</span>
                      </div>
                    </div>
                  </div>

                  {/* KPIs blocks */}
                  <div className="md:col-span-5 flex flex-col justify-between gap-3">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Key Performance Indicators</span>
                    
                    <div className="grid grid-cols-2 gap-3 flex-1">
                      
                      <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/20 flex items-center gap-3">
                        <Clock className="w-8 h-8 text-primary shrink-0 opacity-80" />
                        <div>
                          <span className="text-[8px] text-muted-foreground block">Avg. Turnaround</span>
                          <span className="text-xs font-bold text-foreground">18.4 hours</span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/20 flex items-center gap-3">
                        <Star className="w-8 h-8 text-accent shrink-0 opacity-80" />
                        <div>
                          <span className="text-[8px] text-muted-foreground block">Satisfaction Score</span>
                          <span className="text-xs font-bold text-foreground">4.9 / 5</span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/20 flex items-center gap-3">
                        <TrendingUp className="w-8 h-8 text-emerald-500 shrink-0 opacity-80" />
                        <div>
                          <span className="text-[8px] text-muted-foreground block">Study Completion</span>
                          <span className="text-xs font-bold text-foreground">82.5% Rate</span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/20 flex flex-col justify-between">
                        <span className="text-[8px] text-muted-foreground block">AI Insight Quality</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-foreground">99.2%</span>
                          <span className="text-[8px] text-emerald-500 font-semibold bg-emerald-500/10 px-1.5 py-0.2 rounded-full">Accurate</span>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              )}

            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
