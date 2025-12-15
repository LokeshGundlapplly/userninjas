import { Search, Target, Shield } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const features = [
  {
    icon: Search,
    title: 'Sentiment AI',
    description: 'Our AI analyzes facial expressions and voice tone to generate automated sentiment scores for every session.',
    size: 'normal',
  },
  {
    icon: Target,
    title: 'Precision Targeting',
    description: 'Filter by job title, income, device, or even specific software skills. Get the exact users you need.',
    size: 'normal',
  },
];

const securityFeature = {
  icon: Shield,
  title: 'Enterprise-Grade Security',
  description: 'SOC2 Type II compliant. NDA management built-in. Your prototypes are safe with our stealth protocols.',
  code: `$ init_security_protocol --force
> verifying_encryption... OK
> GDPR_compliance_check... PASSED
> access_granted: level_5_clearance`,
};

export default function Features() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {features.map((feature, index) => (
            <ScrollReveal 
              key={feature.title} 
              animation={index === 0 ? 'fade-right' : 'fade-left'} 
              delay={index * 200}
            >
              <div className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300 h-full">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Security Feature - Full Width */}
        <ScrollReveal animation="fade-up" delay={400}>
          <div className="p-8 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <securityFeature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display text-2xl font-bold mb-3">{securityFeature.title}</h3>
                <p className="text-muted-foreground">{securityFeature.description}</p>
              </div>
              
              <ScrollReveal animation="blur" delay={600}>
                <div className="bg-ninja-dark rounded-xl p-6 font-mono text-sm">
                  {securityFeature.code.split('\n').map((line, i) => (
                    <div key={i} className="text-muted-foreground">
                      {line.includes('$') ? (
                        <span>
                          <span className="text-primary">$</span>
                          <span className="text-primary-foreground">{line.slice(1)}</span>
                        </span>
                      ) : line.includes('OK') ? (
                        <span>
                          <span className="text-muted-foreground">&gt; {line.split('...')[0]}...</span>
                          <span className="text-success"> OK</span>
                        </span>
                      ) : line.includes('PASSED') ? (
                        <span>
                          <span className="text-muted-foreground">&gt; {line.split('...')[0]}...</span>
                          <span className="text-success"> PASSED</span>
                        </span>
                      ) : line.includes('level_5') ? (
                        <span>
                          <span className="text-muted-foreground">&gt; access_granted: </span>
                          <span className="text-primary">level_5_clearance</span>
                        </span>
                      ) : (
                        <span>{line}</span>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
