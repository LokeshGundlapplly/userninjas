import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, DollarSign } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

export default function TesterCTA() {
  return (
    <section className="py-16 border-t border-border/40">
      <div className="container mx-auto px-4">
        <ScrollReveal animation="fade-up">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/8 border border-accent/15 text-xs font-medium text-accent mb-4">
              <DollarSign className="w-3.5 h-3.5" />
              For Testers
            </div>
            <h3 className="font-display text-2xl md:text-3xl font-bold mb-3">
              Earn money by testing apps
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Get paid for sharing your honest feedback on websites and apps. Flexible hours, real impact.
            </p>
            <Link to="/auth">
              <Button variant="outline" size="lg" className="rounded-xl gap-2 border-accent/40 text-accent hover:bg-accent/5">
                Join as Tester
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
