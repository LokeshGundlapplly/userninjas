import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Target, Shield, Users, Zap, BarChart3, MessageSquare, Globe, PlayCircle, BrainCircuit, FileSearch, Layers, Repeat2, SlidersHorizontal, Lock, Webhook, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Background3D from '@/components/Background3D';
import ScrollReveal from '@/components/ScrollReveal';
import { Helmet } from 'react-helmet-async';

const categories = ['All', 'Research Methods', 'AI & Analysis', 'Panel & Recruitment', 'Integrations', 'Security'];

const features = [
  // Research Methods
  { icon: PlayCircle, category: 'Research Methods', title: 'Moderated Sessions', description: 'Run live 1:1 interviews with screen sharing, recording, and real-time note-taking. Schedule with any timezone participant instantly.' },
  { icon: FileSearch, category: 'Research Methods', title: 'Unmoderated Testing', description: 'Deploy self-service tasks to your tester panel. Participants complete tasks on their own devices — you review recordings on demand.' },
  { icon: Layers, category: 'Research Methods', title: 'Survey Builder', description: 'Build branching, conditional surveys with 20+ question types. Skip logic, required fields, and matrix questions included.' },
  { icon: Repeat2, category: 'Research Methods', title: 'Card Sorting & Tree Testing', description: 'Validate your information architecture with open and closed card sorts, reverse card sorts, and full tree testing.' },
  { icon: SlidersHorizontal, category: 'Research Methods', title: 'Prototype Testing', description: 'Embed Figma, InVision, or live URLs directly in studies. Track clicks, paths, and task completion rates with heatmaps.' },
  { icon: MessageSquare, category: 'Research Methods', title: 'Diary Studies', description: 'Capture longitudinal behaviour with scheduled check-ins over days or weeks. Export journey maps automatically.' },
  // AI & Analysis
  { icon: BrainCircuit, category: 'AI & Analysis', title: 'AI Session Summaries', description: 'Every session auto-generates a written summary with key quotes, flow observations, and sentiment scoring — zero manual effort.' },
  { icon: Sparkles, category: 'AI & Analysis', title: 'Theme Clustering', description: 'Our AI groups related observations across multiple sessions into themes, priorities, and opportunity areas in seconds.' },
  { icon: Search, category: 'AI & Analysis', title: 'Sentiment Analysis', description: 'Track positive, negative, and neutral sentiment across transcripts, responses, and tone-of-voice in video sessions.' },
  { icon: BarChart3, category: 'AI & Analysis', title: 'Smart Highlight Reels', description: 'AI identifies the most impactful moments in recordings and compiles highlight clips automatically for stakeholder sharing.' },
  // Panel & Recruitment
  { icon: Users, category: 'Panel & Recruitment', title: '120K+ Tester Panel', description: 'Instant access to a global network of 120,000+ screened testers across 150+ countries, every demographic, and 200+ device types.' },
  { icon: Target, category: 'Panel & Recruitment', title: 'Precision Targeting', description: 'Filter by job title, income, household, device type, technical proficiency, prior product experience, or any custom attribute.' },
  { icon: Globe, category: 'Panel & Recruitment', title: 'Multi-language Support', description: 'Run studies in 40+ languages. Native-speaker testers, localized task instructions, and auto-translated transcripts available.' },
  { icon: CheckCircle2, category: 'Panel & Recruitment', title: 'Quality Guarantee', description: 'Testers are identity-verified, experience-tracked, and rated after each session. Low-quality responses are automatically flagged and replaced.' },
  // Integrations
  { icon: Webhook, category: 'Integrations', title: 'REST API & Webhooks', description: 'Full REST API with extensive documentation. Trigger studies, retrieve results, and sync data to your own tools via webhooks.' },
  { icon: Zap, category: 'Integrations', title: 'Zapier & Make', description: 'Connect User Ninjas to 5,000+ apps without writing code. Trigger studies from CRM events, send insights to Notion, Slack, and more.' },
  // Security
  { icon: Shield, category: 'Security', title: 'SOC 2 Type II', description: 'Certified SOC 2 Type II compliant. Annual penetration tests, full audit logs, and 99.9% uptime SLA with automatic failover.' },
  { icon: Lock, category: 'Security', title: 'SSO + SCIM', description: 'Enterprise SSO via SAML 2.0. Automatic SCIM provisioning and deprovisioning for seamless IT management.' },
];

const stats = [
  { value: '20+', label: 'Research method types' },
  { value: '40+', label: 'Languages supported' },
  { value: '200+', label: 'Device types in panel' },
  { value: '5,000+', label: 'Zapier app connections' },
];

export default function FeaturesPage() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? features
    : features.filter(f => f.category === activeCategory);

  return (
    <>
      <Helmet>
        <title>Features - User Ninjas</title>
        <meta name="description" content="Discover every feature in User Ninjas — from AI-powered analysis and a 120K tester panel to integrations, security, and advanced research methods." />
      </Helmet>

      <Background3D />
      <Navbar />

      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <ScrollReveal animation="fade-up">
            <div className="text-center mb-12 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-5">
                <Sparkles className="w-3.5 h-3.5" /> Platform Features
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                Everything you need for <span className="text-gradient">great research</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                From first-click tests to longitudinal diary studies — all powered by AI analysis and a 120K+ tester panel.
              </p>
            </div>
          </ScrollReveal>

          {/* Stats strip */}
          <ScrollReveal animation="fade-up">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
              {stats.map(s => (
                <div key={s.label} className="text-center p-5 rounded-2xl bg-card border border-border/60">
                  <p className="font-display text-2xl font-bold text-primary mb-1">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* Category filter */}
          <ScrollReveal animation="fade-up">
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/30'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </ScrollReveal>

          {/* Feature grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {filtered.map((feature, index) => (
              <ScrollReveal key={feature.title} animation="fade-up" delay={index * 50}>
                <div className="group p-6 rounded-2xl bg-card border border-border/60 hover:border-primary/30 hover:shadow-lg transition-all h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{feature.category}</span>
                  </div>
                  <h3 className="font-display text-base font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* CTA */}
          <ScrollReveal animation="fade-up">
            <div className="mt-16 rounded-2xl bg-gradient-to-br from-primary/8 to-accent/8 border border-primary/20 p-10 text-center max-w-3xl mx-auto">
              <h3 className="font-display font-bold text-2xl mb-3">See every feature in action</h3>
              <p className="text-muted-foreground mb-7">Start free and explore the full platform. No credit card required.</p>
              <div className="flex items-center justify-center gap-3">
                <Link to="/auth" className="px-7 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors">
                  Start free
                </Link>
                <Link to="/contact" className="flex items-center gap-1.5 px-5 py-3 rounded-xl border border-border text-sm hover:bg-accent/30 transition-colors">
                  Book a demo <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </main>

      <Footer />
    </>
  );
}

