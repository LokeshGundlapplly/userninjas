import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ScrollReveal from './ScrollReveal';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16">
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal animation="fade-up" delay={200}>
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-6">
              Start Your{' '}
              <span className="text-primary">First Mission</span>
            </h1>
          </ScrollReveal>
          
          <ScrollReveal animation="fade-up" delay={400}>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
              Join 4,000+ elite product teams building better software with stealth-speed insights.
            </p>
          </ScrollReveal>

          <ScrollReveal animation="scale" delay={600}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <div className="border-2 border-dashed border-primary/30 rounded-2xl p-6 bg-background/50">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/login">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-semibold">
                      Start Free Trial
                    </Button>
                  </Link>
                  <Link to="/contact">
                    <Button size="lg" variant="outline" className="px-8 py-6 text-lg font-semibold">
                      Contact Sales
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={800}>
            <p className="text-sm text-muted-foreground">
              No credit card required for trial • SOC2 Certified
            </p>
          </ScrollReveal>
        </div>
      </div>

      {/* Decorative curved line */}
      <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden pointer-events-none">
        <svg viewBox="0 0 1440 120" className="absolute bottom-0 w-full h-auto">
          <path
            d="M0,80 Q360,120 720,80 T1440,80 L1440,120 L0,120 Z"
            fill="hsl(var(--secondary))"
            opacity="0.5"
          />
        </svg>
      </div>
    </section>
  );
}
