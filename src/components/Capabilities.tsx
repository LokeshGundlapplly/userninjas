import { Users, Globe } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const capabilities = [
  {
    icon: Users,
    title: 'Elite Panel Recruitment',
    description: 'Stop testing with your coworkers. Access our diverse panel of over 120,000 verified testers from 150+ countries. Filter by profession, income, device usage, and more.',
    features: ['B2B & B2C targeting', 'Screener questions for niche audiences', 'Bring your own testers (free of charge)'],
    demo: {
      title: 'Audience Selector',
      subtitle: 'Targeting Parameters',
      fields: [
        { label: 'Job Title', value: 'Software Engineer', color: 'bg-primary/10 text-primary' },
        { label: 'Industry', value: 'SaaS / Tech', color: 'bg-purple-100 text-purple-700' },
        { label: 'Location', value: 'North America', color: 'bg-success/10 text-success' },
      ],
    },
  },
];

export default function Capabilities() {
  return (
    <section id="for-clients" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Capabilities
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              A complete arsenal of tools for the modern product team.
            </p>
          </div>
        </ScrollReveal>

        {capabilities.map((cap, index) => (
          <div
            key={cap.title}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            <ScrollReveal animation="fade-right" delay={200}>
              <div>
                <div className="w-14 h-14 rounded-xl bg-card border border-border flex items-center justify-center mb-6">
                  <cap.icon className="w-7 h-7 text-foreground" />
                </div>
                <h3 className="font-display text-3xl font-bold mb-4">{cap.title}</h3>
                <p className="text-muted-foreground mb-6">{cap.description}</p>
                <ul className="space-y-3">
                  {cap.features.map((feature, i) => (
                    <ScrollReveal key={feature} animation="fade-right" delay={300 + i * 100}>
                      <li className="flex items-center gap-3 text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
                        {feature}
                      </li>
                    </ScrollReveal>
                  ))}
                </ul>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="fade-left" delay={400}>
              <div className="bg-card rounded-2xl border border-border p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                    <Globe className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{cap.demo.title}</h4>
                    <p className="text-sm text-muted-foreground">{cap.demo.subtitle}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {cap.demo.fields.map((field, i) => (
                    <ScrollReveal key={field.label} animation="fade-up" delay={500 + i * 100}>
                      <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
                        <span className="text-muted-foreground">{field.label}</span>
                        <span className={`px-3 py-1 rounded-lg text-sm font-medium ${field.color}`}>
                          {field.value}
                        </span>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        ))}
      </div>
    </section>
  );
}
