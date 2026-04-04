import { FileText, Users, Eye } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const steps = [
  {
    icon: FileText,
    step: '01',
    title: 'Create a Test',
    description: 'Set up your test in minutes. Add tasks, questions, and define your target audience. Upload prototypes or share your live URL.',
    accent: 'bg-primary/10 text-primary',
  },
  {
    icon: Users,
    step: '02',
    title: 'Get Real Users',
    description: 'Our matching algorithm finds the perfect testers from our global panel. Filter by demographics, devices, and expertise.',
    accent: 'bg-accent/10 text-accent',
  },
  {
    icon: Eye,
    step: '03',
    title: 'Watch Insights & Recordings',
    description: 'Review video recordings, read AI-generated summaries, and discover pain points. Export reports to share with your team.',
    accent: 'bg-primary/10 text-primary',
  },
];

export default function MissionProtocol() {
  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">How It Works</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Three steps to better products
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              From test creation to actionable insights in as little as 24 hours.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-20 left-[20%] right-[20%] h-px bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20" />

          {steps.map((step, index) => (
            <ScrollReveal key={step.title} animation="fade-up" delay={index * 150}>
              <div className="group relative p-8 rounded-2xl bg-card border border-border/60 hover:border-primary/30 hover:shadow-xl transition-all duration-300 h-full text-center">
                <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors group-hover:scale-105 duration-300"
                  style={{ background: index === 1 ? 'hsl(var(--accent) / 0.1)' : 'hsl(var(--primary) / 0.1)' }}>
                  <step.icon className="w-6 h-6" style={{ color: index === 1 ? 'hsl(var(--accent))' : 'hsl(var(--primary))' }} />
                </div>
                <span className="absolute top-6 right-6 font-display text-3xl font-extrabold text-border/60 group-hover:text-primary/15 transition-colors">{step.step}</span>
                <h3 className="font-display text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
