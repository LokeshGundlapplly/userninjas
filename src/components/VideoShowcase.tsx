import { Play, Monitor, UserCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ScrollReveal from './ScrollReveal';

interface VideoCardProps {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  videoId?: string;
  poster?: string;
  gradient: string;
  badge: string;
  features: string[];
  ctaText: string;
  ctaLink: string;
  reverse?: boolean;
}

function VideoCard({
  title,
  subtitle,
  description,
  icon: Icon,
  videoId,
  poster,
  gradient,
  badge,
  features,
  ctaText,
  ctaLink,
  reverse,
}: VideoCardProps) {
  return (
    <div className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center ${reverse ? 'lg:[direction:rtl]' : ''}`}>
      {/* Video */}
      <ScrollReveal animation={reverse ? 'fade-left' : 'fade-right'} delay={100}>
        <div className={reverse ? 'lg:[direction:ltr]' : ''}>
          <div className="relative rounded-2xl overflow-hidden border border-border/50 shadow-2xl group hover:shadow-primary/10 transition-shadow duration-500">
            <div className="aspect-video bg-gradient-to-br from-foreground/[0.03] to-foreground/[0.08] dark:from-card dark:to-card/80 relative flex items-center justify-center">
              {/* Grid overlay */}
              <div
                className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
                style={{
                  backgroundImage:
                    'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
                  backgroundSize: '48px 48px',
                }}
              />

              {videoId ? (
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <>
                  {/* Play button */}
                  <div className={`relative z-10 w-20 h-20 rounded-full ${gradient} flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform duration-300 cursor-pointer`}>
                    <Play className="w-8 h-8 text-primary-foreground ml-1" fill="currentColor" />
                  </div>

                  {/* Badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-card/90 border border-border/50 rounded-xl px-3 py-2 shadow-sm backdrop-blur-sm">
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold text-foreground">{badge}</span>
                  </div>

                  {/* Duration placeholder */}
                  <div className="absolute bottom-4 right-4 bg-foreground/80 dark:bg-background/80 text-background dark:text-foreground text-xs font-medium px-3 py-1.5 rounded-lg backdrop-blur-sm">
                    Demo
                  </div>

                  {/* Bottom progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-foreground/10">
                    <div className={`h-full w-[45%] ${gradient} rounded-r-full`} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Copy */}
      <ScrollReveal animation={reverse ? 'fade-right' : 'fade-left'} delay={200}>
        <div className={reverse ? 'lg:[direction:ltr]' : ''}>
          <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">{subtitle}</p>
          <h3 className="font-display text-2xl md:text-3xl font-bold tracking-tight mb-4">{title}</h3>
          <p className="text-muted-foreground text-base leading-relaxed mb-6">{description}</p>

          <ul className="space-y-3 mb-8">
            {features.map((feat) => (
              <li key={feat} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                </div>
                <span className="text-sm text-muted-foreground">{feat}</span>
              </li>
            ))}
          </ul>

          <Link to={ctaLink}>
            <Button size="lg" className="rounded-xl px-7 h-11 font-semibold gap-2">
              {ctaText}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </ScrollReveal>
    </div>
  );
}

export default function VideoShowcase() {
  return (
    <section className="py-28 section-soft-divider">
      <div className="container mx-auto px-4 max-w-6xl">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-20">
            <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-4">Platform Walkthrough</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-5">
              See the platform <span className="text-gradient">in action</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Watch how recruiters launch studies and how testers complete sessions — from both sides of the experience.
            </p>
          </div>
        </ScrollReveal>

        <div className="space-y-28">
          {/* Recruiter Dashboard Video */}
          <VideoCard
            subtitle="For Recruiters & Teams"
            title="Launch studies in minutes"
            description="See how easy it is to create a test, recruit participants, and get AI-powered insights — all from one powerful dashboard."
            icon={Monitor}
            gradient="bg-primary"
            badge="Recruiter Dashboard"
            features={[
              'Create unmoderated & moderated tests with built-in templates',
              'Smart recruitment filters across 50+ demographics',
              'Real-time session monitoring and AI analysis',
              'Export clips, highlights, and reports to your team',
            ]}
            ctaText="Try Recruiter Dashboard"
            ctaLink="/auth"
          />

          {/* Tester Experience Video */}
          <VideoCard
            subtitle="For Testers"
            title="Earn by sharing your opinion"
            description="Experience the tester journey — from signing up and qualifying to completing sessions and getting paid. It's smooth, fast, and rewarding."
            icon={UserCheck}
            gradient="bg-accent"
            badge="Tester Experience"
            features={[
              'Simple onboarding with profile-based matching',
              'Screen & voice recording with easy-to-follow tasks',
              'Instant feedback on session quality and approval',
              'Fast payouts and growing earning opportunities',
            ]}
            ctaText="Join as a Tester"
            ctaLink="/auth"
            reverse
          />
        </div>
      </div>
    </section>
  );
}
