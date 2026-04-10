import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Background3D from '@/components/Background3D';
import ScrollReveal from '@/components/ScrollReveal';
import { Helmet } from 'react-helmet-async';
import { Zap, Star, Package, Wrench, ChevronRight } from 'lucide-react';

const releases = [
  {
    version: '3.4.0',
    date: 'April 8, 2026',
    type: 'major',
    badge: 'Major Release',
    badgeColor: 'bg-primary',
    items: [
      { type: 'new', text: 'Survey Builder 2.0: Conditional branching, skip logic, randomised question order, and A/B question variants' },
      { type: 'new', text: 'AI Auto-Highlights: Automatically clips the 3 most insightful moments from every session recording' },
      { type: 'new', text: 'Tester match scoring now factored into automatic session assignment (opt-in)' },
      { type: 'new', text: 'Bulk summarise: Summarise up to 50 sessions in one click using GPT-4o' },
      { type: 'improved', text: 'Recruiter Dashboard analytics tab: Pie chart (status breakdown), bar chart (tests by category), spend-per-test view' },
      { type: 'improved', text: 'Session replay player: 2× speed mode, chapter markers, comment threads at timestamp' },
      { type: 'fix', text: 'Fixed edge case where screener criteria did not apply to last-minute tester substitutions' },
    ],
  },
  {
    version: '3.3.2',
    date: 'March 25, 2026',
    type: 'patch',
    badge: 'Patch',
    badgeColor: 'bg-secondary text-foreground',
    items: [
      { type: 'fix', text: 'Fixed email notification delivery delays exceeding 5 minutes for session-complete events' },
      { type: 'fix', text: 'Resolved payout rounding error that resulted in $0.01 discrepancy for non-USD conversions' },
      { type: 'fix', text: 'Corrected tester dashboard earnings total when multiple partial approvals occurred in one session' },
      { type: 'improved', text: 'Reduced session recording upload time by 40%% through parallel chunked upload' },
    ],
  },
  {
    version: '3.3.0',
    date: 'March 15, 2026',
    type: 'minor',
    badge: 'Minor Release',
    badgeColor: 'bg-accent',
    items: [
      { type: 'new', text: 'Integrations hub: Native Figma, Notion, Jira, Linear, Slack, and HubSpot integrations now in beta' },
      { type: 'new', text: 'Tester reputation system: 5-star rating scale, response time badge, and "Elite Tester" certification' },
      { type: 'new', text: 'Shareable research report generator: Export branded PDF or shareable link' },
      { type: 'improved', text: 'Screener now supports multi-select, ranking, and open-text question types' },
    ],
  },
  {
    version: '3.2.0',
    date: 'February 28, 2026',
    type: 'minor',
    badge: 'Minor Release',
    badgeColor: 'bg-accent',
    items: [
      { type: 'new', text: 'Tree Testing research method added — create navigation hierarchies and track path accuracy' },
      { type: 'new', text: '5-Second Test method: Timed exposure with automatic memory capture questions' },
      { type: 'new', text: 'Competitive research pack: Run tests referencing competitor products with side-by-side comparison' },
      { type: 'improved', text: 'Recruiter onboarding: interactive walkthrough reduces time-to-first-test by 58%%' },
      { type: 'fix', text: 'Fixed screener validation not enforcing minimum/maximum numeric constraints' },
    ],
  },
  {
    version: '3.1.0',
    date: 'February 10, 2026',
    type: 'minor',
    badge: 'Minor Release',
    badgeColor: 'bg-accent',
    items: [
      { type: 'new', text: 'AI Research Assistant chat: Ask questions about your session data in plain English' },
      { type: 'new', text: 'Admin panel: User management, org-wide analytics, seat assignment, and SSO configuration' },
      { type: 'improved', text: 'Tester earnings dashboard redesigned with monthly/quarterly earnings chart' },
      { type: 'improved', text: 'Video player keyboard shortcuts: Space (play/pause), ← → (skip 5s), F (fullscreen)' },
    ],
  },
  {
    version: '3.0.0',
    date: 'January 20, 2026',
    type: 'major',
    badge: 'Major Release',
    badgeColor: 'bg-primary',
    items: [
      { type: 'new', text: 'Complete platform redesign: new dark/light theme, refreshed design system, faster navigation' },
      { type: 'new', text: 'AI Insights Panel: Full GPT-4o powered session analysis with highlights, quotes, and action items' },
      { type: 'new', text: 'Screen Recording component: In-browser screen capture for testers (no extension required)' },
      { type: 'new', text: 'Multi-workspace support: Create separate workspaces for different products or teams' },
      { type: 'improved', text: 'API v3: RESTful endpoints, webhooks, OAuth 2.0 authentication, full OpenAPI spec' },
    ],
  },
];

const typeConfig = {
  new: { label: 'New', color: 'bg-primary/10 text-primary border-primary/20', icon: Star },
  improved: { label: 'Improved', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: Zap },
  fix: { label: 'Fix', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: Wrench },
};

export default function Changelog() {
  return (
    <>
      <Helmet>
        <title>Changelog - User Ninjas</title>
        <meta name="description" content="See what's new in User Ninjas. Product updates, new features, and improvements." />
      </Helmet>
      <Background3D />
      <Navbar />

      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <ScrollReveal animation="fade-up">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-5">
                <Package className="w-3.5 h-3.5" /> Product
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                What's <span className="text-gradient">New</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Every update, improvement, and fix — documented. We ship fast.
              </p>
            </div>
          </ScrollReveal>

          {/* Latest version highlight */}
          <ScrollReveal animation="fade-up" delay={100}>
            <div className="max-w-3xl mx-auto mb-12 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shrink-0">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display font-bold text-lg">v3.4.0 is live</span>
                  <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">Latest</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Survey Builder 2.0, AI Auto-Highlights, Bulk Summarise — our biggest update this year.</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
            </div>
          </ScrollReveal>

          {/* Releases */}
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-8 bottom-0 w-px bg-border/50" />

              <div className="space-y-10">
                {releases.map((release, index) => (
                  <ScrollReveal key={release.version} animation="fade-up" delay={index * 80}>
                    <div className="relative pl-16">
                      {/* Timeline dot */}
                      <div className={`absolute left-3.5 top-1 w-5 h-5 rounded-full border-2 border-background ${release.type === 'major' ? 'bg-primary' : release.type === 'patch' ? 'bg-secondary' : 'bg-accent'} flex items-center justify-center`}>
                        <div className="w-2 h-2 rounded-full bg-white/80" />
                      </div>

                      <div className="rounded-2xl bg-card border border-border/60 overflow-hidden hover:border-primary/20 transition-colors">
                        {/* Release header */}
                        <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between flex-wrap gap-3">
                          <div className="flex items-center gap-3">
                            <span className="font-display font-bold text-lg">v{release.version}</span>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold text-white ${release.badgeColor}`}>{release.badge}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{release.date}</span>
                        </div>

                        {/* Items */}
                        <div className="p-6">
                          <ul className="space-y-3">
                            {release.items.map((item, i) => {
                              const config = typeConfig[item.type as keyof typeof typeConfig];
                              const Icon = config.icon;
                              return (
                                <li key={i} className="flex items-start gap-3">
                                  <span className={`mt-0.5 shrink-0 px-2 py-0.5 rounded border text-xs font-semibold flex items-center gap-1 ${config.color}`}>
                                    <Icon className="w-2.5 h-2.5" />{config.label}
                                  </span>
                                  <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>

          {/* Subscribe to updates */}
          <ScrollReveal animation="fade-up">
            <div className="max-w-3xl mx-auto mt-16 rounded-2xl bg-card border border-border/60 p-8 flex flex-col sm:flex-row items-center gap-6 justify-between">
              <div>
                <h3 className="font-display font-bold text-lg mb-1">Stay up to date</h3>
                <p className="text-sm text-muted-foreground">Get notified when we ship new features and improvements.</p>
              </div>
              <form className="flex gap-2 shrink-0 w-full sm:w-auto" onSubmit={e => e.preventDefault()}>
                <input type="email" placeholder="you@example.com" className="flex-1 sm:w-52 h-10 px-3 rounded-xl bg-background border border-border/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <button type="submit" className="px-4 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shrink-0">Notify me</button>
              </form>
            </div>
          </ScrollReveal>
        </div>
      </main>

      <Footer />
    </>
  );
}
