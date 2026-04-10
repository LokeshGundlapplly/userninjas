import { Video, Sparkles, Target, Zap, Shield, BarChart3 } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const features = [
  {
    icon: Video,
    title: 'Session Recordings',
    description: 'HD screen and voice recordings of real users navigating your product.',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Analysis',
    description: 'Auto transcription, sentiment detection, and smart summaries powered by AI.',
  },
  {
    icon: Target,
    title: 'Smart Recruitment',
    description: 'AI-matched testers filtered by demographics, devices, and custom screeners.',
  },
  {
    icon: Zap,
    title: 'Results in Hours',
    description: 'Get actionable insights in hours, not weeks. Built for speed.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'SOC 2 compliant, GDPR ready, SSO support. Built for serious teams.',
  },
  {
    icon: BarChart3,
    title: 'Rich Analytics',
    description: 'Dashboards, exportable reports, heatmaps, and team collaboration tools.',
  },
];

export default function Features() {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">Features</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Everything you need to{' '}
              <span className="text-gradient">ship with confidence</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              A complete research toolkit trusted by the world's best product teams.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <ScrollReveal key={feature.title} animation="fade-up" delay={index * 80}>
              <div className="group p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/20 hover:shadow-lg transition-all duration-300 h-full">
                <div className="w-11 h-11 rounded-xl bg-primary/8 flex items-center justify-center mb-4 group-hover:bg-primary/12 transition-colors">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display text-base font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
