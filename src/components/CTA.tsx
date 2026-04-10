import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

export default function CTA() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <ScrollReveal animation="scale">
          <div className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent" />
            <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-accent/20 blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-primary/30 blur-[80px]" />
            
            {/* Dot pattern */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }} />

            <div className="relative z-10 px-8 py-16 md:px-16 md:py-20 text-center">
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-primary-foreground leading-tight mb-4">
                Start getting real user<br />insights today
              </h2>
              <p className="text-base md:text-lg text-primary-foreground/70 max-w-lg mx-auto mb-8">
                Join 500+ companies building products people love. Launch your first test in minutes.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/auth">
                  <Button size="lg" className="bg-background text-foreground hover:bg-background/90 px-10 py-6 text-base font-semibold rounded-xl gap-2 shadow-xl">
                    Start Free Trial
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 px-10 py-6 text-base font-semibold rounded-xl">
                    Talk to Sales
                  </Button>
                </Link>
              </div>
              
              <p className="mt-5 text-xs text-primary-foreground/50 uppercase tracking-wider font-medium">
                No credit card · 14-day trial · Cancel anytime
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
