import ScrollReveal from './ScrollReveal';

const logos = ['Spotify', 'Stripe', 'Notion', 'Figma', 'Linear'];

export default function TrustedBy() {
  return (
    <section className="py-14 border-y border-border/40">
      <div className="container mx-auto px-4">
        <ScrollReveal animation="fade-up">
          <p className="text-center text-xs font-semibold tracking-[0.2em] text-muted-foreground mb-10 uppercase">
            Trusted by leading product teams
          </p>
        </ScrollReveal>
        
        <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16">
          {logos.map((name, i) => (
            <ScrollReveal key={name} animation="fade-up" delay={i * 80}>
              <div className="flex items-center gap-2 opacity-40 hover:opacity-70 transition-opacity duration-300">
                <div className="w-8 h-8 rounded-lg bg-foreground/10 flex items-center justify-center">
                  <span className="font-display font-bold text-xs text-foreground/60">{name[0]}</span>
                </div>
                <span className="font-display font-semibold text-sm text-foreground/50 tracking-tight">{name}</span>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
