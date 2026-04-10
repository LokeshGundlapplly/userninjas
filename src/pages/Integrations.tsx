import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Background3D from '@/components/Background3D';
import ScrollReveal from '@/components/ScrollReveal';
import { Helmet } from 'react-helmet-async';
import { Puzzle, CheckCircle2, ArrowRight, Zap } from 'lucide-react';

const categories = ['All', 'Design', 'Project Management', 'CRM', 'Analytics', 'Communication', 'Developer'];

interface Integration {
  name: string;
  category: string;
  description: string;
  status: 'available' | 'beta' | 'coming-soon';
  gradient: string;
  initials: string;
  features: string[];
}

const integrations: Integration[] = [
  {
    name: 'Figma',
    category: 'Design',
    description: 'Import Figma prototypes directly into tests — no screenshots needed. Testers interact with real Figma flows.',
    status: 'available',
    gradient: 'from-pink-500 to-purple-600',
    initials: 'Fg',
    features: ['Import Figma frames', 'Auto-detect hotspots', 'Prototype task completion'],
  },
  {
    name: 'Notion',
    category: 'Project Management',
    description: 'Push research summaries, highlights, and action items directly to a Notion workspace database.',
    status: 'available',
    gradient: 'from-gray-700 to-gray-900',
    initials: 'No',
    features: ['Auto-create research pages', 'Push insights to databases', 'Attach session clips'],
  },
  {
    name: 'Jira',
    category: 'Project Management',
    description: 'Create Jira issues from research insights with one click. Link sessions to existing epics and sprints.',
    status: 'available',
    gradient: 'from-blue-500 to-blue-700',
    initials: 'Ji',
    features: ['Create issues from insights', 'Link to sprints', 'Custom field mapping'],
  },
  {
    name: 'Linear',
    category: 'Project Management',
    description: 'Turn research findings into Linear issues. Attach recordings and AI summaries as attachments.',
    status: 'beta',
    gradient: 'from-violet-500 to-indigo-600',
    initials: 'Ln',
    features: ['Create Linear issues', 'Attach recordings', 'Link to project cycles'],
  },
  {
    name: 'Slack',
    category: 'Communication',
    description: 'Get instant Slack notifications when sessions complete, with AI summaries delivered to your channel.',
    status: 'available',
    gradient: 'from-green-400 to-teal-500',
    initials: 'Sl',
    features: ['Session-complete alerts', 'Daily digest summaries', 'Custom channel routing'],
  },
  {
    name: 'HubSpot',
    category: 'CRM',
    description: 'Match testers against HubSpot contacts. Sync research insights back to customer records.',
    status: 'beta',
    gradient: 'from-orange-400 to-red-500',
    initials: 'Hs',
    features: ['Contact matching', 'Sync insights to CRM', 'Trigger workflows'],
  },
  {
    name: 'Segment',
    category: 'Analytics',
    description: 'Enrich Segment events with research attributes. Build audiences based on tester profiles.',
    status: 'beta',
    gradient: 'from-emerald-500 to-green-600',
    initials: 'Sg',
    features: ['Event enrichment', 'Audience builder', 'Cohort export'],
  },
  {
    name: 'Google Analytics',
    category: 'Analytics',
    description: 'Correlate usability session data with GA4 analytics events to bridge qual and quant research.',
    status: 'coming-soon',
    gradient: 'from-yellow-400 to-orange-500',
    initials: 'GA',
    features: ['GA4 event correlation', 'Segment overlay', 'Conversion context'],
  },
  {
    name: 'Zapier',
    category: 'Developer',
    description: 'Connect User Ninjas to 5,000+ apps via Zapier. Build custom workflows without writing a line of code.',
    status: 'available',
    gradient: 'from-orange-500 to-amber-500',
    initials: 'Zp',
    features: ['5,000+ app connections', 'Trigger on session events', 'No-code workflows'],
  },
  {
    name: 'Webhooks',
    category: 'Developer',
    description: 'Receive real-time HTTP POST events for every platform event. Build custom integrations at scale.',
    status: 'available',
    gradient: 'from-slate-500 to-slate-700',
    initials: '{}',
    features: ['Real-time payloads', 'Custom headers & auth', 'Retry with backoff'],
  },
  {
    name: 'REST API',
    category: 'Developer',
    description: 'Full-featured REST API with OAuth 2.0. Create tests, recruit testers, and retrieve insights programmatically.',
    status: 'available',
    gradient: 'from-cyan-500 to-blue-600',
    initials: 'API',
    features: ['Full CRUD operations', 'OAuth 2.0', 'OpenAPI docs'],
  },
  {
    name: 'Intercom',
    category: 'CRM',
    description: 'Trigger in-app research invitations to specific Intercom user segments based on behaviour.',
    status: 'coming-soon',
    gradient: 'from-blue-400 to-blue-600',
    initials: 'In',
    features: ['Targeted invitations', 'User property sync', 'Session history in Intercom'],
  },
];

const statusLabels = {
  available: { label: 'Available', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  beta: { label: 'Beta', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  'coming-soon': { label: 'Coming Soon', color: 'bg-secondary text-muted-foreground border-border/60' },
};

export default function Integrations() {
  const [active, setActive] = useState('All');

  const filtered = active === 'All' ? integrations : integrations.filter(i => i.category === active);

  return (
    <>
      <Helmet>
        <title>Integrations - User Ninjas</title>
        <meta name="description" content="Connect User Ninjas to your existing tools: Figma, Notion, Jira, Slack, HubSpot and 50+ more." />
      </Helmet>
      <Background3D />
      <Navbar />

      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <ScrollReveal animation="fade-up">
            <div className="text-center mb-12 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-5">
                <Puzzle className="w-3.5 h-3.5" /> Integrations
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                Plug into your <span className="text-gradient">workflow</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Connect User Ninjas to the tools your team already uses. Insights flow where they're needed.
              </p>
            </div>
          </ScrollReveal>

          {/* Stats */}
          <ScrollReveal animation="fade-up" delay={100}>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {[
                { value: '50+', label: 'Integrations' },
                { value: '5,000+', label: 'Apps via Zapier' },
                { value: 'REST API', label: 'Full-featured' },
                { value: 'Webhooks', label: 'Real-time events' },
              ].map(s => (
                <div key={s.label} className="px-5 py-3 rounded-xl bg-card border border-border/60 text-center">
                  <p className="font-display font-bold text-base">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* Category filter */}
          <ScrollReveal animation="fade-up" delay={120}>
            <div className="flex flex-wrap gap-2 justify-center mb-10">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActive(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    active === cat
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </ScrollReveal>

          {/* Integration grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {filtered.map((integration, i) => {
              const status = statusLabels[integration.status];
              return (
                <ScrollReveal key={integration.name} animation="fade-up" delay={i * 50}>
                  <div className="group rounded-2xl bg-card border border-border/60 hover:border-primary/30 hover:shadow-lg transition-all p-6 h-full flex flex-col">
                    {/* Logo + status */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${integration.gradient} flex items-center justify-center text-white font-bold text-sm`}>
                        {integration.initials}
                      </div>
                      <span className={`px-2.5 py-1 rounded-full border text-xs font-semibold ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-base mb-2">{integration.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{integration.description}</p>
                    {/* Features */}
                    <ul className="space-y-1.5 mb-4">
                      {integration.features.map(f => (
                        <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    {integration.status !== 'coming-soon' ? (
                      <button className="flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:gap-2.5 transition-all">
                        Connect <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                        Get notified when available
                      </button>
                    )}
                  </div>
                </ScrollReveal>
              );
            })}
          </div>

          {/* Custom integration CTA */}
          <ScrollReveal animation="fade-up">
            <div className="max-w-5xl mx-auto mt-14 rounded-2xl bg-gradient-to-br from-primary/8 to-accent/8 border border-primary/20 p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">Enterprise</span>
                </div>
                <h3 className="font-display font-bold text-xl mb-2">Need a custom integration?</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Our team can build bespoke integrations for enterprise customers. We support SAML SSO, custom webhooks, and private API endpoints.
                </p>
              </div>
              <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shrink-0">
                Talk to our team <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </ScrollReveal>
        </div>
      </main>

      <Footer />
    </>
  );
}
