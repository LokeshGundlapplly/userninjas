import React, { useState } from 'react';
import { Target, Bot, Zap, Sparkles, CheckSquare, MessageSquare, AlertCircle, ChevronRight } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const WORKFLOW_STEPS = [
  {
    id: 1,
    title: 'Define Study Parameters',
    icon: Target,
    badge: 'Step 01',
    description: 'Set your targeting demographic filters, prototype URL, and specify research objectives.',
    previewTitle: 'Study Setup Configurator',
    previewContent: (
      <div className="space-y-3 text-xs">
        <div className="flex justify-between items-center pb-2 border-b border-border/20">
          <span className="text-muted-foreground font-semibold">Target Audience</span>
          <span className="text-primary font-bold">Product Managers</span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckSquare className="w-3.5 h-3.5 text-accent" />
            <span>Age: 25 - 45 years</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckSquare className="w-3.5 h-3.5 text-accent" />
            <span>Browser: Chrome & Safari</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckSquare className="w-3.5 h-3.5 text-accent" />
            <span>Location: North America</span>
          </div>
        </div>
        <div className="p-2 rounded-lg bg-primary/5 border border-primary/20 mt-2 text-[10px] leading-relaxed text-muted-foreground">
          <strong>Objective:</strong> Validate if users find the new invoice search index intuitive.
        </div>
      </div>
    )
  },
  {
    id: 2,
    title: 'AI Moderator Conducts Session',
    icon: Bot,
    badge: 'Step 02',
    description: 'Our conversational AI moderator interviews testers asynchronously, asking smart follow-ups in real time based on their mouse actions.',
    previewTitle: 'Live AI Moderation Session',
    previewContent: (
      <div className="space-y-3 text-xs">
        <div className="flex items-center gap-2 bg-[#050714] border border-border/30 rounded-lg p-2.5">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-[9px]">AI</div>
          <p className="text-[10px] text-foreground leading-relaxed font-semibold">"Why did you click on search rather than using the sidebar filter?"</p>
        </div>
        <div className="flex items-center gap-2 bg-secondary/30 border border-border/10 rounded-lg p-2.5 ml-4">
          <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-[9px]">U</div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">"I didn't notice the filter block because it looked like static text."</p>
        </div>
        <span className="text-[9px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 font-medium inline-block animate-pulse">
          AI moderator: Analyzing response...
        </span>
      </div>
    )
  },
  {
    id: 3,
    title: 'Automated Insight Extraction',
    icon: Zap,
    badge: 'Step 03',
    description: 'Webcam video feeds are instantly transcribed. AI identifies frustration timestamps, negative sentiments, and design blockers.',
    previewTitle: 'Real-time Signal Extraction',
    previewContent: (
      <div className="space-y-2.5 text-xs">
        <div className="p-2.5 rounded-lg border border-rose-500/20 bg-rose-500/5 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <div className="flex justify-between items-center w-full">
              <span className="font-bold text-foreground">Friction Detected</span>
              <span className="text-[9px] text-rose-400 font-mono">0:14 mark</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Tester hovered index for 8 seconds without clicking.</p>
          </div>
        </div>
        <div className="p-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 flex items-start gap-2.5">
          <MessageSquare className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <div className="flex justify-between items-center w-full">
              <span className="font-bold text-foreground">NPS Promoter Quote</span>
              <span className="text-[9px] text-emerald-400 font-mono">0:45 mark</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">"The billing setup is faster than any tool I've used."</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 4,
    title: 'Synthesized Executive Summary',
    icon: Sparkles,
    badge: 'Step 04',
    description: 'Individual sessions are aggregated into one dashboard containing pain point distributions, task graphs, and direct product recommendation cards.',
    previewTitle: 'Automated Findings Report',
    previewContent: (
      <div className="space-y-3 text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-foreground">Executive Overview</span>
          <span className="text-[9px] bg-primary/20 text-primary px-2 py-0.5 rounded font-bold">READY</span>
        </div>
        <p className="text-[10px] leading-relaxed">
          "Onboarding Task completion rate is **74%**. Users spent an average of **18.4s** on step 2, with the main drop-off occurring due to missing billing descriptors."
        </p>
        <div className="p-2 rounded-lg bg-secondary/50 border border-border/30 text-[9px] text-foreground">
          💡 <strong>AI Recommendation:</strong> Relabel the invoice billing descriptor header.
        </div>
      </div>
    )
  }
];

export default function AIWorkflow() {
  const [activeStep, setActiveStep] = useState(1);

  return (
    <section id="workflow" className="py-24 relative overflow-hidden bg-[#050816]">
      {/* Light highlights */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-4">How it works</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-5 text-foreground">
              From raw user session to <br />
              <span className="text-gradient bg-gradient-to-r from-primary via-violet-400 to-accent text-glow">actionable findings</span>
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Skip days of manual video reviews. Our pipeline automates recruitment, conducts study moderation, and extracts insights.
            </p>
          </div>
        </ScrollReveal>

        {/* Workflow Split Selector Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto items-center">
          
          {/* Left panel: Steps selection */}
          <div className="lg:col-span-6 space-y-3">
            {WORKFLOW_STEPS.map((step) => {
              const Icon = step.icon;
              const isActive = activeStep === step.id;
              
              return (
                <div
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex gap-4 select-none ${
                    isActive
                      ? 'bg-card border-primary/30 shadow-lg shadow-primary/5 translate-x-1'
                      : 'bg-card/40 border-border/30 hover:border-border/60 hover:bg-card/70'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isActive ? 'bg-primary text-primary-foreground' : 'bg-secondary/40 text-muted-foreground'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-primary uppercase tracking-wider">{step.badge}</span>
                      <h3 className={`font-display text-sm font-bold transition-colors ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right panel: Live Preview Mockup of active step */}
          <div className="lg:col-span-6 relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-3xl blur-xl opacity-75 pointer-events-none" />
            
            <div className="relative rounded-2xl border border-border/40 bg-[#0d1025]/85 backdrop-blur-md p-6 shadow-2xl min-h-[260px] flex flex-col justify-between">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border/20">
                <span className="text-[10px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  {WORKFLOW_STEPS[activeStep - 1].previewTitle}
                </span>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-border" />
                  <div className="w-1.5 h-1.5 rounded-full bg-border" />
                </div>
              </div>

              {/* Dynamic Content */}
              <div className="py-5 flex-1 flex flex-col justify-center">
                {WORKFLOW_STEPS[activeStep - 1].previewContent}
              </div>

              {/* Step indicator */}
              <div className="flex items-center justify-between pt-3 border-t border-border/25 text-[10px] text-muted-foreground font-semibold">
                <span>Phase {activeStep} of 4</span>
                <span 
                  onClick={() => setActiveStep(prev => prev === 4 ? 1 : prev + 1)}
                  className="flex items-center gap-0.5 text-primary cursor-pointer hover:underline"
                >
                  Next Phase <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
