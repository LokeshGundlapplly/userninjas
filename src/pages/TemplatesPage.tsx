import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, Bookmark, HelpCircle, Eye, ArrowRight, Clock, Award, Target, Users, BookOpen, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UX_TEMPLATES, type UXTemplate } from '@/data/templates';
import TemplateCard from '@/components/TemplateCard';
import { useToast } from '@/hooks/use-toast';

const CATEGORIES = ['All', 'UX Research', 'User Interviews', 'Surveys', 'Recruitment', 'Product Research'] as const;

export default function TemplatesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<UXTemplate | null>(null);

  // Load bookmarks on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('userninjas_bookmarked_templates');
      if (stored) {
        setBookmarkedIds(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load bookmarks', e);
    }
  }, []);

  // Save bookmarks when updated
  const toggleBookmark = (id: string) => {
    let updated: string[];
    if (bookmarkedIds.includes(id)) {
      updated = bookmarkedIds.filter(item => item !== id);
      toast({
        title: 'Bookmark Removed',
        description: 'Template has been removed from your bookmarks.',
      });
    } else {
      updated = [...bookmarkedIds, id];
      toast({
        title: 'Template Bookmarked',
        description: 'You can now filter by bookmarked templates in your library.',
      });
    }
    setBookmarkedIds(updated);
    localStorage.setItem('userninjas_bookmarked_templates', JSON.stringify(updated));
  };

  const handleUseTemplate = (template: UXTemplate) => {
    // Save template data to sessionStorage so CreateTest can pick it up
    try {
      sessionStorage.setItem('use_template_data', JSON.stringify(template));
      
      toast({
        title: 'Template Selected',
        description: `Creating a study using "${template.name}".`,
      });

      // Close modal if open
      setPreviewTemplate(null);

      // Navigate to create study form
      navigate('/recruiter/create-test');
    } catch (e) {
      console.error('Failed to prepare template', e);
      toast({
        title: 'Error',
        description: 'Failed to apply template. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Filter templates
  const filteredTemplates = UX_TEMPLATES.filter((tpl) => {
    const matchesSearch = tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tpl.objective.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || tpl.category === selectedCategory;
    const matchesBookmark = !showBookmarksOnly || bookmarkedIds.includes(tpl.id);

    return matchesSearch && matchesCategory && matchesBookmark;
  });

  return (
    <>
      <Helmet>
        <title>UX Template Library - User Ninjas</title>
        <meta name="description" content="Quickly launch usability tests, user interviews, and surveys using vetted research templates." />
      </Helmet>

      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="relative rounded-2xl overflow-hidden border border-border/40 bg-card/40 backdrop-blur-md p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 pointer-events-none" />
          <div className="space-y-2 max-w-2xl relative z-10">
            <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Pre-built UX Research Templates
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Accelerate your product insights. Select a vetted template for your research goals, customize questions, set participant criteria, and launch in minutes.
            </p>
          </div>
          <div className="shrink-0 relative z-10 flex gap-2">
            <Button
              variant={showBookmarksOnly ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowBookmarksOnly(prev => !prev)}
              className={`rounded-xl gap-1.5 transition-all text-xs font-semibold ${
                showBookmarksOnly ? 'bg-amber-500 hover:bg-amber-600 text-white border-none' : 'border-border/50'
              }`}
            >
              <Bookmark className="h-3.5 w-3.5 fill-current" />
              Bookmarked ({bookmarkedIds.length})
            </Button>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search templates by name, description, objective..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-xl bg-card/40 border-border/40 focus-visible:ring-primary"
            />
          </div>
          
          {/* Scrollable Horizontal Category Filter for Mobile */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-4 h-9 text-xs transition-all shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-primary text-primary-foreground font-semibold hover:bg-primary/90'
                    : 'border-border/40 hover:bg-secondary/40'
                }`}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((tpl) => (
              <TemplateCard
                key={tpl.id}
                template={tpl}
                isBookmarked={bookmarkedIds.includes(tpl.id)}
                onBookmarkToggle={() => toggleBookmark(tpl.id)}
                onPreview={() => setPreviewTemplate(tpl)}
                onUse={() => handleUseTemplate(tpl)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border/60 bg-secondary/10 p-12 text-center max-w-lg mx-auto">
            <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-sm font-bold text-foreground mb-1">No templates found</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We couldn't find any templates matching your search criteria. Try adjusting your filters or clearing your search query.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setShowBookmarksOnly(false);
              }}
              className="mt-4 rounded-xl border-border/50 text-xs"
            >
              Reset Filters
            </Button>
          </div>
        )}

        {/* Template Detail Preview Modal */}
        <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
          {previewTemplate && (
            <DialogContent className="max-w-2xl bg-card border-border/40 text-foreground overflow-y-auto max-h-[85vh] rounded-2xl p-6">
              <DialogHeader className="pb-4 border-b border-border/20">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-primary/15 text-primary border-primary/20 text-[10px] uppercase font-semibold">
                    {previewTemplate.category}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] text-muted-foreground border-border/60 capitalize">
                    {previewTemplate.testType.replace('_', ' ')}
                  </Badge>
                </div>
                <DialogTitle className="font-display font-bold text-2xl text-foreground">
                  {previewTemplate.name}
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  {previewTemplate.description}
                </DialogDescription>
              </DialogHeader>

              {/* Study Parameters Overview */}
              <div className="grid grid-cols-2 gap-4 py-4 border-b border-border/10">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/20">
                  <Clock className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <span className="text-[10px] text-muted-foreground block font-medium uppercase tracking-wider">Estimated Duration</span>
                    <span className="font-bold text-sm text-foreground">{previewTemplate.duration} minutes</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/20">
                  <Award className="h-5 w-5 text-accent shrink-0" />
                  <div>
                    <span className="text-[10px] text-muted-foreground block font-medium uppercase tracking-wider">Tester Credit Reward</span>
                    <span className="font-bold text-sm text-foreground">${previewTemplate.rewardAmount} per session</span>
                  </div>
                </div>
              </div>

              {/* Recruitment & Target audience */}
              <div className="py-4 space-y-3 border-b border-border/10">
                <div className="flex gap-3">
                  <Target className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-xs text-foreground uppercase tracking-wider block">Study Objective</span>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">{previewTemplate.objective}</p>
                  </div>
                </div>
                <div className="flex gap-3 pt-3 border-t border-border/5">
                  <Users className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-xs text-foreground uppercase tracking-wider block">Target Participants</span>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">{previewTemplate.participantCriteria}</p>
                  </div>
                </div>
              </div>

              {/* Research Questions List */}
              <div className="py-4">
                <span className="font-bold text-xs text-foreground uppercase tracking-wider block mb-3">Pre-defined Study Questions ({previewTemplate.questions.length})</span>
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {previewTemplate.questions.map((q, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-secondary/40 border border-border/20 flex gap-3 items-start">
                      <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-foreground leading-relaxed">{q.question_text}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <Badge variant="secondary" className="text-[9px] px-2 py-0 h-4 capitalize font-normal text-muted-foreground">
                            Type: {q.question_type.replace('_', ' ')}
                          </Badge>
                          {q.required && (
                            <Badge className="bg-destructive/10 text-destructive text-[9px] border-none px-2 py-0 h-4 font-normal">
                              Required
                            </Badge>
                          )}
                          {q.options.length > 0 && (
                            <span className="text-[10px] text-muted-foreground">
                              Options: {q.options.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter className="pt-4 border-t border-border/20 gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => setPreviewTemplate(null)}
                  className="rounded-xl border-border/50 text-xs"
                >
                  Close
                </Button>
                <Button
                  onClick={() => handleUseTemplate(previewTemplate)}
                  className="btn-magnetic bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl gap-1.5 text-xs shadow-md shadow-primary/15"
                >
                  Use This Template
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </DialogFooter>
            </DialogContent>
          )}
        </Dialog>
      </div>
    </>
  );
}
