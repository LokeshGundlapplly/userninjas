import { FileText, Users, BarChart3 } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const steps = [
  {
    icon: FileText,
    step: '1',
    title: 'Create your test',
    description: 'Define tasks, upload prototypes, and set your target audience. Setup takes under 5 minutes.',
  },
  {
    icon: Users,
    step: '2',
    title: 'We match real users',
    description: 'Our AI recruits the right testers from a global panel of 120K+ verified participants.',
  },
  {
    icon: BarChart3,
    step: '3',
    title: 'Get actionable insights',
    description: 'Watch recordings, read AI summaries, and discover pain points — all in one dashboard.',
  },
];

export default function MissionProtocol() {
  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="container mx-auto px-4">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">How It Works</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              Three steps to <span className="text-gradient">better products</span>
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <ScrollReveal key={step.title} animation="fade-up" delay={index * 120}>
              <div className="relative text-center">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px bg-border/60" />
                )}

                <div className="mx-auto w-20 h-20 rounded-2xl bg-primary/8 border border-primary/15 flex items-center justify-center mb-5 relative">
                  <step.icon className="w-8 h-8 text-primary" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-md">
                    {step.step}
                  </span>
                </div>

                <h3 className="font-display text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{step.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
