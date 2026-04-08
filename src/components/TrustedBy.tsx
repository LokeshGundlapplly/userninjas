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
    <section className="py-16 border-y border-border/30 bg-secondary/20">
      <div className="container mx-auto px-4">
        <ScrollReveal animation="fade-up">
          <p className="text-center text-xs font-semibold tracking-[0.25em] text-muted-foreground mb-10 uppercase">
            Powering research at world-class companies
          </p>
        </ScrollReveal>

        <div className="relative overflow-hidden">
          <div className="flex animate-[scroll_20s_linear_infinite] gap-12 md:gap-16">
            {[...logos, ...logos].map((logo, i) => (
              <div key={`${logo.name}-${i}`} className="flex items-center gap-2.5 opacity-30 hover:opacity-60 transition-opacity duration-300 cursor-default shrink-0">
                <div className="w-10 h-10 rounded-xl bg-foreground/6 flex items-center justify-center border border-border/30">
                  <span className="font-display font-bold text-xs text-foreground/50">{logo.letter}</span>
                </div>
                <span className="font-display font-semibold text-sm text-foreground/40 tracking-tight">{logo.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
