import NinjaLogo from './NinjaLogo';

export default function TrustedBy() {
  return (
    <section className="py-16 bg-secondary/50">
      <div className="container mx-auto px-4">
        <p className="text-center text-xs font-semibold tracking-[0.2em] text-muted-foreground mb-12 uppercase">
          Trusted by more than 10,000 enterprise research & insights teams
        </p>
        
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16 opacity-60">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="hover-lift">
              <NinjaLogo showText={true} className="grayscale hover:grayscale-0 transition-all" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
