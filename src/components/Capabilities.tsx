import { Video, Users, Bot, ArrowRight, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ScrollReveal from './ScrollReveal';

export default function Capabilities() {
  return (
    <section id="capabilities" className="py-28 bg-secondary/15 relative overflow-hidden section-soft-divider">
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-20">
            <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-4">Research Suite</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-5">
              Three modes. <span className="text-gradient">Infinite insights.</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
              Everything from quick unmoderated click-tests to automated, conversational AI user interviews.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {/* Card 1: Unmoderated Testing */}
          <ScrollReveal animation="fade-up" delay={100} className="h-full">
            <div className="relative rounded-2xl p-6 bg-card border border-border/50 h-full flex flex-col hover:border-primary/25 hover:shadow-xl transition-all duration-300 lift-glow spotlight-card">
              <div className="mb-6 flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Video className="w-5 h-5 text-primary" />
                </div>
                <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full font-bold">Standard</span>
              </div>

              {/* Graphic container */}
              <div className="h-32 rounded-xl bg-secondary/40 border border-border/30 p-3 mb-5 flex flex-col justify-between relative overflow-hidden select-none">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] bg-red-500 text-white px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                    RECORDING
                  </span>
                  <span className="text-[9px] text-muted-foreground">03:45</span>
                </div>
                
                {/* Simulated Timeline */}
                <div className="space-y-2">
                  <div className="h-1.5 bg-border rounded-full overflow-hidden relative">
                    <div className="h-full bg-primary rounded-full w-2/3" />
                    <div className="absolute top-0 w-2.5 h-2.5 -mt-0.5 rounded-full bg-destructive border border-background" style={{ left: '45%' }} />
                  </div>
                  <div className="flex justify-between text-[8px] text-muted-foreground">
                    <span>Task 1: Add to Cart</span>
                    <span className="text-destructive font-medium flex items-center gap-0.5">
                      <AlertCircle className="w-2.5 h-2.5" /> Frustration at 01:54
                    </span>
                  </div>
                </div>
              </div>

              <h3 className="font-display font-bold text-lg mb-2">Unmoderated Testing</h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                Vetted testers complete custom tasks on your website or Figma prototype independently. Watch full video, screen, and audio captures with automated emotion-tracking.
              </p>
            </div>
          </ScrollReveal>

          {/* Card 2: Live Moderated Studies */}
          <ScrollReveal animation="fade-up" delay={200} className="h-full">
            <div className="relative rounded-2xl p-6 bg-card border border-border/50 h-full flex flex-col hover:border-primary/25 hover:shadow-xl transition-all duration-300 lift-glow spotlight-card">
              <div className="mb-6 flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">Standard</span>
              </div>

              {/* Graphic container */}
              <div className="h-32 rounded-xl bg-secondary/40 border border-border/30 p-3 mb-5 flex flex-col justify-between relative overflow-hidden select-none">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-primary">R</span>
                  </div>
                  <span className="text-[9px] font-semibold">Researcher Session</span>
                </div>

                {/* Audio Waves */}
                <div className="flex items-end gap-0.5 h-10 px-2 justify-center">
                  {[20, 60, 45, 80, 55, 90, 75, 40, 60, 70, 85, 30, 60, 50, 75, 40, 65, 80].map((h, i) => (
                    <div
                      key={i}
                      className={`w-1 rounded-full transition-all ${i % 2 === 0 ? 'bg-primary/40' : 'bg-primary'}`}
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>

              <h3 className="font-display font-bold text-lg mb-2">Live Moderated</h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                Conduct face-to-face quantitative user research interviews. Built-in high-quality video calling, smart scheduling calendars, automatic transcription, and synchronized note-taking.
              </p>
            </div>
          </ScrollReveal>

          {/* Card 3: AI-Moderated Sessions */}
          <ScrollReveal animation="fade-up" delay={300} className="h-full">
            <div className="relative rounded-2xl p-6 bg-card border border-border/50 h-full flex flex-col hover:border-primary/25 hover:shadow-xl transition-all duration-300 lift-glow spotlight-card">
              <div className="mb-6 flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <span className="text-[10px] bg-amber-500/15 text-amber-600 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" /> Premium
                </span>
              </div>

              {/* Graphic container */}
              <div className="h-32 rounded-xl bg-secondary/40 border border-border/30 p-2.5 mb-5 flex flex-col justify-end relative overflow-hidden select-none">
                <div className="space-y-1.5 text-[8px] leading-relaxed">
                  <div className="bg-primary/10 text-primary p-1.5 rounded-lg rounded-bl-none max-w-[85%]">
                    <p className="font-semibold text-[7px] text-primary/80 mb-0.5">AI Interviewer</p>
                    "Why did you click there? Tell me about your onboarding experience."
                  </div>
                  <div className="bg-card p-1.5 rounded-lg rounded-br-none max-w-[80%] ml-auto text-right">
                    "I expected to see a checkout progress bar at the top."
                  </div>
                </div>
              </div>

              <h3 className="font-display font-bold text-lg mb-2">AI-Moderated Sessions</h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                Scale qualitative testing automatically. Our Gemini-powered AI agent interviews testers, prompts them for follow-up details, maps friction points, and summarizes insights instantly.
              </p>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal animation="fade-up" delay={450}>
          <div className="text-center mt-14">
            <Link to="/auth">
              <Button size="lg" className="btn-magnetic btn-shimmer bg-primary text-primary-foreground hover:bg-primary/90 px-10 h-12 text-base font-semibold rounded-xl gap-2 shadow-xl shadow-primary/20">
                Explore capabilities free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
