import ScrollReveal from './ScrollReveal';
import { Star } from 'lucide-react';

const testimonials = [
  {
    quote: "User Ninjas cut our research cycle from 3 weeks to 3 days. The quality of insights is remarkable.",
    name: "Sarah Chen",
    title: "Head of Product, TechFlow",
    rating: 5,
  },
  {
    quote: "The panel quality is unmatched. We finally get feedback from real users, not just our internal team.",
    name: "Marcus Rivera",
    title: "UX Director, DataPulse",
    rating: 5,
  },
  {
    quote: "Their AI sentiment analysis saves us hours of manual video review. Game changer for our workflow.",
    name: "Aisha Patel",
    title: "Research Lead, CloudBase",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">Testimonials</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Loved by product teams
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              See what our customers have to say about User Ninjas.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, index) => (
            <ScrollReveal key={t.name} animation="fade-up" delay={index * 120}>
              <div className="p-7 rounded-2xl bg-card border border-border/60 h-full flex flex-col">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-foreground leading-relaxed flex-1 mb-6">"{t.quote}"</p>
                <div>
                  <p className="font-display font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.title}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
