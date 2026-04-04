import { Video, Sparkles, Target, Zap, DollarSign, BarChart3 } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const features = [
  {
    icon: Video,
    title: 'Video Recordings',
    description: 'Watch real users interact with your product. Screen and voice recordings capture every click, scroll, and reaction.',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Insights',
    description: 'Automatic transcription, sentiment analysis, pain point detection, and smart summaries powered by advanced AI.',
  },
  {
    icon: Target,
    title: 'Targeted Recruitment',
    description: 'Find the right testers with advanced filtering by age, location, device, profession, and custom screener questions.',
  },
  {
    icon: Zap,
    title: 'Fast Turnaround',
    description: 'Get results in hours, not weeks. Our streamlined workflow delivers insights at the speed your team needs.',
  },
  {
    icon: DollarSign,
    title: 'Affordable Pricing',
    description: 'Enterprise-quality research at a fraction of the cost. No hidden fees, no long-term contracts.',
  },
  {
    icon: BarChart3,
    title: 'Dashboard Analytics',
    description: 'Clean, intuitive analytics dashboard with exportable reports, charts, and team collaboration tools.',
  },
];

export default function Features() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">Features</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Everything you need to ship<br />products people love
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              A complete toolkit for modern product research and UX testing.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <ScrollReveal key={feature.title} animation="fade-up" delay={index * 80}>
              <div className="group p-7 rounded-2xl bg-card border border-border/60 hover:border-primary/25 hover:shadow-lg transition-all duration-300 h-full">
                <div className="w-11 h-11 rounded-xl bg-primary/8 flex items-center justify-center mb-5 group-hover:bg-primary/12 transition-colors">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
