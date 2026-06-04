import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Award, Target, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UX_TEMPLATES } from '@/data/templates';
import ScrollReveal from './ScrollReveal';
import { useToast } from '@/hooks/use-toast';

export default function ResearchTemplates() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [startIndex, setStartIndex] = useState(0);

  // Take first 6 templates for homepage display
  const featuredTemplates = UX_TEMPLATES.slice(0, 6);

  const nextSlide = () => {
    if (startIndex + 3 < featuredTemplates.length) {
      setStartIndex(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (startIndex > 0) {
      setStartIndex(prev => prev - 1);
    }
  };

  const handleUseTemplate = (tpl: any) => {
    try {
      sessionStorage.setItem('use_template_data', JSON.stringify(tpl));
      toast({
        title: 'Template Selected',
        description: `Redirecting to launch your "${tpl.name}" study.`,
      });
      // Redirect to authentication callback or create study form
      navigate('/auth?redirect_to=/recruiter/create-test');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <section className="py-24 relative overflow-hidden bg-background border-t border-border/40">
      {/* Glow lines */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-violet-500/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal animation="fade-up">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14 max-w-5xl mx-auto">
            <div>
              <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-4">Study Blueprints</p>
              <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-foreground">
                proven templates, <br />
                <span className="text-gradient bg-gradient-to-r from-violet-400 to-indigo-400 text-glow">ready to deploy</span>
              </h2>
              <p className="text-muted-foreground text-sm max-w-md mt-4">
                Deploy industry-vetted studies for mobile, SaaS, or conversion flows in seconds. Customize everything.
              </p>
            </div>
            
            {/* Carousel navigation controls */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={prevSlide}
                disabled={startIndex === 0}
                className="h-10 w-10 rounded-xl border-border/50 hover:bg-secondary/40 disabled:opacity-30"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={nextSlide}
                disabled={startIndex + 3 >= featuredTemplates.length}
                className="h-10 w-10 rounded-xl border-border/50 hover:bg-secondary/40 disabled:opacity-30"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </ScrollReveal>

        {/* Carousel slide container */}
        <ScrollReveal animation="fade-up" delay={150}>
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-500">
              {featuredTemplates.slice(startIndex, startIndex + 3).map((tpl) => (
                <div 
                  key={tpl.id}
                  className="group relative rounded-2xl border border-border/40 bg-card backdrop-blur-sm p-6 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col h-full justify-between"
                >
                  <div>
                    {/* Header badges */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <Badge className="bg-primary/10 text-primary border-none text-[9px] font-bold uppercase tracking-wider">
                        {tpl.category}
                      </Badge>
                      <span className="text-[9px] text-muted-foreground font-semibold uppercase">{tpl.testType}</span>
                    </div>

                    <h3 className="font-display font-bold text-base mb-2 group-hover:text-primary transition-colors text-foreground">
                      {tpl.name}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-6">
                      {tpl.description}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Parameters details */}
                    <div className="grid grid-cols-2 gap-2 bg-secondary/40 p-2.5 rounded-xl border border-border/25 text-[10px]">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{tpl.duration} mins</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Award className="w-3.5 h-3.5 text-accent shrink-0" />
                        <span>${tpl.rewardAmount} reward</span>
                      </div>
                    </div>

                    {/* Launch button */}
                    <Button
                      size="sm"
                      onClick={() => handleUseTemplate(tpl)}
                      className="w-full btn-magnetic bg-secondary/80 border border-border/40 text-foreground hover:bg-primary hover:text-primary-foreground hover:border-transparent rounded-xl text-xs gap-1.5"
                    >
                      Deploy Template
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
