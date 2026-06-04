import React, { useState } from 'react';
import { Search, Plus, BookOpen, Settings, CreditCard, Sparkles, Terminal } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const SHORTCUT_ITEMS = [
  { icon: Plus, label: "Create new research study", shortcut: "⌘ + N", category: "Actions" },
  { icon: BookOpen, label: "Browse templates library", shortcut: "⌘ + T", category: "Actions" },
  { icon: Sparkles, label: "Launch AI research assistant", shortcut: "⌘ + AI", category: "Intelligence" },
  { icon: Settings, label: "Configure integrations (Figma, Slack)", shortcut: "⌘ + I", category: "Settings" },
  { icon: CreditCard, label: "Manage billing & credits top-up", shortcut: "⌘ + B", category: "Billing" }
];

export default function CommandPaletteDemo() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <section className="py-24 relative overflow-hidden bg-[#050816] border-t border-border/20">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-4">Keyboard First</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-foreground">
              Command search at <br />
              <span className="text-gradient bg-gradient-to-r from-primary via-violet-400 to-accent text-glow">your fingertips</span>
            </h2>
            <p className="text-muted-foreground text-sm mt-4">
              Navigate your research repository in milliseconds. Access our command palette by pressing <kbd className="bg-secondary px-1.5 py-0.5 rounded border border-border/40 text-[10px] font-mono font-bold text-foreground">⌘ K</kbd> anywhere.
            </p>
          </div>
        </ScrollReveal>

        {/* Command Palette Mockup card */}
        <ScrollReveal animation="zoom-up" delay={150}>
          <div className="max-w-xl mx-auto relative">
            <div className="absolute -inset-3 bg-gradient-to-r from-primary/5 to-accent/5 rounded-3xl blur-2xl opacity-75 pointer-events-none" />
            
            <div className="relative rounded-2xl border border-border/40 bg-[#0d1025]/90 backdrop-blur-xl shadow-2xl overflow-hidden p-4 select-none">
              
              {/* Search bar input mockup */}
              <div className="flex items-center gap-3 bg-[#060814] border border-border/30 rounded-xl px-4 py-3 mb-4">
                <Search className="w-4.5 h-4.5 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  placeholder="What would you like to search or launch? (e.g. create test)"
                  disabled
                  className="bg-transparent border-none text-xs focus:outline-none flex-1 text-foreground placeholder-muted-foreground cursor-not-allowed"
                />
                <kbd className="bg-secondary/60 px-1.5 py-0.5 rounded border border-border/40 text-[9px] font-mono font-semibold text-muted-foreground">ESC</kbd>
              </div>

              {/* Command Items lists */}
              <div className="space-y-4">
                <div>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block mb-2 px-2">
                    Quick Commands
                  </span>
                  
                  <div className="space-y-1">
                    {SHORTCUT_ITEMS.map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={idx}
                          onMouseEnter={() => setHoveredIdx(idx)}
                          onMouseLeave={() => setHoveredIdx(null)}
                          className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                            hoveredIdx === idx
                              ? 'bg-primary/10 border-primary/20 text-foreground translate-x-0.5'
                              : 'bg-transparent border-transparent text-muted-foreground'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all ${
                              hoveredIdx === idx ? 'bg-primary border-primary text-primary-foreground' : 'bg-secondary/40 border-border/20 text-muted-foreground'
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-semibold">{item.label}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] opacity-50 font-bold uppercase">{item.category}</span>
                            <kbd className="bg-[#060814] px-2 py-0.8 rounded border border-border/40 text-[9.5px] font-mono font-bold text-foreground">
                              {item.shortcut}
                            </kbd>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer navigation info */}
              <div className="flex items-center gap-3 justify-end pt-3 border-t border-border/20 mt-4 text-[9px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <kbd className="bg-secondary px-1 border border-border/40 rounded text-[8.5px]">↑↓</kbd> to navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="bg-secondary px-1 border border-border/40 rounded text-[8.5px]">⏎</kbd> to select
                </span>
              </div>

            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
