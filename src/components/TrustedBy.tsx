import ScrollReveal from './ScrollReveal';

const logos = [
  { name: 'Spotify', letter: 'S' },
  { name: 'Stripe', letter: 'St' },
  { name: 'Notion', letter: 'N' },
  { name: 'Figma', letter: 'F' },
  { name: 'Linear', letter: 'Li' },
  { name: 'Vercel', letter: 'V' },
  { name: 'Shopify', letter: 'Sh' },
  { name: 'Atlassian', letter: 'A' },
];

export default function TrustedBy() {
  return (
    <section className="py-20 border-y border-border/30 bg-gradient-to-b from-secondary/30 to-secondary/10">
      <div className="container mx-auto px-4">
        <ScrollReveal animation="fade-up">
          <p className="text-center text-xs font-semibold tracking-[0.2em] text-muted-foreground mb-12 uppercase">
            Trusted by leading product teams
          </p>
        </ScrollReveal>

        <div className="relative overflow-hidden">
          <div className="flex animate-[scroll_20s_linear_infinite] gap-12 md:gap-20">
            {[...logos, ...logos].map((logo, i) => (
              <div key={`${logo.name}-${i}`} className="flex items-center gap-3 opacity-40 hover:opacity-80 transition-opacity duration-300 cursor-default shrink-0">
                <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center border border-primary/15 hover:bg-primary/12 transition-colors">
                  <span className="font-display font-bold text-xs text-foreground/60">{logo.letter}</span>
                </div>
                <span className="font-display font-semibold text-sm text-foreground/50 tracking-tight">{logo.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
