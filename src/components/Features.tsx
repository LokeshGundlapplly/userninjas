import { Video, Sparkles, Target, Zap, Brain, BarChart3, Lock, Zap as Speed } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const features = [
  {
    icon: Video,
    title: 'Crystal-Clear Session Recordings',
    description: 'Capture HD video recordings with screen and voice transcription. Replay every interaction to understand exactly how users experience your product.',
    color: 'primary',
  },
  {
    icon: Brain,
    title: 'Advanced AI Intelligence',
    description: 'Leverage machine learning to auto-detect pain points, sentiment patterns, and user behaviors. Get actionable intelligence without manual analysis.',
    color: 'accent',
  },
  {
    icon: Target,
    title: 'Precision User Targeting',
    description: 'Access our global panel of 50,000+ qualified testers. Define exact criteria and recruit the right audience in minutes, not days.',
    color: 'primary',
  },
  {
    icon: Speed,
    title: 'Lightning-Fast Insights',
    description: 'Transform raw feedback into actionable intelligence in hours. Our streamlined platform accelerates your entire research cycle.',
    color: 'accent',
  },
  {
    icon: Lock,
    title: 'Enterprise-Grade Security',
    description: 'SOC 2 Type II certified, GDPR compliant, and HIPAA-ready. Your data is protected with military-grade encryption and isolated infrastructure.',
    color: 'primary',
  },
  {
    icon: BarChart3,
    title: 'Intuitive Analytics Dashboard',
    description: 'Beautiful dashboards with exportable reports, heatmaps, and collaborative tools. Share insights with your entire team instantly.',
    color: 'accent',
  },
];

export default function Features() {
  return (
    <section className="py-28 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-primary/4 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/3 rounded-full blur-[200px]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-xs font-semibold text-accent uppercase tracking-wider mb-5 hover:bg-accent/15 transition-all">
              Comprehensive Platform
            </div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight leading-[1.1]">
              The complete research <br />
              <span className="text-gradient">intelligence platform</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to move faster, learn smarter, and build products that resonate with your audience.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <ScrollReveal key={feature.title} animation="fade-up" delay={index * 80}>
              <div className="group relative p-8 rounded-3xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-500 h-full overflow-hidden backdrop-blur-sm">
                {/* Subtle gradient on hover */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                  feature.color === 'primary' 
                    ? 'bg-gradient-to-br from-primary/5 to-transparent' 
                    : 'bg-gradient-to-br from-accent/5 to-transparent'
                }`} />
                
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 ${
                    feature.color === 'primary' ? 'bg-primary/10' : 'bg-accent/10'
                  }`}>
                    <feature.icon className={`w-6 h-6 ${feature.color === 'primary' ? 'text-primary' : 'text-accent'}`} />
                  </div>
                  <h3 className="font-display text-lg font-bold mb-3 tracking-tight">{feature.title}</h3>
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
