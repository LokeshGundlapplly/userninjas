import { FileText, Users, Eye, ArrowRight } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const steps = [
  {
    icon: FileText,
    step: '01',
    title: 'Create Your Test',
    description: 'Define tasks, add questions, set your target audience. Upload prototypes or share your live URL — setup takes minutes.',
    color: 'primary' as const,
  },
  {
    icon: Users,
    step: '02',
    title: 'Match Real Users',
    description: 'Our AI matches you with ideal testers from a global panel. Filter by demographics, devices, expertise, and behavior.',
    color: 'accent' as const,
  },
  {
    icon: Eye,
    step: '03',
    title: 'Get AI Insights',
    description: 'Watch session recordings, read AI summaries, discover pain points automatically. Export reports to share with your team.',
    color: 'primary' as const,
  },
];

export default function MissionProtocol() {
  return (
    <section id="how-it-works" className="py-28 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[200px]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/8 border border-primary/15 text-xs font-semibold text-primary uppercase tracking-wider mb-5">
              How It Works
            </div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-5 tracking-tight">
              Three steps to <span className="text-gradient">better products</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              From test creation to actionable insights in as little as 24 hours.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto relative">
          {/* Connector arrows */}
          <div className="hidden md:flex absolute top-24 left-[33%] w-[34%] items-center justify-center">
            <div className="w-full h-px bg-gradient-to-r from-primary/30 to-accent/30" />
            <ArrowRight className="w-4 h-4 text-primary/40 absolute left-1/2 -translate-x-1/2" />
          </div>
          <div className="hidden md:flex absolute top-24 left-[66%] w-[20%] items-center justify-center">
            <div className="w-full h-px bg-gradient-to-r from-accent/30 to-primary/30" />
          </div>

          {steps.map((step, index) => (
            <ScrollReveal key={step.title} animation="fade-up" delay={index * 150}>
              <div className="group relative h-full">
                {/* Card */}
                <div className="relative p-8 lg:p-10 rounded-3xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 h-full text-center">
                  {/* Step number */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-lg shadow-primary/25">
                    {index + 1}
                  </div>
                  
                  <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mt-2 transition-all duration-300 group-hover:scale-110 ${
                    step.color === 'primary' ? 'bg-primary/10' : 'bg-accent/10'
                  }`}>
                    <step.icon className={`w-7 h-7 ${step.color === 'primary' ? 'text-primary' : 'text-accent'}`} />
                  </div>
                  
                  <h3 className="font-display text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
