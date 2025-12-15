import { Search, Target, Shield, Users, Zap, BarChart3, MessageSquare, Globe } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Background3D from '@/components/Background3D';
import { Helmet } from 'react-helmet-async';

const features = [
  {
    icon: Search,
    title: 'Sentiment AI',
    description: 'Our AI analyzes facial expressions and voice tone to generate automated sentiment scores for every session.',
  },
  {
    icon: Target,
    title: 'Precision Targeting',
    description: 'Filter by job title, income, device, or even specific software skills. Get the exact users you need.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'SOC2 Type II compliant with built-in NDA management. Your prototypes are safe with us.',
  },
  {
    icon: Users,
    title: 'Panel Access',
    description: 'Access 120,000+ verified testers from 150+ countries, ready for any research mission.',
  },
  {
    icon: Zap,
    title: 'Fast Turnaround',
    description: 'Get results in hours, not weeks. Our streamlined process delivers insights at stealth speed.',
  },
  {
    icon: BarChart3,
    title: 'Smart Analytics',
    description: 'AI-powered insights extraction with automatic tagging, clips, and highlight reels.',
  },
  {
    icon: MessageSquare,
    title: 'Live Interviews',
    description: 'Conduct moderated sessions with integrated recording, transcription, and note-taking.',
  },
  {
    icon: Globe,
    title: 'Global Reach',
    description: 'Test in any language, timezone, or market. True global coverage for international products.',
  },
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
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-4">
              Features
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              A complete arsenal of tools for the modern product team.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300 opacity-0 animate-fade-in"
                style={{ animationDelay: `${0.1 + index * 0.05}s` }}
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
