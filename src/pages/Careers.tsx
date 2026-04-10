import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Background3D from '@/components/Background3D';
import ScrollReveal from '@/components/ScrollReveal';
import { Helmet } from 'react-helmet-async';
import { Briefcase, MapPin, Clock, ArrowRight, Heart, Zap, Users, Globe, Shield, Star, ChevronDown } from 'lucide-react';

const departments = ['All', 'Engineering', 'Design', 'Research', 'Marketing', 'Sales', 'Operations'];

const openings = [
  {
    id: 1,
    title: 'Senior Full-Stack Engineer',
    department: 'Engineering',
    location: 'Remote (Global)',
    type: 'Full-time',
    level: 'Senior',
    description: 'Build and scale the core platform powering 4,000+ research teams. Own backend services, APIs, and real-time infrastructure.',
    skills: ['TypeScript', 'React', 'Supabase', 'Node.js', 'PostgreSQL'],
  },
  {
    id: 2,
    title: 'AI Research Engineer',
    department: 'Engineering',
    location: 'Remote (Global)',
    type: 'Full-time',
    level: 'Mid-Senior',
    description: 'Work on LLM pipelines, sentiment analysis models, and AI-powered session summarisation at scale.',
    skills: ['Python', 'LangChain', 'OpenAI API', 'Fine-tuning', 'NLP'],
  },
  {
    id: 3,
    title: 'Product Designer',
    department: 'Design',
    location: 'Remote (Global)',
    type: 'Full-time',
    level: 'Mid',
    description: 'Design beautiful, intuitive experiences for researchers and testers across web and mobile.',
    skills: ['Figma', 'Design Systems', 'Prototyping', 'User Research', 'Usability'],
  },
  {
    id: 4,
    title: 'UX Research Lead',
    department: 'Research',
    location: 'Remote (US/EU)',
    type: 'Full-time',
    level: 'Senior',
    description: 'Lead our internal research practice and help customers get the most out of User Ninjas. Translate research into product strategy.',
    skills: ['Mixed Methods', 'Research Strategy', 'Stakeholder Management', 'Usability Testing'],
  },
  {
    id: 5,
    title: 'Growth Marketing Manager',
    department: 'Marketing',
    location: 'Remote (US)',
    type: 'Full-time',
    level: 'Mid',
    description: 'Drive acquisition across content, paid, and product-led channels. Own the funnel from first visit to activated customer.',
    skills: ['Performance Marketing', 'SEO/Content', 'Analytics', 'A/B Testing', 'PLG'],
  },
  {
    id: 6,
    title: 'Enterprise Account Executive',
    department: 'Sales',
    location: 'Remote (US)',
    type: 'Full-time',
    level: 'Senior',
    description: 'Close 6-figure enterprise deals with Fortune 500 product and research teams. Full-cycle with strong SDR support.',
    skills: ['SaaS Sales', 'Enterprise', 'MEDDIC', 'Salesforce', 'Research/Design Buyers'],
  },
  {
    id: 7,
    title: 'Customer Success Manager',
    department: 'Operations',
    location: 'Remote (EU/Asia)',
    type: 'Full-time',
    level: 'Mid',
    description: 'Onboard and grow enterprise accounts. Drive adoption, reduce churn, and act as a trusted research advisor.',
    skills: ['Customer Success', 'SaaS', 'Onboarding', 'UX Familiarity', 'Data Analysis'],
  },
  {
    id: 8,
    title: 'Panel Operations Specialist',
    department: 'Operations',
    location: 'Remote (Global)',
    type: 'Full-time',
    level: 'Junior-Mid',
    description: 'Manage tester quality, handle escalations, and grow our panel across target markets.',
    skills: ['Operations', 'Customer Support', 'Data Literacy', 'Communication'],
  },
];

const perks = [
  { icon: Globe, title: 'Fully Remote', description: 'Work from anywhere. We\'re a distributed team across 14 countries.' },
  { icon: Zap, title: '$1,000 Learning Budget', description: 'Annual budget for conferences, courses, and books. No approval needed.' },
  { icon: Heart, title: 'Comprehensive Health', description: 'Full health, dental, and vision coverage for you and dependents (US/EU).' },
  { icon: Clock, title: 'Flexible Hours', description: 'Ship great work on your schedule. We care about output, not office hours.' },
  { icon: Shield, title: 'Equity for Everyone', description: 'Every full-time employee receives meaningful equity with standard vesting.' },
  { icon: Users, title: 'Research Tool Access', description: 'Full access to User Ninjas for personal projects and side research.' },
];

const values = [
  { label: 'Craft matters', text: 'We obsess over quality and hold ourselves to a high bar — in code, design, writing, and communication.' },
  { label: 'Default to async', text: 'We write things down, communicate clearly, and respect everyone\'s timezone and deep work time.' },
  { label: 'Debate openly, commit fully', text: 'We have strong opinions but hold them loosely. Once a decision is made, we move fast as one.' },
  { label: 'Users first', text: 'Every decision starts with: what does this do for the researcher or tester? We practice what we sell.' },
];

export default function Careers() {
  const [activeDept, setActiveDept] = useState('All');
  const [expandedJob, setExpandedJob] = useState<number | null>(null);

  const filtered = activeDept === 'All' ? openings : openings.filter(o => o.department === activeDept);

  return (
    <>
      <Helmet>
        <title>Careers - User Ninjas</title>
        <meta name="description" content="Join User Ninjas and help the world build better products through user research. Remote-first, equity for everyone." />
      </Helmet>
      <Background3D />
      <Navbar />

      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <ScrollReveal animation="fade-up">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-5">
                <Briefcase className="w-3.5 h-3.5" /> Careers
              </div>
              <h1 className="font-display text-4xl md:text-6xl font-bold mb-5 tracking-tight">
                Build the future of <span className="text-gradient">user research</span>
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                We're a small, high-trust team on a mission to make every product team research-driven. Remote-first, deeply collaborative, and obsessively user-focused.
              </p>
              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> 42 team members</span>
                <span className="flex items-center gap-2"><Globe className="w-4 h-4 text-primary" /> 14 countries</span>
                <span className="flex items-center gap-2"><Star className="w-4 h-4 text-primary" /> Series A · $12M raised</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Values */}
          <ScrollReveal animation="fade-up" delay={100}>
            <div className="max-w-5xl mx-auto mb-16">
              <h2 className="font-display text-2xl font-bold mb-8 text-center">How we work</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {values.map(v => (
                  <div key={v.label} className="p-6 rounded-2xl bg-card border border-border/60">
                    <h3 className="font-display font-bold mb-2">{v.label}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{v.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Perks */}
          <ScrollReveal animation="fade-up" delay={100}>
            <div className="max-w-5xl mx-auto mb-16">
              <h2 className="font-display text-2xl font-bold mb-8 text-center">Perks & Benefits</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {perks.map(perk => {
                  const Icon = perk.icon;
                  return (
                    <div key={perk.title} className="p-6 rounded-2xl bg-card border border-border/60 hover:border-primary/20 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-display font-bold text-sm mb-1.5">{perk.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{perk.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollReveal>

          {/* Open roles */}
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <h2 className="font-display text-2xl font-bold">Open Roles ({filtered.length})</h2>
              <div className="flex flex-wrap gap-2">
                {departments.map(d => (
                  <button
                    key={d}
                    onClick={() => setActiveDept(d)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${activeDept === d ? 'bg-primary text-primary-foreground' : 'bg-secondary/60 text-muted-foreground hover:bg-secondary'}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <ScrollReveal animation="fade-up">
              <div className="space-y-3">
                {filtered.map((job) => (
                  <div key={job.id} className={`rounded-2xl bg-card border transition-colors overflow-hidden ${expandedJob === job.id ? 'border-primary/40' : 'border-border/60 hover:border-primary/20'}`}>
                    <button
                      className="w-full p-5 text-left flex items-center justify-between gap-4"
                      onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-display font-bold text-base">{job.title}</h3>
                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">{job.department}</span>
                          <span className="px-2 py-0.5 rounded-full bg-secondary text-xs text-muted-foreground">{job.level}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{job.type}</span>
                        </div>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform ${expandedJob === job.id ? 'rotate-180' : ''}`} />
                    </button>
                    {expandedJob === job.id && (
                      <div className="px-5 pb-5 border-t border-border/40 pt-4">
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{job.description}</p>
                        <div className="flex flex-wrap gap-1.5 mb-5">
                          {job.skills.map(skill => (
                            <span key={skill} className="px-2.5 py-1 rounded-lg bg-secondary/60 text-xs font-medium">{skill}</span>
                          ))}
                        </div>
                        <a
                          href={`mailto:careers@userninjas.io?subject=Application: ${encodeURIComponent(job.title)}`}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
                        >
                          Apply for this role <ArrowRight className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollReveal>

            {/* General application */}
            <ScrollReveal animation="fade-up">
              <div className="mt-8 rounded-2xl bg-secondary/30 border border-border/50 p-7 flex flex-col sm:flex-row items-center justify-between gap-5">
                <div>
                  <h3 className="font-display font-bold mb-1">Don't see the right role?</h3>
                  <p className="text-sm text-muted-foreground">Send us a speculative application — we keep strong candidates on file and reach out when roles open.</p>
                </div>
                <a href="mailto:careers@userninjas.io?subject=Speculative Application" className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-border/60 bg-background text-sm font-semibold hover:bg-secondary/40 transition-colors shrink-0">
                  Send open application
                </a>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
