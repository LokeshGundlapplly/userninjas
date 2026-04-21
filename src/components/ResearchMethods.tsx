import { MonitorPlay, Users, MessageSquare, LayoutGrid, TreePine, Timer, ClipboardList, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const methods = [
  {
    icon: MonitorPlay,
    title: 'Unmoderated Usability Testing',
    description: 'Send tasks to participants and watch recorded sessions asynchronously. Perfect for fast, scalable research.',
    tag: 'Popular',
    tagColor: 'bg-primary/10 text-primary',
    color: 'bg-primary/10 text-primary',
    border: 'hover:border-primary/30',
  },
  {
    icon: Users,
    title: 'Moderated User Interviews',
    description: 'Live 1-on-1 sessions with a moderator. Explore motivations, pain points, and behavioral patterns in depth.',
    tag: 'In-depth',
    tagColor: 'bg-accent/10 text-accent',
    color: 'bg-accent/10 text-accent',
    border: 'hover:border-accent/30',
  },
  {
    icon: ClipboardList,
    title: 'Prototype Testing',
    description: 'Test Figma, InVision or any live prototype before development. Catch usability issues early.',
    tag: 'Pre-launch',
    tagColor: 'bg-[hsl(var(--gold))]/10 text-[hsl(var(--gold))]',
    color: 'bg-[hsl(var(--gold))]/10 text-[hsl(var(--gold))]',
    border: 'hover:border-[hsl(var(--gold))]/30',
  },
  {
    icon: LayoutGrid,
    title: 'Card Sorting',
    description: 'Understand how users mentally categorize your content to build intuitive information architecture.',
    tag: 'IA Research',
    tagColor: 'bg-primary/10 text-primary',
    color: 'bg-primary/10 text-primary',
    border: 'hover:border-primary/30',
  },
  {
    icon: TreePine,
    title: 'Tree Testing',
    description: 'Validate your navigation structure without visual design. Find where users get lost in your hierarchy.',
    tag: 'Navigation',
    tagColor: 'bg-accent/10 text-accent',
    color: 'bg-accent/10 text-accent',
    border: 'hover:border-accent/30',
  },
  {
    icon: Timer,
    title: '5-Second Tests',
    description: 'Test first impressions and message clarity. Find out what users notice — and remember — at a glance.',
    tag: 'Quick',
    tagColor: 'bg-[hsl(var(--gold))]/10 text-[hsl(var(--gold))]',
    color: 'bg-[hsl(var(--gold))]/10 text-[hsl(var(--gold))]',
    border: 'hover:border-[hsl(var(--gold))]/30',
  },
  {
    icon: MessageSquare,
    title: 'Surveys & Screeners',
    description: 'Quantitative surveys paired with smart screener questions to recruit the perfect audience for any study.',
    tag: 'Quantitative',
    tagColor: 'bg-primary/10 text-primary',
    color: 'bg-primary/10 text-primary',
    border: 'hover:border-primary/30',
  },
  {
    icon: Eye,
    title: 'Click Testing',
    description: 'Discover where users click first. Heatmaps and click tracking reveal your interface\'s most intuitive paths.',
    tag: 'Visual',
    tagColor: 'bg-accent/10 text-accent',
    color: 'bg-accent/10 text-accent',
    border: 'hover:border-accent/30',
  },
];

export default function ResearchMethods() {
  return (
    <section className="py-28 bg-secondary/10">
      <div className="container mx-auto px-4">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-4">Research Methods</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-5">
              Every research method{' '}
              <span className="text-gradient">in one platform</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From quick 5-second tests to in-depth moderated interviews — choose the right method for every research question.
              Mix and combine for the richest insights.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {methods.map((method, index) => (
            <ScrollReveal key={method.title} animation="fade-up" delay={index * 60}>
              <div className={`group p-5 rounded-2xl bg-card border border-border/50 ${method.border} hover:shadow-xl transition-all duration-300 h-full hover:-translate-y-1 lift-glow spotlight-card`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl ${method.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <method.icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${method.tagColor} border border-current/20`}>
                    {method.tag}
                  </span>
                </div>
                <h3 className="font-display text-sm font-bold mb-2 leading-snug">{method.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{method.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal animation="fade-up" delay={500}>
          <div className="text-center mt-12">
            <Link to="/auth">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-10 h-12 text-base font-semibold rounded-xl gap-2 shadow-xl shadow-primary/20">
                Explore All Methods
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-3">All methods available from the Starter plan · No extra cost</p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
