import React from 'react';
import { Clock, DollarSign, Award, Target, Users, Eye, ArrowRight, Bookmark } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { UXTemplate } from '@/data/templates';

interface TemplateCardProps {
  template: UXTemplate;
  isBookmarked: boolean;
  onBookmarkToggle: () => void;
  onPreview: () => void;
  onUse: () => void;
}

export default function TemplateCard({
  template,
  isBookmarked,
  onBookmarkToggle,
  onPreview,
  onUse,
}: TemplateCardProps) {
  return (
    <Card className="relative overflow-hidden bg-card/60 border-border/40 backdrop-blur-md hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col h-full spotlight-card group">
      {/* Visual Accent Glow on Hover */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors pointer-events-none" />

      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <Badge className="bg-primary/15 text-primary border-primary/20 font-semibold text-[10px] tracking-wider uppercase">
            {template.category}
          </Badge>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="text-[10px] text-muted-foreground border-border/60 capitalize">
              {template.testType.replace('_', ' ')}
            </Badge>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBookmarkToggle();
              }}
              className={`p-1.5 rounded-lg border transition-all duration-200 ${
                isBookmarked
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                  : 'bg-secondary/40 border-border/30 text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
              title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Template'}
            >
              <Bookmark className="h-3.5 w-3.5 fill-current" />
            </button>
          </div>
        </div>

        <CardTitle className="font-display font-bold text-lg leading-snug group-hover:text-primary transition-colors">
          {template.name}
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground line-clamp-2 mt-1.5 min-h-[32px]">
          {template.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-4 flex-1 space-y-4 relative z-10 text-xs text-muted-foreground">
        {/* Objective & Criteria */}
        <div className="space-y-2 bg-secondary/20 rounded-xl p-3 border border-border/20">
          <div className="flex items-start gap-2">
            <Target className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-foreground block">Objective</span>
              <p className="line-clamp-2 mt-0.5">{template.objective}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 pt-1.5 border-t border-border/10">
            <Users className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-foreground block">Participant Criteria</span>
              <p className="line-clamp-2 mt-0.5">{template.participantCriteria}</p>
            </div>
          </div>
        </div>

        {/* Duration & Rewards info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30 border border-border/10">
            <Clock className="h-4 w-4 text-primary/75" />
            <div>
              <span className="text-[10px] text-muted-foreground block">Duration</span>
              <span className="font-bold text-foreground">{template.duration} mins</span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30 border border-border/10">
            <Award className="h-4 w-4 text-accent/75" />
            <div>
              <span className="text-[10px] text-muted-foreground block">Reward</span>
              <span className="font-bold text-foreground">${template.rewardAmount} credit</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-2 pb-4 flex gap-2 border-t border-border/10 bg-secondary/10 relative z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={onPreview}
          className="flex-1 rounded-lg gap-1 border-border/50 text-xs hover:bg-secondary"
        >
          <Eye className="h-3.5 w-3.5" />
          Preview
        </Button>
        <Button
          size="sm"
          onClick={onUse}
          className="flex-1 btn-magnetic bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg gap-1 text-xs shadow-md shadow-primary/10"
        >
          Use Template
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
