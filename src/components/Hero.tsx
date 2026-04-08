import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Video, Sparkles, Target, Zap, BarChart3, Users, Shield, Globe } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const orbitFeatures = [
  { icon: Video, label: 'Video Recordings', angle: 0, color: 'primary' },
  { icon: Sparkles, label: 'AI Insights', angle: 60, color: 'accent' },
  { icon: Target, label: 'Targeted Users', angle: 120, color: 'primary' },
  { icon: Zap, label: 'Fast Results', angle: 180, color: 'accent' },
  { icon: BarChart3, label: 'Analytics', angle: 240, color: 'primary' },
  { icon: Shield, label: 'Enterprise Ready', angle: 300, color: 'accent' },
];

function GlobeVisual() {
  return (
    <div className="relative w-[500px] h-[500px] lg:w-[600px] lg:h-[600px] mx-auto">
      {/* Outer glow rings */}
      <div className="absolute inset-0 rounded-full border border-primary/10 animate-[spin_30s_linear_infinite]" />
      <div className="absolute inset-6 rounded-full border border-accent/8 animate-[spin_25s_linear_infinite_reverse]" />
      <div className="absolute inset-12 rounded-full border border-primary/6 animate-[spin_20s_linear_infinite]" />

      {/* Gradient glow behind globe */}
      <div className="absolute inset-[15%] rounded-full bg-gradient-to-br from-primary/15 via-accent/10 to-primary/5 blur-[60px]" />
      
      {/* Main globe/orb */}
      <div className="absolute inset-[25%] rounded-full bg-gradient-to-br from-primary/20 via-card to-accent/10 border border-primary/20 shadow-2xl backdrop-blur-sm flex items-center justify-center animate-glow-pulse">
        {/* Inner ring */}
        <div className="absolute inset-3 rounded-full border border-primary/15" />
        
        {/* Globe grid lines */}
        <div className="absolute inset-0 rounded-full overflow-hidden opacity-20">
          <div className="absolute inset-0 border-l border-r border-primary/30" style={{ left: '30%', right: '30%' }} />
          <div className="absolute inset-0 border-t border-b border-primary/30" style={{ top: '30%', bottom: '30%' }} />
          <div className="absolute w-full h-px bg-primary/20 top-1/2" />
          <div className="absolute h-full w-px bg-primary/20 left-1/2" />
          {/* Curved latitude lines */}
          <div className="absolute inset-[15%] rounded-full border border-primary/15" />
          <div className="absolute inset-[35%] rounded-full border border-primary/10" />
        </div>

        {/* Logo center */}
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-xl shadow-primary/30">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="hsl(var(--primary-foreground))" opacity="0.9"/>
              <path d="M2 17L12 22L22 17" stroke="hsl(var(--primary-foreground))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
              <path d="M2 12L12 17L22 12" stroke="hsl(var(--primary-foreground))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.85"/>
            </svg>
          </div>
          <span className="font-display font-bold text-sm lg:text-base tracking-tight">
            <span className="text-foreground">User</span>
            <span className="text-primary">Ninjas</span>
          </span>
        </div>
      </div>

      {/* Orbiting feature nodes */}
      {orbitFeatures.map((feature, i) => {
        const radius = 42; // percentage from center
        const angleRad = (feature.angle * Math.PI) / 180;
        const x = 50 + radius * Math.cos(angleRad);
        const y = 50 + radius * Math.sin(angleRad);
        const Icon = feature.icon;
        
        return (
          <div
            key={feature.label}
            className="absolute group"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: 'translate(-50%, -50%)',
              animationDelay: `${i * 0.15}s`,
            }}
          >
            {/* Connection line to center */}
            <div 
              className="absolute w-px bg-gradient-to-b from-primary/20 to-transparent hidden lg:block"
              style={{
                height: `${radius * 2}px`,
                left: '50%',
                top: '50%',
                transform: `rotate(${feature.angle + 90}deg)`,
                transformOrigin: '0 0',
                opacity: 0.3,
              }}
            />
            
            {/* Feature node */}
            <div className="relative animate-fade-in" style={{ animationDelay: `${0.3 + i * 0.1}s` }}>
              <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center shadow-lg border transition-all duration-300 group-hover:scale-110 ${
                feature.color === 'primary' 
                  ? 'bg-card border-primary/20 shadow-primary/10 group-hover:shadow-primary/25 group-hover:border-primary/40' 
                  : 'bg-card border-accent/20 shadow-accent/10 group-hover:shadow-accent/25 group-hover:border-accent/40'
              }`}>
                <Icon className={`w-5 h-5 lg:w-6 lg:h-6 ${feature.color === 'primary' ? 'text-primary' : 'text-accent'}`} />
              </div>
              <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] lg:text-xs font-semibold text-muted-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                {feature.label}
              </p>
            </div>
          </div>
        );
      })}

      {/* Floating particles */}
      <div className="absolute top-[15%] left-[10%] w-2 h-2 rounded-full bg-primary/30 animate-float" />
      <div className="absolute top-[70%] right-[8%] w-1.5 h-1.5 rounded-full bg-accent/40 animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-[15%] left-[20%] w-1 h-1 rounded-full bg-primary/50 animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[25%] right-[15%] w-1.5 h-1.5 rounded-full bg-accent/30 animate-float" style={{ animationDelay: '0.5s' }} />
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 mesh-gradient" />
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[120px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/3 rounded-full blur-[200px]" />

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Top badge */}
        <ScrollReveal animation="fade-up" delay={100}>
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/8 border border-primary/15 text-sm font-medium text-primary">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Trusted by 500+ companies worldwide
            </div>
          </div>
        </ScrollReveal>

        {/* Headline */}
        <ScrollReveal animation="fade-up" delay={200}>
          <div className="text-center max-w-4xl mx-auto mb-4">
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05]">
              Test your product with{' '}
              <span className="text-gradient">real users</span>
            </h1>
          </div>
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delay={300}>
          <p className="text-center text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            The all-in-one UX research platform. Video recordings, AI-powered insights, 
            and targeted user recruitment — get actionable feedback in hours, not weeks.
          </p>
        </ScrollReveal>

        {/* CTA Buttons */}
        <ScrollReveal animation="fade-up" delay={400}>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-3">
            <Link to="/auth">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-10 py-6 text-base font-semibold rounded-xl gap-2 shadow-lg shadow-primary/25">
                Start Testing Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="px-10 py-6 text-base font-semibold rounded-xl gap-2 border-border/60">
                <Globe className="h-4 w-4" />
                Book a Demo
              </Button>
            </Link>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            No credit card required · Setup in 2 minutes · Cancel anytime
          </p>
        </ScrollReveal>

        {/* Globe Visual */}
        <ScrollReveal animation="scale" delay={500}>
          <div className="mt-8 lg:mt-4">
            <GlobeVisual />
          </div>
        </ScrollReveal>

        {/* Stats bar */}
        <ScrollReveal animation="fade-up" delay={700}>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 mt-0 lg:-mt-8 relative z-20">
            {[
              { value: '10,000+', label: 'Tests Completed' },
              { value: '500+', label: 'Companies Trust Us' },
              { value: '24h', label: 'Avg. Turnaround' },
              { value: '4.9/5', label: 'Customer Rating' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
