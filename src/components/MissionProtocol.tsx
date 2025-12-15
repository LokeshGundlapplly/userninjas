import { Users, Layers, GitBranch, Target } from 'lucide-react';

const steps = [
  {
    icon: Users,
    title: 'Recruit',
    description: 'Access 120,000+ verified testers from 150+ countries',
  },
  {
    icon: Layers,
    title: 'Deploy',
    description: 'Launch moderated or unmoderated research in minutes',
  },
  {
    icon: GitBranch,
    title: 'Analyze',
    description: 'AI-powered insights extraction and tagging',
  },
  {
    icon: Target,
    title: 'Deliver',
    description: 'Share actionable findings with your team',
  },
];

export default function MissionProtocol() {
  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-b from-secondary/30 to-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/30 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Mission Protocol
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            From recruitment to revenue-impacting insights in four tactical steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="group text-center opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${0.2 + index * 0.15}s` }}
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-card border border-border flex items-center justify-center group-hover:border-primary/50 group-hover:shadow-lg transition-all duration-300">
                <step.icon className="w-8 h-8 text-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
