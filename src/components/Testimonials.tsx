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
    quote: "AI sentiment analysis saves us hours of manual video review. Absolute game changer for our workflow.",
    name: "Aisha Patel",
    title: "Research Lead, CloudBase",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">Testimonials</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              Loved by product teams
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {testimonials.map((t, index) => (
            <ScrollReveal key={t.name} animation="fade-up" delay={index * 100}>
              <div className="p-6 rounded-2xl bg-card border border-border/50 h-full flex flex-col hover:border-primary/20 hover:shadow-lg transition-all duration-300">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-foreground leading-relaxed flex-1 mb-5">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{t.name.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                  <div>
                    <p className="font-display font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.title}</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
