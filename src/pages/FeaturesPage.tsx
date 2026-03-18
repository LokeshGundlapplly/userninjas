import { Search, Target, Shield, Users, Zap, BarChart3, MessageSquare, Globe } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Background3D from '@/components/Background3D';
import ScrollReveal from '@/components/ScrollReveal';
import { Helmet } from 'react-helmet-async';

const features = [
  { icon: Search, title: 'Sentiment AI', description: 'AI analyzes facial expressions and voice tone for automated sentiment scores.' },
  { icon: Target, title: 'Precision Targeting', description: 'Filter by job title, income, device, or specific software skills.' },
  { icon: Shield, title: 'Enterprise Security', description: 'SOC2 Type II compliant with built-in NDA management.' },
  { icon: Users, title: 'Panel Access', description: '120,000+ verified testers from 150+ countries, ready for any mission.' },
  { icon: Zap, title: 'Fast Turnaround', description: 'Get results in hours, not weeks. Insights at record speed.' },
  { icon: BarChart3, title: 'Smart Analytics', description: 'AI-powered insights with automatic tagging, clips, and highlights.' },
  { icon: MessageSquare, title: 'Live Interviews', description: 'Moderated sessions with integrated recording and transcription.' },
  { icon: Globe, title: 'Global Reach', description: 'Test in any language, timezone, or market worldwide.' },
];

export default function FeaturesPage() {
  return (
    <>
      <Helmet>
        <title>Features - User Ninjas</title>
        <meta name="description" content="Discover all the powerful features that make User Ninjas the choice for elite product teams." />
      </Helmet>

      <Background3D />
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <ScrollReveal animation="fade-up">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">Features</p>
              <h1 className="font-display text-4xl md:text-6xl font-bold mb-4 tracking-tight">
                Everything you need
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                A complete toolkit for modern product research teams.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <ScrollReveal key={feature.title} animation="fade-up" delay={index * 70}>
                <div className="group p-7 rounded-2xl bg-card border border-border/60 hover:border-primary/30 hover:shadow-lg transition-all duration-300 h-full">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
