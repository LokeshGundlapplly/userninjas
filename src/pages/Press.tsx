import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Background3D from '@/components/Background3D';
import ScrollReveal from '@/components/ScrollReveal';
import { Helmet } from 'react-helmet-async';
import { Download, ExternalLink, Star, Quote, Image, FileText, Globe, Mail } from 'lucide-react';

const pressMentions = [
  {
    outlet: 'TechCrunch',
    headline: '"User Ninjas is making enterprise-grade UX research accessible to startups"',
    date: 'March 2026',
    gradient: 'from-green-500 to-emerald-600',
    initials: 'TC',
  },
  {
    outlet: 'Product Hunt',
    headline: '#1 Product of the Day · #3 Product of the Month',
    date: 'January 2026',
    gradient: 'from-orange-400 to-amber-500',
    initials: 'PH',
  },
  {
    outlet: 'UX Collective',
    headline: '"The platform reshaping how remote teams do qualitative research"',
    date: 'February 2026',
    gradient: 'from-blue-500 to-cyan-500',
    initials: 'UX',
  },
  {
    outlet: 'Fast Company',
    headline: '"Most Innovative Companies in Design 2026"',
    date: 'April 2026',
    gradient: 'from-slate-600 to-slate-800',
    initials: 'FC',
  },
  {
    outlet: 'G2',
    headline: 'Leader Award · User Research Category · Spring 2026',
    date: 'Spring 2026',
    gradient: 'from-orange-500 to-red-500',
    initials: 'G2',
  },
  {
    outlet: 'Hacker News',
    headline: '"Show HN: We rebuilt our entire UX research stack with User Ninjas" — 420 points',
    date: 'March 2026',
    gradient: 'from-orange-400 to-red-400',
    initials: 'HN',
  },
];

const brandAssets = [
  {
    name: 'Logo Pack',
    description: 'SVG, PNG in full-colour, black, white, and transparent backgrounds.',
    size: 'ZIP · 2.4 MB',
    icon: Image,
  },
  {
    name: 'Brand Guidelines',
    description: 'Typography, colour palette, spacing, and usage rules.',
    size: 'PDF · 1.1 MB',
    icon: FileText,
  },
  {
    name: 'Product Screenshots',
    description: 'High-res screenshots of key platform features (light & dark).',
    size: 'ZIP · 18.3 MB',
    icon: Image,
  },
  {
    name: 'Founder Photos',
    description: 'High-resolution press photos of founding team.',
    size: 'ZIP · 6.7 MB',
    icon: Image,
  },
];

const companyFacts = [
  { label: 'Founded', value: '2024' },
  { label: 'Headquarters', value: 'Hyderabad, India + Remote' },
  { label: 'Stage', value: 'Series A · $12M raised' },
  { label: 'Team size', value: '42 employees, 14 countries' },
  { label: 'Testers on platform', value: '120,000+' },
  { label: 'Customers', value: '4,000+ product teams' },
  { label: 'Countries served', value: '150+' },
  { label: 'Uptime SLA', value: '99.9%' },
];

const quotes = [
  {
    text: 'User Ninjas is the fastest way to get real user insight without the enterprise price tag. We replaced a $40K/year vendor with them.',
    author: 'VP Product, Series B SaaS company',
  },
  {
    text: 'The combination of a massive tester panel and AI analysis is genuinely magical. We\'re running 10x the tests we did before.',
    author: 'Head of Research, e-commerce brand',
  },
];

export default function Press() {
  return (
    <>
      <Helmet>
        <title>Press Kit - User Ninjas</title>
        <meta name="description" content="User Ninjas press kit. Download brand assets, read press coverage, and get company facts for media enquiries." />
      </Helmet>
      <Background3D />
      <Navbar />

      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <ScrollReveal animation="fade-up">
            <div className="text-center mb-14 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-5">
                <Globe className="w-3.5 h-3.5" /> Press
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 tracking-tight">Press Kit</h1>
              <p className="text-muted-foreground text-lg mb-6">
                Everything journalists, analysts, and content creators need to cover User Ninjas.
              </p>
              <a href="mailto:press@userninjas.io" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
                <Mail className="w-4 h-4" /> Contact press team: press@userninjas.io
              </a>
            </div>
          </ScrollReveal>

          <div className="max-w-5xl mx-auto space-y-16">
            {/* Company overview */}
            <ScrollReveal animation="fade-up">
              <div>
                <h2 className="font-display text-2xl font-bold mb-6">Company Overview</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 rounded-2xl bg-card border border-border/60 p-7">
                    <h3 className="font-display font-semibold mb-3">About User Ninjas</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                      User Ninjas is the fastest, most affordable UX research platform for product teams of all sizes. We connect researchers with a global panel of 120,000+ verified testers and deliver AI-powered insights in hours, not weeks.
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Founded in 2024, User Ninjas is trusted by 4,000+ product teams — from early-stage startups to Fortune 500 enterprises — across 150+ countries. Our AI analysis engine automatically generates summaries, highlights, sentiment scores, and action items from every session.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-card border border-border/60 p-6">
                    <h3 className="font-display font-semibold mb-4 text-sm">Key Facts</h3>
                    <ul className="space-y-2.5">
                      {companyFacts.map(f => (
                        <li key={f.label} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{f.label}</span>
                          <span className="font-semibold text-right">{f.value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Press mentions */}
            <ScrollReveal animation="fade-up">
              <div>
                <h2 className="font-display text-2xl font-bold mb-6">Press Coverage</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {pressMentions.map(mention => (
                    <div key={mention.outlet} className="group rounded-2xl bg-card border border-border/60 hover:border-primary/20 hover:shadow-md transition-all p-5 cursor-pointer">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${mention.gradient} flex items-center justify-center text-white font-bold text-xs shrink-0`}>
                          {mention.initials}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{mention.outlet}</p>
                          <p className="text-xs text-muted-foreground">{mention.date}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-snug italic">{mention.headline}</p>
                      <ExternalLink className="w-3.5 h-3.5 text-primary mt-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Notable quotes */}
            <ScrollReveal animation="fade-up">
              <div>
                <h2 className="font-display text-2xl font-bold mb-6">Customer Quotes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {quotes.map((q, i) => (
                    <div key={i} className="rounded-2xl bg-card border border-border/60 p-7">
                      <Quote className="w-7 h-7 text-primary/30 mb-3" />
                      <p className="text-base leading-relaxed mb-4 italic">{q.text}</p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                        </div>
                        <span className="text-sm text-muted-foreground">— {q.author}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Brand assets */}
            <ScrollReveal animation="fade-up">
              <div>
                <h2 className="font-display text-2xl font-bold mb-6">Brand Assets</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {brandAssets.map(asset => {
                    const Icon = asset.icon;
                    return (
                      <div key={asset.name} className="group rounded-2xl bg-card border border-border/60 hover:border-primary/30 transition-all p-5 flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">{asset.name}</h3>
                          <p className="text-xs text-muted-foreground">{asset.description}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{asset.size}</p>
                        </div>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition-colors shrink-0">
                          <Download className="w-3.5 h-3.5" /> Download
                        </button>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Please review our brand guidelines before use. User Ninjas logos and marks may not be modified, stretched, or used to imply endorsement without written permission.
                </p>
              </div>
            </ScrollReveal>

            {/* Contact */}
            <ScrollReveal animation="fade-up">
              <div className="rounded-2xl bg-gradient-to-br from-primary/8 to-accent/8 border border-primary/20 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="font-display font-bold text-xl mb-2">Press Enquiries</h3>
                  <p className="text-sm text-muted-foreground max-w-md">For interviews, embargoed news, product briefings, or custom quotes, contact our press team directly.</p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <a href="mailto:press@userninjas.io" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
                    <Mail className="w-4 h-4" /> press@userninjas.io
                  </a>
                  <p className="text-xs text-muted-foreground text-center">Response within 24 hours</p>
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
