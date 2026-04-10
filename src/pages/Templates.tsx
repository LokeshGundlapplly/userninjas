import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Background3D from '@/components/Background3D';
import ScrollReveal from '@/components/ScrollReveal';
import { Helmet } from 'react-helmet-async';
import { Download, Eye, Star, Search, BookOpen, Users, BarChart3, MessageSquare, Filter } from 'lucide-react';

const categories = ['All', 'Usability Testing', 'Interviews', 'Surveys', 'Card Sorting', 'Prototype Testing', 'Screeners'];

interface Template {
  id: number;
  title: string;
  category: string;
  description: string;
  uses: string;
  rating: number;
  gradient: string;
  icon: React.ElementType;
  tags: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

const templates: Template[] = [
  {
    id: 1,
    title: 'SaaS Onboarding Usability Test',
    category: 'Usability Testing',
    description: 'Test new user onboarding flows with 5 structured tasks covering account setup, first action, and key feature discovery.',
    uses: '4,820 uses',
    rating: 4.9,
    gradient: 'from-violet-500/20 to-blue-500/20',
    icon: Users,
    tags: ['SaaS', 'Onboarding', '5 Tasks'],
    difficulty: 'Beginner',
  },
  {
    id: 2,
    title: 'E-commerce Checkout Flow Test',
    category: 'Usability Testing',
    description: 'Identify drop-off points in checkout with cart-to-purchase tasks, error recovery scenarios, and payment flow evaluation.',
    uses: '3,401 uses',
    rating: 4.8,
    gradient: 'from-emerald-500/20 to-teal-500/20',
    icon: BarChart3,
    tags: ['E-commerce', 'Checkout', 'Conversion'],
    difficulty: 'Beginner',
  },
  {
    id: 3,
    title: 'B2B Enterprise UX Interview Script',
    category: 'Interviews',
    description: 'A 45-minute moderated interview guide for enterprise decision-makers covering pain points, workflows, and buying criteria.',
    uses: '2,150 uses',
    rating: 4.9,
    gradient: 'from-amber-500/20 to-orange-500/20',
    icon: MessageSquare,
    tags: ['B2B', 'Enterprise', '45 min'],
    difficulty: 'Intermediate',
  },
  {
    id: 4,
    title: 'Mobile App Navigation Card Sort',
    category: 'Card Sorting',
    description: 'Open card sort for information architecture validation. Includes 40 cards covering features, settings, and content categories.',
    uses: '1,890 uses',
    rating: 4.7,
    gradient: 'from-pink-500/20 to-rose-500/20',
    icon: Filter,
    tags: ['Mobile', 'IA', '40 Cards'],
    difficulty: 'Beginner',
  },
  {
    id: 5,
    title: 'Pricing Page 5-Second Test',
    category: 'Prototype Testing',
    description: 'Measure immediate comprehension of your pricing page. 5-second exposure followed by recall and comprehension questions.',
    uses: '2,770 uses',
    rating: 4.8,
    gradient: 'from-blue-500/20 to-cyan-500/20',
    icon: Eye,
    tags: ['Pricing', 'First Impression', '5-Second'],
    difficulty: 'Beginner',
  },
  {
    id: 6,
    title: 'Post-Onboarding NPS Survey',
    category: 'Surveys',
    description: 'Standard NPS with follow-up branching: promoters get a referral ask, passives get feature questions, detractors get support routing.',
    uses: '3,650 uses',
    rating: 4.6,
    gradient: 'from-indigo-500/20 to-violet-500/20',
    icon: Star,
    tags: ['NPS', 'Post-Onboarding', 'Branching'],
    difficulty: 'Beginner',
  },
  {
    id: 7,
    title: 'Power User Screener — B2C App',
    category: 'Screeners',
    description: 'Qualify power users based on usage frequency, device type, age range, and specific feature engagement criteria.',
    uses: '1,340 uses',
    rating: 4.7,
    gradient: 'from-green-500/20 to-emerald-500/20',
    icon: Search,
    tags: ['Screener', 'B2C', 'Power Users'],
    difficulty: 'Beginner',
  },
  {
    id: 8,
    title: 'Competitive Comparison Interview',
    category: 'Interviews',
    description: 'Structured interview script for users who use both your product and a competitor. Uncovers switching barriers and perceptions.',
    uses: '980 uses',
    rating: 4.8,
    gradient: 'from-yellow-500/20 to-amber-500/20',
    icon: BookOpen,
    tags: ['Competitive', 'Interview', 'Switching'],
    difficulty: 'Advanced',
  },
  {
    id: 9,
    title: 'Feature Prioritisation Survey',
    category: 'Surveys',
    description: 'MaxDiff-style survey template for feature prioritisation. Reveals relative importance of 10–15 candidate features.',
    uses: '1,600 uses',
    rating: 4.7,
    gradient: 'from-sky-500/20 to-blue-500/20',
    icon: BarChart3,
    tags: ['Prioritisation', 'MaxDiff', 'Product'],
    difficulty: 'Intermediate',
  },
];

const difficultyColor = {
  Beginner: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  Intermediate: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  Advanced: 'bg-primary/10 text-primary border-primary/20',
};

export default function Templates() {
  const [active, setActive] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = templates
    .filter(t => active === 'All' || t.category === active)
    .filter(t => t.title.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <Helmet>
        <title>Research Templates - User Ninjas</title>
        <meta name="description" content="Ready-to-use UX research templates: usability tests, interview scripts, surveys, screeners, and more." />
      </Helmet>
      <Background3D />
      <Navbar />

      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <ScrollReveal animation="fade-up">
            <div className="text-center mb-12 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-5">
                <BookOpen className="w-3.5 h-3.5" /> Templates
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                Start from a proven <span className="text-gradient">template</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Expert-crafted research templates built by UX researchers. Customise and launch in minutes.
              </p>
            </div>
          </ScrollReveal>

          {/* Search */}
          <ScrollReveal animation="fade-up" delay={100}>
            <div className="max-w-md mx-auto mb-6 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search templates..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-card border border-border/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
              />
            </div>
          </ScrollReveal>

          {/* Category filters */}
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

          {/* Count */}
          <p className="text-sm text-muted-foreground text-center mb-8">{filtered.length} template{filtered.length !== 1 ? 's' : ''} found</p>

          {/* Templates grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {filtered.map((template, i) => {
              const Icon = template.icon;
              return (
                <ScrollReveal key={template.id} animation="fade-up" delay={i * 60}>
                  <div className="group rounded-2xl bg-card border border-border/60 hover:border-primary/30 hover:shadow-lg transition-all h-full flex flex-col overflow-hidden">
                    {/* Banner */}
                    <div className={`h-28 bg-gradient-to-br ${template.gradient} flex items-center justify-center`}>
                      <Icon className="w-10 h-10 text-white/40" />
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      {/* Badges */}
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        <span className="px-2.5 py-1 rounded-full bg-primary/8 text-primary text-xs font-medium">{template.category}</span>
                        <span className={`px-2 py-0.5 rounded-full border text-xs font-medium ${difficultyColor[template.difficulty]}`}>{template.difficulty}</span>
                      </div>
                      <h3 className="font-display font-bold text-base mb-2 group-hover:text-primary transition-colors leading-snug">{template.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{template.description}</p>
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {template.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded-lg bg-secondary/60 text-xs text-muted-foreground">{tag}</span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-border/40">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-semibold text-foreground">{template.rating}</span>
                          <span>· {template.uses}</span>
                        </div>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition-colors">
                          <Download className="w-3.5 h-3.5" /> Use template
                        </button>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>

          {/* CTA */}
          <ScrollReveal animation="fade-up">
            <div className="max-w-5xl mx-auto mt-14 rounded-2xl bg-card border border-border/60 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="font-display font-bold text-lg mb-1">Don't see what you need?</h3>
                <p className="text-sm text-muted-foreground">Our research team creates custom templates for Enterprise customers.</p>
              </div>
              <button className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shrink-0">
                Request a custom template
              </button>
            </div>
          </ScrollReveal>
        </div>
      </main>

      <Footer />
    </>
  );
}
