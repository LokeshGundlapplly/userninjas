import React from 'react';
import { ShieldAlert, Users, Key, Search, FileLock, Users2, Database } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const ENTERPRISE_CAPABILITIES = [
  {
    icon: Users2,
    title: 'Shared Team Workspaces',
    description: 'Organize research by departments or product lines. Share insights, user quotes, and test feedback across teams seamlessly.',
    badge: 'Collaboration',
    visual: (
      <div className="flex -space-x-2 mt-4 overflow-hidden">
        {['A', 'M', 'J', 'S'].map((letter, i) => (
          <div 
            key={i} 
            className={`w-7 h-7 rounded-full border-2 border-[#0d1025] flex items-center justify-center text-[10px] font-bold text-white shadow-md ${
              i === 0 ? 'bg-primary' : i === 1 ? 'bg-accent' : i === 2 ? 'bg-violet-600' : 'bg-emerald-500'
            }`}
          >
            {letter}
          </div>
        ))}
        <div className="w-7 h-7 rounded-full border-2 border-[#0d1025] bg-secondary flex items-center justify-center text-[9px] font-bold text-muted-foreground shadow-md">
          +12
        </div>
      </div>
    )
  },
  {
    icon: Key,
    title: 'SSO & SCIM User Provisioning',
    description: 'Secure access controls. Automatically provision and deprovision researcher seats via Okta, Azure AD, or custom SAML integrations.',
    badge: 'Access',
    visual: (
      <div className="flex items-center gap-1.5 mt-4 text-[10px] text-muted-foreground font-mono bg-[#060814] p-2 rounded-lg border border-border/30 w-fit">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>SAML 2.0 Auth: Verified</span>
      </div>
    )
  },
  {
    icon: FileLock,
    title: 'Granular Access Controls',
    description: 'Ensure research governance. Set viewing, editing, or billing roles to keep customer data isolated and protected.',
    badge: 'Permissions',
    visual: (
      <div className="space-y-1.5 mt-4 w-full">
        <div className="flex justify-between items-center text-[9px] bg-secondary/35 border border-border/10 p-1.5 rounded-md">
          <span className="font-semibold text-foreground">John (Admin)</span>
          <span className="text-primary text-[8px] font-bold">FULL ACCESS</span>
        </div>
        <div className="flex justify-between items-center text-[9px] bg-secondary/35 border border-border/10 p-1.5 rounded-md">
          <span className="font-semibold text-foreground">Lisa (Viewer)</span>
          <span className="text-muted-foreground text-[8px] font-bold">READ ONLY</span>
        </div>
      </div>
    )
  },
  {
    icon: Database,
    title: 'Centralized Research Repository',
    description: 'Store every user session, transcript, and survey metric in a globally searchable data hub with automated tagging.',
    badge: 'Governance',
    visual: (
      <div className="relative mt-4 flex items-center bg-[#060814] border border-border/40 rounded-lg px-2.5 py-1 text-[9px] text-muted-foreground w-full">
        <Search className="w-3 h-3 text-muted-foreground shrink-0 mr-1.5" />
        <span>Search checkout recordings...</span>
      </div>
    )
  }
];

export default function EnterpriseFeatures() {
  return (
    <section className="py-24 relative overflow-hidden bg-[#050816] border-t border-border/20">
      {/* Light highlights */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-4">Enterprise Architecture</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-foreground">
              Built for teams. <br />
              <span className="text-gradient bg-gradient-to-r from-primary to-accent text-glow">Trusted by enterprises.</span>
            </h2>
            <p className="text-muted-foreground text-sm mt-4">
              Scale research across departments with enterprise-grade provisioning, advanced team workspaces, and strict security guardrails.
            </p>
          </div>
        </ScrollReveal>

        {/* 2x2 Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {ENTERPRISE_CAPABILITIES.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <ScrollReveal key={cap.title} animation="fade-up" delay={i * 80}>
                <div className="group h-full rounded-2xl border border-border/45 bg-[#0d1025]/50 backdrop-blur-md p-6 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col justify-between spotlight-card">
                  <div>
                    {/* Badge */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-xl bg-secondary/50 border border-border/20 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <Badge variant="outline" className="text-[9px] text-muted-foreground border-border/50 uppercase font-bold tracking-wider">
                        {cap.badge}
                      </Badge>
                    </div>

                    <h3 className="font-display font-bold text-base mb-2 group-hover:text-primary transition-colors text-foreground">
                      {cap.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {cap.description}
                    </p>
                  </div>

                  {/* Feature Visual Preview block */}
                  <div className="pt-2">
                    {cap.visual}
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
