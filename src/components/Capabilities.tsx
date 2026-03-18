import { Users, Globe, CheckCircle } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const capabilities = [
  {
    icon: Users,
    title: 'Elite Panel Recruitment',
    description: 'Stop testing with your coworkers. Access our diverse panel of over 120,000 verified testers from 150+ countries.',
    features: ['B2B & B2C targeting', 'Screener questions for niche audiences', 'Bring your own testers (free)'],
    demo: {
      title: 'Audience Selector',
      subtitle: 'Targeting Parameters',
      fields: [
        { label: 'Job Title', value: 'Software Engineer' },
        { label: 'Industry', value: 'SaaS / Tech' },
        { label: 'Location', value: 'North America' },
      ],
    },
  },
];

export default function Capabilities() {
  return (
    <section id="for-clients" className="py-24 bg-secondary/40">
      <div className="container mx-auto px-4">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">For Clients</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Built for product teams
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              A complete arsenal of tools for the modern research workflow.
            </p>
          </div>
        </ScrollReveal>

        {capabilities.map((cap) => (
          <div key={cap.title} className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <ScrollReveal animation="fade-right" delay={150}>
              <div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <cap.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display text-3xl font-bold mb-4 tracking-tight">{cap.title}</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">{cap.description}</p>
                <ul className="space-y-3">
                  {cap.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-success shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="fade-left" delay={300}>
              <div className="bg-card rounded-2xl border border-border/60 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                    <Globe className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{cap.demo.title}</h4>
                    <p className="text-xs text-muted-foreground">{cap.demo.subtitle}</p>
                  </div>
                </div>
                <div className="space-y-0">
                  {cap.demo.fields.map((field) => (
                    <div key={field.label} className="flex items-center justify-between py-3.5 border-b border-border/40 last:border-0">
                      <span className="text-sm text-muted-foreground">{field.label}</span>
                      <span className="px-3 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary">
                        {field.value}
                      </span>
                    </div>
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
