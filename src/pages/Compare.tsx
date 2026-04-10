import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Background3D from '@/components/Background3D';
import ScrollReveal from '@/components/ScrollReveal';
import { Check, ArrowRight, Zap } from 'lucide-react';

const competitors = [
  {
    name: 'Maze',
    slug: 'vs-maze',
    description: 'Great for prototype click-tests, but limited tester panel, no live sessions, and steep per-study pricing.',
    wins: ['120K+ tester panel vs Maze\'s limited network', 'Live video sessions included', 'AI analysis on every session', '70% lower cost per study'],
    category: 'Prototype Testing Tool',
  },
  {
    name: 'UserTesting',
    slug: 'vs-usertesting',
    description: 'The enterprise incumbent. Powerful but costs $30K+/year, has slow turnaround, and panel quality concerns.',
    wins: ['Same panel quality at 90% lower cost', 'Results in hours, not days', 'Modern AI-first approach', 'No enterprise lock-in'],
    category: 'Enterprise Research Platform',
  },
  {
    name: 'Playbook UX',
    slug: 'vs-playbook',
    description: 'Quick guerrilla tests only. Lacks moderated sessions, deep recruitment, and AI analysis depth.',
    wins: ['Moderated + unmoderated in one platform', 'Managed tester recruitment', 'Richer AI insight reports', 'Better question types & logic'],
    category: 'Lightweight Testing Tool',
  },
  {
    name: 'UXtweak',
    slug: 'vs-uxtweak',
    description: 'Strong for card sorting and tree testing, but limited on qualitative research and AI-powered analysis.',
    wins: ['Full qualitative research suite', 'Larger & more diverse panel', 'Advanced AI session summaries', 'Simpler pricing model'],
    category: 'UX Research Suite',
  },
  {
    name: 'Lookback',
    slug: 'vs-lookback',
    description: 'Great moderated session tool, but no tester recruitment, limited analysis tools, and no AI summaries.',
    wins: ['Built-in tester recruitment', 'Automated AI transcription & summaries', 'Unmoderated tests included', '3x cheaper for similar usage'],
    category: 'Moderated Session Tool',
  },
];

const globalWins = [
  { label: 'Tester panel', us: '120,000+ verified testers', them: 'Varies (0–15K)' },
  { label: 'Starting price', us: 'Free · $49/mo paid', them: '$300–$2,500+/mo' },
  { label: 'AI analysis', us: 'Built-in on every session', them: 'Limited or none' },
  { label: 'Session recording', us: 'HD video + transcript', them: 'Tool-dependent' },
  { label: 'Time to first insight', us: '< 2 hours', them: '1–5 days' },
  { label: 'Contract required', us: 'No — month-to-month', them: 'Often annual' },
];

export default function Compare() {
  return (
    <>
      <Helmet>
        <title>User Ninjas vs Competitors — UX Research Platform Comparisons</title>
        <meta name="description" content="See how User Ninjas stacks up against Maze, UserTesting, Playbook, UXtweak, and Lookback. Feature tables, pricing, and honest comparisons." />
      </Helmet>
      <Background3D />
      <Navbar />

      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <ScrollReveal animation="fade-up">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-5">
                <Zap className="w-3.5 h-3.5" /> Comparisons
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                How does <span className="text-gradient">User Ninjas</span> compare?
              </h1>
              <p className="text-muted-foreground text-lg">
                Honest, detailed comparisons against the most popular UX research platforms on the market.
              </p>
            </div>
          </ScrollReveal>

          <div className="max-w-5xl mx-auto space-y-14">
            {/* Global comparison strip */}
            <ScrollReveal animation="fade-up">
              <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
                <div className="grid grid-cols-[1fr_200px_200px] bg-muted/40 border-b border-border/60 px-6 py-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Category</span>
                  <span className="text-xs font-semibold text-primary text-center uppercase tracking-widest">User Ninjas</span>
                  <span className="text-xs font-semibold text-muted-foreground text-center uppercase tracking-widest">Others</span>
                </div>
                {globalWins.map((row, i) => (
                  <div key={row.label} className={`grid grid-cols-[1fr_200px_200px] px-6 py-4 items-center ${i < globalWins.length - 1 ? 'border-b border-border/30' : ''}`}>
                    <span className="text-sm font-medium">{row.label}</span>
                    <div className="flex items-center justify-center gap-1">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium text-center">{row.us}</span>
                    </div>
                    <span className="text-xs text-muted-foreground text-center">{row.them}</span>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            {/* Competitor cards */}
            <ScrollReveal animation="fade-up">
              <h2 className="font-display text-2xl font-bold mb-6 text-center">Detailed comparisons</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {competitors.map(comp => (
                  <Link
                    key={comp.slug}
                    to={`/compare/${comp.slug}`}
                    className="group rounded-2xl bg-card border border-border/60 hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5 transition-all p-5 flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-xs text-muted-foreground font-medium">{comp.category}</span>
                        <h3 className="font-display font-bold text-lg">vs {comp.name}</h3>
                      </div>
                      <ArrowRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 flex-1">{comp.description}</p>
                    <ul className="space-y-1.5">
                      {comp.wins.map(w => (
                        <li key={w} className="flex items-start gap-2 text-xs">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{w}</span>
                        </li>
                      ))}
                    </ul>
                    <span className="mt-4 text-xs font-semibold text-primary group-hover:underline">View full comparison →</span>
                  </Link>
                ))}
              </div>
            </ScrollReveal>

            {/* CTA */}
            <ScrollReveal animation="fade-up">
              <div className="rounded-2xl bg-gradient-to-br from-primary/8 to-accent/8 border border-primary/20 p-10 text-center">
                <h3 className="font-display font-bold text-2xl mb-3">See it for yourself</h3>
                <p className="text-muted-foreground mb-7">Try User Ninjas free — no credit card required. Cancel anytime.</p>
                <div className="flex items-center justify-center gap-3">
                  <Link to="/auth" className="px-7 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors">
                    Start for free
                  </Link>
                  <Link to="/contact" className="px-5 py-3 rounded-xl border border-border text-sm hover:bg-accent/30 transition-colors">
                    Request a demo
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
