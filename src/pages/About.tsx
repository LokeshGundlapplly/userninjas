import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Background3D from '@/components/Background3D';
import ScrollReveal from '@/components/ScrollReveal';
import { Helmet } from 'react-helmet-async';
import { Users, Globe, Zap, Shield } from 'lucide-react';

const stats = [
  { value: '120K+', label: 'Verified Testers' },
  { value: '150+', label: 'Countries' },
  { value: '4,000+', label: 'Product Teams' },
  { value: '99.9%', label: 'Uptime' },
];

const values = [
  { icon: Zap, title: 'Speed', description: 'We believe research should happen at the speed of product development.' },
  { icon: Users, title: 'Diversity', description: 'Our panel represents real users from every demographic and market.' },
  { icon: Shield, title: 'Trust', description: 'Enterprise-grade security and privacy for every research session.' },
  { icon: Globe, title: 'Scale', description: 'Global reach with local expertise across 150+ countries.' },
];

export default function About() {
  return (
    <>
      <Helmet>
        <title>About - User Ninjas</title>
        <meta name="description" content="Learn about User Ninjas - the elite user research platform trusted by 4,000+ product teams worldwide." />
      </Helmet>

      <Background3D />
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <ScrollReveal animation="fade-up">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">About Us</p>
              <h1 className="font-display text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                Making user research<br />accessible to everyone
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We're on a mission to make user research fast, accessible, and actionable for product teams of all sizes.
              </p>
            </div>
          </ScrollReveal>

          {/* Stats */}
          <ScrollReveal animation="fade-up" delay={150}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-20">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center p-6 rounded-2xl bg-card border border-border/60">
                  <p className="font-display text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* Story */}
          <ScrollReveal animation="fade-up" delay={200}>
            <div className="max-w-3xl mx-auto mb-20">
              <div className="bg-card rounded-2xl border border-border/60 p-8 md:p-12">
                <h2 className="font-display text-2xl font-bold mb-6">Our Story</h2>
                <div className="text-muted-foreground space-y-4 leading-relaxed">
                  <p>User Ninjas was founded with a simple belief: every product team deserves access to real user insights, without the enterprise price tag or lengthy timelines.</p>
                  <p>We built a platform that connects researchers with our global panel of over 120,000 verified testers, enabling teams to gather actionable feedback in hours instead of weeks.</p>
                  <p>Our AI-powered analysis tools automatically extract sentiment, generate highlights, and surface the insights that matter most—so you can focus on building products people love.</p>
                  <p>Today, we're trusted by 4,000+ product teams at companies of all sizes, from ambitious startups to Fortune 500 enterprises.</p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Values */}
          <ScrollReveal animation="fade-up" delay={300}>
            <div className="max-w-4xl mx-auto">
              <h2 className="font-display text-2xl font-bold mb-8 text-center">Our Values</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {values.map((v) => (
                  <div key={v.title} className="p-7 rounded-2xl bg-card border border-border/60">
                    <v.icon className="w-6 h-6 text-primary mb-4" />
                    <h3 className="font-display text-lg font-bold mb-2">{v.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </main>

      <Footer />
    </>
  );
}
