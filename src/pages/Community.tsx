import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Background3D from '@/components/Background3D';
import ScrollReveal from '@/components/ScrollReveal';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Users, MessageSquare, Star, TrendingUp, Award, ArrowRight, Heart, Zap } from 'lucide-react';

const discussions = [
  {
    category: 'Methods',
    title: 'Best practices for writing screener questions that actually qualify the right testers?',
    author: 'Alex Kim',
    time: '2 hours ago',
    replies: 14,
    views: '320',
    votes: 28,
    badge: 'Hot',
    badgeColor: 'bg-rose-500/10 text-rose-600',
  },
  {
    category: 'AI Tools',
    title: 'How are you using the bulk AI summarise feature in your research workflow?',
    author: 'Sarah O.',
    time: '5 hours ago',
    replies: 22,
    views: '540',
    votes: 41,
    badge: 'Trending',
    badgeColor: 'bg-amber-500/10 text-amber-600',
  },
  {
    category: 'Tips & Tricks',
    title: 'Sharing my template for unmoderated app testing — 5 tasks that always surface insights',
    author: 'Tomás R.',
    time: '1 day ago',
    replies: 8,
    views: '210',
    votes: 36,
    badge: null,
    badgeColor: '',
  },
  {
    category: 'Integrations',
    title: 'Zapier + User Ninjas → Notion: full workflow walkthrough',
    author: 'Priya A.',
    time: '2 days ago',
    replies: 17,
    views: '480',
    votes: 52,
    badge: 'Popular',
    badgeColor: 'bg-primary/10 text-primary',
  },
  {
    category: 'Methods',
    title: 'Tree testing vs card sorting — when do you pick which one?',
    author: 'Marcus O.',
    time: '3 days ago',
    replies: 10,
    views: '265',
    votes: 19,
    badge: null,
    badgeColor: '',
  },
  {
    category: 'Career',
    title: 'How to justify a user research budget to a sceptical VP of Product',
    author: 'Leila A.',
    time: '4 days ago',
    replies: 31,
    views: '720',
    votes: 67,
    badge: 'Trending',
    badgeColor: 'bg-amber-500/10 text-amber-600',
  },
];

const topContributors = [
  { name: 'Priya Anand', title: 'UX Research Lead', posts: 142, badge: 'Research Expert', avatar: 'PA' },
  { name: 'Marcus Osei', title: 'AI Research Analyst', posts: 98, badge: 'AI Specialist', avatar: 'MO' },
  { name: 'Sophia Chen', title: 'Product Designer', posts: 87, badge: 'Template Master', avatar: 'SC' },
  { name: 'Tomás Reyes', title: 'UX Strategist', posts: 73, badge: 'Community Star', avatar: 'TR' },
];

const forumCategories = [
  { icon: MessageSquare, name: 'Research Methods', description: 'Discuss testing approaches, interview techniques, and study design', count: 248 },
  { icon: Zap, name: 'AI & Analysis', description: 'AI summaries, sentiment analysis, and making sense of data', count: 183 },
  { icon: Users, name: 'Tester Recruitment', description: 'Screeners, targeting, and finding the right participants', count: 112 },
  { icon: Award, name: 'Case Studies', description: 'Share research stories and lessons from real projects', count: 95 },
  { icon: Heart, name: 'Templates & Resources', description: 'Share and discover research templates, scripts, and tools', count: 167 },
  { icon: TrendingUp, name: 'Career & Growth', description: 'UX research career development, portfolios, and industry growth', count: 204 },
];

export default function Community() {
  return (
    <>
      <Helmet>
        <title>Community - User Ninjas</title>
        <meta name="description" content="Join the User Ninjas community. Discuss UX research methods, share templates, and connect with researchers worldwide." />
      </Helmet>
      <Background3D />
      <Navbar />

      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <ScrollReveal animation="fade-up">
            <div className="text-center mb-14 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-5">
                <Users className="w-3.5 h-3.5" /> Community
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                The UX research <span className="text-gradient">community</span>
              </h1>
              <p className="text-muted-foreground text-lg mb-6">
                Connect with 12,000+ researchers, designers, and product managers. Share, learn, and grow together.
              </p>
              <button className="px-8 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
                Join Community — Free
              </button>
            </div>
          </ScrollReveal>

          {/* Stats */}
          <ScrollReveal animation="fade-up" delay={100}>
            <div className="flex flex-wrap justify-center gap-4 mb-16">
              {[
                { value: '12,400+', label: 'Members' },
                { value: '1,800+', label: 'Discussions' },
                { value: '4,200+', label: 'Resources shared' },
                { value: '48 countries', label: 'Represented' },
              ].map(s => (
                <div key={s.label} className="px-6 py-4 rounded-2xl bg-card border border-border/60 text-center">
                  <p className="font-display font-bold text-xl">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Left: Forum categories + discussions */}
            <div className="lg:col-span-2 space-y-8">
              {/* Forum categories */}
              <ScrollReveal animation="fade-up">
                <h2 className="font-display text-xl font-bold mb-5">Forum Categories</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {forumCategories.map(cat => {
                    const Icon = cat.icon;
                    return (
                      <div key={cat.name} className="group p-5 rounded-2xl bg-card border border-border/60 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{cat.name}</h3>
                              <span className="text-xs text-muted-foreground shrink-0">{cat.count} posts</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{cat.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollReveal>

              {/* Discussions */}
              <ScrollReveal animation="fade-up">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display text-xl font-bold">Recent Discussions</h2>
                  <button className="flex items-center gap-1.5 text-sm text-primary font-semibold hover:gap-2.5 transition-all">View all <ArrowRight className="w-3.5 h-3.5" /></button>
                </div>
                <div className="space-y-3">
                  {discussions.map(d => (
                    <div key={d.title} className="group p-5 rounded-2xl bg-card border border-border/60 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className="px-2 py-0.5 rounded-full bg-secondary text-xs font-medium">{d.category}</span>
                            {d.badge && <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${d.badgeColor}`}>{d.badge}</span>}
                          </div>
                          <h3 className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors mb-2">{d.title}</h3>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="font-medium text-foreground/70">{d.author}</span>
                            <span>{d.time}</span>
                            <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{d.replies}</span>
                            <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{d.views} views</span>
                            <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{d.votes}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>

            {/* Right sidebar */}
            <div className="space-y-6">
              {/* Top contributors */}
              <ScrollReveal animation="fade-up" delay={100}>
                <div className="rounded-2xl bg-card border border-border/60 p-6">
                  <h3 className="font-display font-bold text-base mb-5">Top Contributors</h3>
                  <div className="space-y-4">
                    {topContributors.map((c, i) => (
                      <div key={c.name} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                          {c.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.posts} posts · {c.badge}</p>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">#{i + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>

              {/* Start a discussion */}
              <ScrollReveal animation="fade-up" delay={150}>
                <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 p-6">
                  <h3 className="font-display font-bold text-base mb-2">Start a discussion</h3>
                  <p className="text-sm text-muted-foreground mb-4">Share a tip, ask a question, or start a conversation with fellow researchers.</p>
                  <button className="w-full px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
                    New Discussion
                  </button>
                </div>
              </ScrollReveal>

              {/* Resources highlight */}
              <ScrollReveal animation="fade-up" delay={200}>
                <div className="rounded-2xl bg-card border border-border/60 p-6">
                  <h3 className="font-display font-bold text-base mb-4">Community Resources</h3>
                  <ul className="space-y-3">
                    {[
                      { label: 'Free templates library', href: '/templates' },
                      { label: 'Research glossary', href: '/glossary' },
                      { label: 'UX Research blog', href: '/blog' },
                      { label: 'Documentation', href: '/docs' },
                    ].map(r => (
                      <li key={r.label}>
                        <Link to={r.href} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                          <ArrowRight className="w-3.5 h-3.5 shrink-0" /> {r.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
