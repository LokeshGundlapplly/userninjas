import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Background3D from '@/components/Background3D';
import ScrollReveal from '@/components/ScrollReveal';
import { Helmet } from 'react-helmet-async';
import { Clock, ArrowRight, BookOpen, TrendingUp, Lightbulb, Users } from 'lucide-react';

const categories = ['All', 'Research Tips', 'Product Updates', 'Case Studies', 'AI & Analysis', 'Industry Trends'];

const posts = [
  {
    id: 1,
    category: 'Research Tips',
    title: 'How to Write a Usability Test Script That Novices Can Follow',
    excerpt: 'A well-crafted test script is the difference between rich insights and surface-level feedback. Here\'s our step-by-step guide to writing one that works.',
    author: 'Priya Anand',
    role: 'Head of Research',
    date: 'Apr 8, 2026',
    readTime: '8 min read',
    featured: true,
    gradient: 'from-violet-500/20 to-blue-500/20',
  },
  {
    id: 2,
    category: 'AI & Analysis',
    title: 'How AI Sentiment Analysis Changed the Way We Read User Videos',
    excerpt: 'Manual tagging used to take hours. Our new AI pipeline surfaces frustration moments, delight signals, and confusion points automatically.',
    author: 'Marcus Osei',
    role: 'AI Research Lead',
    date: 'Apr 3, 2026',
    readTime: '6 min read',
    featured: false,
    gradient: 'from-emerald-500/20 to-teal-500/20',
  },
  {
    id: 3,
    category: 'Case Studies',
    title: 'How Finrise Cut Checkout Drop-offs by 34% with 5-Second Tests',
    excerpt: 'The fintech startup ran 12 rapid tests in one week and identified 3 critical friction points. Here\'s the process they used.',
    author: 'Sophia Chen',
    role: 'Customer Success',
    date: 'Mar 28, 2026',
    readTime: '10 min read',
    featured: false,
    gradient: 'from-amber-500/20 to-orange-500/20',
  },
  {
    id: 4,
    category: 'Research Tips',
    title: 'Screen Recording vs Live Session: When to Use Which',
    excerpt: 'Both methods have their place. Understand the tradeoffs and pick the format that matches your research question.',
    author: 'Tomás Reyes',
    role: 'UX Research Advisor',
    date: 'Mar 22, 2026',
    readTime: '5 min read',
    featured: false,
    gradient: 'from-pink-500/20 to-rose-500/20',
  },
  {
    id: 5,
    category: 'Product Updates',
    title: 'Introducing Survey Builder 2.0: Branching Logic, Skip Rules & More',
    excerpt: 'Our all-new survey builder ships with conditional branching, display logic, randomised question order, and side-by-side A/B comparisons.',
    author: 'User Ninjas Team',
    role: 'Product',
    date: 'Mar 15, 2026',
    readTime: '4 min read',
    featured: false,
    gradient: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    id: 6,
    category: 'Industry Trends',
    title: 'The State of UX Research in 2026: Key Findings from Our Annual Survey',
    excerpt: 'We surveyed 2,400 product professionals across 62 countries. Here\'s what we learned about research budgets, AI adoption, and team structures.',
    author: 'Priya Anand',
    role: 'Head of Research',
    date: 'Mar 10, 2026',
    readTime: '14 min read',
    featured: false,
    gradient: 'from-indigo-500/20 to-violet-500/20',
  },
  {
    id: 7,
    category: 'Research Tips',
    title: 'Recruiting Testers for Niche Products: A Practical Guide',
    excerpt: 'Finding fintech-savvy testers, enterprise software users, or healthcare professionals doesn\'t have to be hard. Here\'s how to structure your screener.',
    author: 'Leila Ahmadi',
    role: 'Panel Operations',
    date: 'Mar 5, 2026',
    readTime: '7 min read',
    featured: false,
    gradient: 'from-green-500/20 to-emerald-500/20',
  },
  {
    id: 8,
    category: 'Case Studies',
    title: 'From Concept to Validated Design in 48 Hours: A UX Ninja Sprint',
    excerpt: 'A B2B SaaS team ran 8 moderated sessions, 20 unmoderated tests, and 2 card sorts in one weekend. Here\'s the full breakdown.',
    author: 'Sophia Chen',
    role: 'Customer Success',
    date: 'Feb 28, 2026',
    readTime: '11 min read',
    featured: false,
    gradient: 'from-yellow-500/20 to-amber-500/20',
  },
  {
    id: 9,
    category: 'AI & Analysis',
    title: 'Building a Research Repository with AI Tagging: A How-To',
    excerpt: 'Transform raw session notes and recordings into a searchable knowledge base that your whole team can use without manual tagging.',
    author: 'Marcus Osei',
    role: 'AI Research Lead',
    date: 'Feb 20, 2026',
    readTime: '9 min read',
    featured: false,
    gradient: 'from-sky-500/20 to-blue-500/20',
  },
];

const categoryIcons: Record<string, React.ElementType> = {
  'Research Tips': Lightbulb,
  'Product Updates': TrendingUp,
  'Case Studies': BookOpen,
  'AI & Analysis': TrendingUp,
  'Industry Trends': Users,
};

export default function Blog() {
  const [active, setActive] = useState('All');

  const filtered = active === 'All' ? posts : posts.filter(p => p.category === active);
  const featured = filtered.find(p => p.featured) ?? filtered[0];
  const rest = filtered.filter(p => p.id !== featured?.id);

  return (
    <>
      <Helmet>
        <title>UX Research Blog - User Ninjas</title>
        <meta name="description" content="Research tips, case studies, product updates, and industry insights from the User Ninjas team." />
      </Helmet>
      <Background3D />
      <Navbar />

      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <ScrollReveal animation="fade-up">
            <div className="text-center mb-12 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-5">
                <BookOpen className="w-3.5 h-3.5" /> Blog
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                The UX Research <span className="text-gradient">Intelligence</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Tips, case studies, and product updates from the researchers, builders, and operators at User Ninjas.
              </p>
            </div>
          </ScrollReveal>

          {/* Category filters */}
          <ScrollReveal animation="fade-up" delay={100}>
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

          {/* Featured post */}
          {featured && (
            <ScrollReveal animation="fade-up" delay={150}>
              <div className={`rounded-2xl bg-gradient-to-br ${featured.gradient} border border-border/50 p-8 md:p-10 mb-8 hover:shadow-lg transition-shadow cursor-pointer group`}>
                <div className="max-w-3xl">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">{featured.category}</span>
                    <span className="text-xs text-muted-foreground">Featured</span>
                  </div>
                  <h2 className="font-display text-2xl md:text-3xl font-bold mb-3 group-hover:text-primary transition-colors">{featured.title}</h2>
                  <p className="text-muted-foreground leading-relaxed mb-5">{featured.excerpt}</p>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                        {featured.author.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{featured.author}</p>
                        <p className="text-xs text-muted-foreground">{featured.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{featured.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{featured.readTime}</span>
                      <span className="flex items-center gap-1 text-primary font-semibold group-hover:gap-2 transition-all">Read article <ArrowRight className="w-3.5 h-3.5" /></span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          )}

          {/* Post grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {rest.map((post, i) => {
              const Icon = categoryIcons[post.category] ?? BookOpen;
              return (
                <ScrollReveal key={post.id} animation="fade-up" delay={i * 60}>
                  <div className="group rounded-2xl bg-card border border-border/60 overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer h-full flex flex-col">
                    <div className={`h-36 bg-gradient-to-br ${post.gradient} flex items-center justify-center`}>
                      <Icon className="w-12 h-12 text-white/30" />
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2.5 py-1 rounded-full bg-primary/8 text-primary text-xs font-medium">{post.category}</span>
                      </div>
                      <h3 className="font-display font-bold text-base mb-2 group-hover:text-primary transition-colors leading-snug">{post.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{post.excerpt}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-border/40">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                            {post.author.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-xs font-medium">{post.author}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{post.date}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>

          {/* Load more */}
          <div className="text-center mt-12">
            <button className="px-8 py-3 rounded-xl border border-border/60 bg-card text-sm font-semibold hover:bg-secondary/40 transition-colors">
              Load More Articles
            </button>
          </div>

          {/* Newsletter CTA */}
          <ScrollReveal animation="fade-up">
            <div className="mt-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 p-8 md:p-12 text-center max-w-3xl mx-auto">
              <h3 className="font-display text-2xl font-bold mb-3">Get insights in your inbox</h3>
              <p className="text-muted-foreground mb-6">Weekly UX research tips and case studies. No fluff, unsubscribe anytime.</p>
              <form className="flex gap-2 max-w-md mx-auto" onSubmit={e => e.preventDefault()}>
                <input type="email" placeholder="your@email.com" required className="flex-1 h-11 px-4 rounded-xl bg-background border border-border/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <button type="submit" className="px-5 h-11 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap">Subscribe</button>
              </form>
            </div>
          </ScrollReveal>
        </div>
      </main>

      <Footer />
    </>
  );
}
