import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Background3D from '@/components/Background3D';
import ScrollReveal from '@/components/ScrollReveal';
import { Check, X, ArrowRight, Zap } from 'lucide-react';

export interface CompareFeature {
  category: string;
  features: {
    name: string;
    us: boolean | string;
    them: boolean | string;
  }[];
}

export interface ComparePageProps {
  competitor: string;
  competitorSlug: string;
  tagline: string;
  headline: string;
  subheadline: string;
  ourPriceLabel: string;
  theirPriceLabel: string;
  ourPriceNote: string;
  theirPriceNote: string;
  winReasons: { title: string; body: string }[];
  features: CompareFeature[];
  switchNote: string;
}

function FeatureCell({ val }: { val: boolean | string }) {
  if (val === true) return <Check className="w-5 h-5 text-emerald-500 mx-auto" />;
  if (val === false) return <X className="w-5 h-5 text-muted-foreground/40 mx-auto" />;
  return <span className="text-xs text-center leading-tight">{val as string}</span>;
}

export default function ComparePageTemplate(props: ComparePageProps) {
  const {
    competitor, tagline, headline, subheadline,
    ourPriceLabel, theirPriceLabel, ourPriceNote, theirPriceNote,
    winReasons, features, switchNote,
  } = props;

  return (
    <>
      <Background3D />
      <Navbar />
      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link to="/compare" className="hover:text-primary transition-colors">Compare</Link>
            <span>/</span>
            <span>vs {competitor}</span>
          </div>

          {/* Hero */}
          <ScrollReveal animation="fade-up">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-5">
                <Zap className="w-3.5 h-3.5" /> {tagline}
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                <span className="text-gradient">User Ninjas</span> vs {competitor}
              </h1>
              <p className="text-muted-foreground text-lg">{headline}</p>
              <p className="text-muted-foreground text-base mt-2">{subheadline}</p>
              <div className="flex items-center justify-center gap-4 mt-8">
                <Link to="/auth" className="px-7 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors">
                  Start free — no credit card
                </Link>
                <Link to="/compare" className="px-5 py-3 rounded-xl border border-border text-sm hover:bg-accent/30 transition-colors flex items-center gap-2">
                  See all comparisons <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </ScrollReveal>

          <div className="max-w-5xl mx-auto space-y-16">
            {/* Pricing comparison */}
            <ScrollReveal animation="fade-up">
              <div>
                <h2 className="font-display text-2xl font-bold mb-6 text-center">Pricing Comparison</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/30 p-7">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                        <Zap className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <span className="font-display font-bold">User Ninjas</span>
                      <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-semibold">WINNER</span>
                    </div>
                    <div className="text-3xl font-display font-bold mb-1">{ourPriceLabel}</div>
                    <p className="text-sm text-muted-foreground">{ourPriceNote}</p>
                  </div>
                  <div className="rounded-2xl bg-card border border-border/60 p-7 opacity-70">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold">{competitor[0]}</div>
                      <span className="font-display font-bold">{competitor}</span>
                    </div>
                    <div className="text-3xl font-display font-bold mb-1">{theirPriceLabel}</div>
                    <p className="text-sm text-muted-foreground">{theirPriceNote}</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Feature table */}
            <ScrollReveal animation="fade-up">
              <div>
                <h2 className="font-display text-2xl font-bold mb-6 text-center">Feature-by-Feature Comparison</h2>
                <div className="rounded-2xl border border-border/60 overflow-hidden bg-card">
                  <div className="grid grid-cols-[1fr_120px_120px] bg-muted/50 border-b border-border/60 px-5 py-3">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Feature</span>
                    <span className="text-xs font-semibold text-primary text-center uppercase tracking-widest">User Ninjas</span>
                    <span className="text-xs font-semibold text-muted-foreground text-center uppercase tracking-widest">{competitor}</span>
                  </div>
                  {features.map((section) => (
                    <div key={section.category}>
                      <div className="px-5 py-2 bg-muted/30 border-b border-border/50 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                        {section.category}
                      </div>
                      {section.features.map((f, i) => (
                        <div key={f.name} className={`grid grid-cols-[1fr_120px_120px] px-5 py-3.5 items-center ${i < section.features.length - 1 ? 'border-b border-border/30' : ''}`}>
                          <span className="text-sm">{f.name}</span>
                          <div className="flex justify-center"><FeatureCell val={f.us} /></div>
                          <div className="flex justify-center"><FeatureCell val={f.them} /></div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Why switch */}
            <ScrollReveal animation="fade-up">
              <div>
                <h2 className="font-display text-2xl font-bold mb-6 text-center">Why teams switch from {competitor}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {winReasons.map((r, i) => (
                    <div key={i} className="rounded-2xl bg-card border border-border/60 p-5">
                      <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 text-xs flex items-center justify-center font-bold">{i + 1}</span>
                        {r.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{r.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Migration note */}
            {switchNote && (
              <ScrollReveal animation="fade-up">
                <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/20 p-6 flex gap-4">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Easy migration from {competitor}</h4>
                    <p className="text-sm text-muted-foreground">{switchNote}</p>
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* CTA */}
            <ScrollReveal animation="fade-up">
              <div className="rounded-2xl bg-gradient-to-br from-primary/8 to-accent/8 border border-primary/20 p-10 text-center">
                <h3 className="font-display font-bold text-2xl mb-3">Ready to make the switch?</h3>
                <p className="text-muted-foreground mb-7 max-w-lg mx-auto">
                  Join 4,000+ product teams who chose User Ninjas. Free plan forever, paid plans from $49/month.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Link to="/auth" className="px-7 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors">
                    Get started free
                  </Link>
                  <Link to="/contact" className="px-5 py-3 rounded-xl border border-border text-sm hover:bg-accent/30 transition-colors">
                    Talk to sales
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
