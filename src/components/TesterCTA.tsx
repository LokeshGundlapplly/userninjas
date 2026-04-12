import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, DollarSign, Clock, Star, Globe } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const testerPerks = [
  { icon: DollarSign, label: '$10–$50 per test', sub: 'Avg. 20 mins of work' },
  { icon: Clock, label: 'Flexible schedule', sub: 'Test anytime, anywhere' },
  { icon: Star, label: '4.8★ tester rating', sub: 'Highly rated community' },
  { icon: Globe, label: '150+ countries', sub: 'Global tester panel' },
];

export default function TesterCTA() {
  return (
    <section className="py-20 border-t border-border/30">
      <div className="container mx-auto px-4">
        <ScrollReveal animation="fade-up">
          <div className="max-w-5xl mx-auto rounded-2xl bg-card border border-border/50 p-8 md:p-12 flex flex-col lg:flex-row items-center gap-10 shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden spotlight-card">
            {/* Subtle accent gradient */}
            <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-accent/5 blur-[80px] pointer-events-none" />
            {/* Left copy */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-xs font-semibold text-accent mb-5">
                <DollarSign className="w-3.5 h-3.5" />
                For Testers
              </div>
              <h3 className="font-display text-2xl md:text-3xl font-bold mb-3 tracking-tight">
                Earn money by testing apps & websites
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed mb-6 max-w-md">
                Share your honest feedback on real products and get paid $10–$50 per session.
                Flexible hours, no experience needed — just your genuine opinions.
              </p>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="rounded-xl gap-2 border-accent/40 text-accent hover:bg-accent/8 hover:border-accent/60 font-semibold px-8 h-12">
                  Join as Tester — It's Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground mt-3">120,000+ testers already earning · Instant sign-up</p>
            </div>

            {/* Right perks grid */}
            <div className="grid grid-cols-2 gap-3 flex-shrink-0 w-full lg:w-auto lg:max-w-xs">
              {testerPerks.map((perk) => (
                <div key={perk.label} className="p-4 rounded-xl bg-secondary/40 border border-border/40 hover:border-accent/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center mb-2.5">
                    <perk.icon className="w-4 h-4 text-accent" />
                  </div>
                  <p className="font-display font-semibold text-sm leading-tight">{perk.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{perk.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
