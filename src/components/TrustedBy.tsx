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
    <section className="py-14 border-y border-border/40">
      <div className="container mx-auto px-4">
        <ScrollReveal animation="fade-up">
          <p className="text-center text-xs font-semibold tracking-[0.2em] text-muted-foreground mb-10 uppercase">
            Trusted by leading product teams at
          </p>
        </ScrollReveal>

        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-14">
          {logos.map((logo, i) => (
            <ScrollReveal key={logo.name} animation="fade-up" delay={i * 60}>
              <div className="flex items-center gap-2.5 opacity-35 hover:opacity-60 transition-opacity duration-300 cursor-default">
                <div className="w-9 h-9 rounded-lg bg-foreground/8 flex items-center justify-center border border-border/40">
                  <span className="font-display font-bold text-xs text-foreground/50">{logo.letter}</span>
                </div>
                <span className="font-display font-semibold text-sm text-foreground/45 tracking-tight">{logo.name}</span>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
