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
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent" />
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-accent/30 blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-primary/40 blur-[80px]" />

            <div className="relative z-10 p-12 md:p-16 text-center">
              <h2 className="font-display text-3xl md:text-5xl font-bold mb-4 tracking-tight text-primary-foreground">
                Start getting real user insights today
              </h2>
              <p className="text-lg text-primary-foreground/70 max-w-xl mx-auto mb-8">
                Join 500+ companies building products people love. Launch your first test in minutes.
              </p>
              <Link to="/auth">
                <Button size="lg" className="bg-background text-foreground hover:bg-background/90 px-10 py-6 text-base font-semibold rounded-xl gap-2 shadow-xl">
                  Start Testing — It's Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <p className="mt-5 text-xs text-primary-foreground/50 uppercase tracking-wider font-medium">
                No credit card required · 14-day free trial · Cancel anytime
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
