import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Background3D from '@/components/Background3D';
import ScrollReveal from '@/components/ScrollReveal';
import { Helmet } from 'react-helmet-async';
import { Users, Globe, Zap, Shield, Heart, Lightbulb, Target, Award, ArrowRight } from 'lucide-react';

const stats = [
  { value: '120K+', label: 'Verified Testers', sublabel: 'Across 150+ countries' },
  { value: '$12M', label: 'Raised', sublabel: 'Series A · 2025' },
  { value: '4,000+', label: 'Product Teams', sublabel: 'From startups to Fortune 500' },
  { value: '99.9%', label: 'Uptime SLA', sublabel: 'SOC 2 Type II certified' },
];

const milestones = [
  { year: '2024 Q1', title: 'Founded', body: 'User Ninjas incorporated in Hyderabad. First engineering hires, MVP built in 90 days.' },
  { year: '2024 Q3', title: 'Public launch & Product Hunt #1', body: 'Launched publicly on Product Hunt. #1 Product of the Day. First 500 teams onboard within 30 days.' },
  { year: '2024 Q4', title: 'Seed funding — $2.4M', body: 'Closed seed round led by Accel. Used to scale the tester panel to 30,000 verified participants.' },
  { year: '2025 Q2', title: 'AI Analysis Engine v1', body: 'Launched proprietary AI — auto-summaries, sentiment scoring, and theme clustering on every session.' },
  { year: '2025 Q4', title: 'Series A — $12M', body: 'Led by Sequoia India. Expanded to 5 continents, 14-country team, 120K+ testers on platform.' },
  { year: '2026 Q1', title: 'Enterprise launch & G2 Leader', body: 'Rolled out enterprise tier with SSO, audit logs, and custom contracts. Named G2 Leader in User Research.' },
];

const team = [
  { name: 'Arjun Reddy', role: 'CEO & Co-founder', bio: 'Former Head of Product at Razorpay. Stanford MBA. Obsessed with making research as fast as shipping code.', gradient: 'from-violet-500 to-purple-600', initials: 'AR' },
  { name: 'Priya Mehta', role: 'CTO & Co-founder', bio: 'Ex-Principal Engineer at Swiggy. Built data infra for 50M+ users. Leads AI, infra, and platform engineering.', gradient: 'from-blue-500 to-cyan-500', initials: 'PM' },
  { name: 'Lucas Ferreira', role: 'Head of Research Science', bio: 'PhD in Cognitive Psychology (MIT). Designed our AI analysis models and tester quality scoring system.', gradient: 'from-green-500 to-emerald-500', initials: 'LF' },
  { name: 'Neha Sharma', role: 'VP of Product', bio: 'Previously Product Lead at Figma. Drives the roadmap strategy, design system, and feature prioritisation.', gradient: 'from-orange-400 to-red-500', initials: 'NS' },
  { name: 'Tom Kovalski', role: 'VP of Engineering', bio: 'Scaled backend systems at Deliveroo from 0 to 200M orders/year. Leads our infra, security, and reliability.', gradient: 'from-teal-500 to-cyan-600', initials: 'TK' },
  { name: 'Amara Osei', role: 'Head of Community & Growth', bio: 'Built UX research communities at UserZoom and IDEO CoLab. Leads our tester panel and partner programmes.', gradient: 'from-pink-500 to-rose-500', initials: 'AO' },
];

const values = [
  { icon: Zap, title: 'Speed over process', description: 'Research should happen at the speed of product development. We remove every second of unnecessary friction.' },
  { icon: Users, title: 'Diversity by design', description: 'Our panel actively reflects the real world — every demographic, device, and region intentionally represented.' },
  { icon: Shield, title: 'Privacy first', description: 'Enterprise-grade security, GDPR/CCPA compliance, and transparent data practices — non-negotiable at every tier.' },
  { icon: Lightbulb, title: 'Insight over data', description: 'Raw data is noise. We obsess over surfacing the meaningful insight buried in every session and response.' },
  { icon: Target, title: 'Customer obsession', description: 'We dogfood our own product for every major feature decision. Our roadmap is our customers speaking.' },
  { icon: Heart, title: 'Open & honest', description: 'No enterprise black boxes. Transparent pricing, honest comparison pages, and public changelogs.' },
];

const investors = [
  { name: 'Sequoia India', stage: 'Series A lead', gradient: 'from-orange-400 to-red-400', initials: 'SEQ' },
  { name: 'Accel Partners', stage: 'Seed lead', gradient: 'from-blue-500 to-indigo-500', initials: 'ACC' },
  { name: 'Blume Ventures', stage: 'Seed participant', gradient: 'from-teal-500 to-emerald-500', initials: 'BLM' },
  { name: 'Beenext', stage: 'Seed participant', gradient: 'from-purple-500 to-violet-500', initials: 'BNX' },
];

export default function About() {
  return (
    <>
      <Helmet>
        <title>About - User Ninjas</title>
        <meta name="description" content="Learn about User Ninjas — the team, story, milestones, and mission behind the UX research platform trusted by 4,000+ product teams." />
      </Helmet>

      <Background3D />
      <Navbar />

      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <ScrollReveal animation="fade-up">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-5">
                <Globe className="w-3.5 h-3.5" /> Our Story
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                Making user research <span className="text-gradient">fast, affordable</span>, and genuinely useful
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We started User Ninjas because every product team deserves real user insights — not just the ones with enterprise budgets and six-week timelines.
              </p>
            </div>
          </ScrollReveal>

          <div className="max-w-5xl mx-auto space-y-20">
            {/* Stats */}
            <ScrollReveal animation="fade-up">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center p-6 rounded-2xl bg-card border border-border/60">
                    <p className="font-display text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</p>
                    <p className="text-sm font-semibold mb-0.5">{stat.label}</p>
                    <p className="text-xs text-muted-foreground">{stat.sublabel}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            {/* Story */}
            <ScrollReveal animation="fade-up">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card rounded-2xl border border-border/60 p-8">
                  <h2 className="font-display text-2xl font-bold mb-4">Origin story</h2>
                  <div className="text-muted-foreground space-y-3 leading-relaxed text-sm">
                    <p>Arjun spent years watching product teams skip user research — not because they didn't value it, but because it was too slow and too expensive. A single UserTesting study could cost $3,000 and take five days.</p>
                    <p>He joined forces with Priya to rebuild the research stack from scratch: a global tester network with instant access, AI that replaces 90% of manual analysis, and pricing that startups can afford.</p>
                    <p>From the first line of code in early 2024 to 4,000+ teams today, the mission has stayed the same — make every product team as research-powered as the best in the world.</p>
                  </div>
                </div>
                <div className="bg-card rounded-2xl border border-border/60 p-8">
                  <h2 className="font-display text-2xl font-bold mb-4">What sets us apart</h2>
                  <ul className="space-y-3">
                    {[
                      'AI-first — analysis happens automatically, not after',
                      '120,000+ testers with real demographic diversity',
                      'Results typically in under 2 hours, not 2 days',
                      'Flat monthly pricing — no per-credit surprises',
                      'Built by researchers and engineers, not just engineers',
                      'Open roadmap + public changelog — you shape the product',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm">
                        <Award className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </ScrollReveal>

            {/* Timeline */}
            <ScrollReveal animation="fade-up">
              <div>
                <h2 className="font-display text-2xl font-bold mb-8 text-center">Milestones</h2>
                <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
                  <div className="space-y-6">
                    {milestones.map((m, i) => (
                      <div key={i} className="flex gap-5 relative pl-4">
                        <div className="w-5 h-5 rounded-full bg-primary border-2 border-background ring-2 ring-primary/20 shrink-0 mt-1 relative z-10" />
                        <div className="bg-card rounded-xl border border-border/60 p-4 flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{m.year}</span>
                            <h3 className="font-semibold text-sm">{m.title}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground">{m.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Team */}
            <ScrollReveal animation="fade-up">
              <div>
                <h2 className="font-display text-2xl font-bold mb-2 text-center">Meet the team</h2>
                <p className="text-center text-muted-foreground text-sm mb-8">42 people across 14 countries, building the future of user research.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {team.map((member) => (
                    <div key={member.name} className="rounded-2xl bg-card border border-border/60 p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${member.gradient} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                          {member.initials}
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">{member.name}</h3>
                          <p className="text-xs text-primary">{member.role}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{member.bio}</p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Values */}
            <ScrollReveal animation="fade-up">
              <div>
                <h2 className="font-display text-2xl font-bold mb-2 text-center">Our values</h2>
                <p className="text-center text-muted-foreground text-sm mb-8">Principles we hire, promote, and make product decisions by.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {values.map((v) => (
                    <div key={v.title} className="p-6 rounded-2xl bg-card border border-border/60">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                        <v.icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-display text-sm font-bold mb-1.5">{v.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{v.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Investors */}
            <ScrollReveal animation="fade-up">
              <div>
                <h2 className="font-display text-2xl font-bold mb-6 text-center">Backed by world-class investors</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {investors.map((inv) => (
                    <div key={inv.name} className="rounded-2xl bg-card border border-border/60 p-5 text-center">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${inv.gradient} flex items-center justify-center text-white font-bold text-xs mx-auto mb-3`}>
                        {inv.initials}
                      </div>
                      <p className="font-semibold text-sm">{inv.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{inv.stage}</p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Join CTA */}
            <ScrollReveal animation="fade-up">
              <div className="rounded-2xl bg-gradient-to-br from-primary/8 to-accent/8 border border-primary/20 p-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="font-display font-bold text-xl mb-2">Want to join the team?</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">We're hiring across engineering, research, design, and growth. Fully remote-friendly.</p>
                </div>
                <Link to="/careers" className="flex items-center gap-2 px-7 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors shrink-0">
                  View open roles <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
