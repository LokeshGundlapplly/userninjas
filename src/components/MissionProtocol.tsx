import { FileText, Users, BarChart3, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ScrollReveal from './ScrollReveal';

const steps = [
  {
    icon: FileText,
    step: '01',
    title: 'Design your study',
    description: 'Choose your research method, define tasks, upload Figma prototypes or live URLs, and write screener questions. Our guided builder gets you live in under 5 minutes.',
    details: ['Task & scenario builder', 'Prototype & URL testing', 'Screener questions', 'Custom branding'],
    color: 'from-primary/20 to-primary/5',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    borderColor: 'border-primary/20',
  },
  {
    icon: Users,
    step: '02',
    title: 'We recruit real users',
    description: 'Our AI recruiter matches and invites perfectly vetted participants from our global panel of 120,000+ verified testers. Filter by 50+ demographic criteria.',
    details: ['120K+ vetted testers', '50+ targeting filters', '150+ countries covered', 'Quality score guarantee'],
    color: 'from-accent/20 to-accent/5',
    iconBg: 'bg-accent/10',
    iconColor: 'text-accent',
    borderColor: 'border-accent/20',
  },
  {
    icon: BarChart3,
    step: '03',
    title: 'Insights delivered fast',
    description: 'Watch HD session recordings, read AI-generated summaries with pain points highlighted, and share reports with your team — all within 24 hours.',
    details: ['AI summaries & highlights', 'Sentiment & heatmaps', 'Shareable team reports', 'Exportable raw data'],
    color: 'from-[hsl(var(--gold))]/20 to-[hsl(var(--gold))]/5',
    iconBg: 'bg-[hsl(var(--gold))]/10',
    iconColor: 'text-[hsl(var(--gold))]',
    borderColor: 'border-[hsl(var(--gold))]/20',
  },
];

export default function MissionProtocol() {
  return (
    <section id="how-it-works" className="py-28 relative">
      <div className="container mx-auto px-4">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-20">
            <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-4">How It Works</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-5">
              From idea to insight{' '}
              <span className="text-gradient">in three steps</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              The fastest path from product questions to clear answers.
            </p>
          </div>
        </ScrollReveal>

        <div className="max-w-5xl mx-auto relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-16 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <div className="hidden lg:block absolute top-[63px] left-0 right-0 overflow-hidden">
            <div className="h-px gradient-line opacity-30" />
          </div>

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-6">
            {steps.map((step, index) => (
              <ScrollReveal key={step.title} animation="fade-up" delay={index * 120}>
                <div className={`relative group p-6 rounded-2xl bg-card border ${step.borderColor} hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full lift-glow spotlight-card`}>
                  <div className="flex items-start gap-4 mb-5">
                    <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} border border-border/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                      <step.icon className={`w-6 h-6 ${step.iconColor}`} />
                      <div className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center shadow-md ring-2 ring-background">
                        {index + 1}
                      </div>
                    </div>
                    <div className="pt-1">
                      <span className="text-[10px] font-bold tracking-widest text-muted-foreground/50 uppercase">Step {step.step}</span>
                    </div>
                  </div>

                  <h3 className="font-display text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{step.description}</p>

                  <ul className="space-y-1.5">
                    {step.details.map((detail) => (
                      <li key={detail} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${step.iconColor}`} />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        <ScrollReveal animation="fade-up" delay={400}>
          <div className="text-center mt-16">
            <Link to="/auth">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 h-12 text-base font-semibold rounded-xl gap-2 shadow-lg shadow-primary/20">
                Run Your First Test
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
