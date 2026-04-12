import { Video, Sparkles, Target, Zap, Shield, BarChart3, Clock, Globe, Users2, Share2 } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const features = [
  {
    icon: Video,
    title: 'HD Session Recordings',
    description: 'Screen, voice, and webcam recordings of real users navigating your product. See exactly where they hesitate, click, and struggle — with precise timestamps.',
    color: 'bg-primary/10 text-primary',
    border: 'hover:border-primary/30',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Analysis',
    description: 'Auto transcription, pain point detection, sentiment scoring, and smart summaries — all generated within minutes of sessions completing. No manual review.',
    color: 'bg-accent/10 text-accent',
    border: 'hover:border-accent/30',
  },
  {
    icon: Target,
    title: 'Smart Recruitment',
    description: 'Match testers by 50+ demographic filters, device type, and custom screener questions. AI-powered targeting reaches the exact personas you need.',
    color: 'bg-[hsl(var(--gold))]/10 text-[hsl(var(--gold))]',
    border: 'hover:border-[hsl(var(--gold))]/30',
  },
  {
    icon: Zap,
    title: 'Results in Hours',
    description: 'Launch a study in minutes and receive completed sessions by morning. Turnaround time 3–5× faster than traditional research agencies.',
    color: 'bg-primary/10 text-primary',
    border: 'hover:border-primary/30',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'SOC 2 Type II compliant, GDPR-ready, SSO/SAML integration, and granular role-based access controls for security-conscious enterprise teams.',
    color: 'bg-accent/10 text-accent',
    border: 'hover:border-accent/30',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Task metrics, click heatmaps, funnel drop-off analysis, exportable reports, and shareable team workspaces — a complete research command center.',
    color: 'bg-[hsl(var(--gold))]/10 text-[hsl(var(--gold))]',
    border: 'hover:border-[hsl(var(--gold))]/30',
  },
  {
    icon: Users2,
    title: 'Collaborative Workspace',
    description: 'Invite your entire team, add video clips with timestamped notes, tag themes, and co-analyze sessions together — wherever your team works.',
    color: 'bg-primary/10 text-primary',
    border: 'hover:border-primary/30',
  },
  {
    icon: Globe,
    title: 'Global Tester Panel',
    description: 'Access testers across 150+ countries in 50+ languages. Localise your research or run global studies from a single platform.',
    color: 'bg-accent/10 text-accent',
    border: 'hover:border-accent/30',
  },
  {
    icon: Share2,
    title: 'Integrations & API',
    description: 'Connect with Slack, Jira, Notion, Figma, and 50+ tools via Zapier. Full REST API for custom enterprise workflows.',
    color: 'bg-[hsl(var(--gold))]/10 text-[hsl(var(--gold))]',
    border: 'hover:border-[hsl(var(--gold))]/30',
  },
];

export default function Features() {
  return (
    <section className="py-28 section-soft-divider">
      <div className="container mx-auto px-4">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-4">Platform Features</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-5">
              Everything you need to{' '}
              <span className="text-gradient">ship with confidence</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              A complete UX research toolkit trusted by 500+ product teams — from solo designers to Fortune 500 enterprise research teams.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <ScrollReveal key={feature.title} animation="fade-up" delay={index * 70}>
              <div className="tilt-card h-full">
                <div className={`tilt-card-inner group p-6 rounded-2xl bg-card border border-border/50 ${feature.border} hover:shadow-2xl transition-all duration-300 h-full glow-card lift-glow spotlight-card`}>
                  <div className={`w-12 h-12 rounded-2xl ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 icon-glow transition-all duration-300`}>
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display text-base font-bold mb-2.5">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Bottom stat strip */}
        <ScrollReveal animation="fade-up" delay={500}>
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 p-8 rounded-2xl bg-card/60 border border-border/40 max-w-4xl mx-auto backdrop-blur-sm shadow-sm">
            {[
              { value: '120K+', label: 'Verified Testers' },
              { value: '50+', label: 'Targeting Filters' },
              { value: '99.8%', label: 'Platform Uptime' },
              { value: '<24h', label: 'Avg. Turnaround' },
            ].map((s) => (
              <div key={s.label} className="text-center group">
                <p className="font-display text-2xl font-bold text-gradient group-hover:text-glow transition-all">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
