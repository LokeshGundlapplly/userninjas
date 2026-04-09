import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Zap, BarChart3, Globe, Video, Target, Shield } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

function AIDataFlow() {
  return (
    <div className="relative w-full h-[500px] flex items-center justify-center mx-auto">
      {/* Animated neural network background */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <gradient id="dataFlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.4"/>
          </gradient>
        </defs>

        {/* Connection lines with animation */}
        <g strokeWidth="1.5" opacity="0.3" stroke="url(#dataFlow)">
          <line x1="100" y1="150" x2="300" y2="200" className="animate-pulse" style={{animationDuration: '3s'}} />
          <line x1="300" y1="200" x2="500" y2="150" className="animate-pulse" style={{animationDuration: '3.5s'}} />
          <line x1="500" y1="150" x2="700" y2="250" className="animate-pulse" style={{animationDuration: '4s'}} />
          <line x1="300" y1="200" x2="400" y2="350" className="animate-pulse" style={{animationDuration: '3.2s'}} />
          <line x1="500" y1="150" x2="300" y2="350" className="animate-pulse" style={{animationDuration: '3.8s'}} />
        </g>

        {/* Node points */}
        {[
          { x: 100, y: 150, label: 'Data' },
          { x: 300, y: 200, label: 'AI' },
          { x: 500, y: 150, label: 'Analysis' },
          { x: 700, y: 250, label: 'Insights' },
          { x: 400, y: 350, label: 'Recommendations' },
        ].map((node, i) => (
          <g key={i}>
            <circle cx={node.x} cy={node.y} r="8" fill="hsl(var(--primary))" opacity="0.2" />
            <circle 
              cx={node.x} 
              cy={node.y} 
              r="4" 
              fill="hsl(var(--primary))" 
              className="animate-pulse"
              style={{animationDelay: `${i * 0.2}s`}}
            />
          </g>
        ))}
      </svg>

      {/* Floating metric cards */}
      <div className="absolute top-12 left-8 p-4 rounded-xl bg-card/80 backdrop-blur-sm border border-primary/20 shadow-xl animate-float">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-primary">AI Processing</span>
        </div>
        <p className="text-xs text-muted-foreground">Accuracy: 94.7%</p>
      </div>

      <div className="absolute bottom-20 right-12 p-4 rounded-xl bg-card/80 backdrop-blur-sm border border-accent/20 shadow-xl animate-float" style={{animationDelay: '1s'}}>
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-4 h-4 text-accent" />
          <span className="text-xs font-semibold text-accent">Processing Speed</span>
        </div>
        <p className="text-xs text-muted-foreground">2.3s avg</p>
      </div>

      <div className="absolute top-1/2 right-8 p-4 rounded-xl bg-card/80 backdrop-blur-sm border border-primary/20 shadow-xl animate-float" style={{animationDelay: '0.5s'}}>
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-primary">Insights Detected</span>
        </div>
        <p className="text-xs text-muted-foreground">847 patterns</p>
      </div>
    </div>
  );
}

function GlobeVisual() {
  const orbitFeatures = [
    { icon: Video, label: 'HD Recordings', angle: 0, color: 'primary' },
    { icon: Sparkles, label: 'AI Analysis', angle: 60, color: 'accent' },
    { icon: Target, label: 'Smart Targeting', angle: 120, color: 'primary' },
    { icon: Zap, label: 'Instant Results', angle: 180, color: 'accent' },
    { icon: BarChart3, label: 'Rich Analytics', angle: 240, color: 'primary' },
    { icon: Shield, label: 'Enterprise', angle: 300, color: 'accent' },
  ];

  return (
    <div className="relative w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] lg:w-[520px] lg:h-[520px] mx-auto">
      {/* Outer glow rings */}
      <div className="absolute inset-0 rounded-full border border-primary/15 animate-[spin_40s_linear_infinite]" />
      <div className="absolute inset-6 rounded-full border border-accent/10 animate-[spin_35s_linear_infinite_reverse]" />
      <div className="absolute inset-12 rounded-full border border-primary/8 animate-[spin_30s_linear_infinite]" />

      {/* Main orb with gradient */}
      <div className="absolute inset-[20%] rounded-full bg-gradient-to-br from-primary/25 via-card to-accent/15 border border-primary/25 shadow-2xl backdrop-blur-md flex items-center justify-center">
        <div className="absolute inset-2 rounded-full border border-primary/20" />
        <div className="w-14 h-14 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl text-primary-foreground font-display font-bold text-sm lg:text-base">
          UN
        </div>
      </div>

      {/* Orbiting features */}
      {orbitFeatures.map((feature, i) => {
        const radius = 38;
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
            }}
          >
            <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center shadow-lg border transition-all duration-300 group-hover:scale-110 ${
              feature.color === 'primary' 
                ? 'bg-card border-primary/20 group-hover:shadow-primary/30' 
                : 'bg-card border-accent/20 group-hover:shadow-accent/30'
            }`}>
              <Icon className={`w-4 h-4 lg:w-5 lg:h-5 ${feature.color === 'primary' ? 'text-primary' : 'text-accent'}`} />
            </div>
            <p className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] lg:text-xs font-semibold text-muted-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              {feature.label}
            </p>
          </div>
        );
      })}

      {/* Floating particles */}
      <div className="absolute top-[10%] left-[5%] w-2 h-2 rounded-full bg-primary/40 animate-float" />
      <div className="absolute top-[75%] right-[5%] w-1.5 h-1.5 rounded-full bg-accent/50 animate-float" style={{animationDelay: '1s'}} />
      <div className="absolute bottom-[10%] left-[12%] w-1 h-1 rounded-full bg-primary/60 animate-float" style={{animationDelay: '2s'}} />
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Enhanced background */}
      <div className="absolute inset-0 mesh-gradient" />
      <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[180px]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/6 rounded-full blur-[150px]" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-primary/4 rounded-full blur-[180px]" />

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Top badge with enhanced styling */}
        <ScrollReveal animation="fade-up" delay={100}>
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 text-sm font-medium text-primary hover:border-primary/30 transition-all duration-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="font-semibold">AI-Powered Insights</span>
              </span>
              <span className="text-primary/50">•</span>
              <span>Trusted by leading product teams</span>
            </div>
          </div>
        </ScrollReveal>

        {/* Main headline */}
        <ScrollReveal animation="fade-up" delay={200}>
          <div className="text-center max-w-5xl mx-auto mb-6">
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.08] mb-4">
              Unlock Insights With{' '}
              <span className="text-gradient bg-gradient-to-r from-primary via-accent to-primary bg-clip-text">
                Intelligent Research
              </span>
            </h1>
          </div>
        </ScrollReveal>

        {/* Subheading */}
        <ScrollReveal animation="fade-up" delay={300}>
          <p className="text-center text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed font-light">
            Transform user feedback into actionable intelligence. Our AI-driven platform captures, analyzes, and synthesizes real user behavior to accelerate your product decisions.
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
