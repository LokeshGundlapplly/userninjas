import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, Play, CheckCircle, Upload, ShieldCheck, 
  Sparkles, FileVideo, Video, MessageSquareHeart, TrendingUp, AlertTriangle 
} from 'lucide-react';
import ScrollReveal from './ScrollReveal';

export default function HeroInteractive() {
  const [phase, setPhase] = useState<'idle' | 'uploading' | 'analyzing' | 'insights'>('uploading');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTranscriptLine, setActiveTranscriptLine] = useState(0);
  const [aiInsightTyping, setAiInsightTyping] = useState('');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Automated flow simulation loop
  useEffect(() => {
    runFlow();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const runFlow = () => {
    setPhase('uploading');
    setUploadProgress(0);
    setActiveTranscriptLine(0);
    setAiInsightTyping('');

    // Phase 1: Uploading progress (0 - 1.5s)
    let uploadVal = 0;
    const uploadInterval = setInterval(() => {
      uploadVal += 8;
      if (uploadVal >= 100) {
        setUploadProgress(100);
        clearInterval(uploadInterval);
        
        // Transition to Phase 2: Analyzing (at 1.8s)
        setTimeout(() => {
          setPhase('analyzing');
          startTranscriptAnalysis();
        }, 300);
      } else {
        setUploadProgress(uploadVal);
      }
    }, 100);
  };

  const startTranscriptAnalysis = () => {
    let currentLine = 0;
    const lineInterval = setInterval(() => {
      currentLine += 1;
      setActiveTranscriptLine(currentLine);
      if (currentLine >= 3) {
        clearInterval(lineInterval);
        
        // Transition to Phase 3: Insights Compilation (after transcript plays)
        setTimeout(() => {
          setPhase('insights');
          startTypingInsight();
        }, 1200);
      }
    }, 1500);
  };

  const startTypingInsight = () => {
    const fullInsight = "Friction detected: 73% of participants struggled to complete the checkout flow due to unclear shipping fees error message. Recommendation: display fees transparently before step 3.";
    let index = 0;
    const typeInterval = setInterval(() => {
      setAiInsightTyping(() => {
        const next = fullInsight.slice(0, index + 1);
        index++;
        if (index >= fullInsight.length) {
          clearInterval(typeInterval);
          
          // Loop back to start after showing completed screen for 5 seconds
          setTimeout(() => {
            runFlow();
          }, 6000);
        }
        return next;
      });
    }, 20);
  };

  const transcriptLines = [
    { text: "I'm looking for the add-to-cart button... Oh, it's hidden under the banner.", sentiment: "negative", timestamp: "0:04" },
    { text: "Okay, I added it. Now let me see if I can checkout. The layout is clean.", sentiment: "positive", timestamp: "0:12" },
    { text: "Wait, the checkout page says 'Error 402' but doesn't tell me why. That's frustrating.", sentiment: "negative", timestamp: "0:19" },
    { text: "Ah, it was because of my ZIP code format. Let me fix it.", sentiment: "neutral", timestamp: "0:25" }
  ];

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-28 pb-16 overflow-hidden bg-[#050816]">
      {/* Premium background mesh & Aurora glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[85%] h-[60%] rounded-full bg-gradient-to-tr from-indigo-500/10 via-violet-500/5 to-transparent blur-[130px] pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-20 -right-40 w-96 h-96 bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Grid background layer */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} 
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <ScrollReveal animation="fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-8 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Next-Gen AI Research Operating System
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={80}>
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6 text-foreground">
              Understand your users. <br />
              <span className="text-gradient bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400 text-glow">
                Ship without friction.
              </span>
            </h1>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={160}>
            <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto font-medium">
              Run automated moderated studies, unmoderated sessions, and qualitative AI interviews. 
              Upload files or Figma links, and let User Ninjas extract deep findings in minutes.
            </p>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={240}>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <Link to="/auth">
                <Button size="lg" className="btn-magnetic btn-shimmer bg-primary text-primary-foreground hover:bg-primary/90 px-8 h-12 text-sm font-bold rounded-xl gap-2 shadow-xl shadow-primary/20 w-full sm:w-auto">
                  Start Launching Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#workflow">
                <Button size="lg" variant="outline" className="btn-magnetic px-8 h-12 text-sm font-semibold rounded-xl gap-2 border-border/50 w-full sm:w-auto hover:bg-secondary/40">
                  <Play className="h-4 w-4 fill-current" />
                  See Workflow
                </Button>
              </a>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              {['Free tier included', 'Turnaround <12 hours', 'GDPR & SOC2 Ready'].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                  {item}
                </span>
              ))}
            </div>
          </ScrollReveal>
        </div>

        {/* Interactive Walkthrough Mockup Screen */}
        <ScrollReveal animation="zoom-up" delay={320}>
          <div className="max-w-5xl mx-auto relative group">
            {/* Ambient Backlight Glow */}
            <div className="absolute -inset-2 bg-gradient-to-r from-primary/10 via-accent/5 to-emerald-500/10 rounded-3xl blur-2xl opacity-75 pointer-events-none transition-all duration-500 group-hover:opacity-100" />

            <div className="relative rounded-2xl border border-border/40 bg-[#0d1025]/75 backdrop-blur-xl shadow-2xl overflow-hidden">
              {/* Window Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-border/30 bg-[#070918]/60">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex items-center gap-1.5 h-6 px-4 rounded-full bg-secondary/30 text-[10px] text-muted-foreground select-none font-medium">
                  <Sparkles className="w-3 h-3 text-primary" />
                  AI Analysis Engine · live_analysis_v2.bin
                </div>
                <div className="w-12 h-2" />
              </div>

              {/* Window Body Split Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px]">
                
                {/* Left panel: File input & Video Playback */}
                <div className="lg:col-span-7 p-6 border-r border-border/20 flex flex-col justify-center bg-[#090b1c]/30">
                  {phase === 'uploading' && (
                    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-border/40 rounded-xl bg-[#0e112a]/50">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 animate-bounce">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-semibold text-foreground">Uploading raw tester recording...</p>
                      <p className="text-[10px] text-muted-foreground mt-1">onboarding_flow_rec_34.mp4 (42.6 MB)</p>
                      
                      <div className="w-full max-w-xs bg-secondary/50 h-1.5 rounded-full overflow-hidden mt-4">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-100"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-muted-foreground mt-2 font-mono">{uploadProgress}%</span>
                    </div>
                  )}

                  {phase === 'analyzing' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                          <FileVideo className="w-3.5 h-3.5" /> Video Playback
                        </span>
                        <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-mono animate-pulse">
                          Transcribing audio...
                        </span>
                      </div>
                      
                      {/* Video simulator screen */}
                      <div className="aspect-video rounded-xl bg-black border border-border/20 relative overflow-hidden flex items-center justify-center shadow-inner group">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 pointer-events-none" />
                        <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white scale-95 opacity-80 pointer-events-none">
                          <Video className="w-5 h-5 animate-pulse" />
                        </div>
                        {/* Sentiment widget inside video */}
                        <div className="absolute bottom-3 left-3 bg-[#0d1025]/90 border border-border/30 rounded-lg p-2 flex items-center gap-2 backdrop-blur-sm shadow-md">
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                          <span className="text-[9px] text-foreground font-semibold">Sentiment: Negative (Checkout Error)</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {phase === 'insights' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5" /> Analysis Completed
                        </span>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={runFlow}
                          className="h-6 text-[9px] hover:bg-secondary/40 text-primary"
                        >
                          Replay Animation
                        </Button>
                      </div>

                      {/* Video complete status */}
                      <div className="aspect-video rounded-xl border border-border/20 bg-secondary/10 flex flex-col items-center justify-center p-6 text-center select-none">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-3 shadow-md">
                          <CheckCircle className="w-6 h-6" />
                        </div>
                        <h4 className="text-xs font-bold text-foreground">1 Session Evaluated</h4>
                        <p className="text-[10px] text-muted-foreground mt-1 max-w-xs">
                          AI analysis detected 2 critical friction events and synthesized actionable feedback recommendations.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right panel: Live Transcript & AI insights output */}
                <div className="lg:col-span-5 p-6 flex flex-col justify-between bg-[#050714]/40">
                  {phase === 'uploading' && (
                    <div className="flex-1 flex flex-col justify-center items-center text-center py-10 opacity-40">
                      <Sparkles className="w-8 h-8 text-primary animate-spin" />
                      <p className="text-[10px] text-muted-foreground mt-3">Awaiting upload pipeline...</p>
                    </div>
                  )}

                  {phase === 'analyzing' && (
                    <div className="flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Live Transcript Analysis</p>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                          {transcriptLines.map((line, idx) => (
                            <div 
                              key={idx} 
                              className={`p-2.5 rounded-lg border transition-all duration-300 ${
                                idx === activeTranscriptLine 
                                  ? 'bg-[#0f122e] border-primary/30 shadow-md translate-x-1' 
                                  : 'bg-secondary/20 border-border/10 opacity-45'
                              }`}
                            >
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-[9px] text-muted-foreground font-mono">{line.timestamp}</span>
                                <span className={`text-[8px] font-semibold px-1.5 py-0.2 rounded uppercase ${
                                  line.sentiment === 'positive' 
                                    ? 'bg-emerald-500/15 text-emerald-500' 
                                    : line.sentiment === 'negative' 
                                    ? 'bg-rose-500/15 text-rose-500' 
                                    : 'bg-secondary text-muted-foreground'
                                }`}>
                                  {line.sentiment}
                                </span>
                              </div>
                              <p className="text-[10px] text-foreground font-medium leading-relaxed">"{line.text}"</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {phase === 'insights' && (
                    <div className="flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                          AI Synthesized Insights
                        </span>
                        
                        <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/15 relative">
                          <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                          <p className="text-[10px] text-muted-foreground leading-relaxed min-h-[72px]">
                            "{aiInsightTyping}"
                            {aiInsightTyping.length < 181 && (
                              <span className="inline-block w-1 h-3.5 bg-primary ml-0.5 animate-pulse" />
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Mini visual widgets */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/10">
                        <div className="p-2 rounded-lg bg-secondary/30 border border-border/10 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-rose-500" />
                          <div>
                            <span className="text-[8px] text-muted-foreground block">Friction Severity</span>
                            <span className="font-bold text-[10px] text-foreground">Critical (High)</span>
                          </div>
                        </div>
                        <div className="p-2 rounded-lg bg-secondary/30 border border-border/10 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-emerald-500" />
                          <div>
                            <span className="text-[8px] text-muted-foreground block">Task Success Rate</span>
                            <span className="font-bold text-[10px] text-foreground">27% completed</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
