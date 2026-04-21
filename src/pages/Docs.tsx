import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Background3D from '@/components/Background3D';
import ScrollReveal from '@/components/ScrollReveal';
import { Helmet } from 'react-helmet-async';
import { BookOpen, Search, ChevronRight, Zap, Code2, Globe, Shield, Users, BarChart3, Puzzle } from 'lucide-react';

const categories = [
  { name: 'Getting Started', icon: Zap, color: 'text-primary', articles: 8,
    topics: ['Create your account', 'Run your first test', 'Invite team members', 'Understanding credits', 'Quick start guide'],
  },
  { name: 'Research Methods', icon: Globe, color: 'text-emerald-600', articles: 14,
    topics: ['Unmoderated usability testing', 'Moderated interviews', 'Card sorting', 'Tree testing', '5-second tests'],
  },
  { name: 'Tester Management', icon: Users, color: 'text-amber-600', articles: 10,
    topics: ['Writing screener questions', 'Targeting criteria', 'Tester quality rating', 'Approving sessions', 'Dispute resolution'],
  },
  { name: 'AI & Analysis', icon: BarChart3, color: 'text-violet-600', articles: 12,
    topics: ['AI summaries explained', 'Sentiment analysis', 'Bulk summarise', 'Exporting insights', 'Tagging & highlights'],
  },
  { name: 'Integrations', icon: Puzzle, color: 'text-blue-600', articles: 16,
    topics: ['Figma integration', 'Slack notifications', 'Jira issue creation', 'Zapier workflows', 'REST API basics'],
  },
  { name: 'API Reference', icon: Code2, color: 'text-rose-600', articles: 20,
    topics: ['Authentication', 'Tests endpoint', 'Sessions endpoint', 'Webhooks', 'Rate limits'],
  },
  { name: 'Security & Privacy', icon: Shield, color: 'text-teal-600', articles: 6,
    topics: ['SOC 2 compliance', 'Data retention policy', 'GDPR for recruiters', 'Recording storage', 'NDA management'],
  },
  { name: 'Billing & Plans', icon: BarChart3, color: 'text-orange-600', articles: 8,
    topics: ['Credit system explained', 'Upgrading your plan', 'Invoice downloads', 'Team billing', 'Enterprise quotas'],
  },
];

const popularArticles = [
  'How to write a good screener question',
  'What is a tester quality score?',
  'How to approve or reject a session',
  'How AI summaries are generated',
  'Connecting User Ninjas to Figma',
  'Setting up Slack notifications',
  'Exporting sessions to CSV',
  'How credits are consumed',
];

export default function Docs() {
  const [search, setSearch] = useState('');

  return (
    <>
      <Helmet>
        <title>Documentation - User Ninjas</title>
        <meta name="description" content="Learn how to use User Ninjas: guides, API reference, integrations, and resources for research teams." />
      </Helmet>
      <Background3D />
      <Navbar />

      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <ScrollReveal animation="fade-up">
            <div className="text-center mb-12 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-5">
                <BookOpen className="w-3.5 h-3.5" /> Documentation
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                How can we help?
              </h1>
              <p className="text-muted-foreground text-lg mb-8">
                Find guides, tutorials, and references for every part of User Ninjas.
              </p>
              {/* Search */}
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search documentation..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 rounded-xl bg-card border border-border/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 shadow-sm"
                />
              </div>
            </div>
          </ScrollReveal>

          {/* Category grid */}
          <ScrollReveal animation="fade-up" delay={100}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto mb-16">
              {categories.map((cat, i) => {
                const Icon = cat.icon;
                return (
                  <ScrollReveal key={cat.name} animation="fade-up" delay={i * 50}>
                    <div className="group rounded-2xl bg-card border border-border/60 hover:border-primary/30 hover:shadow-md transition-all p-6 cursor-pointer">
                      <div className={`w-10 h-10 rounded-xl ${cat.color.replace('text-', 'bg-').replace('-600', '-500/10').replace('primary', 'primary/10')} flex items-center justify-center mb-4`}>
                        <Icon className={`w-5 h-5 ${cat.color}`} />
                      </div>
                      <h3 className="font-display font-bold text-sm mb-1 group-hover:text-primary transition-colors">{cat.name}</h3>
                      <p className="text-xs text-muted-foreground mb-3">{cat.articles} articles</p>
                      <ul className="space-y-1.5">
                        {cat.topics.slice(0, 3).map(topic => (
                          <li key={topic} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                            <ChevronRight className="w-3 h-3 shrink-0" /> {topic}
                          </li>
                        ))}
                        {cat.topics.length > 3 && (
                          <li className="text-xs text-primary font-medium mt-1">+{cat.topics.length - 3} more</li>
                        )}
                      </ul>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </ScrollReveal>

          {/* Popular articles */}
          <ScrollReveal animation="fade-up">
            <div className="max-w-5xl mx-auto mb-12">
              <h2 className="font-display text-xl font-bold mb-6">Popular Articles</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {popularArticles.map((article, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/60 hover:border-primary/30 hover:bg-secondary/20 transition-all cursor-pointer group">
                    <BookOpen className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm font-medium group-hover:text-primary transition-colors">{article}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Quick links */}
          <ScrollReveal animation="fade-up">
            <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="rounded-2xl bg-primary/5 border border-primary/15 p-6">
                <h3 className="font-display font-bold mb-2 flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> Quickstarts</h3>
                <p className="text-sm text-muted-foreground mb-4">Get up and running in under 10 minutes.</p>
                <button className="text-sm text-primary font-semibold flex items-center gap-1.5 hover:gap-2.5 transition-all">View guides <ChevronRight className="w-4 h-4" /></button>
              </div>
              <div className="rounded-2xl bg-accent/5 border border-accent/15 p-6">
                <h3 className="font-display font-bold mb-2 flex items-center gap-2"><Code2 className="w-4 h-4 text-accent" /> API Reference</h3>
                <p className="text-sm text-muted-foreground mb-4">Full REST API documentation with examples.</p>
                <button className="text-sm text-accent font-semibold flex items-center gap-1.5 hover:gap-2.5 transition-all">View API docs <ChevronRight className="w-4 h-4" /></button>
              </div>
              <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/15 p-6">
                <h3 className="font-display font-bold mb-2 flex items-center gap-2"><Users className="w-4 h-4 text-emerald-600" /> Support</h3>
                <p className="text-sm text-muted-foreground mb-4">Need help? Our support team responds in &lt;2h.</p>
                <Link to="/contact" className="text-sm text-emerald-600 font-semibold flex items-center gap-1.5 hover:gap-2.5 transition-all">Contact support <ChevronRight className="w-4 h-4" /></Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </main>

      <Footer />
    </>
  );
}
