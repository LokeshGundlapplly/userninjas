import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

export default function CTA() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <ScrollReveal animation="scale">
          <div className="relative max-w-4xl mx-auto rounded-3xl bg-foreground text-background p-12 md:p-16 text-center overflow-hidden">
            {/* Decorative */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/20 blur-[100px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-accent/15 blur-[80px] translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10">
              <h2 className="font-display text-3xl md:text-5xl font-bold mb-4 tracking-tight">
                Ready to ship better products?
              </h2>
              <p className="text-lg text-background/60 max-w-xl mx-auto mb-8">
                Join 4,000+ product teams building software people love. Start your free trial today.
              </p>
              <Link to="/auth">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-10 py-6 text-base font-semibold rounded-xl gap-2">
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <p className="mt-5 text-xs text-background/40 uppercase tracking-wider font-medium">
                No credit card required · 14-day free trial
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
