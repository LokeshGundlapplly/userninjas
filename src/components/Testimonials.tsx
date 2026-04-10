import ScrollReveal from './ScrollReveal';
import { Star, Quote, TrendingUp } from 'lucide-react';

const testimonials = [
  {
    quote: "User Ninjas cut our research cycle from 3 weeks to 3 days. The AI summaries alone save my team 10+ hours per study. It's genuinely changed how we make product decisions.",
    name: "Sarah Chen",
    title: "Head of Product",
    company: "TechFlow",
    metric: "10× faster research",
    rating: 5,
    highlight: true,
  },
  {
    quote: "The tester panel quality is unmatched. We finally get honest feedback from real users, not just our internal echo chamber. Every study surfaces issues we never would have found on our own.",
    name: "Marcus Rivera",
    title: "UX Director",
    company: "DataPulse",
    metric: "3× more issues found",
    rating: 5,
    highlight: false,
  },
  {
    quote: "AI sentiment analysis cut our manual video review time by 80%. We run 4× as many studies now because the process is so fast. Absolute game changer for our team.",
    name: "Aisha Patel",
    title: "Research Lead",
    company: "CloudBase",
    metric: "80% less manual review",
    rating: 5,
    highlight: false,
  },
  {
    quote: "We went from 'we think users want this' to 'we know users want this' within a single sprint. That shift in confidence alone was worth the subscription.",
    name: "Jordan Kim",
    title: "CPO",
    company: "Launchpad",
    metric: "First study in 1 day",
    rating: 5,
    highlight: false,
  },
  {
    quote: "Setup is incredibly fast. We ran our first moderated test in under 10 minutes and had complete results the next morning. I was genuinely shocked by how smooth the experience was.",
    name: "Priya Nair",
    title: "Product Designer",
    company: "Designly",
    metric: "Setup in <10 minutes",
    rating: 5,
    highlight: false,
  },
  {
    quote: "The best investment we've made in our product process this year. After just two months of regular testing, our user retention jumped 22%. The ROI is crystal clear.",
    name: "Tom Westbrook",
    title: "VP Product",
    company: "Stackr",
    metric: "+22% retention lift",
    rating: 5,
    highlight: true,
  },
  {
    quote: "As an enterprise team we needed SOC 2 compliance and SSO. User Ninjas had both, plus dedicated support. It's the only platform that met our security bar while staying easy to use.",
    name: "Linda Torres",
    title: "Director of Research",
    company: "FinSecure",
    metric: "SOC 2 + SSO ready",
    rating: 5,
    highlight: false,
  },
  {
    quote: "We replaced three separate tools (testing, recruitment, analysis) with User Ninjas. Our team is happier, our process is tighter, and we're saving $800/month.",
    name: "David Park",
    title: "Head of UX",
    company: "Growly",
    metric: "$800/mo cost saving",
    rating: 5,
    highlight: false,
  },
  {
    quote: "Tree testing and card sorting in the same platform as usability testing is huge. We no longer switch between tools mid-project. Everything just flows.",
    name: "Emma Wilson",
    title: "Information Architect",
    company: "ContentFlow",
    metric: "All methods, 1 platform",
    rating: 5,
    highlight: false,
  },
];

export default function Testimonials() {
  return (
    <section className="py-28">
      <div className="container mx-auto px-4">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-4">Customer Stories</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-5">
              Loved by research-driven teams
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              500+ product teams use User Ninjas to build products their users actually love.
              Here's what they have to say.
            </p>
          </div>
        </ScrollReveal>

        {/* Star rating summary bar */}
        <ScrollReveal animation="fade-up" delay={80}>
          <div className="flex items-center justify-center gap-4 mb-12">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-primary text-primary" />
              ))}
            </div>
            <span className="font-display text-xl font-bold">4.9 / 5</span>
            <span className="text-muted-foreground text-sm">from 600+ reviews on G2 & Capterra</span>
          </div>
        </ScrollReveal>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-5 max-w-6xl mx-auto space-y-5">
          {testimonials.map((t, index) => (
            <ScrollReveal key={t.name} animation="fade-up" delay={index * 60}>
              <div className={`break-inside-avoid p-6 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 ${
                t.highlight
                  ? 'bg-gradient-to-br from-primary/8 to-accent/5 border-primary/20 hover:border-primary/35'
                  : 'bg-card border-border/50 hover:border-primary/20'
              }`}>
                <Quote className={`w-8 h-8 mb-4 ${t.highlight ? 'text-primary/40' : 'text-primary/20'}`} />
                
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />
                  ))}
                </div>

                <p className="text-sm text-foreground leading-relaxed mb-4 font-medium">"{t.quote}"</p>

                {t.metric && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-[11px] font-bold mb-4 border border-accent/20">
                    <TrendingUp className="w-3 h-3" />
                    {t.metric}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/15 shrink-0">
                    <span className="text-sm font-bold text-primary">{t.name.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                  <div>
                    <p className="font-display font-semibold text-sm leading-none">{t.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t.title} · {t.company}</p>
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
