import { Video, Sparkles, Target, Zap, DollarSign, BarChart3, Users, Shield } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const features = [
  {
    icon: Video,
    title: 'Session Recordings',
    description: 'Watch real users navigate your product with HD screen and voice recordings. See every click, scroll, and hesitation.',
    color: 'primary',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Analysis',
    description: 'Automatic transcription, sentiment detection, pain point analysis, and smart summaries — powered by advanced AI.',
    color: 'accent',
  },
  {
    icon: Target,
    title: 'Smart Recruitment',
    description: 'AI-matched testers from our global panel. Filter by demographics, devices, profession, and custom screener questions.',
    color: 'primary',
  },
  {
    icon: Zap,
    title: 'Results in Hours',
    description: 'Get actionable insights in hours, not weeks. Our streamlined workflow delivers the speed your team needs.',
    color: 'accent',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'SOC 2 compliant, GDPR ready, SSO support. Built for teams that take security and privacy seriously.',
    color: 'primary',
  },
  {
    icon: BarChart3,
    title: 'Rich Analytics',
    description: 'Intuitive dashboards with exportable reports, heatmaps, charts, and team collaboration tools.',
    color: 'accent',
  },
];

export default function Features() {
  return (
    <section className="py-28 relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/3 rounded-full blur-[200px]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/8 border border-accent/15 text-xs font-semibold text-accent uppercase tracking-wider mb-5">
              Platform Features
            </div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-5 tracking-tight">
              Everything you need to<br />
              <span className="text-gradient">ship products people love</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              A complete research toolkit trusted by the world's best product teams.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <ScrollReveal key={feature.title} animation="fade-up" delay={index * 80}>
              <div className="group relative p-8 rounded-3xl bg-card border border-border/50 hover:border-primary/25 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 h-full overflow-hidden">
                {/* Subtle gradient on hover */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                  feature.color === 'primary' 
                    ? 'bg-gradient-to-br from-primary/3 to-transparent' 
                    : 'bg-gradient-to-br from-accent/3 to-transparent'
                }`} />
                
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 ${
                    feature.color === 'primary' ? 'bg-primary/10' : 'bg-accent/10'
                  }`}>
                    <feature.icon className={`w-6 h-6 ${feature.color === 'primary' ? 'text-primary' : 'text-accent'}`} />
                  </div>
                  <h3 className="font-display text-lg font-bold mb-3">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
