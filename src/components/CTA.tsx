import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ScrollReveal from './ScrollReveal';

export default function CTA() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4 text-center">
        <ScrollReveal animation="scale">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Ready to initiate?
          </h2>
        </ScrollReveal>
        
        <ScrollReveal animation="fade-up" delay={200}>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            Join 4,000+ product teams building better software, faster.
          </p>
        </ScrollReveal>

        <ScrollReveal animation="scale" delay={400}>
          <Link to="/login">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 py-6 text-lg font-semibold rounded-2xl">
              Create Free Account
            </Button>
          </Link>
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delay={600}>
          <p className="mt-6 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            No credit card required // 14-day trial
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
