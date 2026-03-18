import { Users, Layers, GitBranch, Target } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const steps = [
  {
    icon: Users,
    step: '01',
    title: 'Recruit',
    description: 'Access 120,000+ verified testers from 150+ countries. Filter by demographics, device, skills.',
  },
  {
    icon: Layers,
    step: '02',
    title: 'Deploy',
    description: 'Launch moderated or unmoderated research in minutes with our streamlined workflow.',
  },
  {
    icon: GitBranch,
    step: '03',
    title: 'Analyze',
    description: 'AI-powered insights extraction with automatic tagging, sentiment scoring, and highlights.',
  },
  {
    icon: Target,
    step: '04',
    title: 'Deliver',
    description: 'Share actionable findings with your team through exportable reports and integrations.',
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
              Four steps to better products
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              From recruitment to revenue-impacting insights in record time.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <ScrollReveal key={step.title} animation="fade-up" delay={index * 120}>
              <div className="group relative p-8 rounded-2xl bg-card border border-border/60 hover:border-primary/30 hover:shadow-lg transition-all duration-300 h-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                    <step.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-display text-4xl font-extrabold text-border/80 group-hover:text-primary/20 transition-colors">{step.step}</span>
                </div>
                <h3 className="font-display text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
